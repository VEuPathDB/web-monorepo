import React from 'react';
import { wrappable } from '../../Utils/ComponentUtils';

type Props = {
  /** Size attribute for select element */
  size?: number;

  /** Value to use for "name" attribute of the select form input **/
  name?: string;

  /** Array of items to display in the list **/
  items: { value: string; display: string; disabled?: boolean }[];

  /** Value of the option elements that should be selected **/
  value: string[];

  /** Whether a value is required for submission */
  required?: boolean;

  /**
   * Callback function that will be called when user changes selected value.
   * The new (string) value of the selected option will be passed to this
   * function.
   */
  onChange: (value: string[]) => void;
};

function MultiSelect(props: Props) {
  let { name, size, value, items, onChange, required = false, ...rest } = props;
  return (
    <select
      {...rest}
      name={name}
      size={size}
      multiple
      value={value}
      onChange={(event) => {
        let options = event.target.options;
        let value: string[] = [];
        for (let i = 0; i < options.length; i++) {
          if (options[i].selected) {
            value.push(options[i].value);
          }
        }
        onChange(value);
      }}
      required={required}
    >
      {items.map((item) => (
        <option key={item.value} disabled={item.disabled} value={item.value}>
          {item.display}
        </option>
      ))}
    </select>
  );
}

export default wrappable(MultiSelect);
