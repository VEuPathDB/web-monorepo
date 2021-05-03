import { SubsettingClient } from '../api/subsetting-api';
import { DataClient } from '../api/data-api';
import { SessionClient } from '../api/session-api';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { StudyMetadata, StudyRecord, StudyRecordClass } from '../types/study';
import { useNonNullableContext } from './nonNullableContext';

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
export function useSessionClient(): SessionClient {
  return useNonNullableContext(WorkspaceContext).sessionClient;
}
export function useVariableLink(
  entityId?: string,
  variableId?: string
): string {
  const { makeVariableLink = defaultMakeVariableLink } = useNonNullableContext(
    WorkspaceContext
  );
  return makeVariableLink(entityId, variableId);
}

function defaultMakeVariableLink(
  entityId?: string,
  variableId?: string
): string {
  return variableId && entityId
    ? `/variables/${entityId}/${variableId}`
    : entityId
    ? `/variables/${entityId}`
    : `/variables`;
}
