import {
  IsEnabledInPickerParams,
  VisualizationProps,
} from './VisualizationTypes';

export interface VisualizationPluginSpec<Options = undefined> {
  /** Component used to render the visualization */
  fullscreenComponent: React.ComponentType<VisualizationProps<Options>>;
  /** Image URI used in selector */
  selectorIcon: string;
  /** Function used to create a default configuration when a visualization instance is created */
  createDefaultConfig: () => unknown;
  /** Function used to determine if visualization is compatible with study */
  isEnabledInPicker?: (props: IsEnabledInPickerParams) => boolean;
}

interface VisualizationPluginWithExtensions<Options> {
  /** Options that have been set for the plugin instance */
  options?: Options;
  /** Factory function to create a new plugin instance with options applied */
  withOptions: (options: Options) => VisualizationPlugin<Options>;
  /** Factory function to create a new plugin instance with a new selector icon */
  withSelectorIcon: (icon: string) => VisualizationPlugin<Options>;
}

export interface VisualizationPlugin<Options = undefined>
  extends VisualizationPluginSpec<Options>,
    VisualizationPluginWithExtensions<Options> {}

export function createVisualizationPlugin<Options>(
  pluginSpec: VisualizationPluginSpec<Options>
): VisualizationPlugin<Options> {
  return createExtendedVisualizationPlugin(pluginSpec);
}

function createExtendedVisualizationPlugin<Options>(
  plugin: VisualizationPluginSpec<Options> &
    Partial<VisualizationPluginWithExtensions<Options>>
): VisualizationPlugin<Options> {
  return {
    ...plugin,
    withOptions: (options: Options) =>
      createExtendedVisualizationPlugin({
        ...plugin,
        options,
      }),
    withSelectorIcon: (selectorIcon: string) =>
      createExtendedVisualizationPlugin({
        ...plugin,
        selectorIcon,
      }),
  };
}
