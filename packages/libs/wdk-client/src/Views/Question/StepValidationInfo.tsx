import React from 'react';
import {Step} from 'wdk-client/Utils/WdkUser';
import { QuestionWithParameters } from 'wdk-client/Utils/WdkModel';

interface Props {
  stepValidation?: Step['validation'];
  question: QuestionWithParameters;
  isRevise: boolean;
};

const reviseHeading = 'Your original parameters values are no longer valid';
const nonReviseHeading = 'Please correct the following';

export default function StepValidationInfo(props: Props) {
  const { isRevise, stepValidation, question } = props;
  if (stepValidation == null || stepValidation.isValid) return null;

  const getParamDisplayName = (paramName: string) => {
    const parameter = question.parameters.find(p => p.name === paramName);
    return parameter ? parameter.displayName : paramName;
  };

  const { errors } = stepValidation;
  return (
    <div className="wdk-Banner error-banner">
      <div>
        <div>{isRevise ? reviseHeading : nonReviseHeading}:</div>
        <ul>
          {errors.general && errors.general.map((generalError, index) => <li key={index}>{generalError}</li> )}
          {errors.byKey && Object.entries(errors.byKey).map(([paramName, paramErrors = []]) =>
            paramErrors.map((paramError, index) => <li key={paramName + index} ><strong>{getParamDisplayName(paramName)}</strong>: {paramError}</li>)
          )}
        </ul>
      </div>
    </div>
  );
}
