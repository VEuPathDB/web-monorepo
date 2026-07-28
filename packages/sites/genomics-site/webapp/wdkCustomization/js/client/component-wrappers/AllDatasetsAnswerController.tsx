import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  ComponentType,
  useRef,
} from 'react';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import RecordLink from '@veupathdb/wdk-client/lib/Views/Records/RecordLink';
import { renderAttributeValue } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import {
  AttributeField,
  RecordInstance,
  Question,
  RecordClass,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { preorderSeq } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import {
  isQualifying,
  getId,
} from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import LockIcon from '@material-ui/icons/Lock';
import PublicIcon from '@material-ui/icons/Public';
import { projectId, webAppUrl } from '@veupathdb/web-common/lib/config';

import './AllDatasetsAnswerController.scss';

interface HarmonizedAttribute {
  displayName: string;
  datasetAttrName: string | null;
  userDatasetAttrName: string | null;
  metadata: AttributeField;
}

interface NormalizedRecord extends RecordInstance {
  dataset_source: 'dataset' | 'userdataset';
  is_public?: boolean;
}

interface MergedState {
  records: NormalizedRecord[];
  harmonizedAttributes: HarmonizedAttribute[];
  allHarmonizedAttributes: HarmonizedAttribute[];
  defaultVisibleDisplayNames: string[];
}

export function MergedDatasetsAnswer(props: any) {
  const [showDataSources, setShowDataSources] = useState(true);
  const [showPublicUserDatasets, setShowPublicUserDatasets] = useState(true);
  const [showPrivateUserDatasets, setShowPrivateUserDatasets] = useState(true);
  const [userSelectedColumns, setUserSelectedColumns] = useState<
    AttributeField[] | null
  >(null);
  const DefaultComponent = props.DefaultComponent;

  // Store both record classes for custom cell rendering
  const [datasetRecordClass, setDatasetRecordClass] =
    useState<RecordClass | null>(null);
  const [userDatasetRecordClass, setUserDatasetRecordClass] =
    useState<RecordClass | null>(null);

  const mergedState = useWdkService(
    async (wdkService) => {
      try {
        // 1. Fetch metadata (record classes, questions, and ontology)
        const [
          fetchedDatasetRecordClass,
          fetchedUserDatasetRecordClass,
          datasetQuestion,
          userDatasetQuestion,
          ontology,
        ] = await Promise.all([
          wdkService.findRecordClass('dataset'),
          wdkService.findRecordClass('userdataset'),
          wdkService.findQuestion('AllDatasets'),
          wdkService.findQuestion('AllUserDatasets'),
          wdkService.getCategoriesOntology(),
        ]);

        // Store record classes for custom cell rendering
        setDatasetRecordClass(fetchedDatasetRecordClass);
        setUserDatasetRecordClass(fetchedUserDatasetRecordClass);

        // 2. Get attribute names with scope='results' from ontology for each record class
        const datasetResultAttributeNames = preorderSeq(ontology.tree)
          .filter(
            isQualifying({
              scope: 'results',
              targetType: 'attribute',
              recordClassName: fetchedDatasetRecordClass.fullName,
            })
          )
          .map(getId)
          .toArray();

        const userDatasetResultAttributeNames = preorderSeq(ontology.tree)
          .filter(
            isQualifying({
              scope: 'results',
              targetType: 'attribute',
              recordClassName: fetchedUserDatasetRecordClass.fullName,
            })
          )
          .map(getId)
          .toArray();

        // 3. Filter attributes to only those with result scope (plus primary_key)
        const allDatasetAttrs = fetchedDatasetRecordClass.attributes.filter(
          (attr) =>
            datasetResultAttributeNames.includes(attr.name) ||
            attr.name === 'primary_key'
        );
        const allUserDatasetAttrs =
          fetchedUserDatasetRecordClass.attributes.filter(
            (attr) =>
              userDatasetResultAttributeNames.includes(attr.name) ||
              attr.name === 'primary_key'
          );

        // 3. Harmonize ALL attributes (not just defaults) so Add Columns shows everything
        const allHarmonizedAttributes = harmonizeAttributes(
          allDatasetAttrs,
          allUserDatasetAttrs
        );

        // 4. Get question defaults to determine which to fetch initially
        const datasetDefaultAttrNames = datasetQuestion.defaultAttributes;
        const userDatasetDefaultAttrNames =
          userDatasetQuestion.defaultAttributes;

        // 5. Build list of default attributes to fetch from harmonized set
        const defaultsToFetch = allHarmonizedAttributes.filter((attr) => {
          const inDatasetDefaults =
            attr.datasetAttrName &&
            datasetDefaultAttrNames.includes(attr.datasetAttrName);
          const inUserDatasetDefaults =
            attr.userDatasetAttrName &&
            userDatasetDefaultAttrNames.includes(attr.userDatasetAttrName);
          return inDatasetDefaults || inUserDatasetDefaults;
        });

        const harmonizedAttributes = defaultsToFetch;

        // Create modified attribute metadata that uses displayName as the name
        // Exception: keep primary_key as 'primary_key' so WDK renders it as a link
        const harmonizedAttributesWithDisplayNameAsKey =
          harmonizedAttributes.map((attr) => ({
            ...attr,
            metadata: {
              ...attr.metadata,
              name:
                attr.datasetAttrName === 'primary_key' ||
                attr.userDatasetAttrName === 'primary_key'
                  ? 'primary_key'
                  : attr.displayName,
            },
          }));

        // 4. Determine default visible attributes (union of both question defaults)
        // Use allHarmonizedAttributes here, not the filtered defaultsToFetch
        const defaultVisibleDisplayNames = getDefaultVisibleAttributes(
          datasetQuestion,
          userDatasetQuestion,
          fetchedDatasetRecordClass,
          fetchedUserDatasetRecordClass,
          allHarmonizedAttributes
        );

        // 5. Extract all native attribute names for each record type from harmonized set
        const datasetAttrsToFetch = harmonizedAttributesWithDisplayNameAsKey
          .map((a) => a.datasetAttrName)
          .filter((name): name is string => name !== null);

        const userDatasetAttrsToFetch = harmonizedAttributesWithDisplayNameAsKey
          .map((a) => a.userDatasetAttrName)
          .filter((name): name is string => name !== null);

        // 6. Fetch data in parallel
        const reportConfig = {
          tables: [],
          pagination: { offset: 0, numRecords: 4000 },
          sorting: props.stateProps.displayInfo?.sorting || [],
        };

        const [datasetsAnswer, userDatasetsAnswer] = await Promise.all([
          wdkService.getAnswerJson(
            { searchName: 'AllDatasets', searchConfig: { parameters: {} } },
            { ...reportConfig, attributes: datasetAttrsToFetch }
          ),
          wdkService
            .getAnswerJson(
              {
                searchName: 'AllUserDatasets',
                searchConfig: { parameters: {} },
              },
              { ...reportConfig, attributes: userDatasetAttrsToFetch }
            )
            .catch((err: any) => {
              console.warn('Failed to fetch user datasets:', err);
              return { records: [], meta: { totalCount: 0, responseCount: 0 } };
            }),
        ]);

        // 7. Normalize records
        // Use allHarmonizedAttributes so all possible columns are initialized (prevents sorting errors)
        const allHarmonizedWithDisplayNameAsKey = allHarmonizedAttributes.map(
          (attr) => ({
            ...attr,
            metadata: {
              ...attr.metadata,
              name:
                attr.datasetAttrName === 'primary_key' ||
                attr.userDatasetAttrName === 'primary_key'
                  ? 'primary_key'
                  : attr.displayName,
            },
          })
        );

        const normalizedDatasets = normalizeRecords(
          datasetsAnswer.records,
          allHarmonizedWithDisplayNameAsKey,
          'dataset'
        );

        const normalizedUserDatasets = normalizeRecords(
          userDatasetsAnswer.records,
          allHarmonizedWithDisplayNameAsKey,
          'userdataset'
        );

        // 8. Merge
        const mergedRecords = [
          ...normalizedDatasets,
          ...normalizedUserDatasets,
        ];

        return {
          records: mergedRecords,
          harmonizedAttributes: harmonizedAttributesWithDisplayNameAsKey,
          allHarmonizedAttributes: allHarmonizedAttributes.map((attr) => ({
            ...attr,
            metadata: {
              ...attr.metadata,
              name:
                attr.datasetAttrName === 'primary_key' ||
                attr.userDatasetAttrName === 'primary_key'
                  ? 'primary_key'
                  : attr.displayName,
            },
          })),
          defaultVisibleDisplayNames,
        };
      } catch (error) {
        console.error('Error fetching/merging datasets:', error);
        return null;
      }
    },
    [] // Empty deps - only fetch once on mount, don't re-fetch on sorting/column changes
  );

  // Filter by source type
  const filteredRecords = useMemo(() => {
    if (!mergedState) return [];
    return mergedState.records.filter((record) => {
      if (record.dataset_source === 'dataset') return showDataSources;
      else if (record.is_public) return showPublicUserDatasets;
      else return showPrivateUserDatasets;
    });
  }, [
    mergedState,
    showDataSources,
    showPublicUserDatasets,
    showPrivateUserDatasets,
  ]);

  // Compute visible attributes - use user selections if available, otherwise defaults
  const visibleAttributes = useMemo(() => {
    if (!mergedState) return [];

    // If user has explicitly selected columns, use those
    if (userSelectedColumns) {
      return userSelectedColumns;
    }

    // Otherwise use our merged defaults (union of Dataset + UserDataset defaults)
    const defaults = mergedState.allHarmonizedAttributes
      .filter((a: HarmonizedAttribute) =>
        mergedState.defaultVisibleDisplayNames.includes(a.displayName)
      )
      .map((a: HarmonizedAttribute) => a.metadata);

    return defaults;
  }, [mergedState, userSelectedColumns]);

  // Intercept column changes to manage our own state
  const handleChangeColumns = useCallback((newColumns: AttributeField[]) => {
    setUserSelectedColumns(newColumns);
  }, []);

  // Create a synthetic attribute for the source icon column
  const sourceIconAttribute: AttributeField = useMemo(
    () => ({
      name: '__source_icon__',
      displayName: ' ',
      help: '',
      isDisplayable: true,
      isRemovable: false,
      isSortable: false,
      isInReport: true,
      truncateTo: 0,
      type: 'string',
      align: 'center',
      formats: [],
    }),
    []
  );

  // Prepend icon column to allAttributes and visibleAttributes
  const allAttributesWithIcon = useMemo(() => {
    if (!mergedState) return [];
    return [
      sourceIconAttribute,
      ...mergedState.allHarmonizedAttributes.map((a) => a.metadata),
    ];
  }, [mergedState, sourceIconAttribute]);

  const visibleAttributesWithIcon = useMemo(() => {
    return [sourceIconAttribute, ...visibleAttributes];
  }, [sourceIconAttribute, visibleAttributes]);

  // Custom cell renderer to use correct recordClass for links
  const renderCellContent = useCallback(
    (cellProps: any) => {
      const { value, attribute, record, CellContent } = cellProps;

      // For primary_key, use the record's dataset_source to determine correct recordClass
      if (
        attribute.name === 'primary_key' &&
        datasetRecordClass &&
        userDatasetRecordClass
      ) {
        const recordClassToUse =
          (record as NormalizedRecord).dataset_source === 'dataset'
            ? datasetRecordClass
            : userDatasetRecordClass;

        if (value == null) {
          return null;
        }

        return (
          <RecordLink
            recordId={record.id}
            recordClass={recordClassToUse}
            className="wdk-AnswerTable-recordLink"
          >
            {renderAttributeValue(value)}
          </RecordLink>
        );
      }

      // For all other attributes, use default rendering
      return <CellContent {...cellProps} />;
    },
    [datasetRecordClass, userDatasetRecordClass]
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Inject filters after description element
  useEffect(() => {
    if (!containerRef.current) return;

    const moveFilters = () => {
      const description = containerRef.current?.querySelector(
        '.wdk-AnswerDescription'
      );
      const filters = containerRef.current?.querySelector(
        '.AllDatasets-SourceFilters'
      ) as HTMLElement;

      if (description && filters) {
        // Insert filters after description
        description.parentNode?.insertBefore(filters, description.nextSibling);
        // Show filters now that they're positioned correctly
        filters.classList.add('positioned');
        return true;
      }
      return false;
    };

    // Try immediately
    if (moveFilters()) return;

    // If that didn't work, watch for the description element to appear
    const observer = new MutationObserver(() => {
      if (moveFilters()) {
        observer.disconnect();
      }
    });

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [mergedState]);

  if (!mergedState) {
    return <Loading />;
  }

  return (
    <div className="AllDatasets-Container" ref={containerRef}>
      <div className="AllDatasets-SourceFilters">
        <label>
          <input
            type="checkbox"
            checked={showDataSources}
            onChange={(e) => setShowDataSources(e.target.checked)}
          />
          <img
            src={`${webAppUrl}/images/${projectId}/favicon.ico`}
            alt="VEuPathDB dataset"
            style={{ width: '20px', height: '20px', objectFit: 'contain' }}
          />
          {' VEuPathDB datasets'}
        </label>
        <label>
          <input
            type="checkbox"
            checked={showPublicUserDatasets}
            onChange={(e) => setShowPublicUserDatasets(e.target.checked)}
          />
          <PublicIcon style={{ width: '20px', height: '20px' }} />
          {' Public User Datasets'}
        </label>
        <label>
          <input
            type="checkbox"
            checked={showPrivateUserDatasets}
            onChange={(e) => setShowPrivateUserDatasets(e.target.checked)}
          />
          <LockIcon style={{ width: '20px', height: '20px' }} />
          {' Private User Datasets'}
        </label>
      </div>
      <DefaultComponent
        {...props}
        renderCellContent={renderCellContent}
        dispatchProps={{
          ...props.dispatchProps,
          changeVisibleColumns: handleChangeColumns,
        }}
        stateProps={{
          ...props.stateProps,
          records: filteredRecords,
          allAttributes: allAttributesWithIcon,
          visibleAttributes: visibleAttributesWithIcon,
          meta: {
            ...props.stateProps.meta,
            totalCount: filteredRecords.length,
            responseCount: filteredRecords.length,
          },
        }}
      />
    </div>
  );
}

// Helper functions

/**
 * Determine default visible attributes by taking union of both question defaults.
 * 1. Get each question's defaultAttributes (native attribute names)
 * 2. Resolve to displayNames using record class metadata
 * 3. Union the displayName sets
 * 4. Result is used to set initial visible columns
 */
function getDefaultVisibleAttributes(
  datasetQuestion: Question,
  userDatasetQuestion: Question,
  datasetRecordClass: RecordClass,
  userDatasetRecordClass: RecordClass,
  harmonizedAttributes: HarmonizedAttribute[]
): string[] {
  // Build lookup maps: native name → displayName
  const datasetNameToDisplay = new Map<string, string>();
  datasetRecordClass.attributes.forEach((attr) => {
    datasetNameToDisplay.set(attr.name, attr.displayName);
  });

  const userDatasetNameToDisplay = new Map<string, string>();
  userDatasetRecordClass.attributes.forEach((attr) => {
    userDatasetNameToDisplay.set(attr.name, attr.displayName);
  });

  // Convert default attributes to displayNames
  const datasetDefaultDisplayNames = datasetQuestion.defaultAttributes
    .map((name) => datasetNameToDisplay.get(name))
    .filter((displayName): displayName is string => displayName !== undefined);

  const userDatasetDefaultDisplayNames = userDatasetQuestion.defaultAttributes
    .map((name) => userDatasetNameToDisplay.get(name))
    .filter((displayName): displayName is string => displayName !== undefined);

  // Union of displayNames
  const unionDisplayNames = Array.from(
    new Set([...datasetDefaultDisplayNames, ...userDatasetDefaultDisplayNames])
  );

  // Filter to only those that exist in harmonized attributes
  return unionDisplayNames.filter((displayName) =>
    harmonizedAttributes.some((attr) => attr.displayName === displayName)
  );
}

function harmonizeAttributes(
  datasetAttrs: AttributeField[],
  userDatasetAttrs: AttributeField[]
): HarmonizedAttribute[] {
  const map = new Map<string, HarmonizedAttribute>();

  const datasetFiltered = datasetAttrs.filter(
    (attr) => attr.isDisplayable || attr.name === 'primary_key'
  );
  const userDatasetFiltered = userDatasetAttrs.filter(
    (attr) => attr.isDisplayable || attr.name === 'primary_key'
  );

  datasetFiltered.forEach((attr) => {
    map.set(attr.displayName, {
      displayName: attr.displayName,
      datasetAttrName: attr.name,
      userDatasetAttrName: null,
      metadata: attr,
    });
  });

  userDatasetFiltered.forEach((attr) => {
    if (map.has(attr.displayName)) {
      const existing = map.get(attr.displayName)!;
      existing.userDatasetAttrName = attr.name;
    } else {
      map.set(attr.displayName, {
        displayName: attr.displayName,
        datasetAttrName: null,
        userDatasetAttrName: attr.name,
        metadata: attr,
      });
    }
  });

  return Array.from(map.values());
}

function normalizeRecords(
  records: RecordInstance[],
  harmonizedAttrs: HarmonizedAttribute[],
  sourceType: 'dataset' | 'userdataset'
): NormalizedRecord[] {
  return records.map((record, index) => {
    const normalizedAttributes: Record<string, any> = {};

    harmonizedAttrs.forEach((attr) => {
      const sourceAttrName =
        sourceType === 'dataset'
          ? attr.datasetAttrName
          : attr.userDatasetAttrName;

      // Use metadata.name (which is now displayName) as the key
      const targetKey = attr.metadata.name;

      // If this record type doesn't have this attribute, set to null
      if (!sourceAttrName) {
        normalizedAttributes[targetKey] = null;
        return;
      }

      // Get the value from the record (may be null/undefined)
      const value = record.attributes[sourceAttrName];

      normalizedAttributes[targetKey] = value ?? null;
    });

    // For UserDatasets, extract is_public attribute
    const isPublic =
      sourceType === 'userdataset'
        ? record.attributes.is_public === 'Public'
        : undefined;

    // Add synthetic source icon attribute as HTML
    const iconHtml =
      sourceType === 'dataset'
        ? `<img src="${webAppUrl}/images/${projectId}/favicon.ico" alt="VEuPathDB dataset" title="VEuPathDB dataset" style="width: 20px; height: 20px; object-fit: contain;" />`
        : isPublic
        ? `<svg class="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true" title="Public User Dataset" style="width: 20px; height: 20px;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></svg>`
        : `<svg class="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true" title="Private User Dataset" style="width: 20px; height: 20px;"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"></path></svg>`;

    normalizedAttributes['__source_icon__'] = iconHtml;

    return {
      ...record,
      attributes: normalizedAttributes,
      dataset_source: sourceType,
      is_public: isPublic,
      // Override recordClassName so links point to correct record type
      recordClassName: sourceType === 'dataset' ? 'dataset' : 'userdataset',
    };
  });
}
