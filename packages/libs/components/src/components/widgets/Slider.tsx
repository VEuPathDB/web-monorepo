import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

import { NumberInput } from './NumberAndDateInputs';
import { DARK_GRAY, LIGHT_GRAY, MEDIUM_GRAY } from '../../constants/colors';
import { debounce } from 'lodash';
import { NumberOrDate } from '../../types/general';

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
  /** Rate at which to debounce onChange calls, in milliseconds. Defaults to 100. */
  debounceRateMs?: number;
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
  /** Show an auxillary text input box */
  showTextInput?: boolean;
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
  debounceRateMs = 100,
  onChange,
  label,
  colorSpec,
  containerStyles = {},
  showTextInput,
}: SliderWidgetProps) {
  // Used to track whether or not has mouse hovering over widget.
  const [focused, setFocused] = useState(false);

  const useStyles = makeStyles({
    root: {
      height: 0,
      paddingTop: 5,
      flex: 1,
      width: '11em',
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

  const [localValue, setLocalValue] = useState<number>(value);

  // XXX We may want a generic useDebouncedCallback hook.
  const debouncedOnChange = useMemo(() => debounce(onChange, debounceRateMs), [
    onChange,
  ]);

  // cancel any lingering calls to onChange (via useEffect cleanup fn)
  useEffect(() => debouncedOnChange.cancel, []);

  // watch external 'value' for changes and set localValue
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback(
    (_: unknown, value: number | number[]) => {
      if (Array.isArray(value))
        throw new Error('Expected a number, but got an array.');
      setLocalValue(value);
      debouncedOnChange(value);
    },
    [debouncedOnChange]
  );

  const valueLabelDisplay = showTextInput ? 'off' : 'auto';

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
          variant="button"
          style={{ color: focused ? DARK_GRAY : MEDIUM_GRAY, paddingRight: 15 }}
        >
          {label}
        </Typography>
      )}
      {showTextInput && (
        <NumberInput
          value={localValue}
          minValue={minimum}
          maxValue={maximum}
          onValueChange={(newValue?: NumberOrDate) =>
            /** disable clearing of text field by ignoring empty string */
            newValue != null && handleChange(null, newValue as number)
          }
          displayRangeViolationWarnings={false}
          containerStyles={{
            width:
              Math.max(String(maximum).length, String(minimum).length) +
              5 +
              'ch',
            marginRight: 10,
          }}
        />
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
        value={localValue}
        step={step}
        valueLabelDisplay={valueLabelDisplay}
        valueLabelFormat={valueFormatter}
        onChange={handleChange}
      />
    </div>
  );
}
