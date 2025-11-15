import { pick, property } from 'lodash';
import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import DataTable from '../../Components/DataTable/DataTable';
import Dialog from '../../Components/Overlays/Dialog';
import { wrappable } from '../../Utils/ComponentUtils';
import {
  AttributeField,
  RecordClass,
  RecordInstance,
} from '../../Utils/WdkModel';
import { DisplayInfo, Sorting } from '../../Actions/AnswerActions';
import { History, Location } from 'history';

/**
 * Generic table with UI features:
 *
 *   - Sort columns
 *   - Move columns
 *   - Show/Hide columns
 *   - Paging
 *
 *
 * NB: A View-Controller will need to pass handlers to this component:
 *
 *   - onSort(columnName: string, direction: string(asc|desc))
 *   - onMoveColumn(columnName: string, newPosition: number)
 *   - onShowColumns(columnNames: Array<string>)
 *   - onHideColumns(columnNames: Array<string>)
 *   - onNewPage(offset: number, numRecords: number)
 */

/**
 * Function that doesn't do anything. This is the default for many
 * optional handlers. We can do an equality check as a form of feature
 * detection. E.g., if onSort === noop, then we won't enable sorting.
 */
function noop() {}

interface AttributeSelectorProps {
  allAttributes: AttributeField[];
  selectedAttributes: AttributeField[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (attributeName: string, isVisible: boolean) => void;
}

function AttributeSelector(props: AttributeSelectorProps) {
  return (
    <form onSubmit={props.onSubmit}>
      <div className="wdk-AnswerTable-AttributeSelectorButtonWrapper">
        <button>Update Columns</button>
      </div>
      <ul className="wdk-AnswerTable-AttributeSelector">
        {props.allAttributes
          .filter((attrib) => attrib.isDisplayable)
          .map((attribute) => {
            return (
              <li key={attribute.name}>
                <input
                  type="checkbox"
                  id={'column-select-' + attribute.name}
                  name="pendingAttribute"
                  value={attribute.name}
                  disabled={!attribute.isRemovable}
                  checked={props.selectedAttributes.includes(attribute)}
                  onChange={(e) =>
                    props.onChange(e.target.value, e.target.checked)
                  }
                />
                <label htmlFor={'column-select-' + attribute.name}>
                  {' '}
                  {attribute.displayName}{' '}
                </label>
              </li>
            );
          })}
      </ul>
      <div className="wdk-AnswerTable-AttributeSelectorButtonWrapper">
        <button>Update Columns</button>
      </div>
    </form>
  );
}

interface AnswerTableProps extends RouteComponentProps {
  meta: any;
  displayInfo: DisplayInfo;
  records: RecordInstance[];
  recordClass: RecordClass;
  allAttributes: AttributeField[];
  visibleAttributes: AttributeField[];
  height: number;
  history: History;
  onSort?: (sorting: Sorting[]) => void;
  onMoveColumn?: (columnName: string, newPosition: number) => void;
  onChangeColumns?: (attributes: AttributeField[]) => void;
  onNewPage?: (offset: number, numRecords: number) => void;
  onRecordClick?: () => void;
}

interface DataTableColumn extends AttributeField {
  isDisplayable: boolean;
}

interface DataTableRow {
  [key: string]: any;
}

interface DataTableSortingEntry {
  name: string;
  direction: 'ASC' | 'DESC';
}

interface AnswerTableState {
  columns: DataTableColumn[];
  data: DataTableRow[];
  sorting: DataTableSortingEntry[];
  pendingVisibleAttributes: AttributeField[];
  attributeSelectorOpen: boolean;
}

class AnswerTable extends React.Component<AnswerTableProps, AnswerTableState> {
  constructor(props: AnswerTableProps) {
    super(props);
    this.handleSort = this.handleSort.bind(this);
    this.handleOpenAttributeSelectorClick =
      this.handleOpenAttributeSelectorClick.bind(this);
    this.handleAttributeSelectorClose =
      this.handleAttributeSelectorClose.bind(this);
    this.handleAttributeSelectorSubmit =
      this.handleAttributeSelectorSubmit.bind(this);
    this.togglePendingAttribute = this.togglePendingAttribute.bind(this);

    // If this is changed, be sure to update handleAttributeSelectorClose()
    this.state = Object.assign({}, this._getInitialAttributeSelectorState(), {
      columns: setVisibilityFlag(
        this.props.recordClass.attributes,
        this.props.visibleAttributes
      ),
      data: getDataFromRecords(
        this.props.records,
        this.props.recordClass,
        this.props.history
      ),
      sorting: getDataTableSorting(this.props.displayInfo.sorting),
    });
  }

  componentWillReceiveProps(nextProps: AnswerTableProps) {
    this.setState({
      pendingVisibleAttributes: nextProps.visibleAttributes,
    });
    if (this.props.records !== nextProps.records) {
      this.setState({
        data: getDataFromRecords(
          nextProps.records,
          nextProps.recordClass,
          nextProps.history
        ),
      });
    }
    if (this.props.visibleAttributes !== nextProps.visibleAttributes) {
      this.setState({
        columns: setVisibilityFlag(
          nextProps.recordClass.attributes,
          nextProps.visibleAttributes
        ),
      });
    }
    if (this.props.displayInfo.sorting !== nextProps.displayInfo.sorting) {
      this.setState({
        sorting: getDataTableSorting(nextProps.displayInfo.sorting),
      });
    }
  }

  handleSort(datatableSorting: DataTableSortingEntry[]) {
    const onSort = this.props.onSort || noop;
    onSort(
      datatableSorting.map((entry) => ({
        attributeName: entry.name,
        direction: entry.direction as 'ASC' | 'DESC',
      }))
    );
  }

  handleOpenAttributeSelectorClick() {
    this.setState({
      attributeSelectorOpen: !this.state.attributeSelectorOpen,
    });
  }

  handleAttributeSelectorClose() {
    this.setState(this._getInitialAttributeSelectorState());
  }

  handleAttributeSelectorSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    const onChangeColumns = this.props.onChangeColumns || noop;
    onChangeColumns(this.state.pendingVisibleAttributes);
    this.setState({
      attributeSelectorOpen: false,
    });
  }

  /**
   * Filter unchecked checkboxes and map to attributes
   */
  togglePendingAttribute(attributeName: string, isVisible: boolean) {
    let pending = new Set(
      this.state.pendingVisibleAttributes.map((attr) => attr.name)
    );

    let pendingVisibleAttributes = this.props.allAttributes.filter((attr) =>
      attr.name === attributeName ? isVisible : pending.has(attr.name)
    );

    this.setState({ pendingVisibleAttributes });
  }

  _getInitialAttributeSelectorState() {
    return {
      pendingVisibleAttributes: this.props.visibleAttributes,
      attributeSelectorOpen: false,
    };
  }

  render() {
    // creates variables: meta, records, and visibleAttributes
    let { pendingVisibleAttributes } = this.state;
    let { allAttributes } = this.props;

    return (
      <div className="wdk-AnswerTable">
        <p className="wdk-AnswerTable-AttributeSelectorOpenButton">
          <button onClick={this.handleOpenAttributeSelectorClick}>
            Add / Remove Columns
          </button>
        </p>

        <Dialog
          modal={true}
          open={this.state.attributeSelectorOpen}
          onClose={this.handleAttributeSelectorClose}
          title="Select Columns"
        >
          <AttributeSelector
            allAttributes={allAttributes}
            selectedAttributes={pendingVisibleAttributes}
            onSubmit={this.handleAttributeSelectorSubmit}
            onChange={this.togglePendingAttribute}
          />
        </Dialog>

        <DataTable
          columns={this.state.columns}
          data={this.state.data}
          searchable={false}
          width="100%"
          height={this.props.height}
          sorting={this.state.sorting}
          onSortingChange={this.handleSort}
        />
      </div>
    );
  }
}

AnswerTable.defaultProps = {
  onSort: noop,
  onMoveColumn: noop,
  onChangeColumns: noop,
  onNewPage: noop,
  onRecordClick: noop,
};

export default wrappable(withRouter(AnswerTable));

/** Convert records array to DataTable format */
function getDataFromRecords(
  records: RecordInstance[],
  recordClass: RecordClass,
  history: History
): DataTableRow[] {
  let attributeNames = recordClass.attributes
    .filter((attr) => attr.isDisplayable)
    .map((attr) => attr.name);

  return records.map((record) => {
    let trimmedAttrs = pick(record.attributes, attributeNames);
    let recordUrl = history.createHref({
      pathname: `/record/${recordClass.urlSegment}/${record.id
        .map(property('value'))
        .join('/')}`,
    } as Location);
    trimmedAttrs.primary_key = `<a href="${recordUrl}">${trimmedAttrs.primary_key}</a>`;
    return trimmedAttrs;
  });
}

/** Convert sorting to DataTable format */
function getDataTableSorting(wdkSorting: Sorting[]): DataTableSortingEntry[] {
  return wdkSorting.map((entry) => ({
    name: entry.attributeName,
    direction: entry.direction,
  }));
}

/** Convert attributes to DataTable format */
function setVisibilityFlag(
  attributes: AttributeField[],
  visibleAttributes: AttributeField[]
): DataTableColumn[] {
  let visibleSet = new Set(visibleAttributes);
  return attributes
    .filter((attr) => attr.isDisplayable)
    .map((attr) =>
      Object.assign({}, attr, {
        isDisplayable: visibleSet.has(attr),
      })
    );
}
