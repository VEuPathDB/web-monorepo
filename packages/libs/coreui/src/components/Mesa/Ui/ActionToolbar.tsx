import React, { ReactNode } from 'react';

import SelectionCounter from './SelectionCounter';
import RowCounter from './RowCounter';
import { makeClassifier } from '../Utils/Utils';
import Toggle from '../../widgets/Toggle';
import { MesaStateProps, MesaAction } from '../types';

const actionToolbarClass = makeClassifier('ActionToolbar');

interface ActionToolbarProps<Row, Key = string>
  extends Partial<MesaStateProps<Row, Key>> {
  children?: ReactNode;
}

class ActionToolbar<Row, Key = string> extends React.PureComponent<
  ActionToolbarProps<Row, Key>
> {
  constructor(props: ActionToolbarProps<Row, Key>) {
    super(props);
    this.dispatchAction = this.dispatchAction.bind(this);
    this.renderCounter = this.renderCounter.bind(this);
    this.renderActionItem = this.renderActionItem.bind(this);
    this.renderActionItemList = this.renderActionItemList.bind(this);
    this.renderGroupBySelectedToggle =
      this.renderGroupBySelectedToggle.bind(this);
  }

  getSelection(): Row[] {
    const { rows, options } = this.props;
    const { isRowSelected } = options || {};

    if (!rows || typeof isRowSelected !== 'function') return [];
    return rows.filter(isRowSelected);
  }

  dispatchAction(action: MesaAction<Row, Key>): void {
    const { handler, callback } = action;
    const { rows, columns } = this.props;
    const selection = this.getSelection();

    if (action.selectionRequired && !selection.length) return;
    if (typeof handler === 'function')
      selection.forEach((row) => handler(row, columns));
    if (typeof callback === 'function') callback(selection, columns, rows);
  }

  renderCounter(): ReactNode {
    const { rows = [], options = {}, uiState = {}, eventHandlers } = this.props;
    const { showCount, toolbar } = options;

    if (!showCount || (showCount && toolbar)) return null;

    const props = { rows, uiState, eventHandlers };

    return (
      <div className="TableToolbar-Info">
        <RowCounter {...props} />
      </div>
    );
  }

  renderActionItem({
    action,
    key,
  }: {
    action: MesaAction<Row, Key>;
    key: number;
  }): ReactNode {
    let { element } = action;
    let selection = this.getSelection();
    let disabled =
      action.selectionRequired && !selection.length ? 'disabled' : undefined;

    if (typeof element !== 'string' && !React.isValidElement(element)) {
      if (typeof element === 'function') element = element(selection);
    }

    let handler = () => this.dispatchAction(action);
    return (
      <div
        key={key}
        onClick={handler}
        className={actionToolbarClass('Item', disabled)}
      >
        {element}
      </div>
    );
  }

  renderActionItemList(): ReactNode {
    const { actions } = this.props;
    return (
      <div className={actionToolbarClass('ItemList')}>
        {!actions
          ? null
          : actions
              .filter((action) => action.element)
              .map((action, idx) =>
                this.renderActionItem({ action, key: idx })
              )}
      </div>
    );
  }

  renderGroupBySelectedToggle(): ReactNode {
    const { rows, options = {}, eventHandlers = {}, uiState = {} } = this.props;
    const { isRowSelected } = options;
    const { onGroupBySelectedChange } = eventHandlers;
    const { groupBySelected } = uiState;

    if (
      !rows ||
      !isRowSelected ||
      groupBySelected == null ||
      !onGroupBySelectedChange
    )
      return null;

    return (
      <div className={actionToolbarClass('GroupBySelectedToggle')}>
        <Toggle
          value={groupBySelected}
          onChange={onGroupBySelectedChange}
          disabled={!rows.filter(isRowSelected).length}
          label="Keep checked values at top"
          labelPosition="right"
        />
      </div>
    );
  }

  render() {
    const { rows, eventHandlers, children, options } = this.props;
    const { selectedNoun, selectedPluralNoun, isRowSelected } = options || {};
    const {
      onRowSelect,
      onRowDeselect,
      onMultipleRowSelect,
      onMultipleRowDeselect,
    } = eventHandlers || {};

    return (
      <div className={actionToolbarClass() + ' Toolbar'}>
        {!children ? null : (
          <div className={actionToolbarClass('Children')}>{children}</div>
        )}
        {this.renderCounter()}
        <div className={actionToolbarClass('Info')}>
          {this.renderGroupBySelectedToggle()}
          {rows && isRowSelected && (
            <SelectionCounter
              rows={rows}
              isRowSelected={isRowSelected}
              onRowSelect={onRowSelect}
              onRowDeselect={onRowDeselect}
              onMultipleRowSelect={onMultipleRowSelect}
              onMultipleRowDeselect={onMultipleRowDeselect}
              selectedNoun={selectedNoun}
              selectedPluralNoun={selectedPluralNoun}
            />
          )}
        </div>
        {this.renderActionItemList()}
      </div>
    );
  }
}

export default ActionToolbar;
