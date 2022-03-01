import { useState, useCallback, useEffect, useMemo } from 'react';
import { ceil } from 'lodash';
import useDimensions from 'react-cool-dimensions';

// Components & Component Generators
import SettingsIcon from '@material-ui/icons/Settings';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import MultiSelectVariableTree from '../../core/components/variableTrees/MultiSelectVariableTree';
import {
  Modal,
  H5,
  DataGrid,
  MesaButton,
  Download,
  CloseFullscreen,
  OutlinedButton,
} from '@veupathdb/coreui';

// Definitions
import { AnalysisState } from '../../core/hooks/analysis';
import { StudyEntity, TabularDataResponse } from '../../core';
import { VariableDescriptor } from '../../core/types/variable';
import { APIError } from '../../core/api/types';
import { gray } from '@veupathdb/coreui/dist/definitions/colors';

// Hooks
import {
  useStudyMetadata,
  useStudyRecord,
  useSubsettingClient,
} from '../../core';

import { useFeaturedFields } from '../../core/components/variableTrees/hooks';
import { useProcessedGridData } from './hooks';

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
  starredVariables?: VariableDescriptor[];
  toggleStarredVariable: (targetVariableId: VariableDescriptor) => void;
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
  starredVariables,
  toggleStarredVariable,
}: SubsettingDataGridProps) {
  const {
    observe: observeEntityDescription,
    width: entityDescriptionWidth,
  } = useDimensions();

  //   Various Custom Hooks
  const studyRecord = useStudyRecord();
  const studyMetadata = useStudyMetadata();
  const subsettingClient = useSubsettingClient();
  const featuredFields = useFeaturedFields(entities, 'download');

  const scopedFeaturedFields = useMemo(
    () =>
      featuredFields.filter((field) =>
        field.term.startsWith(currentEntityID + '/')
      ),
    [currentEntityID, featuredFields]
  );

  const scopedStarredVariables = useMemo(
    () =>
      starredVariables?.filter(
        (variable) => variable.entityId === currentEntityID
      ) ?? [],
    [currentEntityID, starredVariables]
  );

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
    entities,
    currentEntity
  );

  // The current record pagecount.
  const [pageCount, setPageCount] = useState(0);

  // An array of variable descriptors representing the currently
  // selected variables.
  const [
    selectedVariableDescriptors,
    setSelectedVariableDescriptors,
  ] = useState<Array<VariableDescriptor>>(
    analysisState.analysis?.descriptor.dataTableConfig[currentEntityID]
      ?.variables ?? []
  );

  const defaultSelection = useMemo(() => [], []);

  /**
   * Actions to take when the modal is opened.
   */
  const onModalOpen = useCallback(() => {
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
      setSelectedVariableDescriptors(defaultSelection);
    }
  }, [
    analysisState.analysis?.descriptor.dataTableConfig,
    currentEntityID,
    defaultSelection,
    entities,
  ]);

  /** Actions to take when modal is closed. */
  const onModalClose = useCallback(() => {
    setGridData(null);
    setDisplayVariableTree(false);
  }, []);

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
            headerFormat: 'standard',
            trimTimeFromDateVars: true,
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
      reportConfig: {
        headerFormat: 'display',
        trimTimeFromDateVars: true,
      },
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
    if (!displayModal) return;
    setApiError(null);
    fetchPaginatedData({ pageSize: 10, pageIndex: 0 });
  }, [fetchPaginatedData, displayModal]);

  // Render the table data or instructions on how to get started.
  const renderDataGridArea = () => {
    return (
      <div>
        {gridData ? (
          <DataGrid
            columns={gridColumns}
            data={gridRows}
            loading={dataLoading}
            stylePreset="mesa"
            styleOverrides={{ headerCells: { textTransform: 'none' } }}
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
            width: 425,
            left: entityDescriptionWidth + 195,
            top: -54,
            backgroundColor: 'rgba(255, 255, 255, 1)',
            border: '2px solid rgb(200, 200, 200)',
            borderRadius: '.5em',
            boxShadow: '0px 0px 6px rgba(0, 0, 0, .25)',
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
              scope="download"
              selectedVariableDescriptors={selectedVariableDescriptors}
              starredVariableDescriptors={scopedStarredVariables}
              featuredFields={scopedFeaturedFields}
              onSelectedVariablesChange={handleSelectedVariablesChange}
              toggleStarredVariable={toggleStarredVariable}
            />
          </div>
        </div>
      );
    }
  };

  return (
    <Modal
      title={safeHtml(studyRecord.displayName)}
      includeCloseButton={true}
      visible={displayModal}
      toggleVisible={toggleDisplay}
      onOpen={onModalOpen}
      onClose={onModalClose}
      themeRole="primary"
      styleOverrides={{
        content: {
          padding: {
            top: 0,
            right: 25,
            bottom: 25,
            left: 25,
          },
        },
      }}
    >
      <H5
        additionalStyles={{ marginTop: 10, marginBottom: 25 }}
        color={gray[700]}
      >
        {analysisState.analysis?.displayName}
      </H5>
      <div
        key="Controls"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ marginBottom: 15, display: 'flex' }}>
          <div style={{ marginRight: 25 }} ref={observeEntityDescription}>
            <span
              style={{
                fontSize: 18,
                fontWeight: 500,
                color: '#646464',
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
          <OutlinedButton
            text={displayVariableTree ? 'Close Selector' : 'Add Columns'}
            // @ts-ignore
            icon={displayVariableTree ? CloseFullscreen : SettingsIcon}
            size="medium"
            onPress={() => setDisplayVariableTree(!displayVariableTree)}
            styleOverrides={{ container: { width: 155 } }}
            themeRole="primary"
            textTransform="capitalize"
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: 15,
          }}
        >
          <MesaButton
            text="Download"
            icon={Download}
            onPress={downloadData}
            themeRole="primary"
            textTransform="capitalize"
          />
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        {renderDataGridArea()}
        {renderVariableSelectionArea()}
      </div>
    </Modal>
  );
}
