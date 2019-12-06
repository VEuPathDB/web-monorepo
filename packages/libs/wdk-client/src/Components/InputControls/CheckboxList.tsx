import React, { Component, FormEvent, ReactNode } from 'react';
import { wrappable, addOrRemove } from 'wdk-client/Utils/ComponentUtils';
import NativeCheckboxList from 'wdk-client/Components/InputControls/NativeCheckboxList';

type Item = {
  display: ReactNode
  value: any
}

type Props = {
  name?: string
  items: Item[]
  value: string[]
  onChange: (value: string[]) => void
}

/**
 * The goal of CheckboxList is to simplify the API of a NativeCheckboxList
 * to be convenient to simple form components, which will typically use it to
 * display a list of record attributes or tables for selection.
 */
class CheckboxList extends Component<Props> {

  constructor(props: Props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onSelectAll = this.onSelectAll.bind(this);
    this.onClearAll = this.onClearAll.bind(this);
  }

  onChange(event: FormEvent<HTMLInputElement>) {
    this.props.onChange(addOrRemove(this.props.value, event.currentTarget.value));
  }

  onSelectAll() {
    this.props.onChange(this.props.items.map(item => item.value));
  }

  onClearAll() {
    this.props.onChange([]);
  }

  render() {
    let { name, items, value } = this.props;
    return (
      <NativeCheckboxList name={name}
         onChange={this.onChange}
         onSelectAll={this.onSelectAll}
         onClearAll={this.onClearAll}
         selectedItems={value}
         items={items}
      />
    );
  }
}

export default wrappable(CheckboxList);
