import React, { useMemo } from 'react';

import { Mesa, MesaState } from 'wdk-client/Components/Mesa';

import { MesaColumn } from 'wdk-client/Core/CommonTypes';

interface Props<R> {
  rows: R[];
  columns: MesaColumn<keyof R & string>[];
}

export function GraphInformationDataTable<R>({ rows, columns }: Props<R>) {
  const mesaState = useMemo(
    () => MesaState.create({
      rows,
      columns
    }),
    [ rows, columns ]
  );

  return (
    <div className="GraphInformationDataTable">
      <Mesa state={mesaState} />
    </div>
  );
}
