import React from 'react';

class SelectBox extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    const { onChange } = this.props;
    const value = e.target.value;
    if (onChange) onChange(value);
  }

  getOptions() {
    let { options } = this.props;
    if (!Array.isArray(options)) return [];
    options = options.map((option) => {
      return typeof option === 'object' && 'name' in option && 'value' in option
        ? option
        : { name: option.toString(), value: option };
    });
    return options;
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
