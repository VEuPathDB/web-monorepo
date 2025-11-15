export interface ParamEventHandlers {
  onOntologyTermSelectCurrentFilters: (filters: any) => void;
  onOntologyTermSummaryUpdate: (summary: any) => void;
  onOntologyTermSort: (sort: any) => void;
  onOntologyTermSearch: (search: any) => void;
  onParamValueChange: (paramName: string, value: any) => void;
  onParamStateChange: (paramName: string, state: any) => void;
}

export interface ParamGroupProps {
  eventHandlers: ParamEventHandlers;
  group: any;
  parameters: any[];
  paramValues: any;
  paramUIState: any;
}

export interface ParamProps extends ParamEventHandlers {
  param: any;
  value: string;
  uiState: any;
}
