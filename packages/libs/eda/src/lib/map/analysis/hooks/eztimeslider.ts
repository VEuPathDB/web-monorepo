import { useCallback } from 'react';
import { Variable, useStudyEntities } from '../../../core';
import { filterVariablesByConstraint } from '../../../core/utils/data-element-constraints';
import { timeSliderVariableConstraints } from '../config/eztimeslider';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

export function useGetDefaultTimeVariableDescriptor() {
  const entities = useStudyEntities();
  // filter constraint for time slider inputVariables component

  return useCallback(
    function getDefaultTimeVariableDescriptor() {
      const temporalVariableTree = filterVariablesByConstraint(
        entities[0],
        timeSliderVariableConstraints[0]['overlayVariable']
      );

      // take the first suitable variable from the filtered variable tree

      // first find the first entity with some variables that passed the filter
      const defaultTimeSliderEntity = Array.from(
        preorder(temporalVariableTree, (node) => node.children ?? [])
      ).find((entity) => entity.variables.some(Variable.is));

      // then take the first variable from it
      const defaultTimeSliderVariable = defaultTimeSliderEntity?.variables.find(
        Variable.is
      );

      return defaultTimeSliderEntity != null &&
        defaultTimeSliderVariable != null
        ? {
            entityId: defaultTimeSliderEntity.id,
            variableId: defaultTimeSliderVariable.id,
          }
        : undefined;
    },
    [entities, timeSliderVariableConstraints]
  );
}
