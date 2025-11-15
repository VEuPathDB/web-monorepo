import React from 'react';

interface SelectOption {
  name: string;
  value: string | number;
}

interface SelectBoxProps {
  name?: string;
  className?: string;
  selected?: string | number;
  options?: (SelectOption | string | number)[];
  onChange?: (value: string) => void;
}

class SelectBox extends React.PureComponent<SelectBoxProps> {
  constructor(props: SelectBoxProps) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    const { onChange } = this.props;
    const value = e.target.value;
    if (onChange) onChange(value);
  }

  getOptions(): SelectOption[] {
    let { options } = this.props;
    if (!Array.isArray(options)) return [];
    options = options.map((option) => {
      return typeof option === 'object' && 'name' in option && 'value' in option
        ? option
        : { name: option.toString(), value: option };
    });
    return options as SelectOption[];
  }

  render() {
    const { name, className, selected } = this.props;
    let options = this.getOptions();

    return (
      <select
        name={name}
        className={className}
        onChange={this.handleChange}
        value={selected}
      >
        {options.map(({ value, name }) => (
          <option key={value} value={value}>
            {name}
          </option>
        ))}
      </select>
    );
  }
}

export default SelectBox;
