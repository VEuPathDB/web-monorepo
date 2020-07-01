import React, { useMemo } from 'react';

import { Mesa, MesaState } from 'wdk-client/Components/Mesa';

import { GraphInformationColumns } from '../../utils/graphInformation';

interface Props<R, C extends keyof R & string> {
  rows: R[];
  columns: GraphInformationColumns<R, C>;
  columnOrder: readonly C[];
}

export function GraphInformationDataTable<R, V extends keyof R & string>(
  { rows, columns, columnOrder }: Props<R, V>
) {
  const mesaState = useMemo(
    () => MesaState.create({
      rows,
      columns: columnOrder.map(columnKey => columns[columnKey])
    }),
    [ rows, columns, columnOrder ]
  );

  return (
    <div className="GraphInformationDataTable">
      <Mesa state={mesaState} />
    </div>
  );
}
