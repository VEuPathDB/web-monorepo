import React, { ReactNode } from 'react';

export interface FormRowProps {
  label: ReactNode;
  field: ReactNode;
  labelClassName?: string;
  fieldClassName?: string;
}

export const FormRow: React.SFC<FormRowProps> = ({
  label,
  field,
  labelClassName,
  fieldClassName,
}) => (
  <>
    <label className={labelClassName}>{label}</label>
    <div className={fieldClassName}>{field}</div>
  </>
);
