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
  recordClassUrlSegment: string;
  userIsGuest: boolean;
  showLoginWarning: ShowLoginWarning;
}

export default function BasketCell({ value, requestUpdateBasket, recordClassUrlSegment, row, userIsGuest, showLoginWarning }: BasketCellProps) {
  return (
    <BasketIconButton
      tooltipContext="this row"
      status={value}
      idsToToggle={[row.id]}
      recordClassName={recordClassUrlSegment}
      requestUpdateBasket={requestUpdateBasket}
      userIsGuest={userIsGuest}
      showLoginWarning={showLoginWarning}
    />
  );
}
