import React from 'react';
import { connect } from 'react-redux';
import { RootState } from 'wdk-client/Core/State/Types';
import { StrategyDetails } from 'wdk-client/Utils/WdkUser';
import StrategyPanel from 'wdk-client/Views/Strategy/StrategyPanel';
import { Loading } from 'wdk-client/Components';

interface OwnProps {
  strategyId: number;
  stepId?: number;
  // Called whenever a step is selected.
  onStepSelected?: (stepId: number) => void;
}

interface MappedProps {
  strategy?: StrategyDetails;
}

type Props = OwnProps & MappedProps;

function mapStateToProps(state: RootState, ownProps: OwnProps): MappedProps {
  const entry = state.strategies.strategies[ownProps.strategyId];
  const strategy = entry && entry.status === 'success' ? entry.strategy : undefined;
  return { strategy };
}

function StrategyPanelController(props: Props) {
  if (props.strategy == null) return <Loading/>;
  return (
    <StrategyPanel
      strategy={props.strategy}
      selectedStepId={props.stepId}
    />
  );
}

export default connect(mapStateToProps)(StrategyPanelController);
