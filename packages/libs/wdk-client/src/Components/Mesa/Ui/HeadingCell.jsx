import React from 'react';
import PropTypes from 'prop-types';

import Templates from '../Templates';
import Icon from '../Components/Icon';
import Tooltip from '../Components/Tooltip';
import { makeClassifier } from '../Utils/Utils';
import Events, { EventsFactory } from '../Utils/Events';

const headingCellClass = makeClassifier('HeadingCell');

class HeadingCell extends React.PureComponent {
  constructor (props) {
    super(props);
    this.state = {
      offset: null,
      isDragging: false,
      isDragTarget: false,
      clickStart: null
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
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  componentDidMount () {
    this.updateOffset();
    this.listeners = {
      scroll: Events.add('scroll', this.updateOffset),
      resize: Events.add('resize', this.updateOffset),
      MesaScroll: Events.add('MesaScroll', this.updateOffset),
      MesaReflow: Events.add('MesaReflow', this.updateOffset)
    };
  }

  componentWillUnmount () {
    Object.values(this.listeners).forEach(listenerId => Events.remove(listenerId));
  }

  componentWillReceiveProps (newProps) {
    if (newProps
      && newProps.column !== this.props.column
      || newProps.column.width !== this.props.column.width) {
      this.updateOffset();
    }
  }

  updateOffset () {
    const { element } = this;
    if (!element) return;
    let offset = Tooltip.getOffset(element);
    this.setState({ offset });
  }

  sortColumn () {
    const { column, sort, eventHandlers } = this.props;
    const { onSort } = eventHandlers;
    if (typeof onSort !== 'function' || !column.sortable) return;
    const currentlySorting = sort && sort.columnKey === column.key;
    const direction = currentlySorting && sort.direction === 'asc' ? 'desc' : 'asc';
    return onSort(column, direction);
  }

  onMouseDown (e) {
    const clickStart = (new Date).getTime();
    this.setState({ clickStart });
  }

  onMouseUp (e) {
    const { clickStart } = this.state;
    if (!clickStart) return;
    const clickEnd = (new Date).getTime();
    const totalTime = (clickEnd - clickStart);
    this.setState({ clickStart: null, isDragTarget: false })
    if (totalTime <= 500) this.sortColumn();
    if (this.element) this.element.blur();
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  wrapContent (content = null) {
    const SortTrigger = this.renderSortTrigger;
    const HelpTrigger = this.renderHelpTrigger;
    const ClickBoundary = this.renderClickBoundary;
    return (
      <div className={headingCellClass('Content')}>
        <div className={headingCellClass(['Content', 'Aside'])}>
          <SortTrigger />
        </div>
        <div className={headingCellClass(['Content', 'Label'])}>
          {content}
        </div>
        <div className={headingCellClass(['Content', 'Aside'])}>
          <ClickBoundary>
            <HelpTrigger />
          </ClickBoundary>
        </div>
      </div>
    );
  }

  renderContent () {
    const { column, columnIndex, headingRowIndex } = this.props;
    const SortTrigger = this.renderSortTrigger;
    const HelpTrigger = this.renderHelpTrigger;
    const ClickBoundary = this.renderClickBoundary;

    if ('renderHeading' in column && column.renderHeading === false)
      return null;
    if (!'renderHeading' in column || typeof column.renderHeading !== 'function')
      return this.wrapContent(Templates.heading(column, columnIndex));

    const content = column.renderHeading(column, columnIndex, { SortTrigger, HelpTrigger, ClickBoundary });
    const { wrapCustomHeadings } = column;
    const shouldWrap = (wrapCustomHeadings && typeof wrapCustomHeadings === 'function')
      ? wrapCustomHeadings({ column, columnIndex, headingRowIndex })
      : wrapCustomHeadings;

    return shouldWrap ? this.wrapContent(content) : content;
  }

  renderClickBoundary ({ children }) {
    const style = { display: 'inline-block' };
    const stopPropagation = (node) => {
      if (!node) return null;
      const instance = new EventsFactory(node);
      instance.add('click', (e) => {
        e.stopPropagation();
      });
    }
    return <div ref={stopPropagation} style={style} children={children} />
  }

  renderSortTrigger () {
    const { column, sort, eventHandlers } = this.props;
    const { columnKey, direction } = sort ? sort : {};
    const { key, sortable } = column ? column : {};
    const { onSort } = eventHandlers ? eventHandlers : {};
    const isActive = columnKey === key;

    if (!sortable || (typeof onSort !== 'function' && !isActive)) return null;

    const sortIcon = !isActive
      ? 'sort inactive'
      : 'sort-amount-' + direction + ' active';

    return (<Icon fa={sortIcon + ' Trigger SortTrigger'} />);
  }

  renderHelpTrigger () {
    const { column } = this.props;
    const { offset } = this.state;
    const { top, left, height } = offset ? offset : {};
    const position = { top: top + height, left };

    if (!column.helpText) return null;
    return (
      <Tooltip position={position} className="Trigger HelpTrigger" content={column.helpText}>
        <Icon fa="question-circle" />
      </Tooltip>
    );
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  onDragStart (event) {
    const { key } = this.props.column;
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('text', key);
    this.setState({ isDragging: true });
    return event;
  }

  onDragEnd (event) {
    this.setState({ isDragging: false, isDragTarget: false });
    this.element.blur();
    event.preventDefault();
  }

  onDragEnter (event) {
    const dragee = event.dataTransfer.getData('text');
    if (!this.state.isDragTarget) this.setState({ isDragTarget: true });
    event.preventDefault();
  }

  onDragExit (event) {
    this.setState({ isDragTarget: false });
    event.preventDefault();
  }

  onDragOver (event) {
    event.preventDefault();
  }

  onDragLeave (event) {
    this.setState({ isDragTarget: false });
    this.element.blur();
    event.preventDefault();
  }

  onDrop (event) {
    this.element.blur();
    event.preventDefault();
    const { eventHandlers, columnIndex } = this.props;
    const { onColumnReorder } = eventHandlers;
    if (typeof onColumnReorder !== 'function') return;
    const draggedColumn = event.dataTransfer.getData('text');
    if (this.state.isDragTarget) this.setState({ isDragTarget: false });
    onColumnReorder(draggedColumn, columnIndex);
  }

  getDomEvents () {
    const {
      onMouseDown, onMouseUp,
      onDragStart, onDragEnd,
      onDragEnter, onDragExit,
      onDragOver, onDragLeave,
      onDrop
    } = this;
    return {
      onMouseDown, onMouseUp,
      onDragStart, onDragEnd,
      onDragEnter, onDragExit,
      onDragOver, onDragLeave,
      onDrop
    };
  }


  getClassName () {
    const { key, className } = this.props.column;
    const { isDragging, isDragTarget } = this.state;
    const modifiers = ['key-' + key];
    if (isDragging) modifiers.push('Dragging');
    if (isDragTarget) modifiers.push('DragTarget');
    return (typeof className === 'string' ? className + ' ' : '') + headingCellClass(null, modifiers);
  }

  render () {
    const { column, eventHandlers, primary } = this.props;
    const { key, headingStyle, width, renderHeading } = column;
    const widthStyle = width ? { width, maxWidth: width, minWidth: width } : {};

    const style = Object.assign({}, headingStyle ? headingStyle : {}, widthStyle);
    const ref = element => this.element = element;

    const children = this.renderContent();
    const className = this.getClassName();
    const domEvents = this.getDomEvents();

    const draggable = primary
      && column.moveable
      && !column.primary
      && typeof eventHandlers.onColumnReorder === 'function';

    const props = { style, key, ref, draggable, children, className };

    return column.hidden ? null : <th {...props} {...domEvents} />
  }
};

HeadingCell.propTypes = {
  sort: PropTypes.object,
  eventHandlers: PropTypes.object,
  column: PropTypes.object.isRequired,
  columnIndex: PropTypes.number.isRequired
};

export default HeadingCell;
