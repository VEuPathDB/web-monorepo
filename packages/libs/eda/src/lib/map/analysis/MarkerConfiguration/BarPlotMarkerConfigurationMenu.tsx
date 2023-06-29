import { useState, useEffect, useCallback } from 'react';
import {
  InputVariables,
  Props as InputVariablesProps,
} from '../../../core/components/visualizations/InputVariables';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import { VariablesByInputName } from '../../../core/utils/data-element-constraints';
import {
  usePromise,
  AllValuesDefinition,
  OverlayConfig,
  Variable,
  Filter,
} from '../../../core';
import { CategoricalMarkerConfigurationTable } from './CategoricalMarkerConfigurationTable';
import { CategoricalMarkerPreview } from './CategoricalMarkerPreview';
import Barplot from '@veupathdb/components/lib/plots/Barplot';
import { SubsettingClient } from '../../../core/api';
import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import { Toggle } from '@veupathdb/coreui';
import { SharedMarkerConfigurations } from './PieMarkerConfigurationMenu';

interface MarkerConfiguration<T extends string> {
  type: T;
}

export interface BarPlotMarkerConfiguration
  extends MarkerConfiguration<'barplot'>,
    SharedMarkerConfigurations {
  selectedValues: OverlayConfig['overlayValues'] | undefined;
  selectedPlotMode: 'count' | 'proportion';
  dependentAxisLogScale: boolean;
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
  /**
   * Always used for categorical marker preview. Also used in categorical table if selectedCountsOption is 'filtered'
   */
  allFilteredCategoricalValues: AllValuesDefinition[] | undefined;
  /**
   * Only defined and used in categorical table if selectedCountsOption is 'visible'
   */
  allVisibleCategoricalValues: AllValuesDefinition[] | undefined;
}

// TODO: generalize this and PieMarkerConfigMenu into MarkerConfigurationMenu. Lots of code repetition...

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
  allFilteredCategoricalValues,
  allVisibleCategoricalValues,
}: Props) {
  /**
   * Used to track the CategoricalMarkerConfigurationTable's selection state, which allows users to
   * select more than the allowable limit. Doing so results in a message to the user that they've selected
   * too many values. The state is lifted up (versus living in CategoricalMarkerConfigurationTable) in order
   * to pass its length to CategoricalMarkerPreview.
   */
  const [uncontrolledSelections, setUncontrolledSelections] = useState(
    new Set(
      overlayConfiguration?.overlayType === 'categorical'
        ? overlayConfiguration?.overlayValues
        : undefined
    )
  );
  useEffect(() => {
    if (overlayConfiguration?.overlayType !== 'categorical') return;
    setUncontrolledSelections(new Set(overlayConfiguration?.overlayValues));
  }, [overlayConfiguration?.overlayValues, overlayConfiguration?.overlayType]);

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
        color: '#333',
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
      selectedPlotMode:
        option as BarPlotMarkerConfiguration['selectedPlotMode'],
    });
  }
  function handleBinningMethodSelection(option: string) {
    onChange({
      ...configuration,
      binningMethod: option as BarPlotMarkerConfiguration['binningMethod'],
    });
  }
  function handleLogScaleChange(option: boolean) {
    onChange({
      ...configuration,
      dependentAxisLogScale: option,
    });
  }

  return (
    <div>
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
      <div style={{ margin: '5px 0 0 0' }}>
        <span style={{ fontWeight: 'bold' }}>
          Summary marker (all filtered data)
        </span>
        {overlayConfiguration?.overlayType === 'categorical' ? (
          <>
            <CategoricalMarkerPreview
              overlayConfiguration={overlayConfiguration}
              allFilteredCategoricalValues={allFilteredCategoricalValues}
              mapType="barplot"
              numberSelected={uncontrolledSelections.size}
              isDependentAxisLogScaleActive={
                configuration.dependentAxisLogScale
              }
            />
          </>
        ) : (
          continuousMarkerPreview
        )}
      </div>
      <LabelledGroup label="Marker X-axis controls">
        <RadioButtonGroup
          containerStyles={
            {
              // marginTop: 20,
            }
          }
          label="Binning method"
          selectedOption={configuration.binningMethod ?? 'equalInterval'}
          options={['equalInterval', 'quantile', 'standardDeviation']}
          optionLabels={[
            'Equal interval',
            'Quantile (10)',
            'Standard deviation',
          ]}
          buttonColor={'primary'}
          // margins={['0em', '0', '0', '1em']}
          onOptionSelected={handleBinningMethodSelection}
          disabledList={
            overlayConfiguration?.overlayType === 'continuous'
              ? []
              : ['equalInterval', 'quantile', 'standardDeviation']
          }
        />
      </LabelledGroup>
      <LabelledGroup label="Marker Y-axis controls">
        <RadioButtonGroup
          containerStyles={
            {
              // marginTop: 20,
            }
          }
          label="Plot mode"
          selectedOption={configuration.selectedPlotMode || 'count'}
          options={['count', 'proportion']}
          optionLabels={['Count', 'Proportion']}
          buttonColor={'primary'}
          // margins={['0em', '0', '0', '1em']}
          onOptionSelected={handlePlotModeSelection}
        />
        <Toggle
          label="Log scale"
          themeRole="primary"
          value={configuration.dependentAxisLogScale}
          onChange={handleLogScaleChange}
        />
      </LabelledGroup>
      {overlayConfiguration?.overlayType === 'categorical' && (
        <CategoricalMarkerConfigurationTable
          overlayValues={overlayConfiguration.overlayValues}
          configuration={configuration}
          onChange={onChange}
          uncontrolledSelections={uncontrolledSelections}
          setUncontrolledSelections={setUncontrolledSelections}
          allCategoricalValues={
            configuration.selectedCountsOption === 'filtered'
              ? allFilteredCategoricalValues
              : allVisibleCategoricalValues
          }
          selectedCountsOption={configuration.selectedCountsOption}
        />
      )}
      {overlayConfiguration?.overlayType === 'continuous' && barplotData.value && (
        <div style={{ margin: '5px 0 0 0' }}>
          <span style={{ fontWeight: 'bold' }}>
            Raw distribution of overall filtered data
          </span>
          <Barplot
            data={{ series: [barplotData.value] }}
            barLayout="overlay"
            showValues={false}
            showIndependentAxisTickLabel={false}
            spacingOptions={{
              padding: 0,
              marginLeft: 0,
              marginRight: 0,
              marginTop: 0,
              marginBottom: 0,
            }}
            containerStyles={{
              height: 250,
              width: 400,
            }}
          />
        </div>
      )}
    </div>
  );
}
