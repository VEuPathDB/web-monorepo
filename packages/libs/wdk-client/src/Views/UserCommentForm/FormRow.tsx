import React, { ReactNode } from 'react';

export interface FormRowProps {
  label: ReactNode;
  field: ReactNode;
  rowClassName?: string;
  labelClassName?: string;
}

export const FormRow: React.SFC<FormRowProps> = ({ 
  label, 
  field, 
  rowClassName,
  labelClassName
}) => (
  <div className={rowClassName}>
    <label className={labelClassName}>{label}</label>
    {field}
  </div>
);
