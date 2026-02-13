import React from 'react';

interface SelectionCounterProps<Row> {
  // all/total "rows" in the table
  rows: Row[];
  // predicate to test for 'selectedness'
  isRowSelected: (row: Row) => boolean;

  // noun and plural to use for selections (e.g. "25 Datasets selected")
  selectedNoun?: string;
  selectedPluralNoun?: string;
  // single and multiple select/deselect handlers
  onRowSelect?: (row: Row) => void;
  onRowDeselect?: (row: Row) => void;
  onMultipleRowSelect?: (rows: Row[]) => void;
  onMultipleRowDeselect?: (rows: Row[]) => void;
}

class SelectionCounter<Row> extends React.Component<
  SelectionCounterProps<Row>
> {
  constructor(props: SelectionCounterProps<Row>) {
    super(props);
    this.noun = this.noun.bind(this);
    this.selectAllRows = this.selectAllRows.bind(this);
    this.deselectAllRows = this.deselectAllRows.bind(this);
  }

  noun(size: number | Row[]) {
    const { selectedNoun, selectedPluralNoun } = this.props;
    const count = typeof size === 'number' ? size : size.length;
    return !selectedNoun && !selectedPluralNoun
      ? 'row' + (count === 1 ? '' : 's')
      : count === 1
      ? selectedNoun || 'row'
      : selectedPluralNoun || 'rows';
  }

  selectAllRows() {
    const { rows, isRowSelected, onRowSelect, onMultipleRowSelect } =
      this.props;
    const unselectedRows = rows.filter((row) => !isRowSelected(row));
    if (typeof onMultipleRowSelect === 'function')
      onMultipleRowSelect(unselectedRows);
    else if (onRowSelect) unselectedRows.forEach((row) => onRowSelect(row));
  }

  deselectAllRows() {
    const { rows, isRowSelected, onRowDeselect, onMultipleRowDeselect } =
      this.props;
    const selection = rows.filter(isRowSelected);
    if (typeof onMultipleRowDeselect === 'function')
      onMultipleRowDeselect(selection);
    else if (onRowDeselect) selection.forEach((row) => onRowDeselect(row));
  }

  render() {
    const { rows, isRowSelected, onRowDeselect, onMultipleRowDeselect } =
      this.props;
    const selection = rows.filter(isRowSelected);
    if (!selection.length) return null;

    return (
      <div className="SelectionCounter">
        <b>{selection.length} </b>
        {this.noun(selection)} selected.
        <br />
        {!onRowDeselect && !onMultipleRowDeselect ? null : (
          <button className="link" type="button" onClick={this.deselectAllRows}>
            Clear selection.
          </button>
        )}
      </div>
    );
  }
}

export default SelectionCounter;
