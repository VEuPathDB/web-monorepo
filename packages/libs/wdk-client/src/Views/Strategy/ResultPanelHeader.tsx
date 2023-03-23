import React from 'react';
import { RecordClass, Question } from '../../Utils/WdkModel';
import { Step } from '../../Utils/WdkUser';
import { setReviseFormVisibility } from '../../Actions/StrategyPanelActions';
import { connect } from 'react-redux';
import { wrappable } from '../../Utils/ComponentUtils';

interface Props {
  step: Step;
  recordClass: RecordClass;
  question: Question;
  reviseViewId: string;
}

interface DispatchProps {
  setReviseFormVisibility: (viewId: string, stepId: number) => void;
}

const dispatchProps: DispatchProps = {
  setReviseFormVisibility,
};

const headerStyle: React.CSSProperties = {
  order: 1,
  margin: '0',
  padding: '0',
  fontWeight: 'bold',
  fontSize: '1.4em',
};

const buttonStyle: React.CSSProperties = {
  order: 2,
  fontWeight: 'normal',
  verticalAlign: 'middle',
  marginLeft: '1em',
};

function ResultPanelHeader({
  step,
  recordClass,
  question,
  reviseViewId,
  setReviseFormVisibility,
}: Props & DispatchProps) {
  return (
    <React.Fragment>
      <h2 style={headerStyle}>
        {step.estimatedSize == null ? '?' : step.estimatedSize.toLocaleString()}{' '}
        {step.estimatedSize === 1
          ? recordClass.displayName
          : recordClass.displayNamePlural}
      </h2>
      {!isBinaryOperator(question) && (
        <button
          style={buttonStyle}
          type="button"
          onClick={() => setReviseFormVisibility(reviseViewId, step.id)}
        >
          Revise this search
        </button>
      )}
    </React.Fragment>
  );
}

function isBinaryOperator(question: Question) {
  return (
    question.allowedPrimaryInputRecordClassNames != null &&
    question.allowedPrimaryInputRecordClassNames.length > 0 &&
    question.allowedSecondaryInputRecordClassNames != null &&
    question.allowedSecondaryInputRecordClassNames.length > 0
  );
}

export default connect(null, dispatchProps)(wrappable(ResultPanelHeader));
