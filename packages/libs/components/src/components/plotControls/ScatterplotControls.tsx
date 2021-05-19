import React, { useMemo } from 'react';
import useDimensions from 'react-cool-dimensions';

// Definitions
import { LIGHT_BLUE, LIGHT_GRAY } from '../../constants/colors';
import { ErrorManagement } from '../../types/general';
import ControlsHeader from '../typography/ControlsHeader';

// Local Components
import ButtonGroup from '../widgets/ButtonGroup';
import Notification from '../widgets/Notification';

/**
 * Props for scatterplot controls.
 *
 * The presence or absence of an optional callback will
 * determine if that control is displayed.
 */
export type ScatterplotControlsProps = {
  /** Label for control panel. Optional. */
  label?: string;
  /** Additional styles for controls container. Optional */
  containerStyles?: React.CSSProperties;
  /** Color to use as an accent in the control panel. Will accept any
   * valid CSS color definition. Defaults to LIGHT_BLUE */
  accentColor?: string;
  /** Attributes and methdods for error management. */
  errorManagement: ErrorManagement;
  /** Scatterplot: valueSpec */
  valueSpec?: string;
  /** Scatterplot: valueSpec */
  onValueSpecChange?: (valueSpec: string) => void;
};

/**
 * A scatterplot controls panel.
 *
 * If you prefer a different layout or composition, you can
 * contruct you own control panel by using the various
 * widgets contained here.
 */
export default function ScatterplotControls({
  label,
  accentColor = LIGHT_BLUE,
  errorManagement,
  containerStyles,
  // valueSpec
  valueSpec,
  onValueSpecChange,
}: ScatterplotControlsProps) {
  const { ref, width } = useDimensions<HTMLDivElement>();

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
      ref={ref}
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
      {/* <div
        style={{ display: 'flex', flexWrap: 'wrap', paddingTop: '0.3125em' }}
      > */}
      <div style={{ display: 'flex' }}>
        {valueSpec && onValueSpecChange && (
          <ButtonGroup
            label="Plot options"
            options={[
              'Raw',
              'Smoothed mean',
              'Smoothed mean with raw',
              'Best fit line with raw',
            ]}
            selectedOption={valueSpec}
            // @ts-ignore
            onOptionSelected={onValueSpecChange}
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

      {label && (
        <ControlsHeader
          text={label}
          styleOverrides={{ paddingTop: '1.5625em', textAlign: 'right' }}
        />
      )}
    </div>
  );
}
