import { InputErrors } from '../utils/ServiceTypes';

interface Props {
  errors: InputErrors;
}

export function BlastFormValidationInfo({ errors }: Props) {
  return (
    <div className="wdk-Banner error-banner">
      <div>
        <div>Please correct the following:</div>
        <ul>
          {errors.general &&
            errors.general.map((generalError, index) => (
              <li key={index}>{generalError}</li>
            ))}
          {errors.byKey &&
            Object.entries(errors.byKey).map(([paramName, paramErrors = []]) =>
              paramErrors.map((paramError, index) => (
                <li key={paramName + index}>
                  <strong>{paramName}</strong>: {paramError}
                </li>
              ))
            )}
        </ul>
      </div>
    </div>
  );
}
