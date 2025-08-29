import React from 'react';
import { wrappable } from '../../Utils/ComponentUtils';

type Props = {
  /** Value to use for "name" attribute of the select form input **/
  name?: string;
  items: { value: string; display: string; disabled?: boolean }[];
  value?: string;
  required?: boolean;
  onChange: (value: string) => void;
  className?: string;
};

function SingleSelect(props: Props) {
  const { name, value, items, required = false, onChange, className } = props;
  return (
    <select
      name={name}
      value={value}
      onChange={(event) => {
        if (event.target.value !== value) {
          onChange(event.target.value);
        }
      }}
      required={required}
      className={className}
    >
      {items.map((item) => (
        <option key={item.value} disabled={item.disabled} value={item.value}>
          {item.display}
        </option>
      ))}
    </select>
  );
}

export default wrappable(SingleSelect);
