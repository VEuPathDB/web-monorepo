import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import SubsettingClient from '../api/SubsettingClient';
import DataClient from '../api/DataClient';
import { AnalysisClient } from '../api/AnalysisClient';
import {
  MakeVariableLink,
  WorkspaceContext,
} from '../context/WorkspaceContext';
import {
  CollectionVariableTreeNode,
  StudyEntity,
  StudyMetadata,
  StudyRecord,
  StudyRecordClass,
  Variable,
  VariableTreeNode,
} from '../types/study';
import {
  VariableCollectionDescriptor,
  VariableDescriptor,
} from '../types/variable';
import { useCallback, useMemo } from 'react';
import {
  entityTreeToArray,
  findEntityAndVariable,
  findEntityAndVariableCollection,
  findVariableCollections,
} from '../utils/study-metadata';
import { ComputeClient } from '../api/ComputeClient';
import { DownloadClient } from '../api';
import { Filter } from '../types/filter';
import { mapStructure } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import {
  useFeaturedFieldsFromTree,
  useFieldTree,
  useFlattenedFields,
} from '../components/variableSelectors/hooks';
import { findFirstVariable } from '../../workspace/Utils';
import * as DateMath from 'date-arithmetic';
import { TimeUnit } from '../types/general';

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

export function useFindEntityAndVariableCollection(filters?: Filter[]) {
  const entities = useStudyEntities(filters);
  return useCallback(
    (variableCollection?: VariableCollectionDescriptor) => {
      const entAndVarCollection = findEntityAndVariableCollection(
        entities,
        variableCollection
      );
      if (entAndVarCollection == null) return;
      return entAndVarCollection as {
        entity: StudyEntity;
        variableCollection: CollectionVariableTreeNode;
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

export function useEntityAndVariableCollection(
  descriptor?: VariableCollectionDescriptor
) {
  const entities = useStudyEntities();
  return useMemo(
    () => descriptor && findEntityAndVariableCollection(entities, descriptor),
    [descriptor, entities]
  );
}

export function useVariableCollections(
  entity: StudyEntity,
  collectionPredicate?: (
    variableCollection: CollectionVariableTreeNode
  ) => boolean
) {
  return useMemo(
    () => findVariableCollections(entity, collectionPredicate),
    [entity, collectionPredicate]
  );
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
                  if (variable.type !== 'category') {
                    const relevantFilters = filters.filter(
                      (f) =>
                        f.entityId === entity.id && f.variableId === variable.id
                    );
                    if (relevantFilters.length > 0) {
                      // if there's a variable.vocabulary, filter it by *all* the filters
                      // and their filter values
                      const vocabulary = relevantFilters.reduce(
                        (vocab, filter) =>
                          vocab?.filter((vocabItem) =>
                            filter.type === 'dateSet'
                              ? filter.dateSet.includes(vocabItem)
                              : filter.type === 'numberSet'
                              ? filter.numberSet.map(String).includes(vocabItem)
                              : filter.type === 'stringSet'
                              ? filter.stringSet.includes(vocabItem)
                              : undefined
                          ),
                        variable.vocabulary
                      );

                      // augment variable metadata including filter-aware axis range
                      if (
                        variable.type === 'number' ||
                        variable.type === 'integer'
                      ) {
                        // TO DO? recalculate binWidth for numeric variables?
                        // (it's less critical than for dates due to time slider)

                        // narrow variable's rangeMin/Max based on ranges of *all* filters
                        const filterRange = relevantFilters.reduce(
                          (range, filter) => {
                            if (filter.type === 'numberRange')
                              return {
                                min:
                                  filter.min > range.min
                                    ? filter.min
                                    : range.min,
                                max:
                                  filter.max < range.max
                                    ? filter.max
                                    : range.max,
                              };
                            else return range;
                            // longitudeRanges are difficult to handle
                            // and there's no need to modify the range metadata for longitude vars anyway
                          },
                          {
                            min: variable.distributionDefaults.rangeMin,
                            max: variable.distributionDefaults.rangeMax,
                          }
                        );

                        return {
                          ...variable,
                          fullVocabulary: variable.vocabulary,
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
                      } else if (variable.type === 'date') {
                        // as with numbers above, narrow variable's range based on ranges of *all* filters
                        const filterRange = relevantFilters.reduce(
                          (range, filter) => {
                            if (filter.type === 'dateRange') {
                              const filterMin = filter.min.split(
                                /T00:00:00(?:\.000)?Z?/
                              )[0];
                              const filterMax = filter.max.split(
                                /T00:00:00(?:\.000)?Z?/
                              )[0];
                              return {
                                min:
                                  filterMin > range.min ? filterMin : range.min,
                                max:
                                  filterMax < range.max ? filterMax : range.max,
                              };
                            } else return range;
                          },
                          {
                            min: variable.distributionDefaults.rangeMin,
                            max: variable.distributionDefaults.rangeMax,
                          }
                        );

                        // recalculate bin width and units
                        // to keep it simple let's keep the width at 1 and just try different units
                        const binWidth = 1;
                        const binUnits = (['year', 'month', 'week', 'day'].find(
                          (unit) => {
                            if (filterRange) {
                              const diff = DateMath.diff(
                                new Date(filterRange.min as string),
                                new Date(filterRange.max as string),
                                unit as DateMath.Unit
                              );
                              // 12 is somewhat arbitrary, but it basically
                              // means if there are >= 12 years, use year bins.
                              // Otherwise if >= 12 months, use month bins, etc
                              return diff >= 12;
                            }
                          }
                        ) ?? 'day') as TimeUnit;

                        return {
                          ...variable,
                          fullVocabulary: variable.vocabulary,
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
                            binUnits,
                            binWidth,
                          },
                        };
                      } else
                        return {
                          ...variable,
                          fullVocabulary: variable.vocabulary,
                          vocabulary,
                          distinctValuesCount: vocabulary?.length ?? 0,
                        };
                    } else return variable;
                  } else return variable;
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
