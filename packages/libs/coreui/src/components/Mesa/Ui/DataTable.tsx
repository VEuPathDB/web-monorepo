import React, { CSSProperties } from 'react';

import { isEqual, sum } from 'lodash';

import HeadingRow from './HeadingRow';
import DataRowList from './DataRowList';
import { makeClassifier, combineWidths } from '../Utils/Utils';
import { MesaStateProps, MesaColumn } from '../types';

const dataTableClass = makeClassifier('DataTable');

interface DataTableProps<Row> extends MesaStateProps<Row> {}

interface DataTableState {
  dynamicWidths?: number[] | null;
}

class DataTable<Row> extends React.Component<
  DataTableProps<Row>,
  DataTableState
> {
  widthCache: number[] = [];
  resizeId: number = -1;
  mainRef: HTMLDivElement | null = null;
  contentTable: HTMLTableElement | null = null;
  cachedWidth?: number;

  constructor(props: DataTableProps<Row>) {
    super(props);
    this.widthCache = [];
    this.renderStickyTable = this.renderStickyTable.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.hasSelectionColumn = this.hasSelectionColumn.bind(this);
    this.hasExpansionColumn = this.hasExpansionColumn.bind(this);
    this.shouldUseStickyHeader = this.shouldUseStickyHeader.bind(this);
    this.makeFirstNColumnsSticky = this.makeFirstNColumnsSticky.bind(this);
    this.setDynamicWidths = this.setDynamicWidths.bind(this);
    this.resizeId = -1;
    this.mainRef = null;
  }

  shouldUseStickyHeader(): boolean {
    const { options } = this.props;
    if (!options || !options.useStickyHeader) return false;
    if (!options.tableBodyMaxHeight)
      return console.error(`
      "useStickyHeader" option enabled but no maxHeight for the table is set.
      Use a css height as the "tableBodyMaxHeight" option to use this setting.
    `) as any;
    return true;
  }

  makeFirstNColumnsSticky(
    columns: MesaColumn<Row>[],
    n: number
  ): MesaColumn<Row>[] {
    const dynamicWidths = this.widthCache;

    if (n <= columns.length) {
      const stickyColumns = columns.slice(0, n).map((column, index) => {
        const leftOffset = dynamicWidths
          ? sum(dynamicWidths.slice(0, index))
          : 0;

        return {
          ...column,
          moveable: false,
          headingStyle: {
            ...column.headingStyle,
            position: 'sticky' as const,
            left: `${leftOffset}px`,
            zIndex: 2,
          },
          style: {
            ...column.style,
            position: 'sticky' as const,
            left: `${leftOffset}px`,
            zIndex: 1,
          },
          className: `${column.className || ''} StickyColumnCell`,
        };
      });

      return [...stickyColumns, ...columns.slice(n)];
    }

    return columns;
  }

  componentDidMount(): void {
    this.setDynamicWidths();
    this.attachLoadEventHandlers();
    this.attachResizeHandler();
  }

  componentDidUpdate(prevProps: DataTableProps<Row>): void {
    if (
      this.props.columns.map((c) => c.name).toString() !==
        prevProps.columns.map((c) => c.name).toString() ||
      !isEqual(this.props.uiState, prevProps.uiState)
    ) {
      this.setDynamicWidths();
      this.attachLoadEventHandlers();
    }
  }

  componentWillUnmount(): void {
    this.removeResizeHandler();
  }

  attachLoadEventHandlers(): void {
    if (this.contentTable == null) return;
    this.contentTable
      .querySelectorAll('img, iframe, object')
      .forEach((node) => {
        if ((node as HTMLImageElement).complete) return;
        node.addEventListener('load', (event) => {
          const el = (event.target as HTMLElement).offsetParent || event.target;
          if ((el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth)
            this.setDynamicWidths();
        });
      });
  }

  attachResizeHandler(): void {
    this.resizeId = setInterval(() => {
      if (this.mainRef == null || this.cachedWidth === this.mainRef.clientWidth)
        return;
      this.setDynamicWidths();
      this.cachedWidth = this.mainRef.clientWidth;
    }, 250) as any;
  }

  removeResizeHandler(): void {
    clearInterval(this.resizeId);
  }

  setDynamicWidths(): void {
    // noop if rows or filteredRows is empty
    if (
      this.props.rows.length === 0 ||
      (this.props.filteredRows && this.props.filteredRows.length === 0)
    )
      return;

    this.setState({ dynamicWidths: null }, () => {
      this.widthCache = [];
      const { contentTable } = this;
      if (!contentTable) return;
      const contentCells = Array.from(
        contentTable.querySelectorAll('tbody > tr:first-child > td')
      );

      if (contentCells.length === 0) {
        return;
      }

      this.widthCache = contentCells.map(
        (cell) => cell.getBoundingClientRect().width
      );
    });
  }

  hasExpansionColumn(): boolean {
    const { options, eventHandlers } = this.props;
    if (!options || !eventHandlers) return false;
    return (
      typeof options.childRow === 'function' &&
      typeof eventHandlers.onExpandedRowsChange === 'function'
    );
  }

  hasSelectionColumn(): boolean {
    const { options, eventHandlers } = this.props;
    if (!options || !eventHandlers) return false;
    return (
      typeof options.isRowSelected === 'function' &&
      typeof eventHandlers.onRowSelect === 'function' &&
      typeof eventHandlers.onRowDeselect === 'function'
    );
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  renderStickyTable() {
    const {
      options,
      columns,
      rows,
      filteredRows,
      actions,
      eventHandlers,
      uiState,
      headerWrapperStyle,
    } = this.props;
    const newColumns =
      options && options.useStickyFirstNColumns
        ? this.makeFirstNColumnsSticky(columns, options.useStickyFirstNColumns)
        : columns;
    const wrapperStyle: CSSProperties = {
      maxHeight: options ? options.tableBodyMaxHeight : undefined,
    };
    const tableStyle: CSSProperties = {
      tableLayout: 'auto',
    };
    const tableProps = {
      options,
      rows,
      filteredRows,
      actions,
      eventHandlers,
      uiState,
      columns: newColumns,
    };
    return (
      <div ref={(node) => (this.mainRef = node)} className="MesaComponent">
        <div
          className={dataTableClass(
            undefined,
            [
              options && options.useStickyHeader ? 'Sticky' : undefined,
              options && options.marginContent ? 'HasMargin' : undefined,
            ].filter((x): x is string => x !== undefined)
          )}
          style={wrapperStyle}
        >
          <table
            cellSpacing={0}
            cellPadding={0}
            style={tableStyle}
            ref={(node) => (this.contentTable = node)}
          >
            <HeadingRow {...(tableProps as any)} />
            <DataRowList {...tableProps} />
          </table>
          {this.props.options && this.props.options.marginContent && (
            <div className={dataTableClass('Margin')}>
              {this.props.options.marginContent}
            </div>
          )}
        </div>
      </div>
    );
  }

  render() {
    return this.renderStickyTable();
  }
}

export default DataTable;
