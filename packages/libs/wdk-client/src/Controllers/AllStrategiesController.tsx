import React from 'react';
import { connect } from 'react-redux';
import { closeStrategiesListView, openStrategiesListView, setActiveTab, setSearchTerm, addToStrategyListSelection, removeFromStrategyListSelection, setStrategyListSort } from 'wdk-client/Actions/StrategyListActions';
import { Loading } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import { RecordClass } from 'wdk-client/Utils/WdkModel';
import { StrategySummary } from 'wdk-client/Utils/WdkUser';
import AllStrategies from 'wdk-client/Views/Strategy/AllStrategies';
import { propertyIsNonNull } from 'wdk-client/Utils/ComponentUtils';
import { addToOpenedStrategies, removeFromOpenedStrategies } from 'wdk-client/Actions/StrategyWorkspaceActions';
import { MesaSortObject } from 'wdk-client/Core/CommonTypes';
import { requestPatchStrategyProperties, requestDeleteOrRestoreStrategies } from 'wdk-client/Actions/StrategyActions';
import {transitionToInternalPage} from 'wdk-client/Actions/RouterActions';

interface OwnProps {
  strategies?: StrategySummary[];
  strategiesLoading?: boolean;
}

interface StateProps {
  recordClasses?: RecordClass[];
  activeTab?: string;
  searchTermsByTableId: Record<string, string | undefined>;
  selectionByTableId: Record<string, number[] | undefined>;
  openedStrategies?: number[];
  sortByTableId: Record<string, MesaSortObject | undefined>;
}

interface DispatchProps {
  openStrategiesListView: () => void;
  closeStrategiesListView: () => void;
  goToStrategy: (strategyId: number, stepId?: number) => void;
  setActiveTab: (tabId: string) => void;
  setSearchTerm: (tabledId: string, searchTerm: string) => void;
  addToSelection: (tableId: string, ids: number[]) => void;
  removeFromSelection: (TableId: string, ids: number[]) => void;
  addToOpenedStrategies: (ids: number[]) => void;
  removeFromOpenedStrategies: (ids: number[]) => void;
  onSort: (tableId: string, sort: MesaSortObject) => void;
  deleteStrategies: (ids: number[]) => void;
  updatePublicStatus: (id: number, isPublic: boolean) => void;
}

type Props = OwnProps & StateProps & DispatchProps;

function AllStrategiesController(props: Props) {
  const {
    openStrategiesListView,
    closeStrategiesListView,
    ...restProps
  } = props;

  if (!propertyIsNonNull(restProps, 'strategies') || !propertyIsNonNull(restProps, 'recordClasses')) return <Loading/>;

  return (
    <AllStrategies
      {...restProps}
    />
  )
}

function mapStateToProps(state: RootState): StateProps {
  const viewState = state.strategyList;
  return {
    recordClasses: state.globalData.recordClasses,
    activeTab: viewState.activeTab,
    selectionByTableId: viewState.selectedStrategiesByTableId,
    openedStrategies: state.strategyWorkspace.openedStrategies,
    sortByTableId: viewState.sortByTableId,
    searchTermsByTableId: viewState.searchTermsByTableId
  }
}

const dispatchProps: DispatchProps = {
  openStrategiesListView,
  closeStrategiesListView,
  goToStrategy: (strategyId: number, stepId?: number) => {
    const subPath = strategyId + (stepId ? '/' + stepId : '');
    return transitionToInternalPage(`/workspace/strategies/${subPath}`);
  },
  setActiveTab,
  setSearchTerm,
  addToSelection: addToStrategyListSelection,
  removeFromSelection: removeFromStrategyListSelection,
  addToOpenedStrategies,
  removeFromOpenedStrategies,
  onSort: setStrategyListSort,
  updatePublicStatus: (id: number, isPublic: boolean) => requestPatchStrategyProperties(id, { isPublic }),
  deleteStrategies: (ids: number[]) => requestDeleteOrRestoreStrategies(ids.map(strategyId => ({ strategyId, isDeleted: true })))
}

export default connect(mapStateToProps, dispatchProps)(AllStrategiesController);
