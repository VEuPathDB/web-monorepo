import { ReactNode } from 'react';
import { Filter } from '../../../types/filter';
import { VariableDescriptor } from '../../../types/variable';
import { Computation } from '../../../types/visualization';

export interface XAxisOptions {
  getXAxisVariable?: (computeConfig: unknown) => VariableDescriptor | undefined;
}

export interface OverlayOptions {
  getOverlayVariable?: (
    computeConfig: unknown
  ) => VariableDescriptor | undefined;
  getOverlayVariableHelp?: () => string;
  getCheckedLegendItems?: (computeConfig: unknown) => string[] | undefined;
}

export interface RequestOptions<ConfigType> {
  getRequestParams?: (
    studyId: string,
    filters: Filter[] | undefined,
    vizConfig: ConfigType,
    computation: Computation
  ) => unknown;
}
