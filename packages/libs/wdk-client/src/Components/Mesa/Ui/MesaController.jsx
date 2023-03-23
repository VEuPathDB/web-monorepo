import React from 'react';
import PropTypes from 'prop-types';

import DataTable from '../../../Components/Mesa/Ui/DataTable';
import TableToolbar from '../../../Components/Mesa/Ui/TableToolbar';
import ActionToolbar from '../../../Components/Mesa/Ui/ActionToolbar';
import PaginationMenu from '../../../Components/Mesa/Ui/PaginationMenu';
import EmptyState from '../../../Components/Mesa/Ui/EmptyState';

class MesaController extends React.Component {
  constructor(props) {
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
    const { rows, columns, options, actions, eventHandlers, children } =
      this.props;
    let props = { rows, columns, options, actions, eventHandlers };
    if (!actions || !actions.length) return null;
    if (!this.renderToolbar() && children)
      props = Object.assign({}, props, { children });

    return <ActionToolbar {...props} />;
  }

  renderEmptyState() {
    const { uiState, options } = this.props;
    const { emptinessCulprit } = uiState ? uiState : {};
    const { renderEmptyState } = options ? options : {};

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
    };

    const Body = this.renderBody;
    const Toolbar = this.renderToolbar;
    const ActionBar = this.renderActionBar;
    const PageNav = this.renderPaginationMenu;
    const Empty = this.renderEmptyState;

    return (
      <div className="Mesa MesaComponent">
        <Toolbar />
        <ActionBar />
        <PageNav />
        {rows.length ? (
          <React.Fragment>
            <DataTable {...props} />
            {filteredRows.length ? null : <Empty />}
          </React.Fragment>
        ) : (
          <Empty />
        )}
        <PageNav />
      </div>
    );
  }
}

MesaController.propTypes = {
  rows: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  filteredRows: PropTypes.array,
  options: PropTypes.object,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      element: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.node,
        PropTypes.element,
      ]),
      handler: PropTypes.func,
      callback: PropTypes.func,
    })
  ),
  uiState: PropTypes.object,
  eventHandlers: PropTypes.objectOf(PropTypes.func),
};

export default MesaController;
