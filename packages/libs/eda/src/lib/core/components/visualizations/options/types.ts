import { ReactNode } from 'react';
import { OverlayConfig } from '../../../api/DataClient';
import { Filter } from '../../../types/filter';
import {
  VariableDescriptor,
  VariableCollectionDescriptor,
} from '../../../types/variable';
import { Computation } from '../../../types/visualization';

export interface XAxisOptions {
  getXAxisVariable?: (
    computeConfig: unknown
  ) => VariableDescriptor | VariableCollectionDescriptor | undefined;
}

export interface OverlayOptions {
  getOverlayVariable?: (
    computeConfig: unknown
  ) => VariableDescriptor | undefined;
  getOverlayVariableHelp?: () => ReactNode;
  getOverlayType?: () => OverlayConfig['overlayType'] | undefined;
  getOverlayVocabulary?: () => string[] | undefined;
  getCheckedLegendItems?: (computeConfig: unknown) => string[] | undefined;
}

export type RequestOptionProps<ConfigType> = {
  studyId: string;
  filters: Filter[] | undefined;
  vizConfig: Partial<ConfigType>;
  outputEntityId?: string;
  computation?: Computation;
};

export interface RequestOptions<ConfigType, ExtraProps, RequestParamsType> {
  getRequestParams?: (
    props: RequestOptionProps<ConfigType> & ExtraProps
  ) => RequestParamsType;
}
