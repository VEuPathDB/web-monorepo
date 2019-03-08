import React, { ReactNode, Fragment } from 'react';
import { FormRow, FormRowProps } from './FormRow';

interface FormGroupProps {
  groupKey: string;
  headerContent: ReactNode;
  headerClassName?: string;
  formRows: (FormRowProps & { key: string })[];
}

export const FormGroup: React.SFC<FormGroupProps> = ({
  groupKey,
  headerContent,
  headerClassName,
  formRows
}) => (
  <Fragment>
    <FormRow
      key={`${groupKey}/header`}
      label={headerContent}
      labelClassName={headerClassName}
      field={null}
    />
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
  </Fragment>
);
