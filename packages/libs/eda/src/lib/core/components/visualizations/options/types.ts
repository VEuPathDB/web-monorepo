import { VariableDescriptor } from '../../../types/variable';

export interface XAxisOptions {
  getXAxisVariable?: (computeConfig: unknown) => VariableDescriptor | undefined;
}

export interface OverlayOptions {
  getOverlayVariable?: (
    computeConfig: unknown
  ) => VariableDescriptor | undefined;
  getCheckedLegendItems?: (computeConfig: unknown) => string[] | undefined;
}
