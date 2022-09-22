import { useCallback, useMemo } from 'react';

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

import { Button } from '@material-ui/core';

export interface VariableTreeProps {
  starredVariables?: VariableDescriptor[];
  toggleStarredVariable: (targetVariableId: VariableDescriptor) => void;
  entityId?: string;
  variableId?: string;
  disabledVariables?: VariableDescriptor[];
  customDisabledVariableMessage?: string;
  /** term string is of format "entityId/variableId"  e.g. "PCO_0000024/EUPATH_0000714" */
  onChange: (variable?: VariableDescriptor) => void;
  /** Indicate whether or not variables with children   */
  showMultiFilterDescendants?: boolean;
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
  onChange,
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

  const disabledFields = useMemo(
    () => disabledVariables?.map((v) => `${v.entityId}/${v.variableId}`),
    [disabledVariables]
  );

  const onActiveFieldChange = useCallback(
    (term?: string) => {
      if (term == null) {
        onChange(term);
        return;
      }
      const [entityId, variableId] = term.split('/');
      onChange({ entityId, variableId });
    },
    [onChange]
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

  const clearSelectionButton = variable && (
    <div style={{ textAlign: 'center', padding: '.75em 0.25em 0.25em' }}>
      <Button
        type="button"
        style={{ width: '90%' }}
        variant="contained"
        color="default"
        size="small"
        onClick={() => onChange()}
      >
        Clear selection
      </Button>
    </div>
  );

  return (
    <VariableList
      mode="singleSelection"
      customDisabledVariableMessage={customDisabledVariableMessage}
      showMultiFilterDescendants={showMultiFilterDescendants}
      activeField={activeField}
      disabledFieldIds={disabledFields}
      onActiveFieldChange={onActiveFieldChange}
      featuredFields={featuredFields}
      valuesMap={valuesMap}
      fieldTree={fieldTree}
      autoFocus={false}
      starredVariables={starredVariables}
      toggleStarredVariable={toggleStarredVariable}
      asDropdown={asDropdown}
      clearSelectionButton={clearSelectionButton}
      dropdownLabel={label}
    />
  );
}
