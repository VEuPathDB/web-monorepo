import React from 'react';
import { Answer } from 'wdk-client/Utils/WdkModel';
import BasketIconButton from 'wdk-client/Views/ResultTableSummaryView/BasketIconButton';
import { BasketStatusArray, RequestUpdateBasket, ShowLoginWarning } from 'wdk-client/Views/ResultTableSummaryView/Types';

interface BasketHeadingProps {
  answer: Answer;
  basketStatusArray?: BasketStatusArray;
  requestUpdateBasket: RequestUpdateBasket;
  userIsGuest: boolean;
  showLoginWarning: ShowLoginWarning;
}

export default function BasketHeading({
  answer,
  basketStatusArray,
  requestUpdateBasket,
  userIsGuest,
  showLoginWarning
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
      tooltipContext="the current page of rows"
      status={status}
      idsToToggle={answer.records.map(record => record.id)}
      recordClassName={answer.meta.recordClassName}
      requestUpdateBasket={requestUpdateBasket}
      userIsGuest={userIsGuest}
      showLoginWarning={showLoginWarning}
    />
  );
}
