import { createContext } from 'react';
import SubsettingClient from '../api/SubsettingClient';
import DataClient from '../api/DataClient';
import { AnalysisClient } from '../api/analysis-api';
import { StudyMetadata, StudyRecord, StudyRecordClass } from '../types/study';
import { VariableDescriptor } from '../types/variable';

export interface MakeVariableLink {
  (
    variableDescriptor: Partial<VariableDescriptor>,
    studyMetadata: StudyMetadata
  ): string;
}
export interface WorkspaceContextValue {
  studyRecordClass: StudyRecordClass;
  studyRecord: StudyRecord;
  studyMetadata: StudyMetadata;
  analysisClient: AnalysisClient;
  subsettingClient: SubsettingClient;
  dataClient: DataClient;
  makeVariableLink?: MakeVariableLink;
}

export const WorkspaceContext = createContext<
  WorkspaceContextValue | undefined
>(undefined);
