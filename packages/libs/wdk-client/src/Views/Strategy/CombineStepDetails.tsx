import { toUpper } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { requestUpdateStepSearchConfig } from 'wdk-client/Actions/StrategyActions';
import { cxStepBoxes } from 'wdk-client/Views/Strategy/ClassNames';
import { StepDetailProps } from 'wdk-client/Views/Strategy/Types';

interface Operator {
  display: React.ReactNode;
  value: string;
}

const operatorParamName = 'bq_operator';

// TODO This is now an enum param... consider getting values from enum param
const standardOperators: Operator[] = [
  { display: <React.Fragment>A <strong>INTERSECT</strong> B</React.Fragment>, value: 'INTERSECT' },
  { display: <React.Fragment>A <strong>UNION</strong> B</React.Fragment>, value: 'UNION' },
  { display: <React.Fragment>A <strong>MINUS</strong> B</React.Fragment>, value: 'MINUS' },
  { display: <React.Fragment>B <strong>MINUS</strong> A</React.Fragment>, value: 'RMINUS' },
];

const ignoreOperators: Operator[] = [
  { display: <React.Fragment><strong>IGNORE</strong> B</React.Fragment>, value: 'LONLY' },
  { display: <React.Fragment><strong>IGNORE</strong> A</React.Fragment>, value: 'RONLY' },
]

interface DispatchProps {
  dispatch: Dispatch; 
}

function CombineStepDetails({ stepTree, dispatch, onClose }: StepDetailProps & DispatchProps) {
  const { step } = stepTree;
  const currentValue = toUpper(step.searchConfig.parameters[operatorParamName]);
  return (
    <form onSubmit={e => {
      e.preventDefault();
      const operatorInput = e.currentTarget.elements.namedItem(operatorParamName);
      onClose();
      dispatch(() => {
        // Do this check inside of dispatch callback so that error is captured for reporting
        if (operatorInput == null || !(operatorInput instanceof RadioNodeList)) {
          throw new Error(`Could not find "${operatorParamName}" input.`);
        }
        const operatorValue = operatorInput.value;
        return requestUpdateStepSearchConfig(step.strategyId, step.id, {
          ...step.searchConfig,
          parameters: {
            ...step.searchConfig.parameters,
            [operatorParamName]: operatorValue
          }
        });
      })
    }}>
      <div className="CombineStepDetails">
        <div className="CombineStepDetailsTitle">Revise operation</div>
        <Operators currentValue={currentValue} operators={standardOperators}/>
        <hr />
        <div className="CombineStepDetailsTitle">or ignore one of the input steps</div>
        <Operators currentValue={currentValue} operators={ignoreOperators}/>
        <button className="btn" type="submit">Revise</button>
      </div>
    </form>
  )
}

export default connect(null)(CombineStepDetails)

interface OperatorsProps {
  operators: Operator[];
  currentValue: string;
}
function Operators({ currentValue, operators }: OperatorsProps) {
  return (
    <div className="StepOperators">
      {operators.map(operator => {
        const id = `operator__${operator.value}`;
        return (
          <div className="StepOperator" key={id}>
            <input key={currentValue} id={id} type="radio" name={operatorParamName} value={operator.value} defaultChecked={currentValue === operator.value} />
            <label htmlFor={id}> <div className={cxStepBoxes('--CombineOperator', operator.value)}></div></label>
            <label htmlFor={id}> {operator.display} </label>
          </div>
        )
      })}
    </div>
  );
}