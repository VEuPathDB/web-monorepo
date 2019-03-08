import React, { Fragment } from 'react';

import { FormGroup } from 'wdk-client/Views/UserCommentForm/FormGroup';
import { FormRowProps } from 'wdk-client/Views/UserCommentForm/FormRow';

interface FormBodyProps {
  formGroupFields: Record<string, (FormRowProps & { key: string })[]>;
  formGroupDisplayNames: Record<string, string>
  formGroupOrder: string[];
}

export const FormBody: React.SFC<FormBodyProps> = ({
  formGroupFields,
  formGroupDisplayNames,
  formGroupOrder
}) => (
  <Fragment>
    {
      formGroupOrder.map(
        formGroupKey => (
          <FormGroup 
            key={formGroupKey}
            groupKey={formGroupKey}
            headerContent={formGroupDisplayNames[formGroupKey]}
            formRows={formGroupFields[formGroupKey]}
          />
        )
      )
    }
  </Fragment>
);
