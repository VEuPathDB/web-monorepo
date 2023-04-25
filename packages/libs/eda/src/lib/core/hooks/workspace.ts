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
export function useFindEntityAndVariable() {
  const entities = useStudyEntities();
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
 * @param rootEntity The entity in the entity hierarchy. All entities at this level and
 * down will be returned in a flattened array.
 *
 * @returns Essentially, this will provide you will an array of entities in a flattened structure.
 * Technically, the hierarchical structure is still embedded in each entity, but all of the
 * entities are presented as siblings in the array.
 */
export function useStudyEntities() {
  const { rootEntity } = useStudyMetadata();
  return useMemo(() => entityTreeToArray(rootEntity), [rootEntity]);
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
