import {
  InputVariables,
  Props as InputVariablesProps,
} from '../../../core/components/visualizations/InputVariables';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import { VariableDescriptor } from '../../../core/types/variable';
import { VariablesByInputName } from '../../../core/utils/data-element-constraints';
import { AllValuesDefinition, OverlayConfig } from '../../../core';
import { CategoricalMarkerConfigurationTable } from './CategoricalMarkerConfigurationTable';
import { MarkerPreview } from './MarkerPreview';

interface MarkerConfiguration<T extends string> {
  type: T;
}

export interface BarPlotMarkerConfiguration
  extends MarkerConfiguration<'barplot'> {
  selectedVariable: VariableDescriptor;
  selectedValues: OverlayConfig['overlayValues'] | undefined;
  selectedPlotMode: 'count' | 'proportion';
  allValues: AllValuesDefinition[] | undefined;
}

interface Props
  extends Omit<
    InputVariablesProps,
    'onChange' | 'selectedVariables' | 'selectedPlotMode' | 'onPlotSelected'
  > {
  onChange: (configuration: BarPlotMarkerConfiguration) => void;
  configuration: BarPlotMarkerConfiguration;
  overlayConfiguration: OverlayConfig | undefined;
}

export function BarPlotMarkerConfigurationMenu({
  entities,
  onChange,
  starredVariables,
  toggleStarredVariable,
  configuration,
  constraints,
  overlayConfiguration,
}: Props) {
  function handleInputVariablesOnChange(selection: VariablesByInputName) {
    if (!selection.overlayVariable) {
      console.error(
        `Expected overlay to defined but got ${typeof selection.overlayVariable}`
      );
      return;
    }

    onChange({
      ...configuration,
      selectedVariable: selection.overlayVariable,
      selectedValues: undefined,
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
      <MarkerPreview data={overlayConfiguration} />
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
        inputs={[
          { name: 'overlayVariable', label: 'Variable', titleOverride: ' ' },
        ]}
        entities={entities}
        selectedVariables={{ overlayVariable: configuration.selectedVariable }}
        onChange={handleInputVariablesOnChange}
        starredVariables={starredVariables}
        toggleStarredVariable={toggleStarredVariable}
        constraints={constraints}
      />
      {overlayConfiguration?.overlayType === 'categorical' && (
        <CategoricalMarkerConfigurationTable
          overlayConfiguration={overlayConfiguration}
          configuration={configuration}
          // @ts-ignore
          onChange={onChange}
        />
      )}
    </div>
  );
}
