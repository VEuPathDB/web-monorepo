import React from "react";

export interface FieldLabelProps
  extends React.DetailedHTMLProps<
    React.LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  > {
  children: React.ReactNode;
  required: boolean;
}

export function FieldLabel({ children, required, ...labelProps }: FieldLabelProps) {
  return (
    <label {...labelProps}>
      {children}
      {required ? '*' : null}
    </label>
  );
}
