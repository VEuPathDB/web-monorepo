import { useRef, FormEvent, useEffect, ChangeEvent } from 'react';

export type IndeterminateCheckboxProps<T> = {
  checked: boolean;
  indeterminate: boolean;
  name: string;
  value: string;
  /** node and toggleCheckbox are expected for the CheckboxTree implementation */
  node?: T;
  toggleCheckbox?: (node: T, selected: boolean) => void;
  /** onChange is used in conjunction with the DataGrid implementation and is derived from react-table */
  onChange?: (event: ChangeEvent) => void;
}

/**
 * React Component that provides a 3-state checkbox
 */
export default function IndeterminateCheckbox<T>({
    checked,
    indeterminate,
    name,
    node,
    toggleCheckbox,
    onChange,
    value
}: IndeterminateCheckboxProps<T>) {
    const nameProp = name ? { name } : {};
    const nodeRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!nodeRef.current) return;
        nodeRef.current.indeterminate = indeterminate;
    }, [indeterminate])

    const handleChange = (e: FormEvent<HTMLInputElement>) => {
        const selected = e.currentTarget.checked;
        if (toggleCheckbox && node) toggleCheckbox(node, selected);
    };

    return (
        <input ref={nodeRef} type="checkbox" {...nameProp} value={value}
            checked={checked} onChange={onChange ?? handleChange} />
    )
}
