import React from 'react';
import {makeClassNameHelper, wrappable} from 'wdk-client/Utils/ComponentUtils';

const cx = makeClassNameHelper('BasketPane');

interface Props {
  emptyBasket: () => void;
  saveBasketToStrategy: () => void;
  /** Result panel */
  children: React.ReactNode;
}

function BasketPane(props: Props) {
  const { emptyBasket, saveBasketToStrategy, children } = props;
  return (
    <div className={cx()}>
      <div>
        <button type="button" className="btn" onClick={() => emptyBasket()}>Empty Basket</button>
        <button type="button" className="btn" onClick={() => saveBasketToStrategy()}>Save Basket to Strategy</button>
      </div>
      {children}
    </div>
  );
}

export default wrappable(BasketPane);
