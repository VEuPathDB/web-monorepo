import { Tooltip } from '@material-ui/core';
import { useHistory } from 'react-router';
import { useState } from 'react';

import { useMakeVariableLink, useStudyMetadata } from '../../core';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { cx } from '../Utils';
import { VariableDetails } from '../Variable';
import { AnalysisState } from '../../core/hooks/analysis';
import { useEntityCounts } from '../../core/hooks/entityCounts';
import { useToggleStarredVariable } from '../../core/hooks/starredVariables';
import { VariableTree } from '../../core/components/VariableTree';
import FilterChipList from '../../core/components/FilterChipList';

import SubsettingDataGridModal from './SubsettingDataGridModal';

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
  console.log('entityId', entityId);
  console.log('variableId', variableId);
  console.log('analysisState', analysisState);

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const studyMetadata = useStudyMetadata();
  const entities = Array.from(
    preorder(studyMetadata.rootEntity, (e) => e.children || [])
  );
  const entity = entities.find((e) => e.id === entityId);
  const variable = entity?.variables.find((v) => v.id === variableId);
  const history = useHistory();
  const totalCounts = useEntityCounts();
  const filteredCounts = useEntityCounts(analysisState.analysis?.filters);
  const makeVariableLink = useMakeVariableLink();

  const toggleStarredVariable = useToggleStarredVariable(analysisState);

  if (entity == null || variable == null || variable.type === 'category')
    return <div>Could not find specified variable.</div>;

  const totalEntityCount = totalCounts.value && totalCounts.value[entity.id];
  const filteredEntityCount =
    filteredCounts.value && filteredCounts.value[entity.id];

  return (
    <div className={cx('-Subsetting')}>
      <SubsettingDataGridModal
        displayModal={isDownloadModalOpen}
        toggleDisplay={() => setIsDownloadModalOpen(false)}
        analysisState={analysisState}
      />
      <div className="Variables">
        <VariableTree
          rootEntity={entities[0]}
          entityId={entity.id}
          starredVariables={analysisState.analysis?.starredVariables}
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
          filters={analysisState.analysis?.filters.filter(
            (f) => f.entityId === entity.id
          )}
          removeFilter={(filter) =>
            analysisState.analysis &&
            analysisState.setFilters(
              analysisState.analysis.filters.filter((f) => f !== filter)
            )
          }
          entities={entities}
          selectedEntityId={entity.id}
          selectedVariableId={variable.id}
        />
      </div>
      <div className="TabularDownload">
        <Tooltip title={`Download current subset of ${entity.displayName}`}>
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
