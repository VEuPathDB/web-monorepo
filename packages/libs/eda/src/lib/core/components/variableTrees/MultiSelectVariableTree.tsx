import { useCallback, useMemo } from 'react';

import { Field } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';

import { StudyEntity, VariableScope } from '../../types/study';
import { VariableDescriptor } from '../../types/variable';
import VariableList, { VariableFieldTreeNode } from './VariableList';
import { useStudyEntities } from '../../hooks/workspace';
import {
  useFieldTree,
  useFlattenedFields,
  useFlattenFieldsByTerm,
  useValuesMap,
} from './hooks';
import { CustomCheckboxes } from '@veupathdb/wdk-client/lib/Components/CheckboxTree/CheckboxTreeNode';
import { VariableLinkConfig } from '../VariableLink';

export interface MultiSelectVariableTreeProps {
  /** The "scope" of variables which should be offered. */
  scope: VariableScope;
  /** Predicate function used to filter entities */
  filterEntity: (entity: StudyEntity) => boolean;
  /** Which variables have been selected? */
  selectedVariableDescriptors: Array<VariableDescriptor>;
  featuredFields: Array<Field>;
  starredVariableDescriptors: Array<VariableDescriptor>;
  toggleStarredVariable: (targetVariable: VariableDescriptor) => void;
  /** Callback to invoke when selected variables change. */
  onSelectedVariablesChange: (variables: Array<VariableDescriptor>) => void;
  customCheckboxes?: CustomCheckboxes<VariableFieldTreeNode>;
  startExpanded?: boolean;
}

/**
 * A variable selection tree where the user is allowed to select multiple
 * variables concurrently.
 */
export default function MultiSelectVariableTree({
  scope,
  filterEntity,
  selectedVariableDescriptors,
  starredVariableDescriptors,
  toggleStarredVariable,
  featuredFields,
  onSelectedVariablesChange,
  customCheckboxes,
  startExpanded,
}: MultiSelectVariableTreeProps) {
  const entities = useStudyEntities().filter(filterEntity);
  const valuesMap = useValuesMap(entities);
  const flattenedFields = useFlattenedFields(entities, scope);
  const fieldsByTerm = useFlattenFieldsByTerm(flattenedFields);
  const fieldTree = useFieldTree(flattenedFields);

  /**
   * Translate selectedVariableTerms to corresponding Field objects.
   */
  const selectedVariableFields = useMemo(() => {
    const selectedVariableTerms = selectedVariableDescriptors.map(
      (descriptor) => `${descriptor.entityId}/${descriptor.variableId}`
    );

    const selectedVariableFields: Array<Field> = [];
    selectedVariableTerms.forEach((term) => {
      fieldsByTerm[term] && selectedVariableFields.push(fieldsByTerm[term]);
    });

    return selectedVariableFields;
  }, [selectedVariableDescriptors, fieldsByTerm]);

  const onSelectedVariableTermsChange = useCallback(
    (terms: Array<string>) => {
      onSelectedVariablesChange(
        terms.map((term) => {
          const [entityId, variableId] = term.split('/');
          return { entityId, variableId };
        })
      );
    },
    [onSelectedVariablesChange]
  );

  const variableLinkConfig = useMemo((): VariableLinkConfig => {
    return { type: 'button', onClick: () => {} };
  }, []);

  return (
    <VariableList
      mode="multiSelection"
      showMultiFilterDescendants={true}
      selectedFields={selectedVariableFields}
      onSelectedFieldsChange={onSelectedVariableTermsChange}
      variableLinkConfig={variableLinkConfig}
      featuredFields={featuredFields}
      starredVariables={starredVariableDescriptors}
      valuesMap={valuesMap}
      fieldTree={fieldTree}
      autoFocus={false}
      toggleStarredVariable={toggleStarredVariable}
      customCheckboxes={customCheckboxes}
      startExpanded={startExpanded}
      scope={scope}
    />
  );
}
