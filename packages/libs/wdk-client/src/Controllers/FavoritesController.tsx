import * as React from 'react';
import { connect } from 'react-redux';
import { wrappable } from '../Utils/ComponentUtils';
import PageController from '../Core/Controllers/PageController';
import {
  updateSearchTerm,
  updateTableSelection,
  sortTable,
  deleteFavorites,
  filterByType,
  editCell,
  changeCellValue,
  saveCellData,
  cancelCellEdit,
  undeleteFavorites,
  loadFavoritesList,
} from '../Actions/FavoritesActions';
import _FavoritesList from '../Views/Favorites/FavoritesList';
import { State } from '../StoreModules/FavoritesListStoreModule';
import { GlobalData } from '../StoreModules/GlobalData';
import { RootState } from '../Core/State/Types';

// FIXME Convert FavoritesList to TypeScript
const FavoritesList: any = _FavoritesList;

// Named map of ActionCreator functions that will be passed
// as dispatchProps via `connect` below
const ActionCreators = {
  loadFavoritesList,
  deleteFavorites,
  undeleteFavorites,
  saveCellData,
  filterByType,
  cancelCellEdit,
  editCell,
  searchTerm: updateSearchTerm,
  updateSelection: updateTableSelection,
  sortColumn: sortTable,
  changeCell: changeCellValue,
};

type StateProps = Pick<
  State,
  | 'tableState'
  | 'tableSelection'
  | 'favoritesLoading'
  | 'loadError'
  | 'existingFavorite'
  | 'editCoordinates'
  | 'editValue'
  | 'searchText'
  | 'filterByType'
  | 'deletedFavorite'
> &
  Pick<GlobalData, 'user' | 'recordClasses'>;

type DispatchProps = typeof ActionCreators;

type Props = {
  stateProps: StateProps;
  dispatchProps: DispatchProps;
};

class FavoritesListController extends PageController<Props> {
  getTitle() {
    return 'Favorites';
  }

  loadData(prevProps?: Props) {
    // only load favorites on initial mount
    if (prevProps == null) this.props.dispatchProps.loadFavoritesList();
  }

  isRenderDataLoaded() {
    const { user, tableState } = this.props.stateProps;

    return user != null && tableState != null;
  }

  isRenderDataLoadError() {
    const { loadError } = this.props.stateProps;

    return loadError != null;
  }

  renderView() {
    const { stateProps, dispatchProps } = this.props;

    return (
      <FavoritesList
        {...stateProps}
        favoritesEvents={dispatchProps}
        searchBoxPlaceholder="Search Favorites..."
        searchBoxHelp="All table columns will be searched"
      />
    );
  }
}

const mapStateToProps = (state: RootState): StateProps => {
  const {
    tableState,
    tableSelection,
    favoritesLoading,
    loadError,
    existingFavorite,
    editCoordinates,
    editValue,
    searchText,
    filterByType,
    deletedFavorite,
  } = state.favorites;

  const { user, recordClasses } = state.globalData;

  return {
    tableState,
    tableSelection,
    user,
    recordClasses,
    favoritesLoading,
    loadError,
    existingFavorite,
    editCoordinates,
    editValue,
    searchText,
    filterByType,
    deletedFavorite,
  };
};

const mapDispatchToProps = ActionCreators;

const mergeProps = (stateProps: StateProps, dispatchProps: DispatchProps) => ({
  stateProps,
  dispatchProps,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(wrappable(FavoritesListController));
