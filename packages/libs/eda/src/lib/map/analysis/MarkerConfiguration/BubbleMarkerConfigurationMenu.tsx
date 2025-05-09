import {
  InputVariables,
  Props as InputVariablesProps,
} from '../../../core/components/visualizations/InputVariables';
import { VariableTreeNode } from '../../../core/types/study';
import { VariablesByInputName } from '../../../core/utils/data-element-constraints';
import { findEntityAndVariable } from '../../../core/utils/study-metadata';
import HelpIcon from '@veupathdb/wdk-client/lib/Components/Icon/HelpIcon';
import { BubbleOverlayConfig } from '../../../core';
import PluginError from '../../../core/components/visualizations/PluginError';
import {
  aggregationHelp,
  AggregationInputs,
} from '../../../core/components/visualizations/implementations/LineplotVisualization';
import { DataElementConstraint } from '../../../core/types/visualization'; // TO DO for dates: remove
import { SharedMarkerConfigurations } from '../mapTypes/shared';
import { invalidProportionText } from '../utils/defaultOverlayConfig';
import { BubbleLegendPositionConfig, PanelConfig } from '../appState';
import { GeoConfig } from '../../../core/types/geoConfig';
import { findLeastAncestralGeoConfig } from '../../../core/utils/geoVariables';

type AggregatorOption = typeof aggregatorOptions[number];
const aggregatorOptions = ['mean', 'median'] as const;

interface MarkerConfiguration<T extends string> {
  type: T;
}

export interface BubbleMarkerConfiguration
  extends MarkerConfiguration<'bubble'>,
    SharedMarkerConfigurations {
  aggregator?: AggregatorOption;
  numeratorValues?: string[];
  denominatorValues?: string[];
  legendPanelConfig: BubbleLegendPositionConfig;
  visualizationPanelConfig: PanelConfig;
}

interface Props
  extends Omit<
    InputVariablesProps,
    | 'inputs'
    | 'onChange'
    | 'selectedVariables'
    | 'selectedPlotMode'
    | 'onPlotSelected'
  > {
  onChange: (configuration: BubbleMarkerConfiguration) => void;
  configuration: BubbleMarkerConfiguration;
  overlayConfiguration: BubbleOverlayConfig | undefined;
  isValidProportion: boolean | undefined; // undefined when not categorical mode
  geoConfigs: GeoConfig[];
}

export function BubbleMarkerConfigurationMenu({
  entities,
  configuration,
  overlayConfiguration,
  onChange,
  starredVariables,
  toggleStarredVariable,
  constraints,
  isValidProportion,
  geoConfigs,
}: Props) {
  function handleInputVariablesOnChange(selection: VariablesByInputName) {
    if (!selection.overlayVariable) {
      console.error(
        `Expected overlayVariable to be defined but got ${typeof selection.overlayVariable}`
      );
      return;
    }

    const geoConfig = findLeastAncestralGeoConfig(
      geoConfigs,
      selection.overlayVariable.entityId
    );

    onChange({
      ...configuration,
      selectedVariable: selection.overlayVariable,
      numeratorValues: undefined,
      denominatorValues: undefined,
      geoEntityId: geoConfig.entity.id,
    });
  }

  const selectedVariable = findEntityAndVariable(
    entities,
    configuration.selectedVariable
  )?.variable;

  const categoricalMode = isSuitableCategoricalVariable(selectedVariable);

  const aggregationConfig = overlayConfiguration?.aggregationConfig;
  const numeratorValues =
    aggregationConfig && 'numeratorValues' in aggregationConfig
      ? aggregationConfig.numeratorValues
      : undefined;
  const denominatorValues =
    aggregationConfig && 'denominatorValues' in aggregationConfig
      ? aggregationConfig.denominatorValues
      : undefined;
  const aggregator =
    aggregationConfig && 'aggregator' in aggregationConfig
      ? aggregationConfig.aggregator
      : undefined;
  const vocabulary =
    selectedVariable && 'vocabulary' in selectedVariable
      ? selectedVariable.vocabulary
      : undefined;
  // if the vocabulary has been altered by filters on this variable
  // the fullVocabulary will be available here, otherwise it's undefined
  const fullVocabulary =
    selectedVariable && 'fullVocabulary' in selectedVariable
      ? selectedVariable.fullVocabulary
      : undefined;

  const aggregationInputs = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <AggregationInputs
        {...(!categoricalMode
          ? {
              aggregationType: 'function',
              // Superfluous array destructuring is to appease TS
              options: [...aggregatorOptions],
              aggregationFunction: aggregator ?? 'mean',
              onFunctionChange: (value: AggregatorOption) =>
                onChange({
                  ...configuration,
                  aggregator: value,
                }),
            }
          : {
              aggregationType: 'proportion',
              options: fullVocabulary ?? vocabulary ?? [],
              disabledOptions: fullVocabulary
                ? fullVocabulary.filter((value) => !vocabulary?.includes(value))
                : [],
              numeratorValues: numeratorValues ?? [],
              onNumeratorChange: (values) =>
                onChange({
                  ...configuration,
                  numeratorValues: values.filter((value) =>
                    vocabulary?.includes(value)
                  ),
                }),
              denominatorValues: denominatorValues ?? [],
              onDenominatorChange: (values) =>
                onChange({
                  ...configuration,
                  denominatorValues: values.filter((value) =>
                    vocabulary?.includes(value)
                  ),
                }),
            })}
      />
      {isValidProportion === false && (
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', width: '100%' }}>
            <PluginError error={invalidProportionText} />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
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
        inputs={[
          {
            name: 'overlayVariable',
            label: 'Variable',
            titleOverride: ' ',
            isNonNullable: true,
          },
        ]}
        customSections={[
          {
            title: (
              <>
                <span style={{ marginRight: '0.5em' }}>
                  {selectedVariable
                    ? categoricalMode
                      ? 'Proportion (categorical variable)'
                      : 'Aggregation (continuous variable)'
                    : ''}
                </span>
                <HelpIcon children={aggregationHelp} />
              </>
            ),
            order: 75,
            content: selectedVariable ? (
              aggregationInputs
            ) : (
              <span style={{ color: '#969696', fontWeight: 500 }}>
                First choose a Y-axis variable.
              </span>
            ),
          },
        ]}
        entities={entities}
        selectedVariables={{ overlayVariable: configuration.selectedVariable }}
        onChange={handleInputVariablesOnChange}
        starredVariables={starredVariables}
        toggleStarredVariable={toggleStarredVariable}
        constraints={constraints}
        flexDirection="column"
      />
    </div>
  );
}

/**
 * determine if we are dealing with a categorical variable
 */
function isSuitableCategoricalVariable(variable?: VariableTreeNode): boolean {
  return (
    variable != null &&
    'dataShape' in variable &&
    variable.dataShape !== 'continuous' &&
    variable.vocabulary != null &&
    variable.distinctValuesCount != null
  );
}
