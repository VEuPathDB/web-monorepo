import { toNumber, toString } from 'lodash';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { requestQuestionWithParameters } from 'wdk-client/Actions/QuestionWithParametersActions';
import { requestUpdateStepSearchConfig } from 'wdk-client/Actions/StrategyActions';
import { CollapsibleSection } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import { QuestionWithParameters } from 'wdk-client/Utils/WdkModel';
import { StepBoxProps, StepDetailProps, UiStepTree } from 'wdk-client/Views/Strategy/Types';

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

  useEffect(() => {
    requestQuestionWithParameters(step.searchName);
  }, [ step.searchName ]);

  const weight = toString(step.searchConfig.wdkWeight);

  return (
    
    <React.Fragment>
      <table>
        <tbody>
          {question && question.parameters
            .filter(parameter => parameter.isVisible)
            .map(parameter =>(
              <tr key={parameter.name}>
                <th>
                  {parameter.displayName}
                </th>
                <td>
                  {step.searchConfig.parameters[parameter.name] || <em>No value</em>}
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
