import React from 'react';

import { LIGHT_GRAY, LIGHT_GREEN } from '../../constants/colors';
import SliderWidget from './Slider';

export type OpacitySliderProps = {
  /** The current opacity value. Will be between 0 and 1. */
  value: number;
  /** Function to invoke when value changes. */
  onValueChange: (value: number) => void;
  /** Any valid CSS color definition. Hex, rgb, hsl values supported. */
  color?: string;
  /** Additional styles to apply to container. */
  containerStyles?: React.CSSProperties;
};

/** Slider widget customized for showing/controlling opacity. */
export default function OpacitySlider({
  value,
  onValueChange,
  color = LIGHT_GREEN,
  containerStyles = {},
}: OpacitySliderProps) {
  return (
    <SliderWidget
      label="Opacity"
      minimum={0}
      maximum={1}
      step={0.1}
      value={value}
      valueFormatter={(value) => `${value * 100}%`}
      onChange={onValueChange}
      colorSpec={{
        type: 'gradient',
        tooltip: color,
        knobColor: color,
        trackGradientStart: LIGHT_GRAY,
        trackGradientEnd: color,
      }}
      containerStyles={containerStyles}
    />
  );
}
