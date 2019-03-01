import React from 'react';
import { connect } from 'react-redux';
import {
  openMatchedTranscriptsFilter,
  closeMatchedTranscriptsFilter,
  requestMatchedTransFilterExpandedUpdate,
  requestMatchedTransFilterUpdate,
  setDisplayedSelection,
} from 'wdk-client/Actions/MatchedTranscriptsFilterActions';
import { RootState } from 'wdk-client/Core/State/Types';
import MatchedTranscriptsFilter from 'wdk-client/Views/MatchedTranscriptsFilter/MatchedTranscriptsFilter';
import {
  getFilterValue,
  FilterValue
} from 'wdk-client/StoreModules/MatchedTranscriptsFilterStoreModule';

const actionCreators = {
  openMatchedTranscriptsFilter,
  closeMatchedTranscriptsFilter,
  requestMatchedTransFilterExpandedUpdate,
  requestMatchedTransFilterUpdate,
  setDisplayedSelection
}
interface OwnProps {
  stepId: number;
}

type DispatchProps = typeof actionCreators;

type StateProps = (
  Required<RootState['matchedTranscriptsFilter']> & {
    filterValue: FilterValue;
  }
) | undefined;

type Props = OwnProps & {
  stateProps: StateProps;
  actionCreators: DispatchProps;
}

class MatchedTranscriptsFilterController extends React.Component<Props> {

  componentDidMount() {
    this.props.actionCreators.openMatchedTranscriptsFilter(this.props.stepId);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.stepId !== this.props.stepId) {
      this.props.actionCreators.closeMatchedTranscriptsFilter(prevProps.stepId);
      this.props.actionCreators.openMatchedTranscriptsFilter(this.props.stepId);
    }
  }

  componentWillUnmount() {
    this.props.actionCreators.closeMatchedTranscriptsFilter(this.props.stepId);
  }

  render() {
    if (this.props.stateProps == null) return null;
    return <MatchedTranscriptsFilter
      {...this.props.stateProps}
      toggleExpansion={this.props.actionCreators.requestMatchedTransFilterExpandedUpdate}
      updateFilter={this.props.actionCreators.requestMatchedTransFilterUpdate}
      updateSelection={this.props.actionCreators.setDisplayedSelection}
    />;
  }

}

export default connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  (state: RootState, ownProps: OwnProps) => {
    const step = state.steps.steps[ownProps.stepId];
    const stateProps = {
      filterValue: getFilterValue(step),
      ...state.matchedTranscriptsFilter
    };
    return allPropsAreDefined(stateProps) ? stateProps as StateProps : undefined;
  },
  actionCreators,
  (stateProps, actionCreators, ownProps) => ({ stateProps, actionCreators, ...ownProps })
)(MatchedTranscriptsFilterController);

function allPropsAreDefined<T>(t: T): t is Required<T> {
  for (const key in t) {
    if (t[key] === undefined) return false;
  }
  return true;
}
