import { Tooltip } from '@material-ui/core';
import { useHistory } from 'react-router';

import { useState } from 'react';

import {
  MultiFilterVariable,
  useMakeVariableLink,
  useStudyMetadata,
  Variable,
} from '../../core';

import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { cx } from '../Utils';
import { VariableDetails } from '../Variable';
import { AnalysisState } from '../../core/hooks/analysis';
import { useEntityCounts } from '../../core/hooks/entityCounts';
import { useToggleStarredVariable } from '../../core/hooks/starredVariables';
import VariableTree from '../../core/components/variableTrees/VariableTree';
import FilterChipList from '../../core/components/FilterChipList';

import SubsettingDataGridModal from './SubsettingDataGridModal';
import { useStudyEntities } from '../../core/hooks/study';

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

  const studyMetadata = useStudyMetadata();

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
        currentEntityID={entityId}
        currentEntityRecordCount={filteredEntityCount!}
        entities={entities}
      />
      <div className="Variables">
        <VariableTree
          includeMultiFilters
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
          filters={filters?.filter((f) => f.entityId === entity.id)}
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
        <Tooltip
          title={`Download current subset of ${
            entity.displayNamePlural ?? entity.displayName
          }`}
        >
          <button
            type="button"
            className="link"
            onClick={() => setIsDownloadModalOpen(true)}
          >
            <i className="fa fa-table" />
          </button>
        </Tooltip>
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
