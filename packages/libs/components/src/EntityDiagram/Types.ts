export interface Variables {
  id: string;
  providerLabel: string;
  displayName: string;
  type: string;
  isContinuous?: boolean;
  precision?: number;
  units?: string;
  isMultiValued: boolean;
}

export interface StudyData {
  id: string;
  displayName: string;
  description: string;
  children?: this[];
  variables: Variables[];
}
