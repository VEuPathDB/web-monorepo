import React from 'react';
import { PrimaryKey, RecordInstance } from 'wdk-client/Utils/WdkModel';
import BasketIconButton from 'wdk-client/Views/ResultTableSummaryView/BasketIconButton';
import { BasketStatus, ShowLoginWarning } from 'wdk-client/Views/ResultTableSummaryView/Types';

interface BasketCellProps {
  value: BasketStatus;
  requestUpdateBasket: (
    operation: 'add' | 'remove',
    recordClass: string,
    primaryKeys: PrimaryKey[]
  ) => void;
  row: RecordInstance;
  userIsGuest: boolean;
  showLoginWarning: ShowLoginWarning;
}

export default function BasketCell({ value, requestUpdateBasket, row, userIsGuest, showLoginWarning }: BasketCellProps) {
  return (
    <BasketIconButton
      status={value}
      idsToToggle={[row.id]}
      recordClassName={row.recordClassName}
      requestUpdateBasket={requestUpdateBasket}
      userIsGuest={userIsGuest}
      showLoginWarning={showLoginWarning}
    />
  );
}
