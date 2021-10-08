import { useState, useCallback, useEffect } from 'react';
import { ceil } from 'lodash';
import { H3, H5 } from '@veupathdb/core-components/dist/components/headers';
import DataGrid from '@veupathdb/core-components/dist/components/grids/DataGrid';
import FullScreenModal from '@veupathdb/core-components/dist/components/modals/FullScreenModal';
import SwissArmyButton from '@veupathdb/core-components/dist/components/buttons/SwissArmyButton';

import { AnalysisState } from '../../core/hooks/analysis';
import {
  StudyEntity,
  TabularDataResponse,
  useStudyMetadata,
  useSubsettingClient,
} from '../../core';

import MultiSelectVariableTree from '../../core/components/variableTrees/MultiSelectVariableTree';
import { VariableDescriptor } from '../../core/types/variable';
import { useFlattenedFields } from '../../core/components/variableTrees/hooks';
import { useProcessedGridData } from './hooks';
import { APIError } from '../../core/api/types';

type SubsettingDataGridProps = {
  /** Should the modal currently be visible? */
  displayModal: boolean;
  /** Toggle the display of the modal. */
  toggleDisplay: () => void;
  /**
   * Analysis state. We will read/write to this object as
   * people change the variables selected for display.
   * */
  analysisState: AnalysisState;
  /** The entities for the Study/Analysis being interacted with. */
  entities: Array<StudyEntity>;
  /** The ID of the currently selected entity OUTSIDE of the modal.  */
  currentEntityID: string;
  /** The total number of records in the datastore for the currently selected entity. */
  currentEntityRecordCount: number;
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
  currentEntityRecordCount,
}: SubsettingDataGridProps) {
  //   Various Custom Hooks
  const studyMetadata = useStudyMetadata();
  const subsettingClient = useSubsettingClient();
  const flattenedFields = useFlattenedFields(entities, false);

  const [currentEntity, setCurrentEntity] = useState<StudyEntity | undefined>(
    undefined
  );

  // Used to track if there is an inflight API call.
  const [dataLoading, setDataLoading] = useState(false);

  // API error storage.
  const [apiError, setApiError] = useState<APIError | null>(null);

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

  // Whether or not to display the variable tree.
  const [displayVariableTree, setDisplayVariableTree] = useState(false);

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
      analysisState.analysis?.descriptor.dataTableSettings.selectedVariables[
        currentEntityID
      ];

    if (previouslyStoredEntityData?.length) {
      const variableDescriptors = previouslyStoredEntityData.map(
        (variable): VariableDescriptor => ({
          entityId: currentEntityID,
          variableId: variable,
        })
      );

      setSelectedVariableDescriptors(variableDescriptors);

      console.log('Loaded Variable Selections from Analysis');
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
          filters: [],
          outputVariableIds: selectedVariableDescriptors.map(
            (descriptor) => descriptor.variableId
          ),
          reportConfig: {
            paging: { numRows: pageSize, offset: pageSize * pageIndex },
          },
        })
        .then((data) => {
          setGridData(data);
          setPageCount(ceil(currentEntityRecordCount / pageSize));
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
      currentEntityRecordCount,
      selectedVariableDescriptors,
      studyMetadata.id,
      subsettingClient,
    ]
  );

  /** Handler for when a user selects/de-selectors variables. */
  const handleSelectedVariablesChange = (
    variableDescriptors: Array<VariableDescriptor>
  ) => {
    // Update analysisState
    analysisState.setDataTableSettings({
      selectedVariables: {
        // Reiterate any current data for other entities.
        ...analysisState.analysis?.descriptor.dataTableSettings
          .selectedVariables,
        // Update the data for the current entity.
        [currentEntityID]: variableDescriptors.map(
          (descriptor) => descriptor.variableId
        ),
      },
      sorting: [],
    });
    setSelectedVariableDescriptors(variableDescriptors);
  };

  /** Whenever the selected variables change, load a new data set. */
  useEffect(() => {
    setApiError(null);
    selectedVariableDescriptors.length
      ? fetchPaginatedData({ pageSize: 10, pageIndex: 0 })
      : setGridData(null);
  }, [selectedVariableDescriptors, fetchPaginatedData]);

  // Render the table data or instructions on how to get started.
  const renderDataGridArea = () => {
    return (
      <div style={{ flex: 2, overflowX: 'auto' }}>
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
              text='To get started, click on the "Select Variables" button.'
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
            right: 50,
            top: 100,
            backgroundColor: 'rgba(255, 255, 255, 1)',
            filter: 'drop-shadow(1px 1px 3px gray)',
            borderRadius: 5,
          }}
        >
          {errorMessage && (
            <div
              style={{
                borderColor: '#d32323',
                backgroundColor: '#d32323',
                borderRadius: 5,
                // padding: 10,
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
      <div
        key="Title and Controls"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          marginBottom: 15,
        }}
      >
        <H3
          text={analysisState.analysis?.displayName ?? ''}
          additionalStyles={{ flex: 1 }}
          underline
        />
        <div
          style={{
            display: 'flex',
            flexBasis: 410,
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: 'flex',
              marginRight: 50,
              justifyContent: 'flex-start',
              flex: 1,
            }}
          >
            <SwissArmyButton
              text="Download"
              icon="download"
              stylePreset="mesa"
              styleOverrides={{ container: { marginRight: 10 } }}
              onPress={() => console.log('Download Stuff')}
            />
            <SwissArmyButton
              text="Select Variables"
              stylePreset="mesa"
              icon="settings"
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
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {renderDataGridArea()}
        {renderVariableSelectionArea()}
      </div>
    </FullScreenModal>
  );
}
