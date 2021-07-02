import React from 'react';
import { useHistory } from 'react-router';
import { useMakeVariableLink, useStudyMetadata } from '../core';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { cx } from './Utils';
import { VariableDetails } from './Variable';
import { AnalysisState } from '../core/hooks/analysis';
import { useEntityCounts } from '../core/hooks/entityCounts';
import { useToggleStarredVariable } from '../core/hooks/starredVariables';
import { VariableTree } from '../core/components/VariableTree';
import FilterChipList from '../core/components/FilterChipList';
import { Tooltip } from '@material-ui/core';

interface Props {
  analysisState: AnalysisState;
  entityId: string;
  variableId: string;
}

export function Subsetting(props: Props) {
  const { entityId, variableId, analysisState } = props;
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
      <div className="Variables">
        <div
          style={{
            padding: '.5em',
            height: '60vh',
            width: '30em',
            position: 'relative',
          }}
        >
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
      </div>
      <div className="FilterChips">
        <FilterChipList
          filters={analysisState.analysis?.filters}
          setFilters={analysisState.setFilters}
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
            onClick={() => alert('Coming soon')}
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
