import React, { useMemo } from 'react';

// Definitions
import { LIGHT_BLUE, LIGHT_GRAY } from '../../constants/colors';
import { ErrorManagement } from '../../types/general';
import ControlsHeader from '../typography/ControlsHeader';

// Local Components
import ButtonGroup from '../widgets/ButtonGroup';
import Notification from '../widgets/Notification';
import OpacitySlider from '../widgets/OpacitySlider';
import Switch from '../widgets/Switch';

export type PieControlsProps = {
  /** Label for control panel. Optional. */
  label?: string;
  /** Whether or not to display the plot legend. */
  displayLegend: boolean;
  /** Action to take on display legend change. */
  toggleDisplayLegend: (displayLegend: boolean) => void;
  /** Whether or not to display the additionally controls that
   * may be provided by the charting library used to generate the plot.
   * For example, Plot.ly controls.*/
  displayLibraryControls: boolean;
  /** Action to take on display library controls change. */
  toggleLibraryControls: (displayLegend: boolean) => void;
  /** Current histogram opacity. */
  opacity: number;
  /** Function to invoke when opacity changes. */
  onOpacityChange: (opacity: number) => void;
  /** The current orientation of the plot.  */
  availableUnits?: Array<string>;
  /** The currently selected bin unit. */
  selectedUnit?: string;
  /** Function to invoke when the selected bin unit changes. */
  onSelectedUnitChange?: (unit: string) => void;
  containerStyles?: React.CSSProperties;
  /** Color to use as an accent in the control panel. Will accept any
   * valid CSS color definition. Defaults to LIGHT_BLUE */
  accentColor?: string;
  /** Attributes and methdods for error management. */
  errorManagement: ErrorManagement;
};

/** A default pie/donut plot control panel. */
export default function PieControls({
  label,
  displayLegend,
  toggleDisplayLegend,
  displayLibraryControls,
  toggleLibraryControls,
  opacity,
  onOpacityChange,
  availableUnits,
  selectedUnit,
  onSelectedUnitChange,
  containerStyles = {},
  accentColor = LIGHT_BLUE,
  errorManagement,
}: PieControlsProps) {
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
      style={{
        borderStyle: 'solid',
        borderWidth: 2,
        borderColor: LIGHT_GRAY,
        borderRadius: '10px',
        padding: '15px',
        minWidth: '280px',
        ...containerStyles,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        {availableUnits?.length && selectedUnit && onSelectedUnitChange ? (
          <ButtonGroup
            label="Data Units"
            options={availableUnits}
            selectedOption={selectedUnit}
            onOptionSelected={onSelectedUnitChange}
            containerStyles={{ paddingRight: 25, paddingBottom: 10 }}
          />
        ) : null}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
          }}
        >
          <OpacitySlider
            value={opacity}
            onValueChange={onOpacityChange}
            color={accentColor}
            containerStyles={{
              minWidth: 250,
              paddingRight: 25,
              paddingBottom: 10,
            }}
          />
          <Switch
            label="Legend"
            color={accentColor}
            state={displayLegend}
            // The stinky use of `any` here comes from
            // an incomplete type definition in the
            // material UI library.
            onStateChange={(event: any) =>
              toggleDisplayLegend(event.target.checked)
            }
            containerStyles={{ paddingRight: 25, paddingBottom: 10 }}
          />
          <Switch
            label="Plot.ly Controls"
            color={accentColor}
            state={displayLibraryControls}
            onStateChange={(event: any) =>
              toggleLibraryControls(event.target.checked)
            }
          />
        </div>
      </div>

      {errorStacks.map(({ error, occurences }, index) => (
        <Notification
          title="Error"
          key={index}
          text={error.message}
          color={accentColor}
          occurences={occurences}
          containerStyles={{ marginTop: 10 }}
          onAcknowledgement={() => errorManagement.removeError(error)}
        />
      ))}

      {label && (
        <ControlsHeader
          text={label}
          styleOverrides={{ paddingTop: 25, textAlign: 'right' }}
        />
      )}
    </div>
  );
}
