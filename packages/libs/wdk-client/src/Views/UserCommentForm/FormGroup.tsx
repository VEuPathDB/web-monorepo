import React, { ReactNode, Fragment } from 'react';
import { FormRow, FormRowProps } from './FormRow';

interface FormGroupProps {
  groupKey: string;
  headerContent: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  formRows: (FormRowProps & { key: string })[];
}

export const FormGroup: React.SFC<FormGroupProps> = ({
  groupKey,
  headerContent,
  className,
  headerClassName,
  bodyClassName,
  formRows
}) => (
  <div className={className}>
    <FormRow
      key={`${groupKey}/header`}
      label={headerContent}
      labelClassName={headerClassName}
      field={null}
    />
    <div className={bodyClassName}>
      {
        formRows.map(
          formRow => (
            <FormRow
              key={`${groupKey}/${formRow.key}`}
              {...formRow}
            />
          )
        )
      }
    </div>
  </div>
);
