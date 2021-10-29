import { useState, useCallback, useEffect } from 'react';
import { ceil, uniqBy } from 'lodash';
import SettingsIcon from '@material-ui/icons/Settings';

import { H5 } from '@veupathdb/core-components/dist/components/headers';
import DataGrid from '@veupathdb/core-components/dist/components/grids/DataGrid';
import FullScreenModal from '@veupathdb/core-components/dist/components/modals/FullScreenModal';
import SwissArmyButton from '@veupathdb/core-components/dist/components/buttons/SwissArmyButton';
import { Download } from '@veupathdb/core-components/dist/components/icons';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { AnalysisState } from '../../core/hooks/analysis';
import {
  StudyEntity,
  TabularDataResponse,
  useStudyMetadata,
  useStudyRecord,
  useSubsettingClient,
} from '../../core';

import MultiSelectVariableTree from '../../core/components/variableTrees/MultiSelectVariableTree';
import { VariableDescriptor } from '../../core/types/variable';
import {
  useFeaturedFields,
  useFlattenedFields,
} from '../../core/components/variableTrees/hooks';
import { useProcessedGridData } from './hooks';
import { APIError } from '../../core/api/types';
import { AnalysisSummary } from '../AnalysisSummary';

type SubsettingDataGridProps = {
  /** Should the modal currently be visible? */
  displayModal: boolean;
  /** Toggle the display of the modal. */
  toggleDisplay: () => void;
  /** Analysis state. We will read/write to this object. */
  analysisState: AnalysisState;
  /** The entities for the Study/Analysis being interacted with. */
  entities: Array<StudyEntity>;
  /** The ID of the currently selected entity. */
  currentEntityID: string;
  /** Record counts for the currently selected entity. With an without any applied filters. */
  currentEntityRecordCounts: {
    total: number | undefined;
    filtered: number | undefined;
  };
};

/**
 * Displays a modal through with the user can:
 * 1. Select entity/variable data for display in a tabular format.
 * 2. Request a CSV of the selected data for download.
 */
export default function SubsettingDataGridModal({
  displayModal,
  toggleDisplay,
  analysisState,
  entities,
  currentEntityID,
  currentEntityRecordCounts,
}: SubsettingDataGridProps) {
  //   Various Custom Hooks
  const studyRecord = useStudyRecord();
  const studyMetadata = useStudyMetadata();
  const subsettingClient = useSubsettingClient();
  const featuredFields = useFeaturedFields(entities);
  const flattenedFields = useFlattenedFields(entities);

  const [currentEntity, setCurrentEntity] = useState<StudyEntity | undefined>(
    undefined
  );

  // Used to track if there is an inflight API call.
  const [dataLoading, setDataLoading] = useState(false);

  // API error storage.
  const [apiError, setApiError] = useState<APIError | null>(null);

  // Whether or not to display the variable tree.
  const [displayVariableTree, setDisplayVariableTree] = useState(false);

  // Internal storage of currently loaded data from API.
  const [gridData, setGridData] = useState<TabularDataResponse | null>(null);
  const [gridColumns, gridRows] = useProcessedGridData(
    gridData,
    flattenedFields,
    entities,
    currentEntityID
  );

  // The current record pagecount.
  const [pageCount, setPageCount] = useState(0);

  // An array of variable descriptors representing the currently
  // selected variables.
  const [
    selectedVariableDescriptors,
    setSelectedVariableDescriptors,
  ] = useState<Array<VariableDescriptor>>([]);

  /**
   * An array of variable descriptors for the current entity's
   * featured and stared variables.
   */
  const [
    featuredAndStarredVariableDescriptors,
    setFeaturedAndStarredVariableDescriptors,
  ] = useState<Array<VariableDescriptor>>([]);

  /**
   * If the user has not manually selected any variables for display,
   * we will attempt to use any starred/featured variables for the current
   * entity as default data grid columns.
   */
  useEffect(() => {
    const starredVariables: Array<VariableDescriptor> =
      analysisState.analysis?.descriptor.starredVariables.filter(
        (variable) => variable.entityId === currentEntityID
      ) ?? [];

    const featuredVariables: Array<VariableDescriptor> = featuredFields
      .filter((field) => field.term.startsWith(currentEntityID))
      .map((field) => {
        return {
          entityId: currentEntityID,
          variableId: field.term.split('/')[1],
        };
      });

    setFeaturedAndStarredVariableDescriptors(
      uniqBy(
        [...starredVariables, ...featuredVariables],
        (value) => `${value.entityId}/${value.variableId}`
      )
    );
  }, [
    analysisState.analysis,
    currentEntityID,
    featuredFields,
    setFeaturedAndStarredVariableDescriptors,
  ]);

  /**
   * Actions to take when the modal is opened.
   */
  const onModalOpen = () => {
    // Sync the current entity inside the modal to whatever is
    // current selected by the user outside the modal.
    setCurrentEntity(entities.find((entity) => entity.id === currentEntityID));

    // Determine if we need to load previously selected variables for the current
    // entity by seeing if any variable selections are stored in the analysis.
    const previouslyStoredEntityData =
      analysisState.analysis?.descriptor.dataTableConfig[currentEntityID];

    if (previouslyStoredEntityData) {
      // Load variables selections from analysis.
      setSelectedVariableDescriptors(previouslyStoredEntityData.variables);
    } else {
      // Use featured and starred variables as defaults if nothing is present on the analysis.
      setSelectedVariableDescriptors(featuredAndStarredVariableDescriptors);
    }
  };

  /** Actions to take when modal is closed. */
  const onModalClose = () => {
    setGridData(null);
    setSelectedVariableDescriptors([]);
    setDisplayVariableTree(false);
  };

  const fetchPaginatedData = useCallback(
    ({ pageSize, pageIndex }) => {
      setDataLoading(true);

      subsettingClient
        .getTabularData(studyMetadata.id, currentEntityID, {
          filters: analysisState.analysis?.descriptor.subset.descriptor ?? [],
          outputVariableIds: selectedVariableDescriptors.map(
            (descriptor) => descriptor.variableId
          ),
          reportConfig: {
            paging: { numRows: pageSize, offset: pageSize * pageIndex },
          },
        })
        .then((data) => {
          setGridData(data);
          setPageCount(ceil(currentEntityRecordCounts.filtered! / pageSize));
        })
        .catch((error: Error) => {
          setApiError(JSON.parse(error.message.split('\n')[1]));
        })
        .finally(() => {
          setDataLoading(false);
        });
    },
    [
      currentEntityID,
      currentEntityRecordCounts.filtered,
      selectedVariableDescriptors,
      studyMetadata.id,
      subsettingClient,
      analysisState.analysis?.descriptor.subset.descriptor,
    ]
  );

  // Function to download selected data.
  const downloadData = useCallback(() => {
    subsettingClient.tabularDataDownload(studyMetadata.id, currentEntityID, {
      filters: analysisState.analysis?.descriptor.subset.descriptor ?? [],
      outputVariableIds: selectedVariableDescriptors.map(
        (descriptor) => descriptor.variableId
      ),
    });
  }, [
    subsettingClient,
    selectedVariableDescriptors,
    currentEntityID,
    studyMetadata.id,
    analysisState.analysis?.descriptor.subset.descriptor,
  ]);

  /** Handler for when a user selects/de-selectors variables. */
  const handleSelectedVariablesChange = (
    variableDescriptors: Array<VariableDescriptor>
  ) => {
    // Update the analysis to save the user's selections.
    analysisState.setDataTableConfig({
      ...analysisState.analysis?.descriptor.dataTableConfig,
      [currentEntityID]: { variables: variableDescriptors, sorting: null },
    });

    setSelectedVariableDescriptors(variableDescriptors);
  };

  /** Whenever `selectedVariableDescriptors` changes, load a new data set. */
  useEffect(() => {
    setApiError(null);
    selectedVariableDescriptors.length
      ? fetchPaginatedData({ pageSize: 10, pageIndex: 0 })
      : setGridData(null);
  }, [selectedVariableDescriptors, fetchPaginatedData]);

  // Render the table data or instructions on how to get started.
  const renderDataGridArea = () => {
    return (
      <div style={{ overflowX: 'auto' }}>
        {gridData ? (
          <DataGrid
            columns={gridColumns}
            data={gridRows}
            loading={dataLoading}
            stylePreset="mesa"
            pagination={{
              recordsPerPage: 10,
              controlsLocation: 'bottom',
              serverSidePagination: {
                fetchPaginatedData,
                pageCount,
              },
            }}
          />
        ) : !dataLoading ? (
          <div
            style={{
              border: '2px solid lightgray',
              padding: 10,
              borderRadius: 5,
              height: '25vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <H5
              text='To get started, click on the "Select Variables" button above.'
              additionalStyles={{ fontSize: 18 }}
            />
          </div>
        ) : null}
      </div>
    );
  };

  // Render the variable selection panel.
  const renderVariableSelectionArea = () => {
    const errorMessage = apiError
      ? apiError.message === 'Unable to fetch all required data'
        ? 'We are not currently able to fetch all the desired columns. Please reduce the number of selected columns.'
        : 'An unexpected error occurred while trying to retrieve the requested data.'
      : null;

    if ((displayVariableTree || errorMessage) && currentEntity) {
      return (
        <div
          style={{
            position: 'absolute',
            width: 410,
            right: 0,
            top: 0,
            backgroundColor: 'rgba(255, 255, 255, 1)',
            border: '2px solid rgb(200, 200, 200)',
            borderRadius: 5,
          }}
        >
          {errorMessage && (
            <div
              style={{
                borderColor: '#d32323',
                backgroundColor: '#d32323',
                borderRadius: 5,
                borderWidth: 2,
                borderStyle: 'solid',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <H5
                text="Error"
                textTransform="uppercase"
                color="white"
                additionalStyles={{
                  margin: 0,
                  paddingLeft: 10,
                  paddingRight: 10,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
              <H5
                text={errorMessage}
                color="#d32323"
                additionalStyles={{
                  flex: 1,
                  fontSize: 14,
                  padding: 5,
                  paddingLeft: 10,
                  backgroundColor: 'white',
                }}
              />
            </div>
          )}
          <div>
            <MultiSelectVariableTree
              // NOTE: We are purposely removing all child entities here because
              // we only want a user to be able to select variables from a single
              // entity at a time.
              rootEntity={{ ...currentEntity, children: [] }}
              selectedVariableDescriptors={selectedVariableDescriptors}
              onSelectedVariablesChange={handleSelectedVariablesChange}
            />
          </div>
        </div>
      );
    }
  };

  return (
    <FullScreenModal
      visible={displayModal}
      onOpen={onModalOpen}
      onClose={onModalClose}
    >
      <div key="Title" style={{ marginBottom: 35 }}>
        <h1 style={{ paddingBottom: 0 }}>
          {safeHtml(studyRecord.displayName)}
        </h1>
        <AnalysisSummary
          analysis={analysisState.analysis!}
          setAnalysisName={analysisState.setName}
          saveAnalysis={analysisState.saveAnalysis}
        />
      </div>
      <div
        key="Controls"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ marginBottom: 15 }}>
          <span
            style={{
              fontSize: 18,
              fontWeight: 500,
              color: '#646464',
              textTransform: 'capitalize',
            }}
          >
            {currentEntity?.displayNamePlural}
          </span>
          {currentEntityRecordCounts.filtered &&
            currentEntityRecordCounts.total && (
              <p
                style={{
                  marginTop: 0,
                  marginBottom: 0,
                  color: 'gray',
                }}
              >
                {`${currentEntityRecordCounts.filtered.toLocaleString()} of ${currentEntityRecordCounts.total.toLocaleString()} records selected`}
              </p>
            )}
        </div>
        <div
          style={{
            display: 'flex',
            flexBasis: 410,
            justifyContent: 'flex-end',
            marginBottom: 15,
          }}
        >
          <div
            style={{
              display: 'flex',
              paddingRight: 50,
              flex: 1,
            }}
          >
            <SwissArmyButton
              text="Download"
              icon={Download}
              stylePreset="mesa"
              styleOverrides={{ container: { marginRight: 10 } }}
              onPress={downloadData}
            />
            <SwissArmyButton
              text="Select Variables"
              stylePreset="mesa"
              // @ts-ignore
              icon={SettingsIcon}
              size="medium"
              onPress={() => setDisplayVariableTree(!displayVariableTree)}
            />
          </div>
          <SwissArmyButton
            text="Close"
            stylePreset="mesa"
            onPress={() => toggleDisplay()}
          />
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        {renderDataGridArea()}
        {renderVariableSelectionArea()}
      </div>
    </FullScreenModal>
  );
}
