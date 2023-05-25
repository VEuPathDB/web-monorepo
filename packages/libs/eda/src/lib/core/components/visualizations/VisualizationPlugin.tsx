import { DuotoneSvgProps } from './implementations/selectorIcons/types';
import {
  IsEnabledInPickerParams,
  VisualizationProps,
} from './VisualizationTypes';

type SelectorIcon = React.ComponentType<DuotoneSvgProps>;

export interface VisualizationPluginSpec<Options = undefined> {
  /** Component used to render the visualization */
  fullscreenComponent: React.ComponentType<VisualizationProps<Options>>;
  /** SVG used in selector */
  selectorIcon: SelectorIcon;
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
  withSelectorIcon: (icon: SelectorIcon) => VisualizationPlugin<Options>;
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
        options: {
          ...plugin.options,
          ...options,
        },
      }),
    withSelectorIcon: (selectorIcon: SelectorIcon) =>
      createExtendedVisualizationPlugin({
        ...plugin,
        selectorIcon,
      }),
  };
}
