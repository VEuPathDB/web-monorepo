import {
  BarPlotMarkerConfigurationMenu,
  BarPlotMarkerConfiguration,
} from './BarPlotMarkerConfigurationMenu';
import {
  DonutConfigurationMenu,
  DonutMarkerConfiguration,
} from './DonutConfigurationMenu';
import { MarkerConfigurationSelector } from './MarkerConfigurationSelector';

export {
  MarkerConfigurationSelector,
  DonutConfigurationMenu,
  BarPlotMarkerConfigurationMenu,
};

export type MarkerConfiguration =
  | BarPlotMarkerConfiguration
  | DonutMarkerConfiguration;
