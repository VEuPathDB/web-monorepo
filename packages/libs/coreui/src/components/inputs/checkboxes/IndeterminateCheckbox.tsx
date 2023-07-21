import { useRef, useEffect } from 'react';

export type IndeterminateCheckboxProps<T> = {
  checked: boolean;
  indeterminate: boolean;
  name: string;
  value: string;
  onChange: (isChecked: boolean) => void;
};

/**
 * React Component that provides a 3-state checkbox
 */
export default function IndeterminateCheckbox<T>({
  checked,
  indeterminate,
  name,
  onChange,
  value,
}: IndeterminateCheckboxProps<T>) {
  const nameProp = name ? { name } : {};
  const nodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!nodeRef.current) return;
    nodeRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={nodeRef}
      type="checkbox"
      {...nameProp}
      value={value}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
}
