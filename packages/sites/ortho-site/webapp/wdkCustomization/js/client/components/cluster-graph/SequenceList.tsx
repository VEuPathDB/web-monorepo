import React, { useMemo } from 'react';

import { GraphInformationTabProps, layoutToSequenceListRows } from '../../utils/graphInformation';

export function SequenceList({ layout }: GraphInformationTabProps) {
  const rows = useMemo(
    () => layoutToSequenceListRows(layout),
    [ layout ]
  );

  return (
    <pre>
      {JSON.stringify(rows, null, 2)}
    </pre>
  );
}
