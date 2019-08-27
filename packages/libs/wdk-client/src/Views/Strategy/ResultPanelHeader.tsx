import React from 'react';
import { RecordClass } from 'wdk-client/Utils/WdkModel';
import { Step } from 'wdk-client/Utils/WdkUser';
import {setReviseFormVisibility} from 'wdk-client/Actions/StrategyPanelActions';
import {connect} from 'react-redux';

interface Props {
  step: Step;
  recordClass: RecordClass;
  reviseViewId: string;
}

interface DispatchProps {
  setReviseFormVisibility: (viewId: string, stepId: number) => void;
}

const dispatchProps: DispatchProps = {
  setReviseFormVisibility
}

const headerStyle: React.CSSProperties = {
  marginTop: '.75em',
  fontWeight: 'bold',
  fontSize: '1.4em'
};

const buttonStyle: React.CSSProperties = {
  fontSize: '.7em',
  fontWeight: 'normal',
  verticalAlign: 'middle',
  marginLeft: '.5em'
}

function ResultPanelHeader({ step, recordClass, reviseViewId, setReviseFormVisibility }: Props & DispatchProps) {
  return (
    <h2 style={headerStyle}>
      {step.estimatedSize == null ? '?' : step.estimatedSize.toLocaleString()} {step.estimatedSize === 1 ? recordClass.displayName : recordClass.displayNamePlural}
      &nbsp;
      <button
        style={buttonStyle}
        type="button"
        onClick={() => setReviseFormVisibility(reviseViewId, step.id)}
      >Revise this search</button>
    </h2>
  )
}

export default connect(null, dispatchProps)(ResultPanelHeader);
