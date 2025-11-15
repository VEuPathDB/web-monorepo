import { orderBy, uniq, ListIteratee } from 'lodash';
import React, {
  useMemo,
  useState,
  useCallback,
  FC,
  ReactNode,
  FormEvent,
} from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import Icon from '../../Components/Icon/IconAlt';
import { Mesa } from '@veupathdb/coreui/lib/components/Mesa';
import { MesaStateProps } from '@veupathdb/coreui/lib/components/Mesa/types';
import Dialog from '../../Components/Overlays/Dialog';
import { wrappable } from '../../Utils/ComponentUtils';
import AttributeSelector from '../../Views/Answer/AnswerAttributeSelector';
import AnswerFilter from '../../Views/Answer/AnswerFilter';
import AnswerTableCell from '../../Views/Answer/AnswerTableCell';
import '../../Views/Answer/wdk-Answer.scss';
import {
  AttributeField,
  RecordClass,
  RecordInstance,
  Question,
  AttributeValue,
  LinkAttributeValue,
} from '../../Utils/WdkModel';
import { DisplayInfo, Sorting } from '../../Actions/AnswerActions';

interface TableAction {
  key: string;
  display: ReactNode;
}

interface CellContentProps {
  value: AttributeValue;
  attribute: AttributeField;
  record: RecordInstance;
  recordClass: RecordClass;
}

interface RenderCellProps extends CellContentProps {
  CellContent: React.ComponentType<CellContentProps>;
}

interface RowClassNameProps {
  record: RecordInstance;
  recordClass: RecordClass;
}

interface AnswerProps extends RouteComponentProps {
  question: Question;
  recordClass: RecordClass;
  displayInfo: DisplayInfo;
  meta: {
    totalCount: number;
    responseCount: number;
  };
  records: RecordInstance[];
  allAttributes: AttributeField[];
  visibleAttributes: AttributeField[];
  onSort: (sorting: Sorting[]) => void;
  onMoveColumn: (columnName: string, newIndex: number) => void;
  onChangeColumns: (attributes: AttributeField[]) => void;
  renderCellContent?: (props: RenderCellProps) => ReactNode;
  deriveRowClassName?: (props: RowClassNameProps) => string | undefined;
  customSortBys?: Record<string, ListIteratee<RecordInstance>[]>;
  additionalActions?: TableAction[];
  useStickyFirstNColumns?: number;
}

const Answer: FC<AnswerProps> = (props) => {
  const { question, recordClass, displayInfo, additionalActions } = props;

  const tableState = useTableState(props);

  return (
    <div className="wdk-AnswerContainer">
      <h1 className="wdk-AnswerHeader">
        {displayInfo.customName || question.displayName}
      </h1>
      <div className="wdk-AnswerDescription">{recordClass.description}</div>
      <div className="wdk-Answer">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <AnswerFilter {...(props as any)} />
          <AnswerCount {...(props as any)} />
          <div style={{ flex: 1, textAlign: 'right' }}>
            {additionalActions?.map(({ key, display }) => (
              <React.Fragment key={key}>{display}</React.Fragment>
            ))}
            <AttributePopup {...(props as any)} />
          </div>
        </div>
        <Mesa state={tableState} />
      </div>
    </div>
  );
};

interface AnswerCountProps {
  recordClass: RecordClass;
  meta: {
    totalCount: number;
    responseCount: number;
  };
  records: RecordInstance[];
  displayInfo: DisplayInfo;
}

const AnswerCount: FC<AnswerCountProps> = (props) => {
  const { recordClass, meta, records, displayInfo } = props;
  const { displayNamePlural } = recordClass;
  const { pagination } = displayInfo;
  const { offset, numRecords } = pagination;
  const { totalCount, responseCount } = meta;
  const first = offset + 1;
  const last = Math.min(offset + numRecords, responseCount, records.length);
  const countPhrase = !records.length
    ? 0
    : `${first} - ${last} of ${totalCount}`;

  return (
    <p className="wdk-Answer-count">
      Showing {countPhrase} {displayNamePlural}
    </p>
  );
};

interface AttributePopupProps {
  allAttributes: AttributeField[];
  visibleAttributes: AttributeField[];
  onChangeColumns: (attributes: AttributeField[]) => void;
}

const AttributePopup: FC<AttributePopupProps> = (props) => {
  const { allAttributes, visibleAttributes, onChangeColumns } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>(
    visibleAttributes.map((attr) => attr.name)
  );
  const handleClose = useCallback(() => setIsOpen(false), [setIsOpen]);
  const handleAttributeSelectorSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const nextVisibleAttributes = selectedAttributes
        .map((attrName) => allAttributes.find((attr) => attr.name === attrName))
        .filter((attr): attr is AttributeField => attr !== undefined);
      onChangeColumns(nextVisibleAttributes);
      setIsOpen(false);
    },
    [allAttributes, onChangeColumns, selectedAttributes, setIsOpen]
  );
  const toggleSelectedAttribute = useCallback(
    (attributeName: string, isVisible: boolean) => {
      const nextSelectedAttributes = isVisible
        ? uniq([...selectedAttributes, attributeName])
        : selectedAttributes.filter((attrName) => attrName !== attributeName);
      setSelectedAttributes(nextSelectedAttributes);
    },
    [selectedAttributes, setSelectedAttributes]
  );
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
        onClose={handleClose}
      >
        <AttributeSelector
          allAttributes={allAttributes}
          onChange={toggleSelectedAttribute}
          onSubmit={handleAttributeSelectorSubmit}
          selectedAttributes={selectedAttributes}
        />
      </Dialog>
    </>
  );
};

interface MesaColumn {
  key: string;
  helpText?: string;
  name: string;
  sortable: boolean;
  primary: boolean;
  moveable: boolean;
  renderCell: (cellData: { row: RecordInstance }) => ReactNode;
}

interface MesaOptions {
  useStickyFirstNColumns?: number;
  deriveRowClassName?: (record: RecordInstance) => string | undefined;
  [key: string]: any;
}

interface MesaUIState {
  sort: {
    columnKey: string | null;
    direction: string;
  } | null;
}

interface MesaEventHandlers {
  onSort: (column: { key: string }, direction: string) => void;
  onColumnReorder: (colKey: string, newIndex: number) => void;
}

function useTableState(props: AnswerProps) {
  const {
    records,
    onSort,
    recordClass,
    onMoveColumn,
    visibleAttributes,
    displayInfo,
    renderCellContent,
    deriveRowClassName,
    customSortBys = {},
    useStickyFirstNColumns,
  } = props;

  const columns = useMemo(
    () =>
      visibleAttributes.map((attribute): MesaColumn => {
        return {
          key: attribute.name,
          helpText: attribute.help,
          name: attribute.displayName,
          sortable: attribute.isSortable,
          primary: attribute.isPrimary ?? false,
          moveable: true,
          renderCell: ({ row: record }) => {
            const cellProps: CellContentProps = {
              attribute,
              record,
              recordClass,
              value: record.attributes[attribute.name],
            };
            if (renderCellContent)
              return renderCellContent({
                ...cellProps,
                CellContent: AnswerTableCell,
              });
            return <AnswerTableCell {...cellProps} />;
          },
        };
      }),
    [renderCellContent, visibleAttributes, recordClass]
  );

  const options = useMemo(
    () => ({
      useStickyHeader: true,
      useStickyFirstNColumns,
      tableBodyMaxHeight: '70vh',
      deriveRowClassName:
        deriveRowClassName &&
        ((record: RecordInstance) =>
          deriveRowClassName({ recordClass, record })),
    }),
    [deriveRowClassName, useStickyFirstNColumns, recordClass]
  );

  const { sorting } = displayInfo;

  const uiState = useMemo(
    () => ({
      sort:
        !sorting.length || !sorting[0].attributeName
          ? undefined
          : {
              columnKey: sorting[0].attributeName,
              direction:
                (sorting[0].direction.toLowerCase() as 'asc' | 'desc') || 'asc',
            },
    }),
    [sorting]
  );

  const rows = useMemo(() => {
    const sortingAttribute = visibleAttributes.find(
      (attribute) => attribute.name === sorting[0]?.attributeName
    );
    const sortKeys = makeSortKeys(
      sortingAttribute ? sortingAttribute : visibleAttributes[0],
      customSortBys
    );
    const sortDirections = sortKeys.map(
      (_) => sorting[0]?.direction.toLowerCase() || 'asc'
    ) as ('asc' | 'desc')[];
    return orderBy(records, sortKeys, sortDirections);
  }, [records, sorting, visibleAttributes, customSortBys]);

  const eventHandlers = useMemo(
    () => ({
      onSort({ key }: { key: string }, direction: string) {
        onSort([
          { attributeName: key, direction: direction as 'ASC' | 'DESC' },
        ]);
      },
      onColumnReorder: (colKey: string, newIndex: number) => {
        const currentIndex = columns.findIndex((col) => col.key === colKey);
        if (currentIndex < 0) return;
        if (newIndex < currentIndex) newIndex++;
        onMoveColumn(colKey, newIndex);
      },
    }),
    [columns, onMoveColumn, onSort]
  );

  const headerWrapperStyle = { zIndex: 2 };

  return useMemo(
    (): MesaStateProps<RecordInstance, string> => ({
      rows,
      columns,
      options,
      uiState,
      eventHandlers,
      headerWrapperStyle,
    }),
    [rows, columns, options, uiState, eventHandlers]
  );
}

function makeSortKeys(
  sortingAttribute: AttributeField,
  customSortBys: Record<string, ListIteratee<RecordInstance>[]> = {}
): ListIteratee<RecordInstance>[] {
  if (customSortBys[sortingAttribute.name] != null) {
    return customSortBys[sortingAttribute.name];
  } else if (sortingAttribute.type === 'number') {
    return [
      (record: RecordInstance) =>
        castValue(
          record.attributes[sortingAttribute.name] &&
            typeof record.attributes[sortingAttribute.name] === 'string'
            ? (record.attributes[sortingAttribute.name] as string).replace(
                /,/g,
                ''
              )
            : record.attributes[sortingAttribute.name]
        ),
    ];
  } else if (sortingAttribute.type === 'link') {
    return [
      (record: RecordInstance) => {
        const attrValue = record.attributes[sortingAttribute.name];
        return castValue(
          attrValue &&
            typeof attrValue === 'object' &&
            attrValue !== null &&
            'displayText' in attrValue
            ? (attrValue as LinkAttributeValue).displayText
            : attrValue
        );
      },
    ];
  } else {
    return [
      (record: RecordInstance) => {
        const attrValue = record.attributes[sortingAttribute.name];
        if (attrValue === null) {
          // return a string from the smallest UTF-16
          return String.fromCharCode(0);
        } else if (typeof attrValue === 'string') {
          // compare strings as lowercase to normalize the sorting behavior
          return attrValue.toLowerCase();
        } else {
          return attrValue;
        }
      },
    ];
  }
}

function castValue(
  value: AttributeValue | string | null | undefined
): number | string {
  if (value == null) return Number.NEGATIVE_INFINITY;
  const stringValue = typeof value === 'string' ? value : String(value);
  const numberValue = Number(stringValue);
  return Number.isNaN(numberValue) ? stringValue : numberValue;
}

export default wrappable(withRouter(Answer));
