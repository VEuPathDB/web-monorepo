import Banner from '@veupathdb/coreui/dist/components/banners/Banner';

import { InputErrors } from '../utils/ServiceTypes';

interface Props {
  errors: InputErrors;
}

export function BlastFormValidationInfo({ errors }: Props) {
  return (
    <Banner
      banner={{
        type: 'danger',
        message: (
          <div>
            <div>Please correct the following:</div>
            <ul>
              {errors.general &&
                errors.general.map((generalError, index) => (
                  <li key={index}>{generalError}</li>
                ))}
              {errors.byKey &&
                Object.entries(errors.byKey).map(
                  ([paramName, paramErrors = []]) =>
                    paramErrors.map((paramError, index) => (
                      <li key={paramName + index}>
                        <strong>{paramName}</strong>: {paramError}
                      </li>
                    ))
                )}
            </ul>
          </div>
        ),
        pinned: true,
      }}
    />
  );
}
