import {
  BarPlotMarkerConfigurationMenu,
  BarPlotMarkerConfiguration,
} from './BarPlotMarkerConfigurationMenu';
import {
  PieMarkerConfigurationMenu,
  PieMarkerConfiguration,
} from './PieMarkerConfigurationMenu';
import { MarkerConfigurationSelector } from './MarkerConfigurationSelector';

export {
  MarkerConfigurationSelector,
  PieMarkerConfigurationMenu,
  BarPlotMarkerConfigurationMenu,
};

export type MarkerConfiguration =
  | BarPlotMarkerConfiguration
  | PieMarkerConfiguration;
