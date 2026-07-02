import React, { ButtonHTMLAttributes, ReactElement } from 'react';

export type AddRowButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly onClick: () => void;
};

export function AddRowButton({
  children,
  className,
  onClick,
  ...props
}: AddRowButtonProps): ReactElement {
  if (typeof className === 'string' && className.length > 0)
    className += ' input-appender';

  return (
    <span className={className}>
      <button className={className} type="button" onClick={onClick} {...props}>
        {children}
      </button>
    </span>
  );
}
