import { VariableScope } from '../../types/study';
import { VariableDescriptor } from '../../types/variable';
import VariableList from './VariableList';
import { useStudyEntities } from '../../hooks/workspace';
import {
  useValuesMap,
  useFlattenedFields,
  useFieldTree,
  useFlattenFieldsByTerm,
  useFeaturedFieldsFromTree,
} from './hooks';

import { ClearSelectionButton } from './VariableTreeDropdown';
import { VariableLinkConfig } from '../VariableLink';
import { useHistory } from 'react-router';
import { useMemo } from 'react';

export interface VariableTreeProps {
  starredVariables?: VariableDescriptor[];
  toggleStarredVariable: (targetVariableId: VariableDescriptor) => void;
  entityId?: string;
  variableId?: string;
  disabledVariables?: VariableDescriptor[];
  customDisabledVariableMessage?: string;
  variableLinkConfig: VariableLinkConfig;
  /** Indicate whether or not variables with children   */
  showMultiFilterDescendants?: boolean;
  showClearSelectionButton?: boolean;
  /** The "scope" of variables which should be offered. */
  scope: VariableScope;
  asDropdown?: boolean;
}

export default function VariableTree({
  customDisabledVariableMessage,
  disabledVariables,
  starredVariables,
  toggleStarredVariable,
  entityId,
  variableId,
  variableLinkConfig,
  showClearSelectionButton,
  showMultiFilterDescendants = false,
  scope,
  asDropdown,
}: VariableTreeProps) {
  const entities = useStudyEntities();
  const valuesMap = useValuesMap(entities);
  const flattenedFields = useFlattenedFields(entities, scope);
  const fieldsByTerm = useFlattenFieldsByTerm(flattenedFields);
  const fieldTree = useFieldTree(flattenedFields);
  const featuredFields = useFeaturedFieldsFromTree(fieldTree);
  const history = useHistory();

  const disabledFields = useMemo(
    () => disabledVariables?.map((v) => `${v.entityId}/${v.variableId}`),
    [disabledVariables]
  );

  // Lookup activeField
  const activeField =
    entityId && variableId
      ? fieldsByTerm[`${entityId}/${variableId}`]
      : undefined;

  const variable = entities
    .find((e) => e.id === entityId)
    ?.variables.find((v) => v.id === variableId);
  const label = variable?.displayName ?? 'Select a variable';

  const clearSelectionButton = (
    <ClearSelectionButton
      onClick={() => {
        if (variableLinkConfig.type === 'button') variableLinkConfig.onClick();
        else history.replace(variableLinkConfig.makeVariableLink());
      }}
      disabled={!variable}
    />
  );

  return (
    <VariableList
      mode="singleSelection"
      customDisabledVariableMessage={customDisabledVariableMessage}
      showMultiFilterDescendants={showMultiFilterDescendants}
      activeField={activeField}
      disabledFieldIds={disabledFields}
      variableLinkConfig={variableLinkConfig}
      featuredFields={featuredFields}
      valuesMap={valuesMap}
      fieldTree={fieldTree}
      autoFocus={false}
      starredVariables={starredVariables}
      toggleStarredVariable={toggleStarredVariable}
      asDropdown={asDropdown}
      dropdownLabel={label}
      clearSelectionButton={
        showClearSelectionButton === false ? null : clearSelectionButton
      }
    />
  );
}
