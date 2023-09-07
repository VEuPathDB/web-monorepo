import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import SubsettingClient from '../api/SubsettingClient';
import DataClient from '../api/DataClient';
import { AnalysisClient } from '../api/AnalysisClient';
import {
  MakeVariableLink,
  WorkspaceContext,
} from '../context/WorkspaceContext';
import {
  StudyEntity,
  StudyMetadata,
  StudyRecord,
  StudyRecordClass,
  Variable,
  VariableTreeNode,
} from '../types/study';
import { VariableDescriptor } from '../types/variable';
import { useCallback, useMemo } from 'react';
import {
  entityTreeToArray,
  findCollections,
  findEntityAndVariable,
} from '../utils/study-metadata';
import { ComputeClient } from '../api/ComputeClient';
import { DownloadClient } from '../api';
import { Filter } from '../types/filter';
import {
  mapStructure,
  preorder,
} from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import {
  useFeaturedFieldsFromTree,
  useFieldTree,
  useFlattenedFields,
} from '../components/variableTrees/hooks';
import { findFirstVariable } from '../../workspace/Utils';
import {
  DataElementConstraintRecord,
  filterVariablesByConstraint,
} from '../utils/data-element-constraints';

/** Return the study identifier and a hierarchy of the study entities. */
export function useStudyMetadata(): StudyMetadata {
  return useNonNullableContext(WorkspaceContext).studyMetadata;
}
export function useStudyRecord(): StudyRecord {
  return useNonNullableContext(WorkspaceContext).studyRecord;
}
export function useStudyRecordClass(): StudyRecordClass {
  return useNonNullableContext(WorkspaceContext).studyRecordClass;
}
export function useSubsettingClient(): SubsettingClient {
  return useNonNullableContext(WorkspaceContext).subsettingClient;
}
export function useDataClient(): DataClient {
  return useNonNullableContext(WorkspaceContext).dataClient;
}
export function useDownloadClient(): DownloadClient {
  return useNonNullableContext(WorkspaceContext).downloadClient;
}
export function useAnalysisClient(): AnalysisClient {
  return useNonNullableContext(WorkspaceContext).analysisClient;
}
export function useComputeClient(): ComputeClient {
  return useNonNullableContext(WorkspaceContext).computeClient;
}
export function useMakeVariableLink(): MakeVariableLink {
  return (
    useNonNullableContext(WorkspaceContext).makeVariableLink ??
    defaultMakeVariableLink
  );
}
export function useFindEntityAndVariable(filters?: Filter[]) {
  const entities = useStudyEntities(filters);
  return useCallback(
    (variable?: VariableDescriptor) => {
      const entAndVar = findEntityAndVariable(entities, variable);
      if (entAndVar == null || entAndVar.variable.type === 'category') return;
      return entAndVar as {
        entity: StudyEntity;
        variable: Variable;
      };
    },
    [entities]
  );
}

export function useEntityAndVariable(descriptor?: VariableDescriptor) {
  const entities = useStudyEntities();
  return useMemo(
    () => descriptor && findEntityAndVariable(entities, descriptor),
    [descriptor, entities]
  );
}

export function useCollectionVariables(entity: StudyEntity) {
  return useMemo(() => findCollections(entity).flat(), [entity]);
}

/**
 * Return an array of StudyEntities.
 *
 * @param [filters] If provided, variable metadata will be augmented based on filter selections.
 *
 * @returns Essentially, this will provide you will an array of entities in a flattened structure.
 * Technically, the hierarchical structure is still embedded in each entity, but all of the
 * entities are presented as siblings in the array.
 */
export function useStudyEntities(filters?: Filter[]) {
  const { rootEntity } = useStudyMetadata();
  return useMemo((): StudyEntity[] => {
    const mappedRootEntity = !filters?.length
      ? rootEntity
      : mapStructure<StudyEntity, StudyEntity>(
          (entity, mappedChildren) => {
            if (filters.some((f) => f.entityId === entity.id)) {
              const variables = entity.variables.map(
                (variable): VariableTreeNode => {
                  const filter = filters.find(
                    (f) =>
                      f.entityId === entity.id && f.variableId === variable.id
                  );
                  if (variable.type !== 'category' && filter) {
                    const vocabulary =
                      filter.type === 'dateSet'
                        ? filter.dateSet
                        : filter.type === 'numberSet'
                        ? filter.numberSet.map(String)
                        : filter.type === 'stringSet'
                        ? filter.stringSet
                        : undefined;
                    // need to strip 'T00:00:00Z' from filter.min/max
                    const filterRange =
                      filter.type === 'numberRange' ||
                      filter.type === 'dateRange'
                        ? {
                            min:
                              filter.type === 'numberRange'
                                ? filter.min
                                : filter.min.split(/T00:00:00(?:\.000)?Z?/)[0],
                            max:
                              filter.type === 'numberRange'
                                ? filter.max
                                : filter.max.split(/T00:00:00(?:\.000)?Z?/)[0],
                          }
                        : undefined;

                    // augment variable metadata including filter-aware axis range
                    if (
                      variable.type === 'number' ||
                      variable.type === 'integer'
                    )
                      return {
                        ...variable,
                        vocabulary,
                        distributionDefaults: {
                          ...variable.distributionDefaults,
                          rangeMin:
                            filterRange != null
                              ? (filterRange.min as number)
                              : (variable.distributionDefaults
                                  .rangeMin as number),
                          rangeMax:
                            filterRange != null
                              ? (filterRange.max as number)
                              : (variable.distributionDefaults
                                  .rangeMax as number),
                        },
                      };
                    else if (variable.type === 'date')
                      return {
                        ...variable,
                        vocabulary,
                        distributionDefaults: {
                          ...variable.distributionDefaults,
                          rangeMin:
                            filterRange != null
                              ? (filterRange.min as string)
                              : (variable.distributionDefaults
                                  .rangeMin as string),
                          rangeMax:
                            filterRange != null
                              ? (filterRange.max as string)
                              : (variable.distributionDefaults
                                  .rangeMax as string),
                        },
                      };
                    else
                      return {
                        ...variable,
                        vocabulary,
                        distinctValuesCount: vocabulary?.length ?? 0,
                      };
                  }
                  return variable;
                }
              );
              return {
                ...entity,
                variables,
                children: mappedChildren,
              };
            }
            return {
              ...entity,
              children: mappedChildren,
            };
          },
          (entity) => entity.children ?? [],
          rootEntity
        );
    return entityTreeToArray(mappedRootEntity);
  }, [filters, rootEntity]);
}

function defaultMakeVariableLink({
  variableId,
  entityId,
}: Partial<VariableDescriptor>): string {
  return variableId && entityId
    ? `/variables/${entityId}/${variableId}`
    : entityId
    ? `/variables/${entityId}`
    : `/variables`;
}

/**
 * TODO: This is pasted directly `DefaultVariableRedirect`. Cover this hook by some
 * kind of test and simplify its logic.
 */
export function useGetDefaultVariableDescriptor() {
  const entities = useStudyEntities();
  const flattenedFields = useFlattenedFields(entities, 'variableTree');
  const fieldTree = useFieldTree(flattenedFields);
  const featuredFields = useFeaturedFieldsFromTree(fieldTree);

  return useCallback(
    function getDefaultVariableDescriptor(entityId?: string) {
      let finalEntityId;
      let finalVariableId;

      if (entityId || featuredFields.length === 0) {
        // Use the first variable in the entity
        const entity = entityId
          ? entities.find((e) => e.id === entityId)
          : entities[0];

        if (entity) {
          finalEntityId = entity.id;

          const firstVariable = findFirstVariable(
            fieldTree,
            entity.id
          )?.field.term.split('/')[1];

          finalVariableId = firstVariable || '';
        }
      } else {
        // Use the first featured variable
        [finalEntityId, finalVariableId] = featuredFields[0].term.split('/');
      }

      if (finalEntityId == null || finalVariableId == null) {
        throw new Error('Could not find a default variable.');
      }

      return { entityId: finalEntityId, variableId: finalVariableId };
    },
    [entities, featuredFields, fieldTree]
  );
}

export const timeSliderVariableConstraints: DataElementConstraintRecord[] = [
  {
    overlayVariable: {
      isRequired: true,
      minNumVars: 1,
      maxNumVars: 1,
      // TODO: testing with SCORE S. mansoni Cluster Randomized Trial study
      // however, this study does not have date variable, thus temporarily use below for test purpose
      // i.e., additionally allowing 'integer'
      allowedTypes: ['date', 'integer'],
      // TODO: below two are correct ones
      // allowedTypes: ['date'],
      //        isTemporal: true,
    },
  },
];

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
      const defaultTimeSliderEntity: StudyEntity | undefined = Array.from(
        preorder(temporalVariableTree, (entity) => entity.children ?? [])
      )
        // not all `variables` are actually variables, so we filter to be sure
        .filter(
          (entity) =>
            entity.variables.filter((variable) => Variable.is(variable))
              .length > 0
        )[0];

      // then take the first variable from it
      const defaultTimeSliderVariable: Variable | undefined =
        defaultTimeSliderEntity.variables.filter(
          (variable): variable is Variable => Variable.is(variable)
        )[0];

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
