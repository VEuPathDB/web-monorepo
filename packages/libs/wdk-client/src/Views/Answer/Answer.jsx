import { orderBy, uniq } from 'lodash';
import React, { useMemo, useState, useCallback } from 'react';
import { withRouter } from 'react-router';
import Icon from 'wdk-client/Components/Icon/IconAlt';
import { Mesa, MesaState } from 'wdk-client/Components/Mesa';
import Dialog from 'wdk-client/Components/Overlays/Dialog';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import AttributeSelector from 'wdk-client/Views/Answer/AnswerAttributeSelector';
import AnswerFilter from 'wdk-client/Views/Answer/AnswerFilter';
import AnswerTableCell from 'wdk-client/Views/Answer/AnswerTableCell';
import 'wdk-client/Views/Answer/wdk-Answer.scss';

function Answer(props) {
  const { question, recordClass, displayInfo, additionalActions } = props;

  const tableState = useTableState(props);

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
          <AnswerFilter {...props}/>
          <AnswerCount {...props} />
          <div style={{ flex: 1, textAlign: 'right' }}>
            {additionalActions?.map(({ key, display }) =>
              <React.Fragment key={key}>
                {display}
              </React.Fragment>
            )}
            <AttributePopup {...props} />
          </div>
        </div>
        <Mesa state={tableState} />
      </div>
    </div>
  );
}

function AnswerCount(props) {
  const { recordClass, meta, records, displayInfo } = props;
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

function AttributePopup(props) {
  const { allAttributes, visibleAttributes, onChangeColumns } = props;
  const [ isOpen, setIsOpen ] = useState(false);
  const [ selectedAttributes, setSelectedAttributes ] = useState(visibleAttributes.map(attr => attr.name));
  const handleClose = useCallback(() => setIsOpen(false), [setIsOpen]);
  const handleAttributeSelectorSubmit = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    const nextVisibleAttributes = selectedAttributes.map(attrName => allAttributes.find(attr => attr.name === attrName));
    onChangeColumns(nextVisibleAttributes);
    setIsOpen(false);
  }, [allAttributes, onChangeColumns, selectedAttributes, setIsOpen]);
  const toggleSelectedAttribute = useCallback((attributeName, isVisible) => {
    const nextSelectedAttributes = isVisible
      ? uniq([ ...selectedAttributes, attributeName])
      : selectedAttributes.filter(attrName => attrName !== attributeName);
    setSelectedAttributes(nextSelectedAttributes);
  }, [selectedAttributes, setSelectedAttributes]);
  return (
    <>
      <button className="btn" onClick={() => setIsOpen(true)}>
        <Icon fa="plus-circle" />
        Add / Remove Columns
      </button>
      <Dialog
        modal={true}
        title="Select Columns"
        open={isOpen}
        onClose={handleClose}>
        <AttributeSelector
          allAttributes={allAttributes}
          onChange={toggleSelectedAttribute}
          onSubmit={handleAttributeSelectorSubmit}
          selectedAttributes={selectedAttributes}
        />
      </Dialog>
    </>
  );
}

function useTableState (props) {
  const { records, onSort, recordClass, onMoveColumn, visibleAttributes, displayInfo, renderCellContent, deriveRowClassName, customSortBys } = props;

  const columns = useMemo(() =>
    visibleAttributes.map((attribute) => {
      return {
        key: attribute.name,
        helpText: attribute.help,
        name: attribute.displayName,
        sortable: attribute.isSortable,
        primary: attribute.isPrimary,
        moveable: true,
        renderCell: ({ row: record }) => {
          const cellProps = {
            attribute,
            record,
            recordClass,
            value: record.attributes[attribute.name],
          };
          if (renderCellContent) return renderCellContent({ ...cellProps, CellContent: AnswerTableCell });
          return <AnswerTableCell {...cellProps}/>;
        } 
      };
    }
  ), [renderCellContent, visibleAttributes]);

  const options = useMemo(
    () => ({
      useStickyHeader: true,
      tableBodyMaxHeight: 'unset',
      deriveRowClassName: deriveRowClassName && (record => deriveRowClassName({ recordClass, record }))
    }),
    [ deriveRowClassName ]
  );

  const { sorting } = displayInfo;

  const uiState = useMemo(
    () => ({
      sort: !sorting.length ? null : {
        columnKey: sorting[0].attributeName ? sorting[0].attributeName : null,
        direction: sorting[0].direction.toLowerCase() || 'asc'
      }
    }),
    [ sorting ]
  );

  const rows = useMemo(() => {
    const sortingAttribute = visibleAttributes.find( attribute => attribute.name === sorting[0].attributeName )
    const sortKeys = makeSortKeys(sortingAttribute, customSortBys);
    const sortDirections = sortKeys.map(_ => sorting[0].direction.toLowerCase() || 'asc');

    return orderBy(records, sortKeys, sortDirections);
  }, [records, sorting, visibleAttributes, customSortBys]);

  const eventHandlers = useMemo(
    () => ({
      onSort ({ key }, direction) { onSort([{ attributeName: key, direction }]); },
      onColumnReorder: (colKey, newIndex) => {
        const currentIndex = columns.findIndex(col => col.key === colKey);
        if (currentIndex < 0) return;
        if (newIndex < currentIndex) newIndex++;
        onMoveColumn(colKey, newIndex);
      }
    }),
    [columns, onMoveColumn, onSort]
  );

  return useMemo(() =>
    MesaState.create({
      rows,
      columns,
      options,
      uiState,
      eventHandlers
    }),
    [rows, columns, options, uiState, eventHandlers]
  );
}

function makeSortKeys(sortingAttribute, customSortBys = {}) {
  if (customSortBys[sortingAttribute.name] != null) {
    return customSortBys[sortingAttribute.name];
  } else if (sortingAttribute.type === 'number') {
    return [
      record => castValue(
        record.attributes[sortingAttribute.name] &&
        record.attributes[sortingAttribute.name].replace(/,/g, '')
      )
    ];
  } else if (sortingAttribute.type === 'link') {
    return [
      record => castValue(
        record.attributes[sortingAttribute.name] &&
        record.attributes[sortingAttribute.name].displayText
      )
    ];
  } else {
    return [
      record => record.attributes[sortingAttribute.name]
    ];
  }
}

function castValue(value) {
  if (value == null) return value;
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
}

export default wrappable(withRouter(Answer));
