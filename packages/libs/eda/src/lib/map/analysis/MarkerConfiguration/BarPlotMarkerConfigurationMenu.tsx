import { H6 } from '@veupathdb/coreui';
import {
  InputVariables,
  Props as InputVariablesProps,
} from '../../../core/components/visualizations/InputVariables';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import { VariableDescriptor } from '../../../core/types/variable';
import { VariablesByInputName } from '../../../core/utils/data-element-constraints';
import { OverlayConfig } from '../../../core';

interface MarkerConfiguration<T extends string> {
  type: T;
}

export interface BarPlotMarkerConfiguration
  extends MarkerConfiguration<'barplot'> {
  selectedVariable: VariableDescriptor;
  overlayConfig: OverlayConfig | undefined;
  selectedPlotMode: 'count' | 'proportion';
}

interface Props
  extends Omit<
    InputVariablesProps,
    'onChange' | 'selectedVariables' | 'selectedPlotMode' | 'onPlotSelected'
  > {
  selectedPlotMode: string;
  onChange: (configuration: BarPlotMarkerConfiguration) => void;
  configuration: BarPlotMarkerConfiguration;
}

export function BarPlotMarkerConfigurationMenu({
  entities,
  onChange,
  starredVariables,
  toggleStarredVariable,
  configuration,
}: Props) {
  function handleInputVariablesOnChange(selection: VariablesByInputName) {
    if (!selection.overlay) {
      console.error(
        `Expected overlay to defined but got ${typeof selection.overlay}`
      );
      return;
    }

    onChange({
      ...configuration,
      selectedVariable: selection.overlay,
      overlayConfig: undefined,
    });
  }
  function handlePlotModeSelection(option: string) {
    onChange({
      ...configuration,
      selectedPlotMode: option as 'count' | 'proportion',
    });
  }

  return (
    <div>
      <H6
        additionalStyles={{
          margin: '15px 12px',
        }}
      >
        Configure Bar Plots:
      </H6>
      <p
        style={{
          paddingLeft: 7,
          margin: '5px 0 0 0',
          fontWeight: 'bold',
        }}
      >
        Color:
      </p>
      <InputVariables
        showClearSelectionButton={false}
        inputs={[{ name: 'overlay', label: 'Variable', titleOverride: ' ' }]}
        entities={entities}
        selectedVariables={{ overlay: configuration.selectedVariable }}
        onChange={handleInputVariablesOnChange}
        starredVariables={starredVariables}
        toggleStarredVariable={toggleStarredVariable}
      />
      <RadioButtonGroup
        containerStyles={{
          marginTop: 20,
        }}
        label="Y-axis"
        selectedOption={configuration.selectedPlotMode || 'count'}
        options={['count', 'proportion']}
        optionLabels={['Count', 'Proportion']}
        buttonColor={'primary'}
        margins={['0em', '0', '0', '1em']}
        onOptionSelected={handlePlotModeSelection}
      />
    </div>
  );
}
