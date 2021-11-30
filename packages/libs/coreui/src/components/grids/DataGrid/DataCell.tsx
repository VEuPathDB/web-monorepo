import { Cell } from 'react-table';

import typography from '../../../styleDefinitions/typography';
import { DataGridStyleSpec } from './stylePresets';

type DataCellProps = {
  cell: Cell;
  styleSpec: DataGridStyleSpec;
};

/** Render an individual data cell. */
export default function DataCell({ cell, styleSpec }: DataCellProps) {
  return (
    <td
      {...cell.getCellProps()}
      css={[
        typography.td,
        {
          ...styleSpec.dataCells,
        },
      ]}
    >
      {cell.render('Cell')}
    </td>
  );
}
