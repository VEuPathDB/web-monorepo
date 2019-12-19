import { toNumber, toString, memoize, zip } from 'lodash';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { requestQuestionWithParameters } from 'wdk-client/Actions/QuestionWithParametersActions';
import { requestUpdateStepSearchConfig } from 'wdk-client/Actions/StrategyActions';
import { CollapsibleSection, IconAlt } from 'wdk-client/Components';
import { getFilterValueDisplay } from 'wdk-client/Components/AttributeFilter/AttributeFilterUtils';
import { FilterWithFieldDisplayName } from 'wdk-client/Components/AttributeFilter/Types';
import { RootState } from 'wdk-client/Core/State/Types';
import { useWdkEffect } from 'wdk-client/Service/WdkService';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { preorderSeq } from 'wdk-client/Utils/TreeUtils';
import { QuestionWithParameters, Parameter, EnumParam, DatasetParam } from 'wdk-client/Utils/WdkModel';
import { isEnumParam, isMultiPick, toMultiValueArray } from 'wdk-client/Views/Question/Params/EnumParamUtils';
import { datasetItemToString, DatasetItem } from 'wdk-client/Views/Question/Params/DatasetParamUtils';
import { StepBoxProps, StepDetailProps, UiStepTree } from 'wdk-client/Views/Strategy/Types';

import './StepDetails.scss';

const cx = makeClassNameHelper('StepDetails');

interface MappedProps {
  question?: QuestionWithParameters;
}

interface DispatchProps {
  requestQuestionWithParameters: (name: string) => void;
  assignWeight: (weight: number) => void;
}

function StepDetails({ stepTree, question, assignWeight, requestQuestionWithParameters }: StepDetailProps<UiStepTree> & DispatchProps & MappedProps) {
  const { step } = stepTree;
  const [ weightCollapsed, setWeightCollapsed ] = useState(true);
  const [ datasetParamItems, setDatasetParamItems ] = useState<Record<string, DatasetItem[]> | undefined>(undefined);

  useEffect(() => {
    setDatasetParamItems(undefined);
    requestQuestionWithParameters(step.searchName);
  }, [ step.searchName ]);

  useWdkEffect(wdkService => {
    (async () => {
      if (question) {
        const nonemptyDatasetParams = question.parameters
          .filter(
            ({ name, type }) => (
              type === 'input-dataset' && step.searchConfig.parameters[name]
            )
          );

        const datasetParamItemArrays = await Promise.all(
          nonemptyDatasetParams.map(
            ({ name }) => wdkService.getDataset(+step.searchConfig.parameters[name])
          )
        );

        const paramsWithItemValues = zip(nonemptyDatasetParams, datasetParamItemArrays);

        setDatasetParamItems(paramsWithItemValues.reduce(
          (memo, [ param, itemArray ]) => ({
            ...memo,
            [(param as Parameter).name]: itemArray as DatasetItem[]
          }),
          {} as Record<number, DatasetItem[]>
        ));
      }
    })();
  }, [ question ]);

  const weight = toString(step.searchConfig.wdkWeight);

  return (
    <React.Fragment>
      <table className={cx('Table')}>
        <tbody>
          {question && question.parameters
            .filter(parameter => parameter.isVisible)
            .map(parameter =>(
              <tr key={parameter.name}>
                <th>
                  {parameter.displayName}
                </th>
                <td>
                  {formatParameterValue(parameter, step.searchConfig.parameters[parameter.name], datasetParamItems) || <em>No value</em>}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <form onSubmit={e => {
        e.preventDefault();
        const weightInput = e.currentTarget.elements.namedItem('weight');
        if (weightInput == null || !(weightInput instanceof HTMLInputElement)) {
          throw new Error("Could not find the weight input.");
        }
        const wdkWeight = toNumber(weightInput.value);
        assignWeight(wdkWeight);
      }}>
        <CollapsibleSection
          className="StepBoxes--StepDetailsWeight"
          headerContent="Give this search a weight"
          isCollapsed={weightCollapsed}
          onCollapsedChange={setWeightCollapsed}
        >
          <div>
            Optionally give this search a 'weight' (for example 10, 200, -50). In a search strategy, unions and intersects will sum the weights, giving higher scores to items found in multiple searches.
          </div>
          <div><input name="weight" key={weight} type="number" defaultValue={weight} /></div>
          <div><button className="btn" type="submit">Assign weight</button></div>
        </CollapsibleSection>
      </form>
    </React.Fragment>
  );
}

function formatParameterValue(
  parameter: Parameter,
  value: string | undefined,
  datasetParamItems: Record<string, DatasetItem[]> | undefined
) {
  if (
    !value ||
    parameter.type === 'string' ||
    parameter.type === 'number' ||
    parameter.type === 'date' ||
    parameter.type === 'timestamp' ||
    parameter.type === 'input-step'
  ) {
    return value;
  } else if (parameter.type === 'date-range' || parameter.type === 'number-range') {
    return formatRangeParameterValue(value);
  } else if (isEnumParam(parameter)) {
    return formatEnumParameterValue(parameter, value);
  } else if (parameter.type === 'filter') {
    return formatFilterValue(value);
  } else {
    return formatDatasetValue(parameter, datasetParamItems);
  }
}

function formatRangeParameterValue(value: string) {
  try {
    const { min, max } = JSON.parse(value);

    return min !== undefined && max !== undefined
      ? `min:${min},max:${max}`
      : value;
  } catch {
    return value;
  }
}

function formatEnumParameterValue(parameter: EnumParam, value: string) {
  const valueSet = new Set(isMultiPick(parameter) ? toMultiValueArray(value) : [ value ]);
  const termDisplayPairs = makeTermDisplayPairs(parameter.vocabulary);

  return termDisplayPairs
    .filter(([term]) => valueSet.has(term))
    .map(([, display]) => display)
    .join(', ');
}

const makeTermDisplayPairs = memoize((vocabulary: EnumParam['vocabulary']): [string, string, null][] =>
  Array.isArray(vocabulary)
    ? vocabulary
    : preorderSeq(vocabulary)
        .filter(node => node.children.length === 0)
        .map((node): [ string, string, null ] => [ node.data.term, node.data.display, null ])
        .toArray()
);

function formatFilterValue(value: string) {
  try {
    const { filters } = JSON.parse(value) as { filters: FilterWithFieldDisplayName[] };

    return filters.flatMap((filter, i, coll) =>
      <React.Fragment key={filter.field}>
        {filter.fieldDisplayName || filter.field}: {getFilterValueDisplay(filter)}
        {i < coll.length - 1 ? <><br /><br /></> : null}
      </React.Fragment>
    );
  } catch {
    return value;
  }
}

function formatDatasetValue(
  parameter: DatasetParam,
  datasetParamItems: Record<string, DatasetItem[]> | undefined
) {
  return !datasetParamItems
    ? <IconAlt fa="circle-o-notch" className="fa-spin fa-fw" />
    : datasetParamItems[parameter.name]
        .map(datasetItemToString)
        .join(', ');
}

function mapStateToProps(state: RootState, props: StepBoxProps): MappedProps {
  const question = state.questionsWithParameters[props.stepTree.step.searchName];
  return { question };
}

function mapDispatchToProps(dispatch: Dispatch, props: StepBoxProps): DispatchProps {
  const { step } = props.stepTree;
  return bindActionCreators({
    requestQuestionWithParameters,
    assignWeight: (wdkWeight: number) => requestUpdateStepSearchConfig(
      step.strategyId,
      step.id,
      {
        ...step.searchConfig,
        wdkWeight
      }
    )
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(StepDetails);
