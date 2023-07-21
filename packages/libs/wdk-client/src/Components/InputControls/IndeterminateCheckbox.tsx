import ReactDOM from 'react-dom';
import React from 'react';
import FormEvent = React.FormEvent;

export type IndeterminateCheckboxProps<T> = {
  checked: boolean;
  className: string;
  indeterminate: boolean;
  name: string;
  node: T;
  toggleCheckbox: (node: T, selected: boolean) => void;
  value: string;
};

/**
 * React Component that provides a 3-state checkbox
 */
export default class IndeterminateCheckbox<T> extends React.Component<
  IndeterminateCheckboxProps<T>
> {
  constructor(props: IndeterminateCheckboxProps<T>) {
    super(props);

    // hard bind the handleChange functions to the IndeterminateCheckbox object
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.setIndeterminate(this.props.indeterminate);
  }

  componentDidUpdate() {
    this.setIndeterminate(this.props.indeterminate);
  }

  /**
   * Sets the checkbox to the indeterminate state based on the the provided property.
   * This can only be set via JS.
   * @param indeterminate
   */
  setIndeterminate(indeterminate: boolean) {
    const node = ReactDOM.findDOMNode(this) as HTMLInputElement;
    node.indeterminate = indeterminate;
  }

  handleChange(e: FormEvent<HTMLInputElement>) {
    let selected = e.currentTarget.checked;
    this.props.toggleCheckbox(this.props.node, selected);
  }

  render() {
    // name may be undefined; it is optional
    let nameProp = this.props.name ? { name: this.props.name } : {};
    return (
      <input
        type="checkbox"
        {...nameProp}
        className={this.props.className}
        value={this.props.value}
        checked={this.props.checked}
        onChange={this.handleChange}
      />
    );
  }
}
