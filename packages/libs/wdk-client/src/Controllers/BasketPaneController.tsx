import React from 'react';
import BasketPane from 'wdk-client/Views/Basket/BasketPane';
import {connect} from 'react-redux';
import {wrappable} from 'wdk-client/Utils/ComponentUtils';
import {Dispatch, bindActionCreators} from 'redux';
import {ResultPanelController} from 'wdk-client/Controllers';
import {BasketResultType} from 'wdk-client/Utils/WdkResult';

interface OwnProps {
  recordClassName: string;
}

interface DispatchProps {
  emptyBasket: () => void;
  saveBasketToStrategy: () => void;
}

type Props = OwnProps & DispatchProps;

function BasketPaneController(props: Props) {
  const { emptyBasket, saveBasketToStrategy, recordClassName } = props;
  const resultType: BasketResultType = { type: 'basket', basketName: recordClassName };
  const viewId = `basket__${recordClassName}`;
  return (
    <BasketPane emptyBasket={emptyBasket} saveBasketToStrategy={saveBasketToStrategy}>
      <ResultPanelController
        resultType={resultType}
        viewId={viewId}
      />
    </BasketPane>
  );
}

function mapDispatchToProps(dispatch: Dispatch, props: OwnProps): DispatchProps {
  return {
    emptyBasket: () => alert('TODO'),
    saveBasketToStrategy: () => alert('TODO')
  }
}

export default connect(
  null,
  mapDispatchToProps
)(wrappable(BasketPaneController));
