import { useMemo } from 'react';
import { Redirect } from 'react-router';

import { MultiFilterVariable, Variable, VariableScope } from '../../core';

// Components
import { VariableDetails } from '../Variable';
import VariableTree from '../../core/components/variableTrees/VariableTree';

// Hooks
import { EntityCounts } from '../../core/hooks/entityCounts';
import { useToggleStarredVariable } from '../../core/hooks/starredVariables';
import { useStudyEntities } from '../../core/hooks/workspace';

// Definitions
import { AnalysisState } from '../../core/hooks/analysis';

// Functions
import { cx } from '../Utils';
import { findMultiFilterParent } from '../../core/utils/study-metadata';
import { VariableLinkConfig } from '../../core/components/VariableLink';

interface SubsettingProps {
  analysisState: AnalysisState;
  /** The ID of the currently selected entity in the entity tree. */
  entityId: string;
  /**
   * The ID of the currently selected entity variable. Remember that
   * a variable is a child of an entity.
   */
  variableId: string;
  totalCounts: EntityCounts | undefined;
  filteredCounts: EntityCounts | undefined;
  variableLinkConfig: VariableLinkConfig;
  /**
   * used to disable FieldNode's scrollIntoView property in map scope
   */
  scope?: VariableScope;
}

/** Allow user to filter study data based on the value(s) of any available variable. */
export default function Subsetting({
  entityId,
  variableId,
  analysisState,
  totalCounts,
  filteredCounts,
  variableLinkConfig,
  scope = 'variableTree',
}: SubsettingProps) {
  // Obtain all entities and associated variables.
  const entities = useStudyEntities();

  // What is the current entity?
  const entity = entities.find((e) => e.id === entityId);

  // What is the current variable?
  const variable = entity?.variables.find((v) => v.id === variableId);

  const toggleStarredVariable = useToggleStarredVariable(analysisState);

  // Find multifilter parent. We will redirect to it later, if one is found.
  const multiFilterParent = useMemo(
    () => entity && variable && findMultiFilterParent(entity, variable),
    [entity, variable]
  );

  if (
    entity == null ||
    (!Variable.is(variable) && !MultiFilterVariable.is(variable))
  ) {
    return <div>Could not find specified variable.</div>;
  }

  if (multiFilterParent) {
    return <Redirect to={multiFilterParent.id} />;
  }

  const totalEntityCount = totalCounts && totalCounts[entity.id];

  // This will give you the count of rows for the current entity.
  const filteredEntityCount = filteredCounts && filteredCounts[entity.id];

  const starredVariables = analysisState.analysis?.descriptor.starredVariables;

  return (
    <div className={cx('-Subsetting')}>
      <div className="Variables">
        <VariableTree
          scope={scope}
          entityId={entity.id}
          starredVariables={starredVariables}
          toggleStarredVariable={toggleStarredVariable}
          variableId={variable.id}
          variableLinkConfig={variableLinkConfig}
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
