import { debounce } from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import { HelpTrigger } from '../../Components/Mesa';
import Tooltip from '../../Components/Overlays/Tooltip';
import { wrappable } from '../../Utils/ComponentUtils';
import AnswerFilterSelector from '../../Views/Answer/AnswerFilterSelector';

// concatenate each item in items with arr
function addToArray(arr, item) {
  return arr.concat(item);
}

function removeFromArray(arr, item) {
  return arr.filter(function (a) {
    return a !== item;
  });
}

class AnswerFilter extends React.Component {
  constructor(props) {
    super(props);

    this.toggleFilterFieldSelector = this.toggleFilterFieldSelector.bind(this);
    this.handleFilter = debounce(this.handleFilter.bind(this), 300);
    this.toggleAttribute = this.toggleAttribute.bind(this);
    this.toggleTable = this.toggleTable.bind(this);
    this.selectAll = this.selectAll.bind(this);
    this.clearAll = this.clearAll.bind(this);

    let { filterAttributes, filterTables } = this.props;
    this.state = {
      showFilterFieldSelector: false,
      filterAttributes,
      filterTables,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    let { filterAttributes, filterTables } = this.state;
    if (
      filterAttributes !== prevState.filterAttributes ||
      filterTables !== prevState.filterTables
    ) {
      this.handleFilter();
    }
  }

  toggleFilterFieldSelector(e) {
    e.stopPropagation();
    this.setState({
      showFilterFieldSelector: !this.state.showFilterFieldSelector,
    });
  }

  handleFilter() {
    let value = ReactDOM.findDOMNode(this.refs.filterInput).value;
    let { filterAttributes, filterTables } = this.state;
    this.props.onFilter(value, filterAttributes, filterTables);
  }

  toggleAttribute(e) {
    let attr = e.target.value;
    let op = e.target.checked ? addToArray : removeFromArray;
    this.setState({
      filterAttributes: op(this.state.filterAttributes, attr),
    });
  }

  toggleTable(e) {
    let table = e.target.value;
    let op = e.target.checked ? addToArray : removeFromArray;
    this.setState({
      filterTables: op(this.state.filterTables, table),
    });
  }

  selectAll(e) {
    let { attributes, tables } = this.props.recordClass;
    this.setState({
      filterAttributes: attributes.map((a) => a.name),
      filterTables: tables.map((t) => t.name),
    });
    e.preventDefault();
  }

  clearAll(e) {
    this.setState({ filterAttributes: [], filterTables: [] });
    e.preventDefault();
  }

  render() {
    let { filterAttributes, filterTables, showFilterFieldSelector } =
      this.state;
    let { recordClass, question, filterTerm, displayInfo } = this.props;
    let { displayNamePlural } = recordClass;
    let tooltipContent = (
      <div>
        <ul>
          <li>
            The data sets in your refined list will contain ALL your terms (or
            phrases, when using double quotes), in ANY of the selected fields.
          </li>
          <li>Click on the arrow inside the box to select/unselect fields. </li>
          <li>
            Your terms are matched at the start; for example, the term{' '}
            <i>typ</i> will match{' '}
            <i>
              <u>typ</u>ically
            </i>{' '}
            and{' '}
            <i>
              <u>typ</u>e
            </i>
            , but <strong>not</strong>{' '}
            <i>
              <u>atyp</u>ical
            </i>
            .
          </li>
          <li>
            Your terms may include * wildcards; for example, the term{' '}
            <i>*typ</i> will match{' '}
            <i>
              <u>typ</u>ically
            </i>
            ,{' '}
            <i>
              <u>typ</u>e
            </i>
            , and{' '}
            <i>
              a<u>typ</u>ical
            </i>
            .
          </li>
        </ul>
      </div>
    );
    let attributes = recordClass.attributes
      .concat(question.dynamicAttributes)
      .filter((attr) => displayInfo.attributes.includes(attr.name));
    let tables = recordClass.tables.filter((table) =>
      displayInfo.tables.includes(table.name)
    );

    return (
      <div className="wdk-Answer-filter">
        <input
          ref="filterInput"
          className="wdk-Answer-filterInput"
          defaultValue={filterTerm}
          placeholder={`Search ${displayNamePlural}`}
          onChange={this.handleFilter}
        />
        <Tooltip content="Show search fields">
          <button
            className="fa fa-caret-down wdk-Answer-filterSelectFieldsIcon"
            onClick={this.toggleFilterFieldSelector}
          />
        </Tooltip>
        <HelpTrigger>{tooltipContent}</HelpTrigger>
        <AnswerFilterSelector
          attributes={attributes}
          tables={tables}
          open={showFilterFieldSelector}
          onClose={this.toggleFilterFieldSelector}
          filterAttributes={filterAttributes}
          filterTables={filterTables}
          selectAll={this.selectAll}
          clearAll={this.clearAll}
          toggleAttribute={this.toggleAttribute}
          toggleTable={this.toggleTable}
        />
      </div>
    );
  }
}

export default wrappable(AnswerFilter);
