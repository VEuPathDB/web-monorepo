import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { StrategySummary } from 'wdk-client/Utils/WdkUser';
import { Link, Loading } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import {closeStrategiesListView, openStrategiesListView} from 'wdk-client/Actions/StrategyListActions';
import StrategyHeader from 'wdk-client/Views/Strategy/StrategyHeader';

interface OwnProps {
  viewId: string;
}

interface StateProps {
  strategies?: StrategySummary[];
}

interface DispatchProps {
  dispatch: Dispatch;
}

type Props = OwnProps & StateProps & DispatchProps;

function AllStrategiesController(props: Props) {
  const { viewId, dispatch, strategies } = props;

  useEffect(() => {
    props.dispatch(openStrategiesListView(viewId));
    return () => {
      dispatch(closeStrategiesListView(viewId));
    };
  }, [viewId]);
  return (
    <div>
      <StrategyHeader/>
      <h1>All Strategies</h1>

      {strategies
        ? strategies.map(strategy => (
          <div><Link to={`/workspace/strategies/${strategy.strategyId}/${strategy.rootStepId}`}>{strategy.name}</Link></div>
        ))
        : <Loading/> }
    </div>
  )
}

function mapStateToProps(state: RootState, props: OwnProps): StateProps {
  const { viewId } = props;
  const viewState = state.strategyList[viewId];
  return {
    strategies: viewState && viewState.strategySummaries
  }
}

export default connect(mapStateToProps)(AllStrategiesController);
