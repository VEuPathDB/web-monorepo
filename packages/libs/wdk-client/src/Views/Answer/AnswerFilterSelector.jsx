import $ from 'jquery';
import { includes } from 'lodash';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import TabbableContainer from '../../Components/Display/TabbableContainer';
import { wrappable, lazy } from '../../Utils/ComponentUtils';

/** Filter text input */
function renderFilterField(field, isChecked, handleChange) {
  return (
    <div key={field.name}>
      <label>
        <input
          type="checkbox"
          value={field.name}
          checked={isChecked}
          onChange={handleChange}
        />
        {' ' + field.displayName}
      </label>
    </div>
  );
}

/** Record fields to match filter expression against */
class AnswerFilterSelector extends Component {
  constructor(props) {
    super(props);
    this.handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        this.props.onClose();
      }
    };
    this.handleDocumentClick = (e) => {
      // close if the click target is not contained by this node
      let node = ReactDOM.findDOMNode(this);
      if ($(e.target).closest(node).length === 0) {
        this.props.onClose();
      }
    };
  }

  componentDidMount() {
    if (this.props.open) {
      document.addEventListener('click', this.handleDocumentClick);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick);
  }

  componentDidUpdate() {
    document.removeEventListener('click', this.handleDocumentClick);
    if (this.props.open) {
      document.addEventListener('click', this.handleDocumentClick);
    }
  }

  render() {
    if (!this.props.open) {
      return null;
    }

    let {
      attributes,
      tables,
      filterAttributes,
      filterTables,
      selectAll,
      clearAll,
      onClose,
      toggleAttribute,
      toggleTable,
    } = this.props;

    return (
      <TabbableContainer
        autoFocus
        onKeyDown={this.handleKeyPress}
        className="wdk-Answer-filterFieldSelector"
      >
        <p>
          <a href="#" onClick={selectAll}>
            select all
          </a>
          {' | '}
          <a href="#" onClick={clearAll}>
            clear all
          </a>
        </p>

        {attributes.map((attr) => {
          let isChecked = includes(filterAttributes, attr.name);
          return renderFilterField(attr, isChecked, toggleAttribute);
        })}

        {tables.map((table) => {
          let isChecked = includes(filterTables, table.name);
          return renderFilterField(table, isChecked, toggleTable);
        })}

        <div className="wdk-Answer-filterFieldSelectorCloseIconWrapper">
          <button
            className="fa fa-close wdk-Answer-filterFieldSelectorCloseIcon"
            onClick={onClose}
          />
        </div>
      </TabbableContainer>
    );
  }
}

export default wrappable(AnswerFilterSelector);
