import { useState } from 'react';
import { useHistory } from 'react-router';

import {
  MultiFilterVariable,
  useMakeVariableLink,
  useStudyMetadata,
  useStudyRecord,
  Variable,
} from '../../core';

// Components
import { SwissArmyButton } from '@veupathdb/core-components';
import { VariableDetails } from '../Variable';
import VariableTree from '../../core/components/variableTrees/VariableTree';
import FilterChipList from '../../core/components/FilterChipList';
import SubsettingDataGridModal from './SubsettingDataGridModal';
import { TableDownload } from '@veupathdb/core-components/dist/components/icons';

// Hooks
import { useEntityCounts } from '../../core/hooks/entityCounts';
import { useToggleStarredVariable } from '../../core/hooks/starredVariables';
import { useStudyEntities } from '../../core/hooks/study';

// Definitions
import { AnalysisState } from '../../core/hooks/analysis';

// Functions
import { cx } from '../Utils';
import { Action } from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionUtils';
import { useAttemptActionCallback } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';

interface SubsettingProps {
  analysisState: AnalysisState;
  /** The ID of the currently selected entity in the entity tree. */
  entityId: string;
  /**
   * The ID of the currently selected entity variable. Remember that
   * a variable is a child of an entity.
   */
  variableId: string;
}

/** Allow user to filter study data based on the value(s) of any available variable. */
export default function Subsetting({
  entityId,
  variableId,
  analysisState,
}: SubsettingProps) {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const studyRecord = useStudyRecord();
  const studyMetadata = useStudyMetadata();

  const attemptAction = useAttemptActionCallback();

  // Obtain all entities and associated variables.
  const entities = useStudyEntities(studyMetadata.rootEntity);

  // What is the current entity?
  const entity = entities.find((e) => e.id === entityId);

  // What is the current variable?
  const variable = entity?.variables.find((v) => v.id === variableId);

  const history = useHistory();
  const totalCounts = useEntityCounts();
  const filters = analysisState.analysis?.descriptor.subset.descriptor;
  const filteredCounts = useEntityCounts(filters);
  const makeVariableLink = useMakeVariableLink();

  const toggleStarredVariable = useToggleStarredVariable(analysisState);

  if (
    entity == null ||
    (!Variable.is(variable) && !MultiFilterVariable.is(variable))
  )
    return <div>Could not find specified variable.</div>;

  const totalEntityCount = totalCounts.value && totalCounts.value[entity.id];

  // This will give you the count of rows for the current entity.
  const filteredEntityCount =
    filteredCounts.value && filteredCounts.value[entity.id];

  return (
    <div className={cx('-Subsetting')}>
      <SubsettingDataGridModal
        displayModal={isDownloadModalOpen}
        toggleDisplay={() => setIsDownloadModalOpen(false)}
        analysisState={analysisState}
        entities={entities}
        currentEntityID={entityId}
        currentEntityRecordCounts={{
          total: totalEntityCount,
          filtered: filteredEntityCount,
        }}
      />
      <div className="Variables">
        <VariableTree
          rootEntity={entities[0]}
          entityId={entity.id}
          starredVariables={analysisState.analysis?.descriptor.starredVariables}
          toggleStarredVariable={toggleStarredVariable}
          variableId={variable.id}
          onChange={(variable) => {
            if (variable) {
              const { entityId, variableId } = variable;
              history.replace(
                makeVariableLink({ entityId, variableId }, studyMetadata)
              );
            } else history.replace('..');
          }}
        />
      </div>
      <div className="FilterChips">
        <FilterChipList
          filters={filters}
          removeFilter={(filter) =>
            analysisState.analysis &&
            analysisState.setFilters(
              analysisState.analysis.descriptor.subset.descriptor.filter(
                (f) => f !== filter
              )
            )
          }
          entities={entities}
          selectedEntityId={entity.id}
          selectedVariableId={variable.id}
        />
      </div>
      <div className="TabularDownload">
        <SwissArmyButton
          text="View and download"
          tooltip={`View and download current subset of ${
            entity.displayNamePlural ?? entity.displayName
          }`}
          stylePreset="mesa"
          icon={TableDownload}
          onPress={() => {
            attemptAction(Action.download, {
              studyId: studyRecord.id[0].value,
              onAllow: () => {
                setIsDownloadModalOpen(true);
              },
            });
          }}
        />
      </div>
      <div className="Filter">
        <VariableDetails
          entity={entity}
          variable={variable}
          analysisState={analysisState}
          totalEntityCount={totalEntityCount}
          filteredEntityCount={filteredEntityCount}
        />
      </div>
    </div>
  );
}
