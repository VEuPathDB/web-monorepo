import { keys } from 'lodash';
import {
  InputVariables,
  Props as InputVariablesProps,
} from '../../../core/components/visualizations/InputVariables';
import { useInputStyles } from '../../../core/components/visualizations/inputStyles';
import { useFindEntityAndVariable } from '../../../core/hooks/workspace';
import { Variable, VariableTreeNode } from '../../../core/types/study';
import { VariableDescriptor } from '../../../core/types/variable';
import { VariablesByInputName } from '../../../core/utils/data-element-constraints';
import {
  EntityAndVariable,
  findEntityAndVariable,
} from '../../../core/utils/study-metadata';
import { SharedMarkerConfigurations } from './PieMarkerConfigurationMenu';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';
import SingleSelect from '@veupathdb/coreui/lib/components/inputs/SingleSelect';
import { ValuePicker } from '../../../core/components/visualizations/implementations/ValuePicker';
import HelpIcon from '@veupathdb/wdk-client/lib/Components/Icon/HelpIcon';
import { useEffect } from 'react';
import { BubbleOverlayConfig } from '../../../core';
import PluginError from '../../../core/components/visualizations/PluginError';
import {
  aggregationHelp,
  AggregationInputs,
} from '../../../core/components/visualizations/implementations/LineplotVisualization';

// // Display names to internal names
// const valueSpecLookup = {
//   'Arithmetic mean': 'mean',
//   Median: 'median',
//   // 'Geometric mean': 'geometricMean',
//   Proportion: 'proportion', // used to be 'Ratio or proportion' hence the lookup rather than simple lowercasing
// } as const;

type AggregatorOption = typeof aggregatorOptions[number];
const aggregatorOptions = ['mean', 'median'] as const;

interface MarkerConfiguration<T extends string> {
  type: T;
}

export interface BubbleMarkerConfiguration
  extends MarkerConfiguration<'bubble'>,
    SharedMarkerConfigurations {
  // valueSpecConfig: 'Arithmetic mean' | 'Median' | 'Proportion';
  aggregator?: AggregatorOption;
  numeratorValues?: string[];
  denominatorValues?: string[];
  // selectedVariable: VariableDescriptor;
  // selectedValues: string[] | undefined;
}
interface Props
  extends Omit<
    InputVariablesProps,
    'onChange' | 'selectedVariables' | 'selectedPlotMode' | 'onPlotSelected'
  > {
  onChange: (configuration: BubbleMarkerConfiguration) => void;
  configuration: BubbleMarkerConfiguration;
  overlayConfiguration: BubbleOverlayConfig | undefined;
}

// Currently identical to pie marker configuration menu
export function BubbleMarkerConfigurationMenu({
  entities,
  configuration,
  overlayConfiguration,
  onChange,
  starredVariables,
  toggleStarredVariable,
  constraints,
}: Props) {
  // const getValueSpec = (
  //   variable?: VariableTreeNode
  // ): keyof typeof valueSpecLookup => {
  //   return isSuitableCategoricalVariable(variable)
  //     ? 'Proportion'
  //     : configuration.valueSpecConfig === 'Proportion'
  //     ? 'Arithmetic mean'
  //     : configuration.valueSpecConfig;
  // };

  function handleInputVariablesOnChange(selection: VariablesByInputName) {
    if (!selection.overlayVariable) {
      console.error(
        `Expected overlayVariable to be defined but got ${typeof selection.overlayVariable}`
      );
      return;
    }

    // const selectedVariable = findEntityAndVariable(
    //   entities,
    //   selection.overlayVariable
    // )?.variable;

    // const valueSpec = getValueSpec(selectedVariable);

    onChange({
      ...configuration,
      selectedVariable: selection.overlayVariable,
      numeratorValues: undefined,
      denominatorValues: undefined,
      // selectedValues: undefined,
      // valueSpecConfig: valueSpec,
    });
  }

  const selectedVariable = findEntityAndVariable(
    entities,
    configuration.selectedVariable
  )?.variable;

  // useEffect(() => {
  //   // The first time the component is rendered, check that the valueSpec is
  //   // correct for the given variable. If not, update it.
  //   const valueSpec = getValueSpec(selectedVariable);

  //   if (configuration.valueSpecConfig !== valueSpec) {
  //     onChange({
  //       ...configuration,
  //       valueSpecConfig: valueSpec,
  //     });
  //   }
  // }, []);

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

  const classes = useInputStyles();
  const proportionIsValid = validateProportionValues(
    numeratorValues,
    denominatorValues
  );

  // const aggregationInputs = (
  //   <div style={{ display: 'flex', flexDirection: 'column' }}>
  //     {!categoricalMode ? (
  //       <div
  //         style={{
  //           display: 'flex',
  //           alignItems: 'center',
  //         }}
  //       >
  //         <Tooltip title={'Required parameter'}>
  //           <div className={classes.label}>
  //             Function<sup>*</sup>
  //           </div>
  //         </Tooltip>
  //         <SingleSelect
  //           onSelect={(value) =>
  //             onChange({
  //               ...configuration,
  //               aggregator: value,
  //             })
  //           }
  //           value={aggregator}
  //           buttonDisplayContent={aggregator}
  //           items={aggregatorOptions.map((option) => ({
  //             value: option,
  //             display: option,
  //           }))}
  //         />
  //       </div>
  //     ) : (
  //       <div style={{ position: 'relative' }}>
  //         <div
  //           style={{
  //             display: 'grid',
  //             gridTemplateColumns: 'repeat(2, auto)',
  //             gridTemplateRows: 'repeat(3, auto)',
  //           }}
  //         >
  //           <Tooltip title={'Required parameter'}>
  //             <div
  //               className={classes.label}
  //               style={{
  //                 gridColumn: 1,
  //                 gridRow: 2,
  //                 // color:
  //                 //   configuration.numeratorValues?.length &&
  //                 //   configuration.denominatorValues?.length
  //                 //     ? undefined
  //                 //     : requiredInputLabelStyle.color,
  //               }}
  //             >
  //               Proportion<sup>*</sup>&nbsp;=
  //             </div>
  //           </Tooltip>
  //           <div
  //             className={classes.input}
  //             style={{
  //               gridColumn: 2,
  //               gridRow: 1,
  //               marginBottom: 0,
  //               justifyContent: 'center',
  //             }}
  //           >
  //             <ValuePicker
  //               allowedValues={vocabulary}
  //               selectedValues={numeratorValues}
  //               onSelectedValuesChange={(value) =>
  //                 onChange({
  //                   ...configuration,
  //                   numeratorValues: value,
  //                 })
  //               }
  //             />
  //           </div>
  //           <div style={{ gridColumn: 2, gridRow: 2, marginRight: '2em' }}>
  //             <hr style={{ marginTop: '0.6em' }} />
  //           </div>
  //           <div
  //             className={classes.input}
  //             style={{ gridColumn: 2, gridRow: 3, justifyContent: 'center' }}
  //           >
  //             <ValuePicker
  //               allowedValues={vocabulary}
  //               selectedValues={denominatorValues}
  //               onSelectedValuesChange={(value) =>
  //                 onChange({
  //                   ...configuration,
  //                   denominatorValues: value,
  //                 })
  //               }
  //             />
  //           </div>
  //         </div>
  //         {!proportionIsValid && (
  //           <div style={{ position: 'absolute', width: '100%' }}>
  //             <PluginError error="To calculate a proportion, all selected numerator values must also be present in the denominator" />
  //           </div>
  //         )}
  //       </div>
  //     )}
  //   </div>
  // );

  // need to reintroduce proportion validation
  const aggregationInputs = (
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
          { name: 'overlayVariable', label: 'Variable', titleOverride: ' ' },
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

// We currently call this function twice per value change. If the number of values becomes vary large, we may want to optimize this?
export const validateProportionValues = (
  numeratorValues: string[] | undefined,
  denominatorValues: string[] | undefined
) =>
  numeratorValues === undefined ||
  denominatorValues === undefined ||
  numeratorValues.every((value) => denominatorValues.includes(value));
