import React, { Fragment, ReactNode } from 'react';

import { FormGroup } from 'wdk-client/Views/UserCommentForm/FormGroup';
import { FormRowProps } from 'wdk-client/Views/UserCommentForm/FormRow';

interface FormBodyProps {
  formGroupFields: Record<string, (FormRowProps & { key: string })[]>;
  formGroupHeaders: Record<string, ReactNode>;
  formGroupOrder: string[];
  formGroupClassName?: string;
  formGroupBodyClassName?: string;
}

export const FormBody: React.SFC<FormBodyProps> = ({
  formGroupFields,
  formGroupHeaders,
  formGroupOrder,
  formGroupClassName,
  formGroupBodyClassName
}) => (
  <>
    {
      formGroupOrder.map(
        formGroupKey => (
          <FormGroup 
            key={formGroupKey}
            groupKey={formGroupKey}
            headerContent={formGroupHeaders[formGroupKey]}
            formRows={formGroupFields[formGroupKey]}
            className={formGroupClassName}
            bodyClassName={formGroupBodyClassName}
          />
        )
      )
    }
  </>
);
