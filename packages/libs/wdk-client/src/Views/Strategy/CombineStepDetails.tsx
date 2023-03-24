import React, { useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { Dispatch, compose } from 'redux';
import {
  requestUpdateStepSearchConfig,
  requestReplaceStep,
} from '../../Actions/StrategyActions';
import { RootState } from '../../Core/State/Types';
import { StepDetailProps, CombineUiStepTree } from '../../Views/Strategy/Types';
import {
  useReviseOperatorConfigs,
  useCompatibleOperatorMetadata,
  OperatorMetadata,
  ReviseOperatorMenuGroup,
} from '../../Utils/Operations';
import { Question } from '../../Utils/WdkModel';
import Loading from '../../Components/Loading';
import { StrategyDetails } from '../../Utils/WdkUser';
import NotFound from '../../Views/NotFound/NotFound';
import { emptyAction } from '../../Core/WdkMiddleware';
import { Plugin } from '../../Utils/ClientPlugin';

export interface ReviseOperatorMenuItem {
  display: React.ReactNode;
  value: string;
  iconClassName: string;
}

interface StateProps {
  questions?: Question[];
  strategy?: StrategyDetails;
}

interface DispatchProps {
  dispatch: Dispatch;
}

type OwnProps = StepDetailProps<CombineUiStepTree>;

export type CombineStepDetailsProps = OwnProps & StateProps & DispatchProps;

function CombineStepDetails(props: CombineStepDetailsProps) {
  return (
    <Plugin
      context={{
        type: 'stepDetails',
        name: 'combine',
        searchName: props.stepTree.step.searchName,
        recordClassName: props.stepTree.step.recordClassName,
      }}
      pluginProps={props}
      defaultComponent={DefaultCombineStepDetails}
    />
  );
}

function DefaultCombineStepDetails({
  questions,
  strategy,
  stepTree,
  onClose,
  dispatch,
}: CombineStepDetailsProps) {
  const { step } = stepTree;

  const compatibleOperatorMetadata = useCompatibleOperatorMetadata(
    questions,
    stepTree
  );
  const reviseOperatorConfigs = useReviseOperatorConfigs(questions, stepTree);

  const currentOperatorMetadata =
    compatibleOperatorMetadata &&
    Object.values(compatibleOperatorMetadata).find(
      ({ searchName }) => searchName === step.searchName
    );

  const currentOperatorParamName =
    currentOperatorMetadata && currentOperatorMetadata.paramName;
  const currentOperatorSearchName =
    currentOperatorMetadata && currentOperatorMetadata.searchName;
  const currentOperatorValue =
    currentOperatorMetadata &&
    currentOperatorParamName &&
    (currentOperatorMetadata.reviseOperatorParamConfiguration.type === 'inline'
      ? step.searchConfig.parameters[currentOperatorParamName]
      : currentOperatorMetadata.paramValue);

  return !questions ||
    !strategy ||
    !compatibleOperatorMetadata ||
    !reviseOperatorConfigs ||
    !currentOperatorMetadata ||
    !currentOperatorSearchName ||
    !currentOperatorValue ? (
    <Loading />
  ) : (
    <CombineStepDetailsForm
      questions={questions}
      strategy={strategy}
      onClose={onClose}
      dispatch={dispatch}
      compatibleOperatorMetadata={compatibleOperatorMetadata}
      currentOperatorSearchName={currentOperatorSearchName}
      currentOperatorValue={currentOperatorValue}
      stepTree={stepTree}
      reviseOperatorConfigs={reviseOperatorConfigs}
    />
  );
}

type CombineStepDetailsFormProps = {
  questions: Question[];
  strategy: StrategyDetails;
  onClose: () => void;
  dispatch: Dispatch;
  compatibleOperatorMetadata: Record<string, OperatorMetadata>;
  currentOperatorSearchName: string;
  currentOperatorValue: string;
  stepTree: CombineUiStepTree;
  reviseOperatorConfigs: ReviseOperatorMenuGroup[];
};

const CombineStepDetailsForm = ({
  questions,
  strategy,
  onClose,
  dispatch,
  compatibleOperatorMetadata,
  currentOperatorSearchName,
  currentOperatorValue,
  stepTree,
  reviseOperatorConfigs,
}: CombineStepDetailsFormProps) => {
  const { step } = stepTree;

  const [newOperatorValue, setNewOperatorValue] =
    useState(currentOperatorValue);

  // If there is only one choice of operator value, and that operator requires a form,
  // jump directly to said form
  const [isConfiguringOperatorParams, setIsConfiguringOperatorParams] =
    useState(
      Object.values(compatibleOperatorMetadata).length === 1 &&
        compatibleOperatorMetadata[newOperatorValue]
          .reviseOperatorParamConfiguration.type === 'form'
    );

  const {
    searchName: newOperatorSearchName,
    reviseOperatorParamConfiguration: reviseOperatorParamConfiguration,
    paramName: newOperatorParamName,
  } = compatibleOperatorMetadata[newOperatorValue];

  const ReviseOperatorForm =
    reviseOperatorParamConfiguration.type === 'form' &&
    reviseOperatorParamConfiguration.FormComponent;

  return !isConfiguringOperatorParams ? (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        dispatch(() => {
          if (reviseOperatorParamConfiguration.type === 'inline') {
            onClose();

            if (currentOperatorSearchName === newOperatorSearchName) {
              return requestUpdateStepSearchConfig(step.strategyId, step.id, {
                ...step.searchConfig,
                parameters: {
                  ...step.searchConfig.parameters,
                  [newOperatorParamName]: newOperatorValue,
                },
              });
            } else {
              const newOperatorQuestion = questions.find(
                ({ urlSegment }) => urlSegment === newOperatorSearchName
              );

              if (!newOperatorQuestion || !newOperatorSearchName) {
                throw new Error(
                  `Could not find "${
                    newOperatorSearchName || 'Unknown'
                  }" question.`
                );
              }

              // FIXME This is coupled to the order in which the answer parameters appear in the parameter list
              const answerParamValues = newOperatorQuestion.paramNames
                .slice(0, 2)
                .reduce(
                  (memo, answerParamName) => ({
                    ...memo,
                    [answerParamName]: '',
                  }),
                  {} as Record<string, string>
                );

              return requestReplaceStep(step.strategyId, step.id, {
                searchName: newOperatorSearchName,
                searchConfig: {
                  ...step.searchConfig,
                  parameters: {
                    ...answerParamValues,
                    [newOperatorParamName]: newOperatorValue,
                  },
                },
                customName: newOperatorQuestion.displayName,
              });
            }
          } else {
            setIsConfiguringOperatorParams(true);

            return emptyAction;
          }
        });
      }}
    >
      <div className="CombineStepDetails">
        {reviseOperatorConfigs.map((config) => (
          <React.Fragment key={config.name}>
            <div className="CombineStepDetailsTitle">{config.display}</div>
            <Operators
              currentValue={newOperatorValue}
              operators={config.items}
              setValue={setNewOperatorValue}
            />
            <hr />
          </React.Fragment>
        ))}
        <button className="btn" type="submit">
          {reviseOperatorParamConfiguration.type === 'form'
            ? 'Continue...'
            : 'Revise'}
        </button>
      </div>
    </form>
  ) : !ReviseOperatorForm ? (
    <NotFound />
  ) : (
    <ReviseOperatorForm
      uiStepTree={stepTree}
      searchName={newOperatorSearchName}
      questions={questions}
      step={step}
      strategy={strategy}
      primaryInputQuestion={stepTree.primaryInput.question}
      primaryInputRecordClass={stepTree.primaryInput.recordClass}
      secondaryInputQuestion={stepTree.secondaryInput.question}
      secondaryInputRecordClass={stepTree.secondaryInput.recordClass}
      onClose={onClose}
      requestUpdateStepSearchConfig={compose(
        dispatch,
        requestUpdateStepSearchConfig
      )}
      requestReplaceStep={compose(dispatch, requestReplaceStep)}
    />
  );
};

export default connect((state: RootState, ownProps: OwnProps) => {
  const questions = state.globalData.questions;
  const strategyDetails =
    state.strategies.strategies[ownProps.stepTree.step.strategyId];
  const strategy = strategyDetails && strategyDetails.strategy;

  return {
    questions,
    strategy,
  };
})(CombineStepDetails);

interface OperatorsProps {
  operators: ReviseOperatorMenuItem[];
  currentValue: string;
  setValue: (newValue: string) => void;
}
function Operators({ currentValue, operators, setValue }: OperatorsProps) {
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    },
    [setValue]
  );

  return (
    <div className="StepOperators">
      {operators.map((operator) => {
        const id = `operator__${operator.value}`;
        return (
          <div className="StepOperator" key={id}>
            <input
              key={currentValue}
              id={id}
              onChange={onChange}
              type="radio"
              name="revise-operator"
              value={operator.value}
              checked={currentValue === operator.value}
            />
            <label htmlFor={id}>
              {' '}
              <div className={operator.iconClassName}></div>
            </label>
            <label htmlFor={id}> {operator.display} </label>
          </div>
        );
      })}
    </div>
  );
}
