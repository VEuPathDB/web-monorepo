import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

import { DARK_GRAY, LIGHT_GRAY, MEDIUM_GRAY } from '../../constants/colors';

export type SliderWidgetProps = {
  /** The minimum value of the slider. */
  minimum: number;
  /** The maximum value of the slider. */
  maximum: number;
  /** The current value of the slider. */
  value: number;
  /** An optional function which returns a string
   * representation of the value. Used in the tooltip. */
  valueFormatter?: (value: number) => string;
  /** The amount the value will change each time the mouse moves. Defaults to 1. */
  step?: number;
  /** Whether to mark each step on the slider. Useful for non-continous values. Defaults to false. */
  displayStepMarks?: boolean;
  /** Function to invoke whenever the value changes. */
  onChange: (value: number) => void;
  /** Optional label for the widget. */
  label?: string;
  /**
   * Optional color specification that allows for complete
   * control of slider colors.
   */
  colorSpec?:
    | {
        type: 'singleColor';
        tooltip: string;
        trackColor: string;
        knobColor: string;
      }
    | {
        type: 'gradient';
        tooltip: string;
        knobColor: string;
        trackGradientStart: string;
        trackGradientEnd: string;
      };
  /** Additional styles to apply to component container. */
  containerStyles?: React.CSSProperties;
};

/** A customizable slider widget. */
export default function SliderWidget({
  minimum,
  maximum,
  value,
  valueFormatter,
  step = 1,
  displayStepMarks = false,
  onChange,
  label,
  colorSpec,
  containerStyles = {},
}: SliderWidgetProps) {
  const [focused, setFocused] = useState(false);

  const useStyles = makeStyles({
    root: {
      height: 0,
      paddingTop: 5,
    },
    rail: {
      background: colorSpec
        ? colorSpec.type === 'gradient'
          ? `linear-gradient(90deg, ${colorSpec.trackGradientStart}, ${colorSpec.trackGradientEnd})`
          : colorSpec.trackColor
        : LIGHT_GRAY,
      opacity: 1,
      height: 8,
      borderRadius: 5,
    },
    track: {
      height: 0,
    },
    thumb: {
      height: 18,
      width: 18,
      backgroundColor: '#fff',
      border: `2px solid ${colorSpec ? colorSpec.knobColor : MEDIUM_GRAY}`,
      marginTop: -5,
    },
    valueLabel: {
      color: colorSpec ? colorSpec.tooltip : MEDIUM_GRAY,
      marginLeft: 2,
    },
  });

  const classes = useStyles();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        ...containerStyles,
      }}
      onMouseOver={() => setFocused(true)}
      onMouseOut={() => setFocused(false)}
    >
      {label && (
        <Typography
          variant='button'
          style={{ color: focused ? DARK_GRAY : MEDIUM_GRAY }}
        >
          {label}
        </Typography>
      )}
      <Slider
        classes={{
          root: classes.root,
          rail: classes.rail,
          track: classes.track,
          thumb: classes.thumb,
          valueLabel: classes.valueLabel,
        }}
        aria-label={label ?? 'slider'}
        min={minimum}
        max={maximum}
        value={value}
        step={step}
        valueLabelDisplay='auto'
        valueLabelFormat={valueFormatter}
        onChange={(event, value) => onChange(value as number)}
        marks={displayStepMarks}
      />
    </div>
  );
}
