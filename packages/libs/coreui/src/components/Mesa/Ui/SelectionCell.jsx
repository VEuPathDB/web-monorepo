import React from 'react';

import Checkbox from '../Components/Checkbox';
import AnchoredTooltip from '../Components/AnchoredTooltip';
import Icon from '../Components/Icon';

class SelectionCell extends React.PureComponent {
  constructor(props) {
    super(props);
    this.selectAllRows = this.selectAllRows.bind(this);
    this.deselectAllRows = this.deselectAllRows.bind(this);
    this.renderPageCheckbox = this.renderPageCheckbox.bind(this);
    this.renderRowCheckbox = this.renderRowCheckbox.bind(this);
  }

  selectAllRows() {
    const { rows, options, eventHandlers } = this.props;
    const { isRowSelected } = options;
    const { onRowSelect, onMultipleRowSelect } = eventHandlers;
    const unselectedRows = rows.filter((row) => !isRowSelected(row));
    if (onMultipleRowSelect) return onMultipleRowSelect(unselectedRows);
    return unselectedRows.forEach(onRowSelect);
  }

  deselectAllRows() {
    const { rows, options, eventHandlers } = this.props;
    const { isRowSelected } = options;
    const { onRowDeselect, onMultipleRowDeselect } = eventHandlers;
    const selection = rows.filter(isRowSelected);
    if (onMultipleRowDeselect) return onMultipleRowDeselect(selection);
    return selection.forEach(onRowDeselect);
  }

  renderPageCheckbox() {
    const { rows, isRowSelected, inert, options } = this.props;
    const selection = rows.filter(isRowSelected);
    const checked = rows.length && rows.every(isRowSelected);
    const isIndeterminate = selection.length > 0 && !checked;

    const { selectColumnHeadingDetails } = options;

    let handler = (e) => {
      e.stopPropagation();
      return checked || isIndeterminate
        ? this.deselectAllRows()
        : this.selectAllRows();
    };

    return (
      <th
        className={
          'SelectionCell' + (selectColumnHeadingDetails ? '__withDetails' : '')
        }
        onClick={handler}
      >
        {inert ? null : (
          <AnchoredTooltip
            content={checked || isIndeterminate ? 'Clear all' : 'Select all'}
          >
            <Checkbox checked={checked} indeterminate={isIndeterminate} />
          </AnchoredTooltip>
        )}
        {selectColumnHeadingDetails && (
          <span>{selectColumnHeadingDetails.heading}</span>
        )}
        {selectColumnHeadingDetails && selectColumnHeadingDetails.helpText && (
          <AnchoredTooltip
            className="Trigger HelpTrigger"
            content={selectColumnHeadingDetails.helpText}
          >
            <Icon fa="question-circle" />
          </AnchoredTooltip>
        )}
      </th>
    );
  }

  renderRowCheckbox() {
    const { row, isRowSelected, eventHandlers, inert } = this.props;
    const { onRowSelect, onRowDeselect } = eventHandlers;
    const checked = isRowSelected(row);

    let handler = (e) => {
      e.stopPropagation();
      return checked ? onRowDeselect(row) : onRowSelect(row);
    };

    return (
      <td className="SelectionCell" onClick={handler}>
        {inert ? null : <Checkbox checked={checked} />}
      </td>
    );
  }

  render() {
    let { heading } = this.props;
    return heading ? this.renderPageCheckbox() : this.renderRowCheckbox();
  }
}

export default SelectionCell;
