import * as React from 'react';
import { connect } from 'react-redux';
import { wrappable } from '../../Utils/ComponentUtils';
import PageController from '../../Core/Controllers/PageController';
import * as ActionCreators from '../../Views/Favorites/FavoritesActionCreators';
import _FavoritesList from '../../Views/Favorites/FavoritesList';
import { State } from '../../Views/Favorites/FavoritesListStoreModule';
import { GlobalData } from '../../Core/State/StoreModules/GlobalData';
import { RootState } from '../../Core/State/Types';

// FIXME Convert FavoritesList to TypeScript
const FavoritesList: any = _FavoritesList;

type StateProps = Pick<State,
  'tableState' |
  'tableSelection' |
  'favoritesLoading' |
  'loadError' |
  'existingFavorite' |
  'editCoordinates' |
  'editValue' |
  'searchText'
> & Pick<GlobalData, 'user' | 'recordClasses'>;

type DispatchProps = typeof ActionCreators;

type Props = {
  stateProps: StateProps,
  dispatchProps: DispatchProps
};

class FavoritesListController extends PageController<Props> {
  getTitle () {
    return 'Favorites';
  }

  loadData () {
    const {
      loadFavoritesList
    } = this.props.dispatchProps;

    loadFavoritesList();
  }

  isRenderDataLoaded() {
    const {
      user,
      favoritesLoading
    } = this.props.stateProps;

    return user != null && favoritesLoading === false;
  }

  isRenderDataLoadError() {
    const {
      loadError
    } = this.props.stateProps;

    return loadError != null;
  }

  renderView() {
    const {
      stateProps,
      dispatchProps
    } = this.props;
 
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

const mapStateToProps = (state: RootState) => {
  const {
    tableState,
    tableSelection,
    favoritesLoading,
    loadError,
    existingFavorite,
    editCoordinates,
    editValue,
    searchText,
    deletedFavorite,
    filterByType
  } = state.favorites;

  const {
    user,
    recordClasses
  } = state.globalData;

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
    deletedFavorite,
    filterByType
  };
};

const mapDispatchToProps = ActionCreators;

const mergeProps = (stateProps: StateProps, dispatchProps: DispatchProps) => ({
  stateProps,
  dispatchProps
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(wrappable(FavoritesListController));
