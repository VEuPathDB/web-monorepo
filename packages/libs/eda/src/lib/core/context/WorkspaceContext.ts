import { createContext } from 'react';
import { SubsettingClient } from '../api/subsetting-api';
import { DataClient } from '../api/data-api';
import { SessionClient } from '../api/session-api';
import { StudyMetadata, StudyRecord, StudyRecordClass } from '../types/study';
import { Variable } from '../types/variable';

export interface MakeVariableLink {
  (variableDescriptor: Partial<Variable>, studyMetadata: StudyMetadata): string;
}
export interface WorkspaceContextValue {
  studyRecordClass: StudyRecordClass;
  studyRecord: StudyRecord;
  studyMetadata: StudyMetadata;
  sessionClient: SessionClient;
  subsettingClient: SubsettingClient;
  dataClient: DataClient;
  makeVariableLink?: MakeVariableLink;
}

export const WorkspaceContext = createContext<
  WorkspaceContextValue | undefined
>(undefined);
