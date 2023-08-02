import {
  InputVariables,
  Props as InputVariablesProps,
} from '../../../core/components/visualizations/InputVariables';
import { VariableTreeNode } from '../../../core/types/study';
import { VariablesByInputName } from '../../../core/utils/data-element-constraints';
import { findEntityAndVariable } from '../../../core/utils/study-metadata';
import { SharedMarkerConfigurations } from './PieMarkerConfigurationMenu';
import HelpIcon from '@veupathdb/wdk-client/lib/Components/Icon/HelpIcon';
import { BubbleOverlayConfig } from '../../../core';
import PluginError from '../../../core/components/visualizations/PluginError';
import {
  aggregationHelp,
  AggregationInputs,
} from '../../../core/components/visualizations/implementations/LineplotVisualization';

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
}

export function BubbleMarkerConfigurationMenu({
  entities,
  configuration,
  overlayConfiguration,
  onChange,
  starredVariables,
  toggleStarredVariable,
  constraints,
}: Props) {
  function handleInputVariablesOnChange(selection: VariablesByInputName) {
    if (!selection.overlayVariable) {
      console.error(
        `Expected overlayVariable to be defined but got ${typeof selection.overlayVariable}`
      );
      return;
    }

    onChange({
      ...configuration,
      selectedVariable: selection.overlayVariable,
      numeratorValues: undefined,
      denominatorValues: undefined,
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

  const proportionIsValid = validateProportionValues(
    numeratorValues,
    denominatorValues
  );

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
              options: vocabulary ?? [],
              numeratorValues: numeratorValues ?? [],
              onNumeratorChange: (value) =>
                onChange({
                  ...configuration,
                  numeratorValues: value,
                }),
              denominatorValues: denominatorValues ?? [],
              onDenominatorChange: (value) =>
                onChange({
                  ...configuration,
                  denominatorValues: value,
                }),
            })}
      />
      {!proportionIsValid && (
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', width: '100%' }}>
            <PluginError error="To calculate a proportion, all selected numerator values must also be present in the denominator" />
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
                      ? 'Aggregation (categorical variable)'
                      : 'Proportion (continuous variable)'
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

// We currently call this function twice per value change.
// If the number of values becomes vary large, we may want to optimize this?
// Maybe O(n^2) isn't that bad though.
export const validateProportionValues = (
  numeratorValues: string[] | undefined,
  denominatorValues: string[] | undefined
) =>
  numeratorValues === undefined ||
  denominatorValues === undefined ||
  numeratorValues.every((value) => denominatorValues.includes(value));
