import React, { useEffect, useState } from 'react';
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

/** A customizable slider widget.
 *
 * TODO: There is a good chance that we will need to add some debounce logic
 * to allow for us to update UI immediately and then handle backend calls
 * as needed.
 */
export default function SliderWidget({
  minimum,
  maximum,
  value,
  valueFormatter,
  step = 1,
  onChange,
  label,
  colorSpec,
  containerStyles = {},
}: SliderWidgetProps) {
  // Used to track whether or not has mouse hovering over widget.
  const [focused, setFocused] = useState(false);

  const [previousValue, setPreviousValue] = useState<number>();

  // Clear previous value whenever a new value is received.
  // This has to do with proper event sequencing when
  // `onChange` is an async action.
  useEffect(() => {
    setPreviousValue(undefined);
  }, [value]);

  const useStyles = makeStyles({
    root: {
      height: 0,
      paddingTop: 5,
      flex: 1,
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
      display: 'none',
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
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        ...containerStyles,
      }}
      onMouseOver={() => setFocused(true)}
      onMouseOut={() => setFocused(false)}
    >
      {label && (
        <Typography
          variant='button'
          style={{ color: focused ? DARK_GRAY : MEDIUM_GRAY, paddingRight: 15 }}
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
        onChange={(event, newValue) => {
          /**
           * Prevent multiple API calls by:
           * 1. Ignoring events where new value and current value are equivalent.
           * 2. When internal function has been called, but value prop has not yet been updated.
           */
          if (newValue !== value && !previousValue) {
            setPreviousValue(value);
            onChange(newValue as number);
          }
        }}
      />
    </div>
  );
}
