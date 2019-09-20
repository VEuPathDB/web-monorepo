import React from 'react';
import { connect } from 'react-redux';

import { DispatchAction } from 'wdk-client/Core/CommonTypes';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { ImportStrategy } from 'wdk-client/Views/Strategy/ImportStrategy';
import {requestImportStrategy} from 'wdk-client/Actions/ImportStrategyActions';

interface DispatchProps {
  requestImportStrategy: (strategySignature: string) => void;
};

interface OwnProps {
  strategySignature: string;
  selectedTab?: string;
};

type Props = DispatchProps & OwnProps;

const ImportStrategyControllerView = (props: Props) => <ImportStrategy {...props} />

const mapDispatchToProps = (dispatch: DispatchAction, props: OwnProps): DispatchProps => ({
  requestImportStrategy: (strategySignature: string) => {
    dispatch(requestImportStrategy(strategySignature,props.selectedTab));
  }
});

export const ImportStrategyController = connect(null, mapDispatchToProps)(wrappable(ImportStrategyControllerView));
