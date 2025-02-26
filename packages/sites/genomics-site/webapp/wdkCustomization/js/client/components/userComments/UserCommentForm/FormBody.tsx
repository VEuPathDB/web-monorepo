import React, { ReactNode } from 'react';

import { FormGroup } from './FormGroup';
import { FormRowProps } from './FormRow';

interface FormBodyProps {
  formGroupFields: Record<string, (FormRowProps & { key: string })[]>;
  formGroupHeaders: Record<string, ReactNode>;
  formGroupOrder: string[];
  formGroupClassName?: string;
  formGroupHeaderClassName?: string;
  formGroupBodyClassName?: string;
}

export const FormBody: React.FunctionComponent<FormBodyProps> = ({
  formGroupFields,
  formGroupHeaders,
  formGroupOrder,
  formGroupClassName,
  formGroupHeaderClassName,
  formGroupBodyClassName,
}) => (
  <div>
    {formGroupOrder.map((formGroupKey) => (
      <FormGroup
        key={formGroupKey}
        groupKey={formGroupKey}
        headerContent={formGroupHeaders[formGroupKey]}
        formRows={formGroupFields[formGroupKey]}
        className={formGroupClassName}
        headerClassName={formGroupHeaderClassName}
        bodyClassName={formGroupBodyClassName}
      />
    ))}
  </div>
);
