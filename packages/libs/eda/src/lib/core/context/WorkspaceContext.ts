import { createContext } from 'react';
import SubsettingClient from '../api/SubsettingClient';
import DataClient from '../api/DataClient';
import { AnalysisClient } from '../api/AnalysisClient';
import { StudyMetadata, StudyRecord, StudyRecordClass } from '../types/study';
import { VariableDescriptor } from '../types/variable';
import { DownloadClient } from '../api/DownloadClient';

export interface MakeVariableLink {
  (variableDescriptor: Partial<VariableDescriptor>): string;
}
export interface WorkspaceContextValue {
  studyRecordClass: StudyRecordClass;
  studyRecord: StudyRecord;
  studyMetadata: StudyMetadata;
  analysisClient: AnalysisClient;
  subsettingClient: SubsettingClient;
  downloadClient: DownloadClient;
  dataClient: DataClient;
  makeVariableLink?: MakeVariableLink;
}

export const WorkspaceContext = createContext<
  WorkspaceContextValue | undefined
>(undefined);
