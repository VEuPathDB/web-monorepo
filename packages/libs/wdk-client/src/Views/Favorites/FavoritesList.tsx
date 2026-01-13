import { escape } from 'lodash';
import React, { Component, CSSProperties, ReactNode } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import BannerList from '@veupathdb/coreui/lib/components/banners/BannerList';
import { BannerProps } from '@veupathdb/coreui/lib/components/banners/Banner';
import Icon from '../../Components/Icon/IconAlt';
import TextArea from '../../Components/InputControls/TextArea';
import TextBox from '../../Components/InputControls/TextBox';
import {
  Mesa,
  MesaState,
  Utils as MesaUtils,
} from '@veupathdb/coreui/lib/components/Mesa';
import RealTimeSearchBox from '../../Components/SearchBox/RealTimeSearchBox';
import { wrappable } from '../../Utils/ComponentUtils';
import RecordLink from '../../Views/Records/RecordLink';
import { Favorite, RecordClass } from '../../Utils/WdkModel';
import { User } from '../../Utils/WdkUser';
import '../../Views/Favorites/wdk-Favorites.scss';

interface Banner extends BannerProps {
  id: string;
}

interface EditCoordinates {
  row: number;
  column: number;
}

interface FavoritesEvents {
  searchTerm: (value: string) => void;
  updateSelection: (payload: {
    selectIds?: number[];
    deselectIds?: number[];
  }) => void;
  sortColumn: (key: string, direction: string) => void;
  filterByType: (type: string | null) => void;
  editCell: (payload: {
    coordinates: EditCoordinates;
    key: string;
    value: string;
    rowData: Favorite;
  }) => void;
  changeCell: (value: string) => void;
  saveCellData: (tableState: any, favorite: Favorite) => void;
  cancelCellEdit: () => void;
  deleteFavorites: (tableState: any, favorites: Favorite[]) => void;
  undeleteFavorites: (tableState: any, favorites: Favorite[]) => void;
}

interface Props extends RouteComponentProps<any> {
  tableState: any;
  tableSelection: number[];
  favoritesLoading: boolean;
  loadError: Error | null;
  existingFavorite: Partial<Favorite>;
  editCoordinates: EditCoordinates | Record<string, never>;
  editValue: string;
  searchText: string;
  filterByType: string | null;
  deletedFavorite: Favorite | null;
  user: User;
  recordClasses: RecordClass[];
  searchBoxPlaceholder: string;
  searchBoxHelp: string;
  favoritesEvents: FavoritesEvents;
  favoriteIds?: number[];
}

interface State {
  banners: Banner[];
}

interface CellRendererProps {
  key: string;
  value: any;
  row: Favorite;
  rowIndex?: number;
  columnIndex?: number;
  column: any;
}

/**
 * Provides the favorites listing page.  The component relies entirely on its properties.
 */
class FavoritesList extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.renderIdCell = this.renderIdCell.bind(this);
    this.renderGroupCell = this.renderGroupCell.bind(this);
    this.renderTypeCell = this.renderTypeCell.bind(this);
    this.renderNoteCell = this.renderNoteCell.bind(this);
    this.renderCountSummary = this.renderCountSummary.bind(this);
    this.renderEmptyState = this.renderEmptyState.bind(this);

    this.handleEditClick = this.handleEditClick.bind(this);
    this.handleCellChange = this.handleCellChange.bind(this);
    this.handleCellSave = this.handleCellSave.bind(this);
    this.handleCellCancel = this.handleCellCancel.bind(this);
    this.handleRowDelete = this.handleRowDelete.bind(this);
    this.handleSearchTermChange = this.handleSearchTermChange.bind(this);
    this.handleTypeFilterClick = this.handleTypeFilterClick.bind(this);

    this.getRecordClassByName = this.getRecordClassByName.bind(this);
    this.countFavoritesByType = this.countFavoritesByType.bind(this);

    this.handleUndoDelete = this.handleUndoDelete.bind(this);
    this.handleBannerClose = this.handleBannerClose.bind(this);
    this.handleBulkUndoDelete = this.handleBulkUndoDelete.bind(this);

    this.onSort = this.onSort.bind(this);
    this.onRowSelect = this.onRowSelect.bind(this);
    this.onRowDeselect = this.onRowDeselect.bind(this);
    this.onMultipleRowSelect = this.onMultipleRowSelect.bind(this);
    this.onMultipleRowDeselect = this.onMultipleRowDeselect.bind(this);

    this.getTableActions = this.getTableActions.bind(this);
    this.getTableOptions = this.getTableOptions.bind(this);
    this.getTableColumns = this.getTableColumns.bind(this);
    this.getTableEventHandlers = this.getTableEventHandlers.bind(this);

    this.state = { banners: [] };
  }

  createDeletedBanner(selection: Favorite[]): void {
    if (!selection || !selection.length) return;
    const { banners } = this.state;
    const bannerId = selection.map((s) => s.displayName).join('-');

    const output: Banner = {
      id: bannerId,
      type: 'success',
      message: null,
    };

    const undoDelete = () => {
      this.handleBulkUndoDelete(selection);

      let bannerList = [...this.state.banners];
      let idx = bannerList.findIndex((banner) => banner.id === bannerId);

      if (idx >= 0) {
        bannerList.splice(idx, 1);
        this.setState({ banners: bannerList });
      }
    };

    if (selection.length === 1) {
      let deleted = selection[0];
      output.message = (
        <span>
          <b>{deleted.displayName}</b> was removed from your favorites.
          <a style={{ marginLeft: '5px' }} onClick={undoDelete}>
            Undo <Icon fa="undo" />
          </a>
        </span>
      );
    } else {
      output.message = (
        <span>
          <b>{selection.length} records</b> were removed from your favorites.
          <a onClick={undoDelete}>
            Undo <Icon fa="undo" />
          </a>
        </span>
      );
    }

    banners.push(output);
    this.setState({ banners });
  }

  handleBannerClose(index: number, banner: Banner): void {
    const { banners } = this.state;
    banners.splice(index, 1);
    this.setState({ banners });
  }

  handleSearchTermChange(value: string): void {
    const { favoritesEvents } = this.props;
    favoritesEvents.searchTerm(value);
  }

  renderEmptyState(): ReactNode {
    const { searchText } = this.props;
    const isSearching = searchText && searchText.length;
    const wrapperStyle: CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      justifyContent: 'center',
    };

    const iconStyle: CSSProperties = {
      fontSize: '80px',
    };

    const message = isSearching ? (
      <span>
        Whoops! No favorites matching your search term, <i>"{searchText}"</i>,
        could be found. <br />
        Please try a different search term or add additional favorites.
      </span>
    ) : (
      'Your favorites page is currently empty. To add items to your favorites simply click on the favorites icon in a record page. If you have favorites, you may have filtered them all out with too restrictive a search criterion.'
    );

    return (
      <div className="EmptyState" style={wrapperStyle}>
        <div style={{ maxWidth: '450px' }}>
          <Icon fa={searchText && searchText.length ? 'search' : 'star-o'} />
          <p>{message}</p>
        </div>
      </div>
    );
  }

  countFavoritesByType(): Record<string, number> {
    const { recordClasses, tableState } = this.props;
    const rows = MesaState.getRows(tableState) as Favorite[];
    const counts = rows.reduce(
      (tally: Record<string, number>, { recordClassName }: Favorite) => {
        if (tally[recordClassName])
          tally[recordClassName] = tally[recordClassName] + 1;
        else tally[recordClassName] = 1;
        return tally;
      },
      {} as Record<string, number>
    );
    return counts;
  }

  //  RENDERERS ===============================================================

  renderIdCell({ key, value, row, column }: CellRendererProps): ReactNode {
    const { recordClassName, primaryKey, displayName } = row as Favorite;
    const recordClass = this.getRecordClassByName(recordClassName);
    const style: CSSProperties = {
      whiteSpace: 'normal',
      wordWrap: 'break-word',
    };
    return (
      <div style={style}>
        {recordClass ? (
          <RecordLink recordClass={recordClass} recordId={primaryKey}>
            {displayName}
          </RecordLink>
        ) : (
          displayName
        )}
      </div>
    );
  }

  renderGroupCell({
    key,
    value,
    row,
    rowIndex,
    columnIndex,
    column,
  }: CellRendererProps): ReactNode {
    const { editCoordinates, editValue } = this.props;
    const normalStyle: CSSProperties = {
      display: 'flex',
      whiteSpace: 'normal',
    };
    const editStyle: CSSProperties = {
      marginLeft: 'auto',
      paddingRight: '1em',
      cursor: 'pointer',
    };
    const isBeingEdited =
      editCoordinates &&
      'row' in editCoordinates &&
      'column' in editCoordinates &&
      (editCoordinates as EditCoordinates).row === rowIndex &&
      (editCoordinates as EditCoordinates).column === columnIndex;

    return isBeingEdited ? (
      <div className="editor-cell">
        <TextBox
          value={editValue}
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
            this.handleEnterKey(e, column.key)
          }
          onChange={(newValue: string) => this.handleCellChange(newValue)}
          autoComplete="on"
          maxLength={50}
          size={5}
        />
        <Icon
          fa="check-circle action-icon save-icon"
          onClick={() => this.handleCellSave(column.key)}
        />
        <Icon
          fa="times action-icon cancel-icon"
          onClick={() => this.handleCellCancel()}
        />
      </div>
    ) : (
      <div style={normalStyle}>
        <div>
          {value ? (
            escape(value)
          ) : (
            <span className="faded">No project set.</span>
          )}
        </div>
        <div style={editStyle}>
          <a
            onClick={() =>
              this.handleEditClick(
                rowIndex || 0,
                columnIndex || 0,
                key,
                row,
                value
              )
            }
            className="edit-link"
            title="Edit This Favorite's Project Grouping"
          >
            <Icon fa="pencil" />
          </a>
        </div>
      </div>
    );
  }

  renderTypeCell({ key, value, row, column }: CellRendererProps): ReactNode {
    let recordClass = this.getRecordClassByName(value);
    let type = recordClass ? recordClass.displayName : 'Unknown';
    return <div>{type}</div>;
  }

  renderNoteCell({
    key,
    value,
    row,
    rowIndex,
    column,
    columnIndex,
  }: CellRendererProps): ReactNode {
    const { editCoordinates, editValue } = this.props;
    const editContainerStyle: CSSProperties = {
      display: 'flex',
      whiteSpace: 'normal',
    };
    const editStyle: CSSProperties = {
      marginLeft: 'auto',
      paddingRight: '1em',
      cursor: 'pointer',
    };
    const isBeingEdited =
      editCoordinates &&
      'row' in editCoordinates &&
      'column' in editCoordinates &&
      (editCoordinates as EditCoordinates).row === rowIndex &&
      (editCoordinates as EditCoordinates).column === columnIndex;

    return isBeingEdited ? (
      <div className="editor-cell">
        <TextArea
          value={editValue}
          onChange={(newValue: string) => this.handleCellChange(newValue)}
          maxLength={200}
          cols={50}
          rows={4}
        />
        <Icon
          fa="check-circle action-icon save-icon"
          onClick={() => this.handleCellSave(key)}
        />
        <Icon
          fa="times action-icon cancel-icon"
          onClick={() => this.handleCellCancel()}
        />
      </div>
    ) : (
      <div style={editContainerStyle}>
        <div>
          {value ? (
            escape(value)
          ) : (
            <span className="faded">This favorite has no notes.</span>
          )}
        </div>
        <div style={editStyle}>
          <a
            onClick={() =>
              this.handleEditClick(
                rowIndex || 0,
                columnIndex || 0,
                key,
                row,
                value
              )
            }
            className="edit-link"
            title="Edit This Favorite's Project Grouping"
          >
            <Icon fa="pencil" />
          </a>
        </div>
      </div>
    );
  }

  renderCountSummary(): ReactNode {
    const counts = this.countFavoritesByType();
    const recordClassNames = Object.keys(counts);
    const output = recordClassNames.map((recordClassName, idx) => {
      let recordClass = this.getRecordClassByName(recordClassName);
      let name = recordClass ? recordClass.displayNamePlural : 'Unknown';
      let { filterByType } = this.props;
      let className =
        'Favorites-GroupCount ' +
        (filterByType && filterByType === recordClassName
          ? 'active'
          : 'inactive');
      return (
        <span
          onClick={() => this.handleTypeFilterClick(recordClassName)}
          className={className}
          key={idx}
        >
          {name}: {counts[recordClassName]}
        </span>
      );
    });

    return <div className="Favorites-CountList">{output}</div>;
  }

  // Table event handlers =====================================================

  onRowSelect({ id }: { id: number }): void {
    const { favoritesEvents } = this.props;
    const { updateSelection } = favoritesEvents;
    updateSelection({ selectIds: [id] });
  }

  onRowDeselect({ id }: { id: number }): void {
    const { favoritesEvents } = this.props;
    const { updateSelection } = favoritesEvents;
    updateSelection({ deselectIds: [id] });
  }

  onMultipleRowSelect(rows: Favorite[]): void {
    const { favoritesEvents } = this.props;
    const ids = rows.map((row) => row.id);
    const { updateSelection } = favoritesEvents;
    updateSelection({ selectIds: ids });
  }

  onMultipleRowDeselect(rows: Favorite[]): void {
    const { favoritesEvents } = this.props;
    const ids = rows.map((row) => row.id);
    const { updateSelection } = favoritesEvents;
    updateSelection({ deselectIds: ids });
  }

  onSort({ key }: { key: string }, direction: string): void {
    const { favoritesEvents } = this.props;
    const { sortColumn } = favoritesEvents;
    sortColumn(key, direction);
  }

  // Table config generators =================================================

  getTableActions(): any[] {
    const { favoritesEvents, tableState } = this.props;
    const { deleteFavorites } = favoritesEvents;
    return [
      {
        selectionRequired: true,
        element(selection: Favorite[]) {
          return (
            <button className="btn btn-error">
              <Icon fa="trash" /> Remove{' '}
              {selection.length
                ? selection.length +
                  ' favorite' +
                  (selection.length === 1 ? '' : 's')
                : ''}
            </button>
          );
        },
        callback: (selection: Favorite[]) => {
          deleteFavorites(tableState, selection);
          this.createDeletedBanner(selection);
        },
      },
    ];
  }

  getTableOptions(): any {
    const { searchBoxPlaceholder, tableSelection } = this.props;

    return {
      useStickyHeader: true,
      selectedNoun: 'Favorite',
      selectedPluralNoun: 'Favorites',
      tableBodyMaxHeight: 'calc(100vh - 80px)',
      renderEmptyState: this.renderEmptyState,
      searchPlaceholder: searchBoxPlaceholder,
      isRowSelected({ id }: { id: number }) {
        return tableSelection.includes(id);
      },
    };
  }

  getTableColumns(): any[] {
    const { renderIdCell, renderTypeCell, renderNoteCell, renderGroupCell } =
      this;
    return [
      {
        key: 'displayName',
        name: 'ID',
        renderCell: renderIdCell,
        width: '15%',
        sortable: true,
      },
      {
        key: 'recordClassName',
        name: 'Type',
        renderCell: renderTypeCell,
        width: '25%',
        sortable: true,
      },
      {
        key: 'description',
        name: 'Notes',
        renderCell: renderNoteCell,
        width: '40%',
        sortable: true,
        helpText:
          "Use this column to add notes. Click the pencil icon to edit the cell's contents.",
      },
      {
        key: 'group',
        name: 'Project',
        renderCell: renderGroupCell,
        width: '20%',
        sortable: true,
        helpText:
          "Organize your favorites by group names. IDs with the same group name will be sorted together once the page is refreshed. Click the pencil icon to edit the cell's contents.",
      },
    ];
  }

  getTableEventHandlers(): any {
    const {
      onSort,
      onRowSelect,
      onMultipleRowSelect,
      onRowDeselect,
      onMultipleRowDeselect,
    } = this;
    return {
      onSort,
      onRowSelect,
      onRowDeselect,
      onMultipleRowSelect,
      onMultipleRowDeselect,
    };
  }

  render(): ReactNode {
    let { banners } = this.state;
    let {
      recordClasses,
      tableState,
      searchText,
      searchBoxPlaceholder,
      searchBoxHelp,
      user,
    } = this.props;
    let { renderIdCell, renderTypeCell, renderNoteCell, renderGroupCell } =
      this;

    const rows = MesaState.getRows(tableState);
    const uiState =
      'uiState' in tableState ? MesaState.getUiState(tableState) : null;
    const { sort } = uiState ? uiState : { sort: undefined };
    const filteredRows = MesaState.getFilteredRows(tableState) as Favorite[];
    const sortedFilteredRows =
      sort && sort.columnKey
        ? MesaUtils.textSort(
            filteredRows,
            sort.columnKey,
            sort.direction === 'asc'
          )
        : filteredRows;

    tableState = MesaState.setOptions(tableState, this.getTableOptions());
    tableState = MesaState.setActions(tableState, this.getTableActions());
    tableState = MesaState.setColumns(tableState, this.getTableColumns());
    tableState = MesaState.setEventHandlers(
      tableState,
      this.getTableEventHandlers()
    );
    tableState = MesaState.setFilteredRows(tableState, sortedFilteredRows);
    tableState = MesaState.setEmptinessCulprit(
      tableState,
      rows.length && !filteredRows.length ? 'search' : null
    );

    if (!recordClasses) return null;
    if (user.isGuest)
      return (
        <div className="empty-message">
          You must login first to use favorites
        </div>
      );

    const bannerProps: BannerProps[] = banners.map(({ id, ...rest }) => rest);

    return (
      <div className="wdk-Favorites">
        <h1 className="page-title">Favorites</h1>
        {this.renderCountSummary()}
        <BannerList
          onClose={(index, banner) =>
            this.handleBannerClose(index, banners[index])
          }
          banners={bannerProps}
        />
        <Mesa state={tableState}>
          <RealTimeSearchBox
            className="favorites-search-field"
            autoFocus={false}
            searchTerm={searchText}
            onSearchTermChange={this.handleSearchTermChange}
            placeholderText={searchBoxPlaceholder}
            helpText={searchBoxHelp}
          />
        </Mesa>
      </div>
    );
  }

  handleTypeFilterClick(recordType: string): void {
    const { filterByType, favoritesEvents } = this.props;
    const active = recordType === filterByType;
    favoritesEvents.filterByType(active ? null : recordType);
  }

  /**
   * Calls appropriate handler when any edit link is pressed.  Because the switch between the cell contents and the
   * in-line edit form can alter row height, the CellMeasurer cache is cleared.
   * @param rowIndex
   * @param columnIndex
   * @param dataKey
   * @param rowData
   * @param cellData
   * @private
   */
  handleEditClick(
    rowIndex: number,
    columnIndex: number,
    dataKey: string,
    rowData: Favorite,
    cellData: any
  ): void {
    this.props.favoritesEvents.editCell({
      coordinates: {
        row: rowIndex,
        column: columnIndex,
      },
      key: dataKey,
      value: cellData,
      rowData: rowData,
    });
  }

  /**
   * Calls appropriate handler when changes are made to content during an in-line edit.
   * @param value - edited value
   * @private
   */
  handleCellChange(value: string): void {
    this.props.favoritesEvents.changeCell(value);
  }

  /**
   * Calls appropriate handler when an in-line edit save button is clicked.  A new favorite is sent back to the handler
   * with the original favorite information updated with the edited value.  Again, because this event collapses the
   * in-line edit form, which can alter row height, the CellMeasurer cache is cleared.
   * @param dataKey - the property of the favorite that was edited (group or note here)
   * @private
   */
  handleCellSave(dataKey: string): void {
    const { tableState, editValue, existingFavorite, favoritesEvents } =
      this.props;
    const favorite = Object.assign({}, existingFavorite, {
      [dataKey]: editValue,
    });
    favoritesEvents.saveCellData(tableState, favorite as Favorite);
  }

  /**
   * Calls appropriate handler when the in-line edit changes are discarded.  Again, because this event collapses the
   * in-line edit form, which can alter row height, the CellMeasure cache is cleared.
   * @private
   */
  handleCellCancel(): void {
    this.props.favoritesEvents.cancelCellEdit();
  }

  /**
   * A workaround that watches an cell input (specifically the group editor) and, when "enter" is pressed, submits
   * the relevant cell for saving.
   * @param e - Keypress event
   * @param dataKey - cell data key to pass along for saving
   **/
  handleEnterKey(
    e: React.KeyboardEvent<HTMLInputElement>,
    dataKey: string
  ): void {
    if (e.key !== 'Enter' || !dataKey) return;
    this.handleCellSave(dataKey);
  }

  handleRowDelete(row: Favorite): void {
    const { tableState, favoritesEvents } = this.props;
    favoritesEvents.deleteFavorites(tableState, [row]);
    this.onRowDeselect(row);
  }

  handleUndoDelete(row: Favorite): void {
    const { tableState, favoritesEvents } = this.props;
    favoritesEvents.undeleteFavorites(tableState, [row]);
  }

  handleBulkUndoDelete(rows: Favorite[]): void {
    const { tableState, favoritesEvents } = this.props;
    favoritesEvents.undeleteFavorites(tableState, rows);
  }

  getDataKeyTooltip(dataKey: string): string {
    switch (dataKey) {
      case 'display':
        return 'This links back to your favorite';
      case 'recordClassName':
        return 'This is the type of your favorite';
      case 'note':
        return 'Use this column to add notes (click edit to change this field).';
      case 'group':
        return 'Organize your favorites by project names';
      default:
        return '';
    }
  }

  getRecordClassByName(recordClassName: string): RecordClass | undefined {
    let { recordClasses } = this.props;
    return recordClasses.find(({ fullName }) => fullName === recordClassName);
  }
}

export default wrappable(withRouter(FavoritesList as any));
