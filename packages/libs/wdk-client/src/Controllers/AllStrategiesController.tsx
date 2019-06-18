import React from 'react';
import { connect } from 'react-redux';

import { StrategySummary } from 'wdk-client/Utils/WdkUser';
import { Link } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';

interface Props {
  strategies: StrategySummary[];
}

function AllStrategiesController(props: Props) {
  return (
    <div>
      <h1>All Strategies</h1>
      {props.strategies.map(strategy => (
        <div><Link to={`/workspace/strategies/${strategy.strategyId}/${strategy.rootStepId}`}>{strategy.name}</Link></div>
      ))}
    </div>
  )
}

function mapStateToProps(state: RootState): Props {
  return {
    strategies: []
  }
}

export default connect(mapStateToProps, null)(AllStrategiesController);