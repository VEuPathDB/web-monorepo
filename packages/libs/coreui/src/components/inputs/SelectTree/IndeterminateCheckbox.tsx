import React, { useRef, FormEvent, useEffect } from 'react';

export type IndeterminateCheckboxProps<T> = {
  checked: boolean;
  indeterminate: boolean;
  name: string;
  node: T;
  toggleCheckbox: (node: T, selected: boolean) => void;
  value: string;
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
        toggleCheckbox(node, selected);
    };

    return (
        <input ref={nodeRef} type="checkbox" {...nameProp} value={value}
            checked={checked} onChange={handleChange} />
    )
}
