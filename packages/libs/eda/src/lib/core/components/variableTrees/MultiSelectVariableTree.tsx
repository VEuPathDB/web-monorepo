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
  const valuesMap = useValuesMap(entities);
  const flattenedFields = useFlattenedFields(entities);
  const fieldsByTerm = useFlattenFieldsByTerm(flattenedFields);
  const fieldTree = useFieldTree(flattenedFields);

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

  return (
    // TODO: @dmfalke This is striped down to the minimum temporarily for MVP.
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
