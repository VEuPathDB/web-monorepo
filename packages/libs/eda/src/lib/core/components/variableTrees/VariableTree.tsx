import { useCallback, useMemo } from 'react';

import { StudyEntity } from '../../types/study';
import { VariableDescriptor } from '../../types/variable';
import VariableList from './VariableList';
import './VariableTree.scss';
import { useStudyEntities } from '../../hooks/study';
import {
  useValuesMap,
  useFlattenedFields,
  useFeaturedFields,
  useFieldTree,
  useFlattenFieldsByTerm,
} from './hooks';

export interface VariableTreeProps {
  rootEntity: StudyEntity;
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
}

export default function VariableTree({
  customDisabledVariableMessage,
  rootEntity,
  disabledVariables,
  starredVariables,
  toggleStarredVariable,
  entityId,
  variableId,
  onChange,
  showMultiFilterDescendants = false,
}: VariableTreeProps) {
  const entities = useStudyEntities(rootEntity);
  const valuesMap = useValuesMap(entities);
  const flattenedFields = useFlattenedFields(entities);
  const fieldsByTerm = useFlattenFieldsByTerm(flattenedFields);
  const featuredFields = useFeaturedFields(entities);
  const fieldTree = useFieldTree(flattenedFields);

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
    />
  );
}
