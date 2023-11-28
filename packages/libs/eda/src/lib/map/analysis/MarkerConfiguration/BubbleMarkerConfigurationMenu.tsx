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
import {
  invalidProportionText,
  validateProportionValues,
} from '../utils/defaultOverlayConfig';

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
    denominatorValues,
    vocabulary
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
      {!proportionIsValid && (
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
        constraints={
          // TEMPORARILY disable date vars; TO DO for dates - remove!
          constraints?.map((constraint) => {
            return Object.fromEntries(
              Object.keys(constraint).map((key) => [
                key,
                {
                  ...constraint[key],
                  allowedTypes: constraint[key]?.allowedTypes?.filter(
                    (t) => t !== 'date'
                  ) ?? ['string', 'number', 'integer'],
                } as DataElementConstraint, // assertion seems required due to spread operator
              ])
            );
          })
        }
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
