import { MosaicData } from '../types/plots/mosaic';
import { EmptyMosaicData } from '../plots/MosaicPlot';
import _ from 'lodash';

interface ContingencyTableProps {
  data?: MosaicData;
  independentVariable: string;
  dependentVariable: string;
}

export function ContingencyTable(props: ContingencyTableProps) {
  const data = props.data ?? EmptyMosaicData;
  const rowSums = data.values.map((row) => _.sum(row));

  return (
    <div className="contingency-table">
      <table>
        <tbody>
          <tr>
            <td
              className="contingency-table_top-left-corner"
              colSpan={2}
              rowSpan={2}
            ></td>
            <th
              className="contingency-table_column-header"
              colSpan={data.independentLabels.length}
              style={{ textAlign: 'center' }}
            >
              {props.independentVariable}
            </th>
          </tr>
          <tr>
            {data.independentLabels.map((label) => (
              <th className="contingency-table_column-label">{label}</th>
            ))}
            <th className="contingency-table_totals-column-header">Total</th>
          </tr>
          {data.values.map((row, index) => (
            <tr>
              {index === 0 && (
                <th
                  className="contingency-table_row-header"
                  rowSpan={data.dependentLabels.length}
                >
                  {props.dependentVariable}
                </th>
              )}
              <th className="contingency-table_row-label">
                {data.dependentLabels[index]}
              </th>
              {row.map((value) => (
                <td className="contingency-table_value">{value}</td>
              ))}
              <td className="contingency-table_totals-column-value">
                {rowSums[index]}
              </td>
            </tr>
          ))}
          <tr>
            <td></td>
            <th className="contingency-table_totals-row-header">Total</th>
            {_.unzip(data.values).map((col) => (
              <td className="contingency-table_totals-row-value">
                {_.sum(col)}
              </td>
            ))}
            <td className="contingency-table_grand-total">{_.sum(rowSums)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
