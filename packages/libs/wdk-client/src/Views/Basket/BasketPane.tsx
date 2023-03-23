import React from 'react';
import { makeClassNameHelper, wrappable } from '../../Utils/ComponentUtils';
import './BasketPane.scss';

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
      <div className={cx('--Header')}>
        <button type="button" className="btn" onClick={() => emptyBasket()}>
          Empty Basket
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => saveBasketToStrategy()}
        >
          Save Basket to Strategy
        </button>
        <div className={cx('--Notes')}>
          <div>In case of Error, please Contact Us or empty your basket.</div>
          <div>On new releases IDs sometimes change or are retired.</div>
        </div>
      </div>
      {children}
    </div>
  );
}

export default wrappable(BasketPane);
