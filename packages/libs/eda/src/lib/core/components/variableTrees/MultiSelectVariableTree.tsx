import PopoverButton from '@veupathdb/components/lib/components/widgets/PopoverButton';
import { Button } from '@material-ui/core';
import { getTree } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/AttributeFilterUtils';
import { pruneDescendantNodes } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { keyBy } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { cx } from '../../../workspace/Utils';
import { StudyEntity } from '../../types/study';
import { VariableDescriptor } from '../../types/variable';
import { edaVariableToWdkField } from '../../utils/wdk-filter-param-adapter';
import VariableList from '../VariableList';
import './VariableTree.scss';
import { useStudyEntities } from '../../hooks/study';

export interface MultiSelectVariableTreeProps {
  /** The root (lowest level) */
  rootEntity: StudyEntity;
  /** Which variables have been selected? */
  selectedVariables: Array<VariableDescriptor>;
  onChange: (variable?: VariableDescriptor) => void;

  // TODO: Add support back for these.
  // starredVariables?: string[];
  // disabledVariables?: VariableDescriptor[];
  // toggleStarredVariable: (targetVariableId: string) => void;
  // hideDisabledFields?: boolean;
  // setHideDisabledFields?: (hide: boolean) => void;
}

/**
 * A variable selection tree where the user is allowed to select multiple
 * variables concurrently.
 *
 */
export default function MultiSelectVariableTree({
  rootEntity,
  selectedVariables = [],
  onChange,
}: MultiSelectVariableTreeProps) {
  const entities = useStudyEntities(rootEntity);

  /**
   * Generates a flattened representation of the possible values for
   * all entity/variable combinations.
   *
   * An example entry would look something like this.
   * "PCO_0000024/ENVO_00000004": "Bangladesh India Kenya Mali Mozambique Pakistan The Gambia",
   *
   * Object keys are `entityID/variableID` and object values are the possible values for that
   * entity/variable combination.
   *
   * This is used by the search functionality of FieldList.
   * It should be a map from field term to string.
   * In WDK searches, this is a concatenated string of values
   * for categorical-type variables.
   *
   */

  const valuesMap = useMemo(() => {
    const valuesMap: Record<string, string> = {};
    for (const entity of entities) {
      for (const variable of entity.variables) {
        if (variable.type !== 'category' && variable.vocabulary) {
          valuesMap[`${entity.id}/${variable.id}`] = variable.vocabulary.join(
            ' '
          );
        }
      }
    }
    return valuesMap;
  }, [entities]);

  const fields = useMemo(() => {
    return entities.flatMap((entity) => {
      // Create a Set of variableId so we can lookup parentIds
      const variableIds = new Set(entity.variables.map((v) => v.id));
      return [
        // Create a non-filterable field for the entity.
        // Note that we're prefixing the term. This avoids
        // collisions with variables using the same term.
        // This situation shouldn't happen in production,
        // but there is nothing preventing it, so we need to
        // handle the case.
        {
          term: `entity:${entity.id}`,
          display: entity.displayName,
        },
        ...entity.variables
          // Before handing off to edaVariableToWdkField, we will
          // change the id of the variable to include the entityId.
          // This will make the id unique across the tree and prevent
          // duplication across entity subtrees.
          .map((variable) => ({
            ...variable,
            id: `${entity.id}/${variable.id}`,
            parentId:
              // Use entity as parent under the following conditions:
              // - if parentId is null
              // - if the parentId is the same as the entityId
              // - if the parentId does not exist in the provided list of variables
              //
              // Variables that meet any of these conditions will serve
              // as the root nodes of the variable subtree, which will
              // become the children of the entity node in the final tree.
              variable.parentId == null ||
              variable.parentId === entity.id ||
              !variableIds.has(variable.parentId)
                ? `entity:${entity.id}`
                : `${entity.id}/${variable.parentId}`,
          }))
          .map(edaVariableToWdkField),
      ];
    });
  }, [entities]);

  const featuredFields = useMemo(() => {
    return entities.flatMap((entity) =>
      entity.variables
        .filter(
          (variable) => variable.type !== 'category' && variable.isFeatured
        )
        .map((variable) => ({
          ...variable,
          id: `${entity.id}/${variable.id}`,
          displayName: `<span class="Entity">${entity.displayName}</span>: ${variable.displayName}`,
        }))
        .map(edaVariableToWdkField)
    );
  }, [entities]);

  // Construct the fieldTree using the fields defined above.
  const fieldTree = useMemo(() => {
    const initialTree = getTree(fields, { hideSingleRoot: false });
    const tree = pruneDescendantNodes(
      (node) => node.field.type != null || node.children.length > 0,
      initialTree
    );
    return tree;
  }, [fields]);

  // const disabledFields = useMemo(
  //   () => disabledVariables?.map((v) => `${v.entityId}/${v.variableId}`),
  //   [disabledVariables]
  // );

  // Used to lookup a field by entityId and variableId.
  const fieldsByTerm = useMemo(() => keyBy(fields, (f) => f.term), [fields]);

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
  // const activeField =
  //   entityId && variableId
  //     ? fieldsByTerm[`${entityId}/${variableId}`]
  //     : undefined;

  return (
    // TODO: @dmfalke This is strip down to the minimum temporary for MVP.
    <VariableList
      onActiveFieldChange={onActiveFieldChange}
      // featuredFields={featuredFields}
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
