import {
  BarPlotConfigurationMenu,
  BarPlotMarkerConfiguration,
} from './BarPlotConfigurationMenu';
import {
  DonutConfigurationMenu,
  DonutMarkerConfiguration,
} from './DonutConfigurationMenu';
import { MarkerConfigurationSelector } from './MarkerConfigurationSelector';

export {
  MarkerConfigurationSelector,
  DonutConfigurationMenu,
  BarPlotConfigurationMenu,
};

export type MarkerConfiguration =
  | BarPlotMarkerConfiguration
  | DonutMarkerConfiguration;
