import React from 'react';
import PropTypes from 'prop-types';

import SelectionCounter from 'wdk-client/Components/Mesa/Ui/SelectionCounter';
import { makeClassifier } from 'wdk-client/Components/Mesa/Utils/Utils';

const actionToolbarClass = makeClassifier('ActionToolbar');

class ActionToolbar extends React.PureComponent {
  constructor (props) {
    super(props);
    this.dispatchAction = this.dispatchAction.bind(this);
    this.renderActionItem = this.renderActionItem.bind(this);
    this.renderActionItemList = this.renderActionItemList.bind(this);
  }

  getSelection () {
    const { rows, options } = this.props;
    const { isRowSelected } = options;

    if (typeof isRowSelected !== 'function') return [];
    return rows.filter(isRowSelected);
  }

  dispatchAction (action) {
    const { handler, callback } = action;
    const { rows, columns } = this.props;
    const selection = this.getSelection();

    if (action.selectionRequired && !selection.length) return;
    if (typeof handler === 'function') selection.forEach(row => handler(row, columns));
    if (typeof callback === 'function') return callback(selection, columns, rows);
  }

  renderActionItem ({ action }) {
    let { element } = action;
    let selection = this.getSelection();
    let disabled = (action.selectionRequired && !selection.length ? 'disabled' : null);

    if (typeof element !== 'string' && !React.isValidElement(element)) {
      if (typeof element === 'function') element = element(selection);
    }

    let handler = () => this.dispatchAction(action);
    return (
      <div
        key={action.__id}
        onClick={handler}
        className={actionToolbarClass('Item', disabled)}>
        {element}
      </div>
    );
  }

  renderActionItemList () {
    const { actions } = this.props;
    const ActionItem = this.renderActionItem;
    return (
      <div className={actionToolbarClass('ItemList')}>
        {!actions ? null : actions
          .filter(action => action.element)
          .map((action, idx) => <ActionItem action={action} key={idx} />)
        }
      </div>
    );
  }

  render () {
    const { rows, eventHandlers, children, options } = this.props;
    const { selectedNoun, selectedPluralNoun, isRowSelected } = options ? options : {};
    const { onRowSelect, onRowDeselect, onMultipleRowSelect, onMultipleRowDeselect } = eventHandlers ? eventHandlers : {};

    const ActionList = this.renderActionItemList;
    const selection = this.getSelection();

    const selectionCounterProps = { rows, isRowSelected, onRowSelect, onRowDeselect, onMultipleRowSelect, onMultipleRowDeselect, selectedNoun, selectedPluralNoun };

    return (
       <div className={actionToolbarClass() + ' Toolbar'}>
         {!children ? null : (
           <div className={actionToolbarClass('Children')}>
             {children}
           </div>
         )}
         <div className={actionToolbarClass('Info')}>
           <SelectionCounter {...selectionCounterProps} />
         </div>
         <ActionList />
       </div>
    );
  }
};

ActionToolbar.propTypes = {
  rows: PropTypes.array,
  actions: PropTypes.array,
  options: PropTypes.object,
  eventHandlers: PropTypes.object
};

export default ActionToolbar;
