import React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';

type Props = {
  /** Value to use for "name" attribute of the select form input **/
  name?: string;
  items: { value: string; display: string; disabled?: boolean; }[];
  value?: string;
  onChange: (value: string) => void;
}

function SingleSelect(props: Props) {
  const { name, value, items, onChange } = props;
  return (
    <select
      name={name}
      value={value}
      onChange={event => {
        if (event.target.value !== value) {
          onChange(event.target.value);
        }
      }}
    >
      {items.map(item => (
        <option key={item.value} disabled={item.disabled} value={item.value}>{item.display}</option>
      ))}
    </select>
  );
}

export default wrappable(SingleSelect)
