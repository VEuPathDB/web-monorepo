import * as React from 'react';

export type ResetFormConfig =
  | { offered: false }
  | ({ disabled: boolean; offered: true } & ResetFormButtonProps);

interface ResetFormButtonProps {
  disabled?: boolean;
  onResetForm: () => void;
  resetFormContent: React.ReactNode;
}

export function ResetFormButton({
  disabled,
  onResetForm,
  resetFormContent,
}: ResetFormButtonProps) {
  return (
    <button
      style={{
        fontSize: '1.1em',
        margin: '1em 0',
      }}
      className={`btn`}
      type="button"
      disabled={disabled}
      onClick={onResetForm}
    >
      {resetFormContent}
    </button>
  );
}
