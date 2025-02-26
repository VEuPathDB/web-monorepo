import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { keyBy } from 'lodash/fp';

import {
  setSearchTerm,
  setSort,
  setPrioritizeExamples,
} from '../Actions/PublicStrategyActions';
import { Loading } from '../Components';
import { DispatchAction } from '../Core/CommonTypes';
import { MesaSortObject } from '@veupathdb/coreui/lib/components/Mesa/types';
import { RootState } from '../Core/State/Types';
import { wrappable, propertyIsNonNull } from '../Utils/ComponentUtils';
import { RecordClass } from '../Utils/WdkModel';
import { StrategySummary } from '../Utils/WdkUser';
import { PublicStrategies } from '../Views/Strategy/PublicStrategies';
import { createSelector } from 'reselect';
import Error from '../Components/PageStatus/Error';

interface StateProps {
  examplesAvailable: boolean;
  searchTerm: string;
  sort?: MesaSortObject;
  prioritizeExamples: boolean;
  publicStrategySummaries?: StrategySummary[];
  recordClassesByUrlSegment?: Record<string, RecordClass>;
  hasError?: boolean;
}

interface DispatchProps {
  onSearchTermChange: (newSearchTerm: string) => void;
  onSortChange: (newSort: MesaSortObject) => void;
  onPriorityChange: (newPriority: boolean) => void;
}

type Props = StateProps & DispatchProps;

const PublicStrategiesControllerView = (props: Props) =>
  props.hasError ? (
    <Error />
  ) : !propertyIsNonNull(props, 'publicStrategySummaries') ||
    !propertyIsNonNull(props, 'recordClassesByUrlSegment') ? (
    <Loading />
  ) : (
    <PublicStrategies {...props} />
  );

const keyByUrlSegment = keyBy<RecordClass>(
  (recordClass) => recordClass.urlSegment
);

const recordClassesByUrlSegment = createSelector(
  ({ globalData }: RootState) => globalData,
  (globalData) =>
    globalData.recordClasses && keyByUrlSegment(globalData.recordClasses)
);

const mapStateToProps = (state: RootState): StateProps => {
  const publicStrategySummaries =
    state.strategyWorkspace.publicStrategySummaries;

  const examplesAvailable =
    publicStrategySummaries?.some(({ isExample }) => isExample) ?? false;

  return {
    examplesAvailable,
    searchTerm: state.publicStrategies.searchTerm,
    sort: state.publicStrategies.sort,
    prioritizeExamples: state.publicStrategies.prioritizeExamples,
    publicStrategySummaries,
    recordClassesByUrlSegment: recordClassesByUrlSegment(state),
    hasError: state.strategyWorkspace.publicStrategySummariesError,
  };
};

const mapDispatchToProps = (dispatch: DispatchAction): DispatchProps => ({
  onSearchTermChange: compose(dispatch, setSearchTerm),
  onSortChange: compose(dispatch, setSort),
  onPriorityChange: compose(dispatch, setPrioritizeExamples),
});

export const PublicStrategiesController = connect(
  mapStateToProps,
  mapDispatchToProps
)(wrappable(PublicStrategiesControllerView));
