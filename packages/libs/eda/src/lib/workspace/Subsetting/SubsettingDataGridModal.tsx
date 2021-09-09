import { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { AnalysisState } from '../../core/hooks/analysis';
import {
  DataGrid,
  SwissArmyButton,
  FullScreenModal,
  H4,
} from '@veupathdb/core-components';

import { StudyEntity, useMakeVariableLink, useStudyMetadata } from '../../core';
import { useToggleStarredVariable } from '../../core/hooks/starredVariables';
import MultiSelectVariableTree from '../../core/components/variableTrees/MultiSelectVariableTree';
import { VariableDescriptor } from '../../core/types/variable';

type SubsettingDataGridProps = {
  /** Should the modal currently be visible? */
  displayModal: boolean;
  /** Toggle the display of the modal. */
  toggleDisplay: () => void;
  /**
   * Analysis state. We will read/write to this object as
   * people change the variable selected for display.
   * TODO: Very possible we don't need the entire object in this component. Consider narrowing this.
   * */
  analysisState: AnalysisState;
  /** The entities for the Study/Analysis being interacted with. */
  entities: Array<StudyEntity>;
  currentEntityID: string;
  currentVariableID: string;
};

/**
 * Display a modal through with the user can:
 * 1. Select entity/variable data for display in a tabular format.
 * 2. Request a CSV of the selected data for download.
 */
export default function SubsettingDataGridModal({
  displayModal,
  toggleDisplay,
  analysisState,
  entities,
  currentEntityID,
  currentVariableID,
}: SubsettingDataGridProps) {
  //   Various Custom Hooks
  const studyMetadata = useStudyMetadata();
  const history = useHistory();
  const makeVariableLink = useMakeVariableLink();

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

  // Which variables are currently selected.
  // TODO: This may be better as a reducer.
  const [selectedVariables, setSelectedVariables] = useState<
    Array<VariableDescriptor>
  >([]);

  // const toggleStarredVariable = useToggleStarredVariable(analysisState);

  // Whether or not to display the variable tree.
  const [displayVariableTree, setDisplayVariableTree] = useState(false);

  return (
    <FullScreenModal visible={displayModal}>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 2, marginRight: 25 }}>
          <DataGrid
            title={analysisState.analysis?.name}
            columns={[
              {
                Header: 'Participant Name',
                accessor: 'col1', // accessor is the "key" in the data
              },
              {
                Header: 'Participant Species',
                accessor: 'col2',
              },
            ]}
            data={[
              {
                col1: 'Michael',
                col2: 'Hutt',
              },

              {
                col1: 'Shaun',
                col2: 'Wookie',
              },

              {
                col1: 'DK',
                col2: 'Mandolorian',
              },
              {
                col1: 'Connor',
                col2: 'Twilek',
              },
            ]}
          />
        </div>

        <div style={{ flex: 1, marginRight: 25, marginTop: 35 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex' }}>
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
                styleOverrides={{ marginRight: 10 }}
              />
            </div>
            <SwissArmyButton text="Close" onPress={() => toggleDisplay()} />
          </div>

          {displayVariableTree && currentEntity && (
            <div>
              <H4 text="Variable Selection" />
              <MultiSelectVariableTree
                /** NOTE: We are purposely removing all child entities here because
                 * we only want a user to be able to select variables from a single
                 * entity at a time.
                 */
                rootEntity={{ ...currentEntity, children: [] }}
                selectedVariables={selectedVariables}
                onChange={(variable) => {
                  console.log('Hello from Modal', variable);
                  // TODO: This is where we need to update which entity/variables
                  // have been selected.

                  // if (variable) {
                  //   const { entityId, variableId } = variable;
                  //   history.replace(
                  //     makeVariableLink({ entityId, variableId }, studyMetadata)
                  //   );
                  // } else history.replace('..');
                }}
                // entityId={currentEntityID}
                // entityId={entity.id}
                // starredVariables={analysisState.analysis?.starredVariables}
                // toggleStarredVariable={toggleStarredVariable}
                // variableId={currentVariableID}
                // variableId={variable.id}
              />
            </div>
          )}
        </div>
      </div>
    </FullScreenModal>
  );
}
