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

// // Display names to internal names
// const valueSpecLookup = {
//   'Arithmetic mean': 'mean',
//   Median: 'median',
//   // 'Geometric mean': 'geometricMean',
//   Proportion: 'proportion', // used to be 'Ratio or proportion' hence the lookup rather than simple lowercasing
// } as const;

const aggregatorOptions = ['mean', 'median'] as const;

interface MarkerConfiguration<T extends string> {
  type: T;
}

export interface BubbleMarkerConfiguration
  extends MarkerConfiguration<'bubble'>,
    SharedMarkerConfigurations {
  // valueSpecConfig: 'Arithmetic mean' | 'Median' | 'Proportion';
  aggregator?: typeof aggregatorOptions[number];
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
  // overlayConfiguration: BubbleOverlayConfig | undefined;
}

// Currently identical to pie marker configuration menu
export function BubbleMarkerConfigurationMenu({
  entities,
  configuration,
  // overlayConfiguration,
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
  const classes = useInputStyles();

  if (
    categoricalMode &&
    configuration.numeratorValues !== undefined &&
    configuration.denominatorValues !== undefined
  ) {
    if (
      !configuration.numeratorValues.every((value) =>
        configuration.denominatorValues?.includes(value)
      )
    )
      throw new Error(
        'To calculate a proportion, all selected numerator values must also be present in the denominator'
      );
  }

  const aggregationInputs = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {!categoricalMode ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Tooltip title={'Required parameter'}>
            <div className={classes.label}>
              Function<sup>*</sup>
            </div>
          </Tooltip>
          <SingleSelect
            onSelect={(value) =>
              onChange({
                ...configuration,
                aggregator: value,
              })
            }
            value={configuration.aggregator}
            buttonDisplayContent={configuration.aggregator}
            items={aggregatorOptions.map((option) => ({
              value: option,
              display: option,
            }))}
          />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, auto)',
            gridTemplateRows: 'repeat(3, auto)',
          }}
        >
          <Tooltip title={'Required parameter'}>
            <div
              className={classes.label}
              style={{
                gridColumn: 1,
                gridRow: 2,
                // color:
                //   configuration.numeratorValues?.length &&
                //   configuration.denominatorValues?.length
                //     ? undefined
                //     : requiredInputLabelStyle.color,
              }}
            >
              Proportion<sup>*</sup>&nbsp;=
            </div>
          </Tooltip>
          <div
            className={classes.input}
            style={{
              gridColumn: 2,
              gridRow: 1,
              marginBottom: 0,
              justifyContent: 'center',
            }}
          >
            <ValuePicker
              allowedValues={
                selectedVariable && 'vocabulary' in selectedVariable
                  ? selectedVariable.vocabulary
                  : undefined
              }
              selectedValues={configuration.numeratorValues}
              onSelectedValuesChange={(value) =>
                onChange({
                  ...configuration,
                  numeratorValues: value,
                })
              }
            />
          </div>
          <div style={{ gridColumn: 2, gridRow: 2, marginRight: '2em' }}>
            <hr style={{ marginTop: '0.6em' }} />
          </div>
          <div
            className={classes.input}
            style={{ gridColumn: 2, gridRow: 3, justifyContent: 'center' }}
          >
            <ValuePicker
              allowedValues={
                selectedVariable && 'vocabulary' in selectedVariable
                  ? selectedVariable.vocabulary
                  : undefined
              }
              selectedValues={configuration.denominatorValues}
              onSelectedValuesChange={(value) =>
                onChange({
                  ...configuration,
                  denominatorValues: value,
                })
              }
            />
          </div>
        </div>
      )}
    </div>
  );

  const aggregationHelp = (
    <div>
      <p>
        “Mean” and “Median” are y-axis aggregation functions that can only be
        used when continuous variables{' '}
        <i className="fa fa-bar-chart-o  wdk-Icon"> </i> are selected for the
        y-axis.
      </p>
      <ul>
        <li>
          Mean = Sum of values for all data points / Number of all data points
        </li>
        <li>
          Median = The middle number in a sorted list of numbers. The median is
          a better measure of central tendency than the mean when data are not
          normally distributed.
        </li>
      </ul>
      <p>
        “Proportion” is the only y-axis aggregation function that can be used
        when categorical variables <i className="fa fa-list  wdk-Icon"> </i> are
        selected for the y-axis.
      </p>
      <ul>
        <li>Proportion = Numerator count / Denominator count</li>
      </ul>
      <p>
        The y-axis variable's values that count towards numerator and
        denominator must be selected in the two drop-downs.
      </p>
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
          { name: 'overlayVariable', label: 'Variable', titleOverride: ' ' },
        ]}
        customSections={[
          {
            title: (
              <>
                <span style={{ marginRight: '0.5em' }}>
                  Y-axis aggregation{' '}
                  {selectedVariable
                    ? categoricalMode
                      ? '(categorical Y)'
                      : '(continuous Y)'
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
