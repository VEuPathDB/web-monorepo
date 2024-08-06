import { useCallback } from 'react';
import {
  InputVariables,
  Props as InputVariablesProps,
} from '../../../core/components/visualizations/InputVariables';
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
import { ContinuousMarkerPreview } from './ContinuousMarkerPreview';
import Barplot from '@veupathdb/components/lib/plots/Barplot';
import { SubsettingClient } from '../../../core/api';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import { useUncontrolledSelections } from '../hooks/uncontrolledSelections';
import {
  BinningMethod,
  PanelConfig,
  PanelPositionConfig,
  SelectedCountsOption,
  SelectedValues,
} from '../appState';
import { SharedMarkerConfigurations } from '../mapTypes/shared';
import { GeoConfig } from '../../../core/types/geoConfig';
import { findLeastAncestralGeoConfig } from '../../../core/utils/geoVariables';

interface MarkerConfiguration<T extends string> {
  type: T;
}

export interface PieMarkerConfiguration
  extends MarkerConfiguration<'pie'>,
    SharedMarkerConfigurations {
  binningMethod: BinningMethod;
  selectedValues: SelectedValues;
  selectedCountsOption: SelectedCountsOption;
  legendPanelConfig: PanelPositionConfig;
  visualizationPanelConfig: PanelConfig;
}

interface Props
  extends Omit<
    InputVariablesProps,
    'onChange' | 'selectedVariables' | 'selectedPlotMode' | 'onPlotSelected'
  > {
  onChange: (configuration: PieMarkerConfiguration) => void;
  configuration: PieMarkerConfiguration;
  overlayConfiguration: OverlayConfig | undefined;
  overlayVariable: Variable | undefined;
  subsettingClient: SubsettingClient;
  studyId: string;
  filters: Filter[] | undefined;
  /**
   * Always used for categorical marker preview. Also used in categorical table if selectedCountsOption is 'filtered'
   */
  allFilteredCategoricalValues: AllValuesDefinition[] | undefined;
  /**
   * Only defined and used in categorical table if selectedCountsOption is 'visible'
   */
  allVisibleCategoricalValues: AllValuesDefinition[] | undefined;
  geoConfigs: GeoConfig[];
}

// TODO: generalize this and BarPlotMarkerConfigMenu into MarkerConfigurationMenu. Lots of code repetition...

export function PieMarkerConfigurationMenu({
  entities,
  configuration,
  onChange,
  starredVariables,
  toggleStarredVariable,
  constraints,
  overlayConfiguration,
  overlayVariable,
  subsettingClient,
  studyId,
  filters,
  allFilteredCategoricalValues,
  allVisibleCategoricalValues,
  geoConfigs,
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
        `Expected overlayVariable to be defined but got ${typeof selection.overlayVariable}`
      );
      return;
    }

    // With each variable change we set the geo entity for the user to the least ancestral
    // entity on the path from root to the chosen variable.
    // However, we could make this choosable via the UI in the future.
    // (That's one reason why we're storing it in appState.)
    const geoConfig = findLeastAncestralGeoConfig(
      geoConfigs,
      selection.overlayVariable.entityId
    );

    onChange({
      ...configuration,
      selectedVariable: selection.overlayVariable,
      selectedValues: undefined,
      geoEntityId: geoConfig.entity.id,
    });
  }

  function handleBinningMethodSelection(option: string) {
    onChange({
      ...configuration,
      binningMethod: option as PieMarkerConfiguration['binningMethod'],
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
          <CategoricalMarkerPreview
            overlayConfiguration={overlayConfiguration}
            allFilteredCategoricalValues={allFilteredCategoricalValues}
            mapType="pie"
            numberSelected={uncontrolledSelections.size}
          />
        ) : (
          <ContinuousMarkerPreview
            configuration={configuration}
            mapType="pie"
            studyId={studyId}
            filters={filters}
            studyEntities={entities}
            geoConfigs={geoConfigs}
          />
        )}
      </div>
      {overlayConfiguration?.overlayType === 'continuous' && (
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
          // margins={['0em', '0', '0', '1em']}
          onOptionSelected={handleBinningMethodSelection}
          disabledList={
            overlayConfiguration?.overlayType === 'continuous'
              ? []
              : ['equalInterval', 'quantile', 'standardDeviation']
          }
        />
      )}
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
              // set barplot maxWidth
              height: '300px',
              maxWidth: '360px',
            }}
          />
        </div>
      )}
    </div>
  );
}
