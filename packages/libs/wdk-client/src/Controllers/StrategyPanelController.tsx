import { keyBy } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';
import { RootState } from 'wdk-client/Core/State/Types';
import { StrategyDetails } from 'wdk-client/Utils/WdkUser';
import StrategyPanel from 'wdk-client/Views/Strategy/StrategyPanel';
import { Loading } from 'wdk-client/Components';
import { requestDuplicateStrategy, requestDeleteStrategy, requestPatchStrategyProperties } from 'wdk-client/Actions/StrategyActions';
import { RecordClass } from 'wdk-client/Utils/WdkModel';

interface OwnProps {
  strategyId: number;
  stepId?: number;
  action?: string;
}

type MappedProps = 
| {
  isLoading: true;
} | {
  isLoading: false;
  strategy: StrategyDetails;
  recordClassesByName: Record<string, RecordClass>;
}

interface MappedDispatch {
  onStrategyCopy: () => void;
  onStrategyDelete: () => void;
  onStrategyRename: (name: string) => void;
  onStrategySave: (name: string, isPublic: boolean, description?: string) => void;
}

type Props = OwnProps & MappedProps & MappedDispatch;

function mapStateToProps(state: RootState, ownProps: OwnProps): MappedProps {
  const entry = state.strategies.strategies[ownProps.strategyId];
  const strategy = entry && entry.status === 'success' ? entry.strategy : undefined;
  const { recordClasses } = state.globalData;
  const recordClassesByName = recordClasses && keyBy(recordClasses, 'urlSegment');
  return strategy == null || recordClassesByName == null
    ? { isLoading: true }
    : { isLoading: false, strategy, recordClassesByName };
}

function mapDispatchToProps(dispatch: Dispatch, props: OwnProps): MappedDispatch {
  return bindActionCreators({
    onStrategyCopy: () => requestDuplicateStrategy({ sourceStrategySignature: String(props.strategyId) }),
    onStrategyDelete: () => requestDeleteStrategy(props.strategyId),
    onStrategyRename: (name: string) => requestPatchStrategyProperties(props.strategyId, { name }),
    onStrategySave: (name: string, isPublic: boolean, description?: string) => requestPatchStrategyProperties(props.strategyId, { isPublic, isSaved: true, name, description })
  }, dispatch);
}

function StrategyPanelController(props: Props) {
  if (props.isLoading) return <Loading/>;

  return (
    <StrategyPanel {...props} />
  );
}


export default connect(mapStateToProps, mapDispatchToProps)(StrategyPanelController);
