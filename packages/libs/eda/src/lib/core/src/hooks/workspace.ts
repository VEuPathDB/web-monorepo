import { SubsettingClient } from "../api/eda-api";
import { SessionClient } from "../api/session-api";
import { WorkspaceContext } from "../context/WorkspaceContext";
import { StudyMetadata, StudyRecord, StudyRecordClass } from "../types/study";
import { useNonNullableContext } from "./nonNullableContext";

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
export function useSessionClient(): SessionClient {
  return useNonNullableContext(WorkspaceContext).sessionClient;
}
