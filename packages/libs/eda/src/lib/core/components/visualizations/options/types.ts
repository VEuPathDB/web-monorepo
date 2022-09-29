import { ReactNode } from 'react';
import { VariableDescriptor } from '../../../types/variable';

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
