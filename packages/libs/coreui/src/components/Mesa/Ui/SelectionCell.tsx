import React from 'react';

import Checkbox from '../Components/Checkbox';
import AnchoredTooltip from '../Components/AnchoredTooltip';
import Icon from '../Components/Icon';
import { MesaStateProps } from '../types';

interface SelectionCellProps<Row> {
  rows?: Row[];
  row?: Row;
  heading?: boolean;
  inert?: boolean;
  isRowSelected: (row: Row) => boolean;
  options: MesaStateProps<Row>['options'];
  eventHandlers: MesaStateProps<Row>['eventHandlers'];
}

class SelectionCell<Row> extends React.PureComponent<SelectionCellProps<Row>> {
  constructor(props: SelectionCellProps<Row>) {
    super(props);
    this.selectAllRows = this.selectAllRows.bind(this);
    this.deselectAllRows = this.deselectAllRows.bind(this);
    this.renderPageCheckbox = this.renderPageCheckbox.bind(this);
    this.renderRowCheckbox = this.renderRowCheckbox.bind(this);
  }

  selectAllRows() {
    const { rows, options, eventHandlers } = this.props;
    const { isRowSelected } = options ?? {};
    const { onRowSelect, onMultipleRowSelect } = eventHandlers ?? {};
    if (!rows || !isRowSelected) return;
    const unselectedRows = rows.filter((row) => !isRowSelected(row));
    if (onMultipleRowSelect) return onMultipleRowSelect(unselectedRows);
    if (onRowSelect) return unselectedRows.forEach(onRowSelect);
  }

  deselectAllRows() {
    const { rows, options, eventHandlers } = this.props;
    const { isRowSelected } = options ?? {};
    const { onRowDeselect, onMultipleRowDeselect } = eventHandlers ?? {};
    if (!rows || !isRowSelected) return;
    const selection = rows.filter(isRowSelected);
    if (onMultipleRowDeselect) return onMultipleRowDeselect(selection);
    if (onRowDeselect) return selection.forEach(onRowDeselect);
  }

  renderPageCheckbox() {
    const { rows, isRowSelected, inert, options } = this.props;
    if (!rows) return null;
    const selection = rows.filter(isRowSelected);
    const checked = rows.length > 0 && rows.every(isRowSelected);
    const isIndeterminate = selection.length > 0 && !checked;

    const { selectColumnHeadingDetails } = options ?? {};

    let handler = (e: React.MouseEvent) => {
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
    const { onRowSelect, onRowDeselect } = eventHandlers ?? {};
    if (!row) return null;
    const checked = isRowSelected(row);

    let handler = (e: React.MouseEvent) => {
      e.stopPropagation();
      return checked
        ? onRowDeselect && onRowDeselect(row)
        : onRowSelect && onRowSelect(row);
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
