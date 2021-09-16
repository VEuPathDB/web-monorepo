import { useCallback, useMemo, useEffect } from 'react';

import { Field } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';

import { StudyEntity } from '../../types/study';
import { VariableDescriptor } from '../../types/variable';
import VariableList from './VariableList';
import './VariableTree.scss';
import { useStudyEntities } from '../../hooks/study';
import {
  useFieldTree,
  useFlattenedFields,
  useFlattenFieldsByTerm,
  useValuesMap,
} from './hooks';

export interface MultiSelectVariableTreeProps {
  /** The entity from which to derive the tree structure. */
  rootEntity: StudyEntity;
  /** Which variables have been selected? */
  selectedVariableDescriptors: Array<VariableDescriptor>;
  /** Callback to invoke when selected variables change. */
  onSelectedVariablesChange: (variables: Array<VariableDescriptor>) => void;
}

/**
 * A variable selection tree where the user is allowed to select multiple
 * variables concurrently.
 */
export default function MultiSelectVariableTree({
  rootEntity,
  selectedVariableDescriptors,
  onSelectedVariablesChange,
}: MultiSelectVariableTreeProps) {
  const entities = useStudyEntities(rootEntity);
  const valuesMap = useValuesMap(entities);
  const flattenedFields = useFlattenedFields(entities);
  const fieldsByTerm = useFlattenFieldsByTerm(flattenedFields);
  const fieldTree = useFieldTree(flattenedFields);

  /**
   * Translate selectedVariableTerms to corresponding Field objects.
   */
  const selectedVariableFields = useMemo(() => {
    console.log(
      'MultiSelect -> selectedVariableFields',
      selectedVariableDescriptors,
      fieldsByTerm
    );

    const selectedVariableTerms = selectedVariableDescriptors.map(
      (descriptor) => `${descriptor.entityId}/${descriptor.variableId}`
    );

    const selectedVariableFields: Array<Field> = [];
    selectedVariableTerms.forEach((term) => {
      fieldsByTerm[term] && selectedVariableFields.push(fieldsByTerm[term]);
    });

    console.log('WILL RETURN', selectedVariableFields);
    return selectedVariableFields;
  }, [selectedVariableDescriptors, fieldsByTerm]);

  const onActiveFieldChange = useCallback((term?: string) => {
    console.log('Hello from Multi-Select onActiveFieldChange', term);
  }, []);

  // Seems weird to translate one way just to go back the other way.
  // TODO: Should we just make VariableList accept variableDescriptors instead of doing this translation back and forth?
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

  return (
    // TODO: @dmfalke This is striped down to the minimum temporarily for MVP.
    <VariableList
      mode="multiSelection"
      selectedFields={selectedVariableFields}
      onSelectedFieldsChange={onSelectedVariableTermsChange}
      onActiveFieldChange={onActiveFieldChange}
      valuesMap={valuesMap}
      fieldTree={fieldTree}
      autoFocus={false}
      toggleStarredVariable={(variable) => console.log(`Toggle ${variable}`)}
      hideDisabledFields={true}
      setHideDisabledFields={(hide) =>
        console.log('Toggle display of hidden fields.')
      }
    />
  );
}
