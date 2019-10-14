import React from 'react';
import { withRouter } from 'react-router';
import Icon from 'wdk-client/Components/Icon/IconAlt';
import { Mesa, MesaState } from 'wdk-client/Components/Mesa';
import Dialog from 'wdk-client/Components/Overlays/Dialog';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import AttributeSelector from 'wdk-client/Views/Answer/AnswerAttributeSelector';
import AnswerFilter from 'wdk-client/Views/Answer/AnswerFilter';
import AnswerTableCell from 'wdk-client/Views/Answer/AnswerTableCell';
import 'wdk-client/Views/Answer/wdk-Answer.scss';
import { orderBy } from 'lodash';


class Answer extends React.Component {
  constructor(props) {
    super(props);
    this.getTableState = this.getTableState.bind(this);
    this.createRecordUrl = this.createRecordUrl.bind(this);
    this.renderAnswerCount = this.renderAnswerCount.bind(this);
    this.renderAttributePopup = this.renderAttributePopup.bind(this);
    this.openAttributeSelector = this.openAttributeSelector.bind(this);
    this.closeAttributeSelector = this.closeAttributeSelector.bind(this);
    this.togglePendingAttribute = this.togglePendingAttribute.bind(this);
    this.handleAttributeSelectorSubmit = this.handleAttributeSelectorSubmit.bind(this);

    const { visibleAttributes } = props;

    this.state = {
      attributeSelectorOpen: false,
      pendingVisibleAttributes: visibleAttributes,
    };
  }

  openAttributeSelector () {
    const attributeSelectorOpen = true;
    this.setState({ attributeSelectorOpen });
  }

  closeAttributeSelector () {
    const { visibleAttributes } = this.props;
    const attributeSelectorOpen = false;
    const pendingVisibleAttributes = visibleAttributes;
    this.setState({ attributeSelectorOpen, pendingVisibleAttributes });
  }

  togglePendingAttribute (attributeName, isVisible) {
    const { allAttributes } = this.props;
    const currentlyVisible = this.state.pendingVisibleAttributes;
    const pendingAttributeNames = currentlyVisible.map(({ name }) => name);
    const pendingVisibleAttributes = allAttributes.filter(({ name }) => {
      return name === attributeName
        ? isVisible
        : pendingAttributeNames.includes(name)
    });
    this.setState({ pendingVisibleAttributes });
  }

  handleAttributeSelectorSubmit (event) {
    event.preventDefault();
    event.stopPropagation();
    const { onChangeColumns } = this.props;
    const { pendingVisibleAttributes } = this.state;
    const attributeSelectorOpen = false;
    onChangeColumns(pendingVisibleAttributes);
    this.setState({ attributeSelectorOpen });
  }

  createRecordUrl ({ id }) {
    const { recordClass, history } = this.props;
    const { urlSegment } = recordClass;
    const pathname = `/record/${urlSegment}/${id.map(_id => _id.value).join('/')}`;
    return history.createHref({ pathname });
  }

  renderAnswerCount () {
    const { recordClass, meta, records, displayInfo } = this.props;
    const { displayNamePlural } = recordClass;
    const { pagination } = displayInfo;
    const { offset, numRecords } = pagination;
    const { totalCount, responseCount } = meta;
    const first = offset + 1;
    const last = Math.min(offset + numRecords, responseCount, records.length);
    const countPhrase = !records.length ? 0 : `${first} - ${last} of ${totalCount}`;

    return (
      <p className="wdk-Answer-count">
        Showing {countPhrase} {displayNamePlural}
      </p>
    );
  }

  renderAttributePopup () {
    const { allAttributes } = this.props;
    const { attributeSelectorOpen, pendingVisibleAttributes } = this.state;
    const { closeAttributeSelector, handleAttributeSelectorSubmit, togglePendingAttribute } = this;
    return (
      <Dialog
        modal={true}
        title="Select Columns"
        open={attributeSelectorOpen}
        onClose={closeAttributeSelector}>
        <AttributeSelector
          allAttributes={allAttributes}
          onChange={togglePendingAttribute}
          onSubmit={handleAttributeSelectorSubmit}
          selectedAttributes={pendingVisibleAttributes}
        />
      </Dialog>
    );
  }

  getTableState () {
    const { records, onSort, recordClass, onMoveColumn, visibleAttributes, displayInfo } = this.props;
    const { sorting } = displayInfo;

    const options = {
      useStickyHeader: true,
      tableBodyMaxHeight: 'calc(100vh - 120px)'
    };

    const uiState = {
      sort: !sorting.length ? null : {
        columnKey: sorting[0].attributeName ? sorting[0].attributeName : null,
        direction: sorting[0].direction.toLowerCase() || 'asc'
      }
    };

    let sortingAttribute = visibleAttributes.find( attribute => attribute.name === sorting[0].attributeName )
    const rows = orderBy( records, 
                          [record => sortingAttribute.type === 'link' ? record.attributes[sortingAttribute.name].displayText : record.attributes[sortingAttribute.name]],
                          sorting[0].direction.toLowerCase() || 'asc' )

    const columns = visibleAttributes.map((attribute) => {
      return {
        key: attribute.name,
        helpText: attribute.help,
        name: attribute.displayName,
        sortable: attribute.isSortable,
        primary: attribute.isPrimary,
        moveable: true,
        renderCell: ({ row }) => {
          return (
            <AnswerTableCell
              value = {row.attributes[attribute.name]}
              descriptor = {attribute}
              record = {row}
              recordClass= {recordClass}
            />
          )
        } 
      }
    });


    const eventHandlers = {
      onSort ({ key }, direction) { onSort([{ attributeName: key, direction }]); },
      onColumnReorder: (colKey, newIndex) => {
	const currentIndex = columns.findIndex(col => col.key === colKey);
	if (currentIndex < 0) return;
	if (newIndex < currentIndex) newIndex++;
        onMoveColumn(colKey, newIndex);
      }
    };

    return MesaState.create({ rows, columns, options, uiState, eventHandlers });
  }

  render () {
    const { question, recordClass, displayInfo } = this.props;

    const TableState = this.getTableState();
    const AnswerCount = this.renderAnswerCount;
    const AttributePopup = this.renderAttributePopup;

    return (
      <div className="wdk-AnswerContainer">
        <h1 className="wdk-AnswerHeader">
          {displayInfo.customName || question.displayName}
        </h1>
        <div className="wdk-AnswerDescription">
          {recordClass.description}
        </div>
        <div className="wdk-Answer">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <AnswerFilter {...this.props}/>
            <AnswerCount />
            <AttributePopup />
            <div style={{ flex: 1, textAlign: 'right' }}>
              <button className="btn" onClick={this.openAttributeSelector}>
                <Icon fa="plus-circle" />
                Add / Remove Columns
              </button>
            </div>
          </div>
          <Mesa state={TableState} />
        </div>
      </div>
    );
  }
}

export default wrappable(withRouter(Answer));
