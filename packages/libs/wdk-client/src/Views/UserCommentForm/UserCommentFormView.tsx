import React, { ReactNode, FormEvent } from 'react';
import { FormRowProps } from 'wdk-client/Views/UserCommentForm/FormRow';
import { FormBody } from './FormBody';

export interface UserCommentFormViewProps {
  title: ReactNode;
  buttonText: string;
  submitting: boolean;
  className?: string;
  onSubmit: (event: FormEvent) => void;
  formGroupFields: Record<string, (FormRowProps & { key: string })[]>;
  formGroupDisplayNames: Record<string, string>;
  formGroupOrder: string[];
}

export const UserCommentFormView: React.SFC<UserCommentFormViewProps> = ({
  title,
  buttonText,
  submitting,
  className,
  onSubmit,
  ...formBodyProps
}) => (
  <div className={className}>
    {title}
    <FormBody {...formBodyProps} />
    <form onSubmit={onSubmit}>
      <button type="submit" disabled={submitting}>
        {buttonText}
      </button>
    </form>
  </div>
);
