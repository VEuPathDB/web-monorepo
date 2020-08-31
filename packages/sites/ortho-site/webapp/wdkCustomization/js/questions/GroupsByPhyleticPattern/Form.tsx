import React, { useCallback } from 'react';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { ParameterGroup } from 'wdk-client/Utils/WdkModel';
import { Props } from 'wdk-client/Views/Question/DefaultQuestionForm';

import { EbrcDefaultQuestionForm } from 'ebrc-client/components/questions/EbrcDefaultQuestionForm';

import './Form.scss';

const cxDefaultQuestionForm = makeClassNameHelper('wdk-QuestionForm');

const PHYLETIC_EXPRESSION_PARAM_NAME = 'phyletic_expression';

export function Form(props: Props) {
  const renderParamGroup = useCallback((group: ParameterGroup, formProps: Props) => {
    return (
      <div key={group.name} className={cxDefaultQuestionForm('ParameterList')}>
        <div className={cxDefaultQuestionForm('ParameterControl')}>
          <PhyleticExpressionParameter
            phyleticExpressionTextField={formProps.parameterElements[PHYLETIC_EXPRESSION_PARAM_NAME]}
          />
        </div>
      </div>
    );
  }, []);

  return (
    <EbrcDefaultQuestionForm
      {...props}
      containerClassName={`${cxDefaultQuestionForm()} ${cxDefaultQuestionForm('GroupsByPhyleticPattern')}`}
      renderParamGroup={renderParamGroup}
    />
  );
}

interface PhyleticExpressionParameterProps {
  phyleticExpressionTextField: React.ReactNode;
}

function PhyleticExpressionParameter(props: PhyleticExpressionParameterProps) {
  return (
    <div className="PhyleticExpressionParameter">
      {props.phyleticExpressionTextField}
    </div>
  );
}
