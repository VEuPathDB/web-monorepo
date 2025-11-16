import React, { ReactNode } from 'react';

import DataTable from './DataTable';
import TableToolbar from './TableToolbar';
import ActionToolbar from './ActionToolbar';
import PaginationMenu from './PaginationMenu';
import EmptyState from './EmptyState';
import { MesaStateProps } from '../types';

interface MesaControllerProps<Row, Key = string>
  extends MesaStateProps<Row, Key> {
  children?: ReactNode;
  headerWrapperStyle?: React.CSSProperties;
}

class MesaController<Row, Key = string> extends React.Component<
  MesaControllerProps<Row, Key>
> {
  constructor(props: MesaControllerProps<Row, Key>) {
    super(props);
    this.renderToolbar = this.renderToolbar.bind(this);
    this.renderActionBar = this.renderActionBar.bind(this);
    this.renderEmptyState = this.renderEmptyState.bind(this);
    this.renderPaginationMenu = this.renderPaginationMenu.bind(this);
  }

  renderPaginationMenu() {
    const { uiState, eventHandlers } = this.props;

    if (
      !uiState ||
      !eventHandlers ||
      !uiState.pagination ||
      !eventHandlers.onPageChange
    )
      return null;

    return <PaginationMenu {...uiState.pagination} {...eventHandlers} />;
  }

  renderToolbar() {
    const { rows, options, columns, uiState, eventHandlers, children } =
      this.props;
    const props = { rows, options, columns, uiState, eventHandlers, children };
    if (!options || !options.toolbar) return null;

    return <TableToolbar {...props} />;
  }

  renderActionBar() {
    const {
      rows,
      columns,
      options,
      actions,
      uiState,
      eventHandlers,
      children,
    } = this.props;
    let props = { rows, columns, options, actions, uiState, eventHandlers };
    if (!actions || !actions.length) return null;
    if (!this.renderToolbar() && children)
      props = Object.assign({}, props, { children });

    return <ActionToolbar {...props} />;
  }

  renderEmptyState() {
    const { uiState, options } = this.props;
    const { emptinessCulprit } = uiState ?? {};
    const { renderEmptyState } = options ?? {};

    return renderEmptyState ? (
      renderEmptyState()
    ) : (
      <EmptyState culprit={emptinessCulprit} />
    );
  }

  render() {
    let {
      rows,
      filteredRows,
      options,
      columns,
      actions,
      uiState,
      eventHandlers,
      headerWrapperStyle,
    } = this.props;
    if (!filteredRows) filteredRows = [...rows];
    const props = {
      rows,
      filteredRows,
      options,
      columns,
      actions,
      uiState,
      eventHandlers,
      headerWrapperStyle,
    };

    const Toolbar = this.renderToolbar;
    const ActionBar = this.renderActionBar;
    const PageNav = this.renderPaginationMenu;

    const className = (options?.className ?? '') + ' Mesa MesaComponent';

    return (
      <div className={className} style={options?.style}>
        <Toolbar />
        <ActionBar />
        <PageNav />
        {rows.length ? (
          <React.Fragment>
            <DataTable {...props} />
            {filteredRows.length ? null : this.renderEmptyState()}
          </React.Fragment>
        ) : (
          this.renderEmptyState()
        )}
        <PageNav />
      </div>
    );
  }
}

export default MesaController;
