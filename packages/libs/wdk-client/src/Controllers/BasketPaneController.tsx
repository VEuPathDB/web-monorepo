import React from 'react';
import BasketPane from '../Views/Basket/BasketPane';
import { connect } from 'react-redux';
import { wrappable } from '../Utils/ComponentUtils';
import { Dispatch, bindActionCreators } from 'redux';
import { ResultPanelController } from '../Controllers';
import { BasketResultType } from '../Utils/WdkResult';
import {
  requestClearBasket,
  saveBasketToStrategy,
} from '../Actions/BasketActions';
import { RecordClass } from '../Utils/WdkModel';

interface OwnProps {
  recordClass: RecordClass;
  count: number;
}

interface DispatchProps {
  emptyBasket: () => void;
  saveBasketToStrategy: () => void;
}

type Props = OwnProps & DispatchProps;

function BasketPaneController(props: Props) {
  const { count, emptyBasket, saveBasketToStrategy, recordClass } = props;
  const resultType: BasketResultType = {
    type: 'basket',
    basketName: recordClass.urlSegment,
  };
  const viewId = `basket__${recordClass.urlSegment}`;
  return (
    <BasketPane
      emptyBasket={emptyBasket}
      saveBasketToStrategy={saveBasketToStrategy}
    >
      <ResultPanelController
        renderHeader={() => (
          <h3>
            {count}{' '}
            {count === 1
              ? recordClass.displayName
              : recordClass.displayNamePlural}
          </h3>
        )}
        resultType={resultType}
        viewId={viewId}
      />
    </BasketPane>
  );
}

function mapDispatchToProps(
  dispatch: Dispatch,
  props: OwnProps
): DispatchProps {
  return bindActionCreators(
    {
      emptyBasket: () => requestClearBasket(props.recordClass.urlSegment),
      saveBasketToStrategy: () =>
        saveBasketToStrategy(props.recordClass.urlSegment),
    },
    dispatch
  );
}

export default connect(
  null,
  mapDispatchToProps
)(wrappable(BasketPaneController));
