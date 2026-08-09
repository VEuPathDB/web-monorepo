import React, {
  useMemo,
  useState,
  useCallback,
  ComponentType,
  ReactNode,
} from 'react';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
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
import {
  DatasetSourceFilters,
  DatasetSourceIcon,
  getDatasetCategory,
  parseYesNo,
  useDatasetSourceFilter,
} from './datasetSourceCategory';

import './MergedDatasetsAnswerController.scss';

interface HarmonizedAttribute {
  displayName: string;
  datasetAttrName: string | null;
  userDatasetAttrName: string | null;
  metadata: AttributeField;
}

interface NormalizedRecord extends RecordInstance {
  dataset_source: 'dataset' | 'userdataset';
  is_public?: boolean;
  owner_is_veupathdb_curator?: boolean;
}

interface MergedState {
  records: NormalizedRecord[];
  harmonizedAttributes: HarmonizedAttribute[];
  allHarmonizedAttributes: HarmonizedAttribute[];
  defaultVisibleDisplayNames: string[];
}

export interface MergedDatasetsConfig {
  datasetRecordClassName: string;
  datasetQuestionName: string;
  userDatasetRecordClassName: string;
  userDatasetQuestionName: string;
  renderPrimaryKeyCellContent: (cellProps: {
    value: unknown;
    attribute: AttributeField;
    record: NormalizedRecord;
    recordClass: RecordClass;
    CellContent: ComponentType<any>;
  }) => ReactNode;
}

export function createMergedDatasetsAnswerController(
  config: MergedDatasetsConfig
): ComponentType<any> {
  return function MergedDatasetsAnswer(props: any) {
    const { visibility, setVisibility } = useDatasetSourceFilter();

    const toSourceInfo = useCallback(
      (record: NormalizedRecord) => ({
        isUserDataset: record.dataset_source !== 'dataset',
        isPublic: record.is_public === true,
        ownerIsVeupathdbCurator: record.owner_is_veupathdb_curator === true,
      }),
      []
    );

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
            wdkService.findRecordClass(config.datasetRecordClassName),
            wdkService.findRecordClass(config.userDatasetRecordClassName),
            wdkService.findQuestion(config.datasetQuestionName),
            wdkService.findQuestion(config.userDatasetQuestionName),
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
          const harmonizedAttributes = allHarmonizedAttributes.filter(
            (attr) => {
              const inDatasetDefaults =
                attr.datasetAttrName &&
                datasetDefaultAttrNames.includes(attr.datasetAttrName);
              const inUserDatasetDefaults =
                attr.userDatasetAttrName &&
                userDatasetDefaultAttrNames.includes(attr.userDatasetAttrName);
              return inDatasetDefaults || inUserDatasetDefaults;
            }
          );

          // Create modified attribute metadata that uses displayName as the name
          // Exception: keep primary_key as 'primary_key' so WDK renders it as a link
          const harmonizedAttributesWithDisplayNameAsKey =
            withDisplayNameAsKey(harmonizedAttributes);

          // 4. Determine default visible attributes (union of both question defaults)
          // Use allHarmonizedAttributes here, not the filtered harmonizedAttributes
          const defaultVisibleDisplayNames = getDefaultVisibleAttributes(
            datasetQuestion,
            userDatasetQuestion,
            fetchedDatasetRecordClass,
            fetchedUserDatasetRecordClass,
            allHarmonizedAttributes
          );

          // 5. Extract all native attribute names for each record type.
          // Fetch every result-scope attribute, not just the question defaults:
          // the Add/Remove Columns panel offers all of them, and adding a column
          // does not trigger a re-fetch (the useWdkService deps below are empty),
          // so any attribute missing here renders as an empty column with no error.
          const allHarmonizedWithKeyForFetch = withDisplayNameAsKey(
            allHarmonizedAttributes
          );

          const datasetAttrsToFetch = allHarmonizedWithKeyForFetch
            .map((a) => a.datasetAttrName)
            .filter((name): name is string => name !== null);

          const userDatasetAttrsToFetch = allHarmonizedWithKeyForFetch
            .map((a) => a.userDatasetAttrName)
            .filter((name): name is string => name !== null);

          // The source-category filter needs this attribute even when its column
          // is hidden, so pin it explicitly rather than relying on harmonization
          // to carry it through.
          if (!userDatasetAttrsToFetch.includes('owner_is_veupathdb_curator')) {
            userDatasetAttrsToFetch.push('owner_is_veupathdb_curator');
          }

          // 6. Fetch data in parallel
          const reportConfig = {
            tables: [],
            pagination: { offset: 0, numRecords: 4000 },
            sorting: props.stateProps.displayInfo?.sorting || [],
          };

          const [datasetsAnswer, userDatasetsAnswer] = await Promise.all([
            wdkService.getAnswerJson(
              {
                searchName: config.datasetQuestionName,
                searchConfig: { parameters: {} },
              },
              { ...reportConfig, attributes: datasetAttrsToFetch }
            ),
            wdkService
              .getAnswerJson(
                {
                  searchName: config.userDatasetQuestionName,
                  searchConfig: { parameters: {} },
                },
                { ...reportConfig, attributes: userDatasetAttrsToFetch }
              )
              .catch((err: any) => {
                console.warn('Failed to fetch user datasets:', err);
                return {
                  records: [],
                  meta: { totalCount: 0, responseCount: 0 },
                };
              }),
          ]);

          // 7. Normalize records
          // Use allHarmonizedAttributes so all possible columns are initialized (prevents sorting errors)
          const allHarmonizedWithDisplayNameAsKey = withDisplayNameAsKey(
            allHarmonizedAttributes
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

          // When the dataset side has no rows at all (e.g. clinepi-site
          // today, before curated datasets are populated), offering or
          // defaulting to its columns would just be a wall of empty cells
          // and dead entries in Add Columns. Drop columns that exist ONLY
          // on the dataset side from both the default-visible set and the
          // Add Columns list; shared columns (meaningful for the
          // userdataset rows present) stay available. Row normalization
          // above still uses the full, unfiltered attribute set — sorting
          // depends on every record having every attribute key, even as
          // null — so this only affects what the UI offers, not the data.
          // Re-evaluated on every load (this effect has empty deps and
          // fetches once per page load), so the columns reappear
          // automatically once the dataset side has real rows again — no
          // code change needed then.
          const isDatasetOnlyColumn = (attr: HarmonizedAttribute) =>
            attr.datasetAttrName != null && attr.userDatasetAttrName == null;

          const uiHarmonizedAttributes =
            datasetsAnswer.records.length === 0
              ? allHarmonizedWithDisplayNameAsKey.filter(
                  (attr) => !isDatasetOnlyColumn(attr)
                )
              : allHarmonizedWithDisplayNameAsKey;

          const visibleDisplayNames = defaultVisibleDisplayNames.filter(
            (displayName) =>
              uiHarmonizedAttributes.some(
                (attr) => attr.displayName === displayName
              )
          );

          return {
            records: mergedRecords,
            harmonizedAttributes: harmonizedAttributesWithDisplayNameAsKey,
            allHarmonizedAttributes: uiHarmonizedAttributes,
            defaultVisibleDisplayNames: visibleDisplayNames,
          };
        } catch (error) {
          console.error('Error fetching/merging datasets:', error);
          return null;
        }
      },
      [] // Empty deps - only fetch once on mount, don't re-fetch on sorting/column changes
    );

    // Filter by source category
    const filteredRecords = useMemo(() => {
      if (!mergedState) return [];
      return mergedState.records.filter(
        (record) => visibility[getDatasetCategory(toSourceInfo(record))]
      );
    }, [mergedState, visibility, toSourceInfo]);

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

    // Intercept column changes to manage our own state.
    // Strip the synthetic source icon column here since it is always
    // re-prepended below; it is isRemovable: false so it always round-trips
    // back through this handler, and without stripping it here it would
    // end up duplicated once prepended again.
    const handleChangeColumns = useCallback(
      (newColumns: AttributeField[]) => {
        const filteredColumns = newColumns.filter(
          (attr) => attr.name !== '__source_icon__'
        );
        setUserSelectedColumns(filteredColumns);

        // If the column currently being sorted on was just removed, WDK's
        // Answer view falls back to sorting by the first visible column,
        // which for us is always the unsortable, valueless icon column and
        // crashes. Reset sorting to the default (primary_key) instead.
        const sorting = props.stateProps.displayInfo?.sorting;
        const sortedAttrName = sorting?.[0]?.attributeName;
        const sortedAttrStillVisible = filteredColumns.some(
          (attr) => attr.name === sortedAttrName
        );
        if (sortedAttrName && !sortedAttrStillVisible) {
          props.dispatchProps.changeSorting([
            { attributeName: 'primary_key', direction: 'ASC' },
          ]);
        }
      },
      [props.stateProps.displayInfo, props.dispatchProps]
    );

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

          return config.renderPrimaryKeyCellContent({
            value,
            attribute,
            record: record as NormalizedRecord,
            recordClass: recordClassToUse,
            CellContent,
          });
        }

        // For the synthetic source icon column, render the icon as a real
        // component rather than an HTML string baked into the record data.
        if (attribute.name === '__source_icon__') {
          const normalizedRecord = record as NormalizedRecord;
          return (
            <DatasetSourceIcon
              category={getDatasetCategory(toSourceInfo(normalizedRecord))}
            />
          );
        }

        // For all other attributes, use default rendering
        return <CellContent {...cellProps} />;
      },
      [datasetRecordClass, userDatasetRecordClass, toSourceInfo]
    );

    const sourceFilters = (
      <DatasetSourceFilters
        visibility={visibility}
        setVisibility={setVisibility}
        className="AllDatasets-SourceFilters"
      />
    );

    if (!mergedState) {
      return <Loading />;
    }

    return (
      <DefaultComponent
        {...props}
        renderCellContent={renderCellContent}
        descriptionSuffix={sourceFilters}
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
    );
  };
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

// Returns a copy of the given harmonized attributes whose metadata.name is
// set to displayName, so records can be normalized/keyed by displayName.
// Exception: primary_key keeps the name 'primary_key' so WDK renders it as a link.
function withDisplayNameAsKey(
  attrs: HarmonizedAttribute[]
): HarmonizedAttribute[] {
  return attrs.map((attr) => ({
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
}

function normalizeRecords(
  records: RecordInstance[],
  harmonizedAttrs: HarmonizedAttribute[],
  sourceType: 'dataset' | 'userdataset'
): NormalizedRecord[] {
  return records.map((record) => {
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

    // Read straight off the raw record: this attribute drives the source
    // category even when its column is hidden, so it is not necessarily
    // present in the harmonized/normalized attribute set.
    const ownerIsVeupathdbCurator =
      sourceType === 'userdataset'
        ? parseYesNo(record.attributes.owner_is_veupathdb_curator)
        : undefined;

    return {
      ...record,
      attributes: normalizedAttributes,
      dataset_source: sourceType,
      is_public: isPublic,
      owner_is_veupathdb_curator: ownerIsVeupathdbCurator,
      // Override recordClassName so links point to correct record type
      recordClassName: sourceType === 'dataset' ? 'dataset' : 'userdataset',
    };
  });
}
