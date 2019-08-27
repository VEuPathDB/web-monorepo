import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { keyBy } from 'lodash/fp';

import { setSearchTerm, setSort, setPrioritizeEuPathDbExamples } from 'wdk-client/Actions/PublicStrategyActions';
import { Loading } from 'wdk-client/Components';
import { MesaSortObject, DispatchAction } from 'wdk-client/Core/CommonTypes';
import { RootState } from 'wdk-client/Core/State/Types';
import { wrappable, propertyIsNonNull } from 'wdk-client/Utils/ComponentUtils';
import { RecordClass } from 'wdk-client/Utils/WdkModel';
import { StrategySummary } from 'wdk-client/Utils/WdkUser';
import { PublicStrategies } from 'wdk-client/Views/Strategy/PublicStrategies';
import { createSelector } from 'reselect';

interface StateProps {
  searchTerm: string;
  sort?: MesaSortObject;
  prioritizeEuPathDbExamples: boolean;
  publicStrategySummaries?: StrategySummary[];
  recordClassesByUrlSegment?: Record<string, RecordClass>;
}

interface DispatchProps {
  onSearchTermChange: (newSearchTerm: string) => void;
  onSortChange: (newSort: MesaSortObject) => void;
  onPriorityChange: (newPriority: boolean) => void;
}

type Props = StateProps & DispatchProps;

const PublicStrategiesControllerView = (props: Props) =>
  !propertyIsNonNull(props, 'publicStrategySummaries') || !propertyIsNonNull(props, 'recordClassesByUrlSegment')
    ? <Loading />
    : <PublicStrategies {...props}  />;

const keyByUrlSegment = keyBy<RecordClass>(recordClass => recordClass.urlSegment);

const recordClassesByUrlSegment = createSelector(
  ({ globalData }: RootState) => globalData,
  globalData => globalData.recordClasses && keyByUrlSegment(globalData.recordClasses)
);

const mapStateToProps = (state: RootState): StateProps => ({
  searchTerm: state.publicStrategies.searchTerm,
  sort: state.publicStrategies.sort,
  prioritizeEuPathDbExamples: state.publicStrategies.prioritizeEuPathDBExamples,
  publicStrategySummaries: state.strategyWorkspace.publicStrategySummaries,
  recordClassesByUrlSegment: recordClassesByUrlSegment(state)
});

const mapDispatchToProps = (dispatch: DispatchAction): DispatchProps => ({
  onSearchTermChange: compose(dispatch, setSearchTerm),
  onSortChange: compose(dispatch, setSort),
  onPriorityChange: compose(dispatch, setPrioritizeEuPathDbExamples)
});

export const PublicStrategiesController = connect(mapStateToProps, mapDispatchToProps)(wrappable(PublicStrategiesControllerView));
