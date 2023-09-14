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
import { Toggle } from '@veupathdb/coreui';
import { SharedMarkerConfigurations } from './PieMarkerConfigurationMenu';
import { useUncontrolledSelections } from '../hooks/uncontrolledSelections';
import {
  BinningMethod,
  SelectedCountsOption,
  SelectedValues,
} from '../appState';
import { gray } from '@veupathdb/coreui/lib/definitions/colors';

interface MarkerConfiguration<T extends string> {
  type: T;
}

export interface BarPlotMarkerConfiguration
  extends MarkerConfiguration<'barplot'>,
    SharedMarkerConfigurations {
  selectedPlotMode: 'count' | 'proportion';
  dependentAxisLogScale: boolean;
  binningMethod: BinningMethod;
  selectedValues: SelectedValues;
  selectedCountsOption: SelectedCountsOption;
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
  const { uncontrolledSelections, setUncontrolledSelections } =
    useUncontrolledSelections(
      overlayConfiguration?.overlayType === 'categorical'
        ? overlayConfiguration?.overlayValues
        : undefined
    );

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
      {/* limit inputVariables width */}
      <div style={{ maxWidth: '350px' }}>
        <InputVariables
          inputs={[
            {
              name: 'overlayVariable',
              label: 'Variable',
              titleOverride: ' ',
              isNonNullable: true,
            },
          ]}
          entities={entities}
          selectedVariables={{
            overlayVariable: configuration.selectedVariable,
          }}
          onChange={handleInputVariablesOnChange}
          starredVariables={starredVariables}
          toggleStarredVariable={toggleStarredVariable}
          constraints={constraints}
        />
      </div>
      <div style={{ margin: '5px 0 0 0' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '0.5em' }}>
          Summary marker (all filtered data)
        </div>
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
      <div style={{ maxWidth: '360px', marginTop: '1em' }}>
        <div
          style={{
            color: gray[900],
            fontWeight: 500,
            fontSize: '1.2em',
            marginBottom: '0.5em',
          }}
        >
          Marker X-axis controls
        </div>
        <RadioButtonGroup
          containerStyles={
            {
              // marginTop: 20,
            }
          }
          label="Binning method"
          selectedOption={configuration.binningMethod ?? 'equalInterval'}
          options={['equalInterval', 'quantile', 'standardDeviation']}
          optionLabels={['Equal interval', 'Quantile (10)', 'Std. dev.']}
          buttonColor={'primary'}
          // margins={['-1em', '0', '0', '0em']}
          onOptionSelected={handleBinningMethodSelection}
          disabledList={
            overlayConfiguration?.overlayType === 'continuous'
              ? []
              : ['equalInterval', 'quantile', 'standardDeviation']
          }
        />
      </div>
      <div style={{ maxWidth: '360px', marginTop: '1em', marginBottom: '1em' }}>
        <div
          style={{
            color: gray[900],
            fontWeight: 500,
            fontSize: '1.2em',
            marginBottom: '0.5em',
          }}
        >
          Marker Y-axis controls
        </div>
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
          // margins={['-1em', '0', '0', '1em']}
          onOptionSelected={handlePlotModeSelection}
        />
        <Toggle
          label="Log scale"
          themeRole="primary"
          value={configuration.dependentAxisLogScale}
          onChange={handleLogScaleChange}
        />
      </div>
      {overlayConfiguration?.overlayType === 'categorical' && (
        <div style={{ maxWidth: '360px', marginTop: '1em' }}>
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
        </div>
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
              height: '300px',
              maxWidth: '360px',
            }}
          />
        </div>
      )}
    </div>
  );
}
