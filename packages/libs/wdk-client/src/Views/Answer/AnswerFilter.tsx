import { debounce } from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import { HelpTrigger } from '@veupathdb/coreui/lib/components/Mesa';
import { Tooltip } from '@veupathdb/coreui';
import { wrappable } from '../../Utils/ComponentUtils';
import {
  RecordClass,
  Question,
  AttributeField,
  TableField,
} from '../../Utils/WdkModel';
import { DisplayInfo } from '../../Actions/AnswerActions';
import AnswerFilterSelector from '../../Views/Answer/AnswerFilterSelector';

// concatenate each item in items with arr
function addToArray(arr: string[], item: string): string[] {
  return arr.concat(item);
}

function removeFromArray(arr: string[], item: string): string[] {
  return arr.filter(function (a) {
    return a !== item;
  });
}

interface AnswerFilterProps {
  recordClass: RecordClass;
  question: Question;
  filterTerm: string;
  displayInfo: DisplayInfo;
  filterAttributes: string[];
  filterTables: string[];
  onFilter: (
    filterTerm: string,
    filterAttributes: string[],
    filterTables: string[]
  ) => void;
}

interface AnswerFilterState {
  showFilterFieldSelector: boolean;
  filterAttributes: string[];
  filterTables: string[];
}

class AnswerFilter extends React.Component<
  AnswerFilterProps,
  AnswerFilterState
> {
  filterInputRef: React.RefObject<HTMLInputElement>;

  constructor(props: AnswerFilterProps) {
    super(props);

    this.filterInputRef = React.createRef();
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

  componentDidUpdate(
    prevProps: AnswerFilterProps,
    prevState: AnswerFilterState
  ): void {
    let { filterAttributes, filterTables } = this.state;
    if (
      filterAttributes !== prevState.filterAttributes ||
      filterTables !== prevState.filterTables
    ) {
      this.handleFilter();
    }
  }

  toggleFilterFieldSelector(): void {
    this.setState({
      showFilterFieldSelector: !this.state.showFilterFieldSelector,
    });
  }

  handleFilter(): void {
    const inputElement = this.filterInputRef.current;
    if (!inputElement) return;

    let value = inputElement.value;
    let { filterAttributes, filterTables } = this.state;
    this.props.onFilter(value, filterAttributes, filterTables);
  }

  toggleAttribute(e: React.ChangeEvent<HTMLInputElement>): void {
    let attr = e.target.value;
    let op = e.target.checked ? addToArray : removeFromArray;
    this.setState({
      filterAttributes: op(this.state.filterAttributes, attr),
    });
  }

  toggleTable(e: React.ChangeEvent<HTMLInputElement>): void {
    let table = e.target.value;
    let op = e.target.checked ? addToArray : removeFromArray;
    this.setState({
      filterTables: op(this.state.filterTables, table),
    });
  }

  selectAll(e: React.MouseEvent<HTMLAnchorElement>): void {
    let { attributes, tables } = this.props.recordClass;
    this.setState({
      filterAttributes: attributes.map((a: AttributeField) => a.name),
      filterTables: tables.map((t: TableField) => t.name),
    });
    e.preventDefault();
  }

  clearAll(e: React.MouseEvent<HTMLAnchorElement>): void {
    this.setState({ filterAttributes: [], filterTables: [] });
    e.preventDefault();
  }

  render(): React.ReactNode {
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
      .filter((attr: AttributeField) =>
        displayInfo.attributes.includes(attr.name)
      );
    let tables = recordClass.tables.filter((table: TableField) =>
      displayInfo.tables.includes(table.name)
    );

    return (
      <div className="wdk-Answer-filter">
        <input
          ref={this.filterInputRef}
          className="wdk-Answer-filterInput"
          defaultValue={filterTerm}
          placeholder={`Search ${displayNamePlural}`}
          onChange={this.handleFilter}
        />
        <Tooltip title="Show search fields">
          <button
            className="fa fa-caret-down wdk-Answer-filterSelectFieldsIcon"
            onClick={(e) => {
              e.stopPropagation();
              this.toggleFilterFieldSelector();
            }}
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
