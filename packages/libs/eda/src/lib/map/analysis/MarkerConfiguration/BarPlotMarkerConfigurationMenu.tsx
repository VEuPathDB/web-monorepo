import { useCallback } from 'react';
import {
  InputVariables,
  Props as InputVariablesProps,
} from '../../../core/components/visualizations/InputVariables';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import { VariableDescriptor } from '../../../core/types/variable';
import { VariablesByInputName } from '../../../core/utils/data-element-constraints';
import {
  usePromise,
  AllValuesDefinition,
  OverlayConfig,
  Variable,
  Filter,
} from '../../../core';
import { CategoricalMarkerConfigurationTable } from './CategoricalMarkerConfigurationTable';
import { MarkerPreview } from './MarkerPreview';
import Barplot from '@veupathdb/components/lib/plots/Barplot';
import { SubsettingClient } from '../../../core/api';

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
  overlayVariable: Variable | undefined;
  subsettingClient: SubsettingClient;
  studyId: string;
  filters: Filter[] | undefined;
  continuousMarkerPreview: JSX.Element | undefined;
}

// TODO: generalize this and PieMarkerConfigMenu into MarkerConfigurationMenu. Lots of code repitition...

export function BarPlotMarkerConfigurationMenu({
  entities,
  onChange,
  starredVariables,
  toggleStarredVariable,
  configuration,
  constraints,
  overlayConfiguration,
  overlayVariable,
  subsettingClient,
  studyId,
  filters,
  continuousMarkerPreview,
}: Props) {
  const barplotData = usePromise(
    useCallback(async () => {
      if (
        !overlayVariable ||
        overlayConfiguration?.overlayType !== 'continuous' ||
        !('distributionDefaults' in overlayVariable)
      )
        return;
      const binSpec = {
        displayRangeMin:
          overlayVariable.distributionDefaults.rangeMin +
          (overlayVariable.type === 'date' ? 'T00:00:00Z' : ''),
        displayRangeMax:
          overlayVariable.distributionDefaults.rangeMax +
          (overlayVariable.type === 'date' ? 'T00:00:00Z' : ''),
        binWidth: overlayVariable.distributionDefaults.binWidth ?? 1,
        binUnits:
          'binUnits' in overlayVariable.distributionDefaults
            ? overlayVariable.distributionDefaults.binUnits
            : undefined,
      };
      const distributionResponse = await subsettingClient.getDistribution(
        studyId,
        configuration.selectedVariable.entityId,
        configuration.selectedVariable.variableId,
        {
          valueSpec: 'count',
          filters: filters ?? [],
          binSpec,
        }
      );
      return {
        name: '',
        value: distributionResponse.histogram.map((d) => d.value),
        label: distributionResponse.histogram.map((d) => d.binLabel),
        showValues: false,
      };
    }, [
      overlayVariable,
      overlayConfiguration?.overlayType,
      subsettingClient,
      filters,
      configuration.selectedVariable,
    ])
  );

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
      <div style={{ margin: '5px 0 0 0' }}>
        <span style={{ fontWeight: 'bold' }}>Marker Preview:</span>
        {overlayConfiguration?.overlayType === 'categorical' ? (
          <MarkerPreview data={overlayConfiguration} mapType="barplot" />
        ) : (
          continuousMarkerPreview
        )}
      </div>
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
          onChange={onChange}
        />
      )}
      {overlayConfiguration?.overlayType === 'continuous' &&
        barplotData.value && (
          <Barplot
            data={{ series: [barplotData.value] }}
            barLayout="overlay"
            showValues={false}
            showIndependentAxisTickLabel={false}
          />
        )}
    </div>
  );
}
