import { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import {
  DataGrid,
  SwissArmyButton,
  FullScreenModal,
  H3,
} from '@veupathdb/core-components';

import { AnalysisState } from '../../core/hooks/analysis';
import {
  StudyEntity,
  TableDataResponse,
  useDataClient,
  useMakeVariableLink,
  useStudyMetadata,
} from '../../core';
import MultiSelectVariableTree from '../../core/components/variableTrees/MultiSelectVariableTree';
import { VariableDescriptor } from '../../core/types/variable';
import { useFlattenedFields } from '../../core/components/variableTrees/hooks';
import { useProcessedGridData } from './hooks';

type SubsettingDataGridProps = {
  /** Should the modal currently be visible? */
  displayModal: boolean;
  /** Toggle the display of the modal. */
  toggleDisplay: () => void;
  /**
   * Analysis state. We will read/write to this object as
   * people change the variable selected for display.
   * TODO: Very possible we don't need the entire object in this component.
   * Consider narrowing this.
   * */
  analysisState: AnalysisState;
  /** The entities for the Study/Analysis being interacted with. */
  entities: Array<StudyEntity>;
  /** The ID of the currently selected entity OUTSIDE of the modal.  */
  currentEntityID: string;
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
}: SubsettingDataGridProps) {
  //   Various Custom Hooks
  const studyMetadata = useStudyMetadata();
  const dataClient = useDataClient();
  const flattenedFields = useFlattenedFields(entities);

  const [currentEntity, setCurrentEntity] = useState<StudyEntity | undefined>(
    undefined
  );

  // While it is possible for the user to switch between entities
  // inside of the modal, we want the selected entity to default to
  // whatever is currently selected outside the modal whenever the
  // modal is opened as an initial value.
  useEffect(() => {
    displayModal &&
      setCurrentEntity(
        entities.find((entity) => entity.id === currentEntityID)
      );
  }, [displayModal, currentEntityID, entities]);

  // Internal storage of currently loaded data from API.
  const [gridData, setGridData] = useState<TableDataResponse | null>(null);
  const [gridColumns, gridRows] = useProcessedGridData(
    gridData,
    flattenedFields,
    entities
  );

  // Whether or not to display the variable tree.
  const [displayVariableTree, setDisplayVariableTree] = useState(false);

  // An array of variable descriptors representing the currently
  // selected variables.
  const [
    selectedVariableDescriptors,
    setSelectedVariableDescriptors,
  ] = useState<Array<VariableDescriptor>>([]);

  /** Handler for when a user selects/de-selectors variables. */
  const handleSelectedVariablesChange = (
    variableDescriptors: Array<VariableDescriptor>
  ) => {
    // Attempt to get data from backend if anything is selected by user.
    if (variableDescriptors.length) {
      dataClient
        .getTableData('pass', {
          studyId: studyMetadata.id,
          config: {
            outputEntityId: currentEntityID,
            outputVariable: variableDescriptors,
            // @ts-ignore
            pagingConfig: { numRows: 20, offset: 0 },
          },
        })
        .then((data) => setGridData(data))
        .catch((error) => console.log(error));
    } else {
      setGridData(null);
    }

    // Update analysisState
    analysisState.setDataTableSettings({
      selectedVariables: {
        // Reiterate any current data for other entities.
        ...analysisState.analysis?.dataTableSettings.selectedVariables,
        // Update the data for the current entity.
        [currentEntityID]: variableDescriptors.map(
          (descriptor) => descriptor.variableId
        ),
      },
      sorting: [],
    });
    setSelectedVariableDescriptors(variableDescriptors);
  };

  useEffect(() => {
    if (analysisState.analysis) {
      console.log(
        'DataTableSettings',
        analysisState.analysis.dataTableSettings
      );
    }
  }, [analysisState.analysis]);

  return (
    <FullScreenModal visible={displayModal}>
      <div
        key="Title and Controls"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 25,
        }}
      >
        <H3
          text={analysisState.analysis?.name ?? ''}
          additionalStyles={{ flex: 2 }}
          underline
        />
        <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end' }}>
          <SwissArmyButton
            type="outlined"
            text="Download"
            icon="download"
            size="medium"
            onPress={() => console.log('Download Stuff')}
            styleOverrides={{ marginRight: 10 }}
          />
          <SwissArmyButton
            type="outlined"
            text="Select Variables"
            onPress={() => setDisplayVariableTree(!displayVariableTree)}
            styleOverrides={{ marginRight: 25 }}
          />
          <SwissArmyButton text="Close" onPress={() => toggleDisplay()} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 2, overflowX: 'auto' }}>
          <DataGrid
            columns={gridColumns}
            data={gridRows}
            pagination={{ recordsPerPage: 10, controlsLocation: 'bottom' }}
          />
        </div>

        {displayVariableTree && currentEntity && (
          <div style={{ flex: 1, marginLeft: 25, marginTop: 0 }}>
            <div>
              <MultiSelectVariableTree
                /** NOTE: We are purposely removing all child entities here because
                 * we only want a user to be able to select variables from a single
                 * entity at a time.
                 */
                rootEntity={{ ...currentEntity, children: [] }}
                selectedVariableDescriptors={selectedVariableDescriptors}
                onSelectedVariablesChange={handleSelectedVariablesChange}
              />
            </div>
          </div>
        )}
      </div>
    </FullScreenModal>
  );
}
