import React from 'react';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import {
  MultiFilterVariable,
  useMakeVariableLink,
  useStudyMetadata,
  Variable,
} from '../core';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { cx } from './Utils';
import { VariableDetails } from './Variable';
import { AnalysisState } from '../core/hooks/analysis';
import { useEntityCounts } from '../core/hooks/entityCounts';
import { useToggleStarredVariable } from '../core/hooks/starredVariables';
import { VariableTree } from '../core/components/VariableTree';
import FilterChipList from '../core/components/FilterChipList';
import { Tooltip, Button, Icon } from '@material-ui/core';

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
  const filteredEntityCount =
    filteredCounts.value && filteredCounts.value[entity.id];

  return (
    <div className={cx('-Subsetting')}>
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
      {/* <div className="TabularDownload">
        <Tooltip
          title={`View and download current subset of ${
            entity.displayNamePlural ?? entity.displayName
          }`}
        >
          <Button
            variant="text"
            color="primary"
            size="large"
            startIcon={<Icon className="ebrc-icon-table-download" />}
            onClick={() => alert('Coming soon')}
          >
            View and download
          </Button>
        </Tooltip>
      </div> */}
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
