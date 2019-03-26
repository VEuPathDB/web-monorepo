import React from 'react';
import { Answer, PrimaryKey } from 'wdk-client/Utils/WdkModel';
import BasketIconButton from 'wdk-client/Views/ResultTableSummaryView/BasketIconButton';
import { BasketStatusArray, RequestUpdateBasket } from 'wdk-client/Views/ResultTableSummaryView/Types';

interface BasketHeadingProps {
  answer: Answer;
  basketStatusArray?: BasketStatusArray;
  requestUpdateBasket: RequestUpdateBasket;
}

export default function BasketHeading({
  answer,
  basketStatusArray,
  requestUpdateBasket
}: BasketHeadingProps) {
  const values = new Set(basketStatusArray);
  const status = values.has('no')
    ? 'no'
    : // only contains 'yes' or 'loading'
    values.size !== 0 && values.has('yes')
    ? 'yes'
    : // only contains 'loading', or is empty'
      'loading';
  return (
    <BasketIconButton
      status={status}
      idsToToggle={answer.records.map(record => record.id)}
      recordClassName={answer.meta.recordClassName}
      requestUpdateBasket={requestUpdateBasket}
    />
  );
}
