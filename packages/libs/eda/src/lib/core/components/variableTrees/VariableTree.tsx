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
  useFeaturedFieldsFromTree,
} from './hooks';
import { FieldTreeNode } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';

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
  const featuredFieldsFromTree = useFeaturedFieldsFromTree(fieldTree);

  // console.log({ flattenedFields });
  // console.log({ fieldTree });
  // console.log({ featuredFields });
  // console.log({ featuredFieldsFromTree });

  const featuredFieldTerms = featuredFields.map((field) => field.term);

  // console.log({ featuredFieldsTerms });

  const getFilteredLeaves = (
    treeNode: FieldTreeNode,
    filterFunc: (field: FieldTreeNode) => boolean
  ) => {
    const filteredFieldList: FieldTreeNode[] = [];
    if (treeNode.children.length > 0) {
      treeNode.children.forEach((child) =>
        filteredFieldList.push(...getFilteredLeaves(child, filterFunc))
      );
    } else {
      // console.log({ leafNode: treeNode });
      if (filterFunc(treeNode)) {
        // console.log('treeNode matched');
        // console.log({ treeNode });
        filteredFieldList.push(treeNode);
      }
    }
    return filteredFieldList;
  };

  const featuredFieldTermsFromTree = getFilteredLeaves(
    fieldTree,
    (node: FieldTreeNode) => featuredFieldTerms.includes(node.field.term)
  ).map((node) => node.field.term);

  // console.log({ featuredFieldTermsFromTree });

  const sortedFeaturedFields = featuredFields.sort(
    (fieldA, fieldB) =>
      featuredFieldTermsFromTree.indexOf(fieldA.term) -
      featuredFieldTermsFromTree.indexOf(fieldB.term)
  );

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
      featuredFields={featuredFieldsFromTree}
      valuesMap={valuesMap}
      fieldTree={fieldTree}
      autoFocus={false}
      starredVariables={starredVariables}
      toggleStarredVariable={toggleStarredVariable}
    />
  );
}
