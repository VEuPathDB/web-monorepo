import HelpIcon from '../../Components/Icon/HelpIcon';
import React, { ReactNode } from 'react';
import { getValueOrDefault, wrappable } from '../../Utils/ComponentUtils';
import '../../Components/InputControls/RadioList.css';

const baseClassName = 'wdk-RadioList';

type Props = {
  /** Value to use for "name" attribute of radio form input elements **/
  name?: string;
  /** Array of items to display in the list **/
  items: Array<{
    display: ReactNode;
    value: string;
    description?: string;
    disabled?: boolean;
    newBuild?: number;
  }>;
  /** Value of the radio input element that should be checked **/
  value?: string;
  /** Whether a value is required for submission */
  required?: boolean;
  /**
   * Callback function that will be called when user changes selected value.
   * The new (string) value of the selected button will be passed to this
   * function.
   */
  onChange: (value: string) => void;
  /**
   * CSS class name that will be applied to the parent <li> element of this
   * radio list.
   */
  className?: string;
};

class RadioList extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(event: React.ChangeEvent<HTMLInputElement>) {
    // only call change function passed in if value is indeed changing
    if (event.target.value !== this.props.value) {
      this.props.onChange(event.target.value);
    }
  }

  render() {
    let currentBuild = 66;
    let className =
      baseClassName + ' ' + getValueOrDefault(this.props, 'className', '');
    const { required = false } = this.props;
    return (
      <ul className={className}>
        {this.props.items.map((item) => (
          <li
            key={item.value}
            className={`${item.disabled ? 'disabled' : ''}   ${
              item.newBuild == currentBuild ? 'newBuild' : ''
            }`}
          >
            <label>
              <input
                type="radio"
                name={this.props.name}
                value={item.value}
                checked={item.value === this.props.value}
                onChange={this.onChange}
                required={required}
                disabled={item.disabled}
              />{' '}
              {item.display}{' '}
              {item.description != null && (
                <HelpIcon>{item.description}</HelpIcon>
              )}
            </label>
          </li>
        ))}
      </ul>
    );
  }
}

export default wrappable(RadioList);
