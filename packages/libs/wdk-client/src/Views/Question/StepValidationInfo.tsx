import React from 'react';
import {Step} from 'wdk-client/Utils/WdkUser';

interface Props {
  stepValidation?: Step['validation'];
};

export default function StepValidationInfo(props: Props) {
  const { stepValidation } = props;
  if (stepValidation == null || stepValidation.isValid) return null;

  const { errors } = stepValidation;
  return (
    <div className="wdk-Banner error-banner">
      <div>
        <div>The following errors need to be fixed:</div>
        <ul>
          {errors.general && errors.general.map((generalError, index) => <li key={index}>{generalError}</li> )}
          {errors.byKey && Object.entries(errors.byKey).map(([paramName, paramErrors = []]) =>
            paramErrors.map((paramError, index) => <li key={paramName + index} >{paramName}: {paramError}</li>)
          )}
        </ul>
      </div>
    </div>
  );
}
