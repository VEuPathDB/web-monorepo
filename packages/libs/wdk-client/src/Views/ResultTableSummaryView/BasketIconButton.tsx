import React from 'react';
import { PrimaryKey } from 'wdk-client/Utils/WdkModel';

interface BasketIconButtonProps {
  status: 'yes' | 'no' | 'loading';
  idsToToggle: PrimaryKey[];
  recordClassName: string;
  requestUpdateBasket: (
    operation: 'add' | 'remove',
    recordClass: string,
    primaryKeys: PrimaryKey[]
  ) => void;
}

export default function BasketIconButton({
  status,
  idsToToggle,
  recordClassName,
  requestUpdateBasket
}: BasketIconButtonProps) {
  const iconWidth = '1em';

  if (status === 'loading') {
    return (
      <i
        className="fa fa-circle-o-notch fa-spin fa-fw"
        style={{ width: iconWidth }}
      />
    );
  }

  return (
    <button
      type="button"
      className="wdk-Link"
      onClick={() => {
        if (status === 'yes')
          requestUpdateBasket('remove', recordClassName, idsToToggle);
        else if (status === 'no')
          requestUpdateBasket('add', recordClassName, idsToToggle);
      }}
    >
      <i
        className="fa fa-shopping-basket"
        style={{ color: status === 'yes' ? 'green' : 'gray', width: iconWidth }}
      />
    </button>
  );
}
