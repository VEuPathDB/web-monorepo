import React, { useMemo } from 'react';
import useDimensions from 'react-cool-dimensions';

// Definitions
import { LIGHT_BLUE, LIGHT_GRAY } from '../../constants/colors';
import { ErrorManagement } from '../../types/general';

// Local Components
import RadioButtonGroup from '../widgets/RadioButtonGroup';
import Notification from '../widgets/Notification';

/**
 * Props for ScatterPlot controls.
 *
 * The presence or absence of an optional callback will
 * determine if that control is displayed.
 */
export type ScatterPlotControlsProps = {
  /** Additional styles for controls container. Optional */
  containerStyles?: React.CSSProperties;
  /** Color to use as an accent in the control panel. Will accept any
   * valid CSS color definition. Defaults to LIGHT_BLUE */
  accentColor?: string;
  /** Attributes and methods for error management. */
  errorManagement: ErrorManagement;
  /** ScatterPlot: valueSpec */
  valueSpec?: string;
  /** ScatterPlot: onValueSpecChange */
  onValueSpecChange?: (valueSpec: string) => void;
  /** How buttons are displayed. Vertical or Horizontal */
  orientation?: 'vertical' | 'horizontal';
  /** location of radio button label: start: label & button; end: button & label */
  labelPlacement?: 'start' | 'end' | 'top' | 'bottom';
  /** minimum width to set up equivalently spaced width per item */
  minWidth?: number;
  /** button color: for now, supporting blue and red only - primary: blue; secondary: red */
  buttonColor?: 'primary' | 'secondary';
  /** margin of radio button group: string array for top, left, bottom, and left, e.g., ['10em', '0', '0', '10em'] */
  // TO DO: standardise to use SpacingOptionsAddon?
  margins?: string[];
  /** marginRight of radio button item: default 16px from MUI */
  itemMarginRight?: number | string;
  /** plot options as props */
  plotOptions?: string[];
  /** label for RadioButtonGroup */
  label?: string;
};

/**
 * A ScatterPlot controls panel.
 *
 * If you prefer a different layout or composition, you can
 * contruct you own control panel by using the various
 * widgets contained here.
 */
export default function ScatterPlotControls({
  accentColor = LIGHT_BLUE,
  errorManagement,
  containerStyles,
  valueSpec,
  onValueSpecChange,
  orientation,
  labelPlacement,
  buttonColor,
  margins,
  itemMarginRight,
  // add plotOptions
  plotOptions,
  label,
}: ScatterPlotControlsProps) {
  const { observe, width } = useDimensions<HTMLDivElement>();

  const errorStacks = useMemo(() => {
    return errorManagement.errors.reduce<
      Array<{ error: Error; occurences: number }>
    >((accumulatedValue, currentValue) => {
      const existingErrorStack = accumulatedValue.find(
        (stack) => stack.error.message === currentValue.message
      );

      if (existingErrorStack) {
        existingErrorStack.occurences++;
        return [...accumulatedValue];
      } else {
        return [...accumulatedValue, { error: currentValue, occurences: 1 }];
      }
    }, []);
  }, [errorManagement.errors]);

  return (
    <div
      ref={observe}
      style={{
        borderStyle: 'solid',
        borderWidth: '0em',
        borderColor: LIGHT_GRAY,
        borderRadius: '0.6125em',
        // padding: '0.9375em',
        paddingLeft: '0.9375em',
        minWidth: '11em',
        // width: 1000,
        ...containerStyles,
      }}
    >
      <div style={{ display: 'flex' }}>
        {valueSpec && onValueSpecChange && (
          <RadioButtonGroup
            label={label}
            // following plotOptions
            options={plotOptions ?? []}
            selectedOption={valueSpec}
            onOptionSelected={onValueSpecChange}
            orientation={orientation}
            labelPlacement={labelPlacement}
            buttonColor={buttonColor}
            margins={margins}
            itemMarginRight={itemMarginRight}
          />
        )}
      </div>
      {errorStacks.map(({ error, occurences }, index) => (
        <Notification
          title="Error"
          key={index}
          text={error.message}
          color={accentColor}
          occurences={occurences}
          containerStyles={{ marginTop: '0.625em' }}
          onAcknowledgement={() => errorManagement.removeError(error)}
        />
      ))}
    </div>
  );
}
