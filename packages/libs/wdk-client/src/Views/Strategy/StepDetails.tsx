import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { requestQuestionWithParameters } from 'wdk-client/Actions/QuestionWithParametersActions';
import { RootState } from 'wdk-client/Core/State/Types';
import { QuestionWithParameters } from 'wdk-client/Utils/WdkModel';
import { UiStepTree } from 'wdk-client/Views/Strategy/Types';
import Loading from 'wdk-client/Components/Loading/Loading';

interface Props {
  stepTree: UiStepTree;
}

interface MappedProps {
  question?: QuestionWithParameters;
}

interface DispatchProps {
  requestQuestionWithParameters: (name: string) => void;
}

function StepDetails({ stepTree, question, requestQuestionWithParameters }: Props & MappedProps & DispatchProps) {
  const { step, recordClass } = stepTree;
  const [ weight, setWeight ] = useState(step.searchConfig.wdkWeight);

  useEffect(() => {
    requestQuestionWithParameters(step.searchName);
  }, [ step.searchName ]);

  if (question == null) return <Loading/>;

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
      <hr/>
      <div className="StepBoxes--StepDetailsResults">
        <strong>Results:</strong> {step.estimatedSize ? step.estimatedSize.toLocaleString() : '?'} {step.estimatedSize === 1 ? recordClass.displayName : recordClass.displayNamePlural}
      </div>
      <hr/>
        <form onSubmit={e => e.preventDefault()}>
          <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} />
          <div>
            Optionally give this search a 'weight' (for example 10, 200, -50). In a search strategy, unions and intersects will sum the weights, giving higher scores to items found in multiple searches.
          </div>
        </form>
    </React.Fragment>
  );
}

function mapStateToProps(state: RootState, props: Props): MappedProps {
  const question = state.questionsWithParameters[props.stepTree.step.searchName];
  return { question };
}

export default connect(mapStateToProps, { requestQuestionWithParameters })(StepDetails);