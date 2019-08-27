import React from 'react';
import { connect } from 'react-redux';

import { requestDuplicateStrategy } from 'wdk-client/Actions/StrategyActions';
import { DispatchAction } from 'wdk-client/Core/CommonTypes';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { ImportStrategy } from 'wdk-client/Views/Strategy/ImportStrategy';

interface DispatchProps {
  requestImportStrategy: (strategySignature: string) => void;
};

interface OwnProps {
  strategySignature: string;
};

type Props = DispatchProps & OwnProps;

const ImportStrategyControllerView = (props: Props) => <ImportStrategy {...props} />

const mapDispatchToProps = (dispatch: DispatchAction): DispatchProps => ({
  requestImportStrategy: (strategySignature: string) => {
    dispatch(requestDuplicateStrategy({ sourceStrategySignature: strategySignature }));
  }
});

export const ImportStrategyController = connect(null, mapDispatchToProps)(wrappable(ImportStrategyControllerView));
