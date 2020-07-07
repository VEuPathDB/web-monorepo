import React from 'react';
import { PrimaryKey } from 'wdk-client/Utils/WdkModel';
import { BasketStatus, RequestUpdateBasket, ShowLoginWarning } from 'wdk-client/Views/ResultTableSummaryView/Types';

interface BasketIconButtonProps {
  status: BasketStatus;
  idsToToggle: PrimaryKey[];
  recordClassName: string;
  userIsGuest: boolean;
  requestUpdateBasket: RequestUpdateBasket;
  showLoginWarning: ShowLoginWarning;
  tooltipContext: string;
}

export default function BasketIconButton({
  tooltipContext,
  status,
  idsToToggle,
  recordClassName,
  userIsGuest,
  requestUpdateBasket,
  showLoginWarning,
}: BasketIconButtonProps) {
  const iconWidth = '1em';

  const icon = status === 'loading'
    ?  (
      <i
        className="fa fa-circle-o-notch fa-spin fa-fw"
        style={{ width: iconWidth }}
      />
    ) : (
      <i
        className="fa fa-shopping-basket"
        style={{ color: status === 'yes' ? 'green' : '#A6ACAF', width: iconWidth }}
      />
    );
  return (
    <button
      type="button"
      className="ResultTableBasketIconButton"
      title={makeTitle(status, tooltipContext, userIsGuest)}
      onClick={() => {
        if (userIsGuest)
          showLoginWarning('use baskets')
        else if (status === 'yes')
          requestUpdateBasket('remove', recordClassName, idsToToggle);
        else if (status === 'no')
          requestUpdateBasket('add', recordClassName, idsToToggle);
      }}
    >
      {icon}
    </button>
  );
}

function makeTitle(status: BasketStatus, tooltipContext: string, userIsGuest: boolean) {
  if (userIsGuest) return 'You must log in to use baskets';
  switch(status) {
    case 'loading': return 'Your basket is being updated';
    case 'no': return `Click to add ${tooltipContext} to your basket`;
    case 'yes': return `Click to remove ${tooltipContext} from your basket`;
  }
}
