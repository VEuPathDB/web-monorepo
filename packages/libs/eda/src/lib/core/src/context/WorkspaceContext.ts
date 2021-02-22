import { createContext } from "react";
import { SubsettingClient } from "../api/eda-api";
import { SessionClient } from "../api/session-api";
import { StudyMetadata, StudyRecord, StudyRecordClass } from "../types/study";

interface WorkspaceContextValue {
  studyRecordClass: StudyRecordClass;
  studyRecord: StudyRecord;
  studyMetadata: StudyMetadata;
  sessionClient: SessionClient;
  subsettingClient: SubsettingClient;
  // dataClient: DataClient;
}

export const WorkspaceContext = createContext<
  WorkspaceContextValue | undefined
>(undefined);
