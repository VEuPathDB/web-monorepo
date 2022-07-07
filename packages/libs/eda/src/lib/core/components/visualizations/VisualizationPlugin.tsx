import {
  IsEnabledInPickerParams,
  SelectorProps,
  VisualizationProps,
} from './VisualizationTypes';

export interface VisualizationPlugin<Options = undefined> {
  fullscreenComponent: React.ComponentType<VisualizationProps<Options>>;
  selectorComponent: React.ComponentType<SelectorProps>;
  createDefaultConfig: () => unknown;
  isEnabledInPicker?: (props: IsEnabledInPickerParams) => boolean;
  withOptions: (options: Options) => VisualizationPlugin<Options>;
  options?: Options;
}

export function createVisualizationPlugin<Options>(
  config: Omit<VisualizationPlugin<Options>, 'withOptions' | 'optoins'>
): VisualizationPlugin<Options> {
  function withOptions(options: Options): VisualizationPlugin<Options> {
    return {
      ...config,
      options: options,
      withOptions,
    };
  }
  return {
    ...config,
    withOptions,
  };
}
