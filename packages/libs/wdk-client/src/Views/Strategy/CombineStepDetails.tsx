import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { requestUpdateStepSearchConfig, requestReplaceStep } from 'wdk-client/Actions/StrategyActions';
import { RootState } from 'wdk-client/Core/State/Types';
import { StepDetailProps } from 'wdk-client/Views/Strategy/Types';
import { useReviseOperatorConfigs, useCompatibleOperatorMetadata } from 'wdk-client/Utils/Operations';
import { Question } from 'wdk-client/Utils/WdkModel';
import Loading from 'wdk-client/Components/Loading';
import { StrategyEntry } from 'wdk-client/StoreModules/StrategyStoreModule';
import { replaceStep } from 'wdk-client/Utils/StrategyUtils';

export interface ReviseOperatorMenuItem {
  display: React.ReactNode;
  value: string;
  iconClassName: string;
}

interface StateProps {
  questions?: Question[]
}

interface DispatchProps {
  dispatch: Dispatch; 
}

type OwnProps = StepDetailProps;

function CombineStepDetails({ questions, stepTree, dispatch, onClose }: OwnProps & StateProps & DispatchProps) {
  const { step } = stepTree;

  const primaryInputRecordClass = stepTree.primaryInput!.recordClass.urlSegment;
  const secondaryInputRecordClass = stepTree.secondaryInput!.recordClass.urlSegment;

  const compatibleOperatorMetadata = useCompatibleOperatorMetadata(
    questions,
    step.recordClassName,
    primaryInputRecordClass, 
    secondaryInputRecordClass
  );

  const reviseOperatorConfigs = useReviseOperatorConfigs(
    questions,
    step.recordClassName,
    primaryInputRecordClass,
    secondaryInputRecordClass
  );

  const currentOperatorMetadata = compatibleOperatorMetadata && Object.values(compatibleOperatorMetadata).find(
    ({ searchName }) => searchName === step.searchName
  );

  const currentOperatorParamName = currentOperatorMetadata && currentOperatorMetadata.paramName;
  const currentOperatorSearchName = currentOperatorMetadata && currentOperatorMetadata.searchName;
  const currentOperatorValue = currentOperatorParamName && step.searchConfig.parameters[currentOperatorParamName];
  
  return (
    !questions ||
    !compatibleOperatorMetadata || 
    !reviseOperatorConfigs ||
    !currentOperatorMetadata ||
    !currentOperatorParamName ||
    !currentOperatorSearchName ||
    !currentOperatorValue
  )
    ? <Loading />
    : (
      <form onSubmit={e => {
        e.preventDefault();
        const operatorInput = e.currentTarget.elements.namedItem('revise-operator');
        onClose();
        dispatch((service) => {
          // Do this check inside of dispatch callback so that error is captured for reporting
          if (operatorInput == null || !(operatorInput instanceof RadioNodeList)) {
            throw new Error('Could not find "revise-operator" input.');
          }
          const newOperatorValue = operatorInput.value;
          const {
            searchName: newOperatorSearchName,
            needsParameterConfiguration: newOperatorNeedsParameterConfiguration,
            paramName: newOperatorParamName
          } = compatibleOperatorMetadata[newOperatorValue];

          if (!newOperatorNeedsParameterConfiguration) {
            if (currentOperatorSearchName === newOperatorSearchName) {
              return requestUpdateStepSearchConfig(step.strategyId, step.id, {
                ...step.searchConfig,
                parameters: {
                  ...step.searchConfig.parameters,
                  [newOperatorParamName]: newOperatorValue
                }
              });
            } else {
              const newOperatorQuestion = questions.find(({ urlSegment }) => urlSegment === newOperatorSearchName);

              if (!newOperatorQuestion) {
                throw new Error(`Could not find "${newOperatorSearchName}" question.`);
              }

              // FIXME This is coupled to the order in which the answer parameters appear in the parameter list
              const answerParamValues = newOperatorQuestion.paramNames
                .slice(0, 2)
                .reduce(
                  (memo, answerParamName) => ({
                    ...memo,
                    [answerParamName]: ''
                  }), 
                  {} as Record<string, string>
                );

              return requestReplaceStep(
                step.strategyId,
                step.id,
                {
                  searchName: newOperatorSearchName,
                  searchConfig: {
                    ...step.searchConfig,
                    parameters: {
                      ...answerParamValues,
                      [newOperatorParamName]: newOperatorValue
                    }
                  },
                  customName: newOperatorQuestion.displayName
                },
              );
            }
          } else {
            alert('Under construction');

            return [

            ];
          }
        })
      }}>
        <div className="CombineStepDetails">
          {
            reviseOperatorConfigs.map(config =>
              <React.Fragment key={config.name}>
                <div className="CombineStepDetailsTitle">{config.display}</div>
                <Operators currentValue={currentOperatorValue} operators={config.items}/>
                <hr />
              </React.Fragment>
            )
          }
          <button className="btn" type="submit">Revise</button>
        </div>
      </form>
    );
}

export default connect(
  (state: RootState, ownProps: OwnProps) => ({
    questions: state.globalData.questions
  })
)(CombineStepDetails)

interface OperatorsProps {
  operators: ReviseOperatorMenuItem[];
  currentValue: string;
}
function Operators({ currentValue, operators }: OperatorsProps) {
  return (
    <div className="StepOperators">
      {operators.map(operator => {
        const id = `operator__${operator.value}`;
        return (
          <div className="StepOperator" key={id}>
            <input key={currentValue} id={id} type="radio" name="revise-operator" value={operator.value} defaultChecked={currentValue === operator.value} />
            <label htmlFor={id}> <div className={operator.iconClassName}></div></label>
            <label htmlFor={id}> {operator.display} </label>
          </div>
        )
      })}
    </div>
  );
}