import React from 'react';

import { Loading } from 'wdk-client/Components';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { RecordClass } from 'wdk-client/Utils/WdkModel';

import { inputResultSetDescription } from './AddStepUtils';

import './BasketInput.scss';

const cx = makeClassNameHelper('BasketInput');

type BasketInputStatus = 'is-guest' | 'loading' | 'enabled';

type Props = {
  basketCounts: Record<string, number> | undefined,
  inputRecordClasses: RecordClass[],
  isGuest: boolean,
  onSelectBasket: (recordClassUrlSegment: string) => void,
  selectBasketButtonText: string
};

export const BasketInput = ({
  inputRecordClasses,
  basketCounts,
  isGuest,
  onSelectBasket,
  selectBasketButtonText
}: Props) => {
  const status: BasketInputStatus = isGuest
    ? 'is-guest'
    : basketCounts == null
    ? 'loading'
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
        status === 'loading' &&
        <Loading />
      }
      {
        status === 'enabled' &&
        <React.Fragment>
          {
            inputRecordClasses.map(inputRecordClass =>
              <button
                key={inputRecordClass.urlSegment}
                disabled={basketCounts && !basketCounts[inputRecordClass.urlSegment]}
                title={basketCounts && !basketCounts[inputRecordClass.urlSegment]
                  ? `Your ${inputRecordClass.displayNamePlural} basket is empty`
                  : undefined
                }
                type="button"
                onClick={() => {
                  onSelectBasket(inputRecordClass.urlSegment)
                }}>{`${selectBasketButtonText} with your ${inputRecordClass.displayNamePlural} basket`}
              </button>
            )
          }
        </React.Fragment>
      }
    </div>
  )
};