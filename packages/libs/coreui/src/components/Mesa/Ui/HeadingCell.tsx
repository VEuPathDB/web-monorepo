import React, { CSSProperties, ReactElement } from 'react';

import Templates from '../Templates';
import Icon from '../Components/Icon';
import HelpTrigger from '../Components/HelpTrigger';
import { makeClassifier } from '../Utils/Utils';
import Events, { EventsFactory } from '../Utils/Events';
import { MesaColumn, MesaSortObject, MesaStateProps } from '../types';

const headingCellClass = makeClassifier('HeadingCell');

interface HeadingCellProps<Row, Key = string> {
  sort?: MesaSortObject<Key extends string ? Key : string>;
  eventHandlers?: MesaStateProps<Row, Key>['eventHandlers'];
  column: MesaColumn<Row, Key>;
  columnIndex: number;
  primary?: boolean;
  headingRowIndex?: number;
  offsetLeft?: number;
}

interface HeadingCellState {
  offset: DOMRect | null;
  isDragging: boolean;
  isDragTarget: boolean;
}

class HeadingCell<Row, Key = string> extends React.PureComponent<
  HeadingCellProps<Row, Key>,
  HeadingCellState
> {
  private element?: HTMLTableCellElement;
  private listeners?: { [key: string]: string };

  constructor(props: HeadingCellProps<Row, Key>) {
    super(props);
    this.state = {
      offset: null,
      isDragging: false,
      isDragTarget: false,
    };

    this.getClassName = this.getClassName.bind(this);
    this.getDomEvents = this.getDomEvents.bind(this);
    this.sortColumn = this.sortColumn.bind(this);
    this.updateOffset = this.updateOffset.bind(this);
    this.renderContent = this.renderContent.bind(this);
    this.renderSortTrigger = this.renderSortTrigger.bind(this);
    this.renderHelpTrigger = this.renderHelpTrigger.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);

    this.onDrop = this.onDrop.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onDragExit = this.onDragExit.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
  }

  componentDidMount() {
    this.updateOffset();
    this.listeners = {
      scroll: Events.add('scroll', this.updateOffset),
      resize: Events.add('resize', this.updateOffset),
    };
  }

  componentWillUnmount() {
    if (this.listeners) {
      Object.values(this.listeners).forEach((listenerId) =>
        Events.remove(listenerId)
      );
    }
  }

  componentDidUpdate(prevProps: HeadingCellProps<Row, Key>) {
    if (
      prevProps.column !== this.props.column ||
      prevProps.column.width !== this.props.column.width
    ) {
      this.updateOffset();
    }
  }

  updateOffset() {
    const { element } = this;
    if (!element) return;
    const offset = element.getBoundingClientRect();
    this.setState({ offset });
  }

  sortColumn() {
    const { column, sort, eventHandlers } = this.props;
    const { onSort } = eventHandlers ?? {};
    if (typeof onSort !== 'function' || !column.sortable) return;
    const currentlySorting = sort && sort.columnKey === String(column.key);
    const direction =
      currentlySorting && sort.direction === 'asc' ? 'desc' : 'asc';
    return onSort(column, direction);
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  wrapContent(content: React.ReactNode = null) {
    const SortTrigger = this.renderSortTrigger;
    const HelpTrigger = this.renderHelpTrigger;
    const ClickBoundary = this.renderClickBoundary;
    return (
      <div className={headingCellClass('Content')}>
        <div className={headingCellClass(['Content', 'Aside'])}>
          <SortTrigger />
        </div>
        <div className={headingCellClass(['Content', 'Label'])}>{content}</div>
        <div className={headingCellClass(['Content', 'Aside'])}>
          <ClickBoundary>
            <HelpTrigger />
          </ClickBoundary>
        </div>
      </div>
    );
  }

  renderContent() {
    const { column, columnIndex, headingRowIndex } = this.props;
    const SortTrigger = this.renderSortTrigger;
    const HelpTrigger = this.renderHelpTrigger;
    const ClickBoundary = this.renderClickBoundary;

    if ('renderHeading' in column && column.renderHeading === false)
      return null;
    if (
      !('renderHeading' in column) ||
      typeof column.renderHeading !== 'function'
    )
      return this.wrapContent(Templates.heading({ key: column.key, column }));

    const content = column.renderHeading(column, columnIndex, {
      SortTrigger: (<SortTrigger />) as ReactElement,
      HelpTrigger: (<HelpTrigger />) as ReactElement,
      ClickBoundary: (<ClickBoundary children={null} />) as ReactElement,
    });
    const { wrapCustomHeadings } = column;
    const shouldWrap =
      wrapCustomHeadings && typeof wrapCustomHeadings === 'function'
        ? wrapCustomHeadings({
            column,
            columnIndex,
            headerRowIndex: headingRowIndex ?? 0,
          })
        : wrapCustomHeadings;

    return shouldWrap ? this.wrapContent(content) : content;
  }

  renderClickBoundary({ children }: { children: React.ReactNode }) {
    const style: CSSProperties = { display: 'inline-block' };
    const stopPropagation = (node: HTMLDivElement | null) => {
      if (!node) return null;
      const instance = EventsFactory(node);
      instance.add('click', (e) => {
        e.stopPropagation();
      });
    };
    return (
      <div ref={stopPropagation} style={style}>
        {children}
      </div>
    );
  }

  renderSortTrigger() {
    const { column, sort, eventHandlers } = this.props;
    const { columnKey, direction } = sort ?? {};
    const { key, sortable } = column ?? {};
    const { onSort } = eventHandlers ?? {};
    const isActive = columnKey === String(key);

    if (!sortable || (typeof onSort !== 'function' && !isActive)) return null;

    const sortIcon = !isActive
      ? 'sort inactive'
      : 'sort-amount-' + direction + ' active';

    const sortHelpText =
      `Activate to sort the table by ${column.name} in ` +
      `${direction === 'asc' ? 'descending' : 'ascending'} order.`;

    return (
      <button
        title={sortHelpText}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 'none',
          margin: 'none',
        }}
        type="button"
        onClick={this.sortColumn}
      >
        <Icon fa={sortIcon + ' Trigger SortTrigger'} />
      </button>
    );
  }

  renderHelpTrigger() {
    const { column } = this.props;
    if (!column.helpText && !('htmlHelp' in column)) return null;
    return (
      <HelpTrigger>
        {('htmlHelp' in column && column.htmlHelp) ?? column.helpText}
      </HelpTrigger>
    );
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  onDragStart(event: React.DragEvent<HTMLTableCellElement>) {
    const { key } = this.props.column;
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('text', String(key));
    this.setState({ isDragging: true });
    return event;
  }

  onDragEnd(event: React.DragEvent<HTMLTableCellElement>) {
    this.setState({ isDragging: false, isDragTarget: false });
    this.element?.blur();
    event.preventDefault();
  }

  onDragEnter(event: React.DragEvent<HTMLTableCellElement>) {
    if (!this.state.isDragTarget) this.setState({ isDragTarget: true });
    event.preventDefault();
  }

  onDragExit(event: React.DragEvent<HTMLTableCellElement>) {
    this.setState({ isDragTarget: false });
    event.preventDefault();
  }

  onDragOver(event: React.DragEvent<HTMLTableCellElement>) {
    event.preventDefault();
  }

  onDragLeave(event: React.DragEvent<HTMLTableCellElement>) {
    this.setState({ isDragTarget: false });
    this.element?.blur();
    event.preventDefault();
  }

  onDrop(event: React.DragEvent<HTMLTableCellElement>) {
    this.element?.blur();
    event.preventDefault();
    const { eventHandlers, columnIndex } = this.props;
    const { onColumnReorder } = eventHandlers ?? {};
    if (typeof onColumnReorder !== 'function') return;
    const draggedColumn = event.dataTransfer.getData('text');
    if (this.state.isDragTarget) this.setState({ isDragTarget: false });
    onColumnReorder(draggedColumn as unknown as Key, columnIndex);
  }

  getDomEvents() {
    const {
      onDragStart,
      onDragEnd,
      onDragEnter,
      onDragExit,
      onDragOver,
      onDragLeave,
      onDrop,
    } = this;
    return {
      onDragStart,
      onDragEnd,
      onDragEnter,
      onDragExit,
      onDragOver,
      onDragLeave,
      onDrop,
    };
  }

  getClassName() {
    const { key, className } = this.props.column;
    const { isDragging, isDragTarget } = this.state;
    const modifiers = ['key-' + String(key)];
    if (isDragging) modifiers.push('Dragging');
    if (isDragTarget) modifiers.push('DragTarget');
    return (
      (typeof className === 'string' ? className + ' ' : '') +
      headingCellClass(undefined, modifiers)
    );
  }

  render() {
    const { column, eventHandlers, primary } = this.props;
    const { key, width } = column;
    const headingStyle =
      'headingStyle' in column
        ? (column.headingStyle as CSSProperties)
        : undefined;
    const widthStyle: CSSProperties = width
      ? { width, maxWidth: width, minWidth: width }
      : {};

    const style: CSSProperties = {
      ...(headingStyle ?? {}),
      ...widthStyle,
    };
    const ref = (element: HTMLTableCellElement | null) => {
      if (element) this.element = element;
    };

    const children = this.renderContent();
    const className = this.getClassName();
    const domEvents = this.getDomEvents();

    const draggable =
      primary &&
      column.moveable &&
      !column.primary &&
      typeof eventHandlers?.onColumnReorder === 'function';

    const props = { style, ref, draggable, children, className };

    const hidden = 'hidden' in column ? column.hidden : false;

    return hidden ? null : <th key={String(key)} {...props} {...domEvents} />;
  }
}

export default HeadingCell;
