import React from 'react';
import { PrimaryKey } from 'wdk-client/Utils/WdkModel';
import { BasketStatus, RequestUpdateBasket } from 'wdk-client/Views/ResultTableSummaryView/Types';

interface BasketIconButtonProps {
  status: BasketStatus;
  idsToToggle: PrimaryKey[];
  recordClassName: string;
  requestUpdateBasket: RequestUpdateBasket;
}

export default function BasketIconButton({
  status,
  idsToToggle,
  recordClassName,
  requestUpdateBasket
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
        style={{ color: status === 'yes' ? 'green' : 'gray', width: iconWidth }}
      />
    );
  return (
    <button
      type="button"
      className="ResultTableBasketIconButton"
      onClick={() => {
        if (status === 'yes')
          requestUpdateBasket('remove', recordClassName, idsToToggle);
        else if (status === 'no')
          requestUpdateBasket('add', recordClassName, idsToToggle);
      }}
    >
      {icon}
    </button>
  );
}
