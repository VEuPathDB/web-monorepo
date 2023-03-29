import { pick, property } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router';
import DataTable from '../../Components/DataTable/DataTable';
import Dialog from '../../Components/Overlays/Dialog';
import { wrappable } from '../../Utils/ComponentUtils';

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

function AttributeSelector(props) {
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

class AnswerTable extends React.Component {
  constructor(props) {
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

  componentWillReceiveProps(nextProps) {
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

  handleSort(datatableSorting) {
    this.props.onSort(
      datatableSorting.map((entry) => ({
        attributeName: entry.name,
        direction: entry.direction,
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

  handleAttributeSelectorSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.onChangeColumns(this.state.pendingVisibleAttributes);
    this.setState({
      attributeSelectorOpen: false,
    });
  }

  /**
   * Filter unchecked checkboxes and map to attributes
   */
  togglePendingAttribute(attributeName, isVisible) {
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

AnswerTable.propTypes = {
  meta: PropTypes.object.isRequired,
  displayInfo: PropTypes.object.isRequired,
  records: PropTypes.array.isRequired,
  recordClass: PropTypes.object.isRequired,
  allAttributes: PropTypes.array.isRequired,
  visibleAttributes: PropTypes.array.isRequired,
  height: PropTypes.number.isRequired,
  history: PropTypes.object.isRequired,
  onSort: PropTypes.func,
  onMoveColumn: PropTypes.func,
  onChangeColumns: PropTypes.func,
  onNewPage: PropTypes.func,
  onRecordClick: PropTypes.func,
};

AnswerTable.defaultProps = {
  onSort: noop,
  onMoveColumn: noop,
  onChangeColumns: noop,
  onNewPage: noop,
  onRecordClick: noop,
};

export default wrappable(withRouter(AnswerTable));

/** Convert records array to DataTable format */
function getDataFromRecords(records, recordClass, history) {
  let attributeNames = recordClass.attributes
    .filter((attr) => attr.isDisplayable)
    .map((attr) => attr.name);

  return records.map((record) => {
    let trimmedAttrs = pick(record.attributes, attributeNames);
    let recordUrl = history.createHref({
      pathname: `/record/${recordClass.urlSegment}/${record.id
        .map(property('value'))
        .join('/')}`,
    });
    trimmedAttrs.primary_key = `<a href="${recordUrl}">${trimmedAttrs.primary_key}</a>`;
    return trimmedAttrs;
  });
}

/** Convert sorting to DataTable format */
function getDataTableSorting(wdkSorting) {
  return wdkSorting.map((entry) => ({
    name: entry.attributeName,
    direction: entry.direction,
  }));
}

/** Convert attributes to DataTable format */
function setVisibilityFlag(attributes, visibleAttributes) {
  let visibleSet = new Set(visibleAttributes);
  return attributes
    .filter((attr) => attr.isDisplayable)
    .map((attr) =>
      Object.assign({}, attr, {
        isDisplayable: visibleSet.has(attr),
      })
    );
}
