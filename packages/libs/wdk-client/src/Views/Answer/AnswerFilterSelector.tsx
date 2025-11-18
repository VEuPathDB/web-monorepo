import { includes } from 'lodash';
import React, { Component } from 'react';
import TabbableContainer from '../../Components/Display/TabbableContainer';
import { wrappable } from '../../Utils/ComponentUtils';
import { AttributeField, TableField } from '../../Utils/WdkModel';

/** Field with name and displayName properties */
interface FilterField {
  name: string;
  displayName: string;
}

/** Props for AnswerFilterSelector component */
interface AnswerFilterSelectorProps {
  open: boolean;
  onClose: () => void;
  attributes: AttributeField[];
  tables: TableField[];
  filterAttributes: string[];
  filterTables: string[];
  selectAll: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  clearAll: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  toggleAttribute: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleTable: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/** Filter text input */
function renderFilterField(
  field: FilterField,
  isChecked: boolean,
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
) {
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

const ANSWER_FILTER_CLASSNAME = 'wdk-Answer-filterFieldSelector';

/** Record fields to match filter expression against */
class AnswerFilterSelector extends Component<AnswerFilterSelectorProps> {
  handleKeyPress: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  handleDocumentClick: (e: MouseEvent) => void;

  constructor(props: AnswerFilterSelectorProps) {
    super(props);
    this.handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        this.props.onClose();
      }
    };
    this.handleDocumentClick = (e: MouseEvent) => {
      // close if the click target is not contained by this node
      if (!(e.target as Element).closest(`.${ANSWER_FILTER_CLASSNAME}`)) {
        this.props.onClose();
      }
    };
  }

  componentDidMount() {
    if (this.props.open) {
      document.addEventListener(
        'click',
        this.handleDocumentClick as EventListener
      );
    }
  }

  componentWillUnmount() {
    document.removeEventListener(
      'click',
      this.handleDocumentClick as EventListener
    );
  }

  componentDidUpdate() {
    document.removeEventListener(
      'click',
      this.handleDocumentClick as EventListener
    );
    if (this.props.open) {
      document.addEventListener(
        'click',
        this.handleDocumentClick as EventListener
      );
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
        className={ANSWER_FILTER_CLASSNAME}
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
