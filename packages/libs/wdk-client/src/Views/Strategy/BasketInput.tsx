import React from 'react';

import { IconAlt } from 'wdk-client/Components';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { RecordClass } from 'wdk-client/Utils/WdkModel';

import './BasketInput.scss';
import { inputResultSetDescription } from './AddStepUtils';

const cx = makeClassNameHelper('BasketInput');

type BasketInputStatus = 'is-guest' | 'empty-basket' | 'enabled';

type Props = {
  inputRecordClass: RecordClass,
  basketCount: number | undefined,
  isGuest: boolean,
  onSelectBasket: () => void,
  selectBasketButtonText: string
};

export const BasketInput = ({
  inputRecordClass,
  basketCount,
  isGuest,
  onSelectBasket,
  selectBasketButtonText
}: Props) => {
  const status: BasketInputStatus = isGuest
    ? 'is-guest'
    : !basketCount
    ? 'empty-basket'
    : 'enabled';

  return (
    <div className={cx('', status)}>
      {
        status === 'is-guest' &&
        <div>
          You must log in to access your basket.
        </div>
      }
      {
        status === 'empty-basket' &&
          <div>
            <div>
              Your {inputRecordClass.displayName} basket is empty.
            </div>
            <div>
              You may add {inputRecordClass.displayNamePlural} to your basket:

              <ol>
                <li>
                  In a {inputRecordClass.displayName} page, by clicking on the{' '}
                  <IconAlt fa="shopping-basket" />{' '}
                  icon located at the top
                </li>
                <li>
                  In a {inputRecordClass.displayName} search result, by either:
                    <ul>
                      <li>Using the <IconAlt fa="shopping-basket" /> icon to add a {inputRecordClass.displayName} or a page</li>
                      <li>Using the <a href="#" onClick={e => {
                        e.preventDefault();
                      }}>Add To Basket</a> link to add the whole result</li>
                    </ul>
                </li>
              </ol>
            </div>
          </div>
      }
      {
        status === 'enabled' &&
        <React.Fragment>
          <div>
            Your basket contains {inputResultSetDescription(basketCount, inputRecordClass)}
          </div>
          <div>
            <button type="button" onClick={onSelectBasket}>{selectBasketButtonText}</button>
          </div>
        </React.Fragment>
      }
    </div>
  )
};