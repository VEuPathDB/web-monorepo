import { CSSProperties } from 'react';
import { MosaicData } from '../types/plots/mosaic';
import _ from 'lodash';
import { FacetedData } from '../types/plots';
import { isFaceted } from '../types/guards';
import Spinner from '../components/Spinner';

interface ContingencyTableProps {
  data?: MosaicData | FacetedData<MosaicData>;
  independentVariable: string;
  dependentVariable: string;
  facetVariable?: string;
  /**
   *  Styling for the component's data table(s).
   *  Also doubles as the container styling when
   *  the component is rendering unfaceted data.
   */
  tableContainerStyles?: CSSProperties;
  /** Styling for a single facet (title + data table) */
  singleFacetContainerStyles?: CSSProperties;
  /** Styling for the container of all facets */
  facetedContainerStyles?: CSSProperties;
  enableSpinner?: boolean;
}

function FacetedContingencyTable(props: ContingencyTableProps) {
  if (isFaceted(props.data) && props.facetVariable != null) {
    return (
      <div
        className="faceted-contingency-table"
        style={props.facetedContainerStyles}
      >
        {props.data.facets.map(({ label, data }, index) => (
          <table key={index} style={props.singleFacetContainerStyles}>
            <tbody>
              <tr>
                <th style={{ border: 'none' /* cancel WDK style! */ }}>
                  {props.facetVariable}: {label}
                </th>
              </tr>
              <tr>
                <td>
                  <ContingencyTable {...props} data={data} />
                </td>
              </tr>
            </tbody>
          </table>
        ))}
      </div>
    );
  } else {
    return null;
  }
}

export function ContingencyTable(props: ContingencyTableProps) {
  const { data } = props;

  if (data == null) {
    return (
      <div
        style={{
          position: 'relative',
          height: '200px',
        }}
      >
        {props.enableSpinner && <Spinner />}
      </div>
    );
  }

  if (isFaceted(data)) {
    return FacetedContingencyTable(props);
  }

  const rowSums = data.values.map((row) => _.sum(row));

  return (
    <div className="contingency-table" style={props.tableContainerStyles}>
      <table>
        <tbody>
          <tr>
            <td className="contingency-table_top-left-corner" colSpan={1}></td>
            <th
              className="contingency-table_column-header"
              colSpan={data.independentLabels.length}
              style={{ textAlign: 'center' }}
            >
              {props.independentVariable}
            </th>
          </tr>
          <tr>
            <th
              className="contingency-table_row-header"
              style={{ textAlign: 'center' }}
            >
              {props.dependentVariable}
            </th>
            {data.independentLabels.map((label) => (
              <th key={label} className="contingency-table_column-label">
                {label}
              </th>
            ))}
            <th className="contingency-table_totals-column-header">Total</th>
          </tr>
          {data.values.map((row, i) => (
            <tr key={data.dependentLabels[i]}>
              <th className="contingency-table_row-label">
                {data.dependentLabels[i]}
              </th>
              {row.map((value, j) => (
                <td
                  key={`${data.dependentLabels[i]}-${data.independentLabels[j]}`}
                  className="contingency-table_value"
                >
                  {value.toLocaleString()}
                </td>
              ))}
              <td className="contingency-table_totals-column-value">
                {rowSums[i].toLocaleString()}
              </td>
            </tr>
          ))}
          <tr>
            <th className="contingency-table_totals-row-header">Total</th>
            {_.unzip(data.values).map((col, i) => (
              <td
                key={data.independentLabels[i]}
                className="contingency-table_totals-row-value"
              >
                {_.sum(col).toLocaleString()}
              </td>
            ))}
            <td className="contingency-table_grand-total">
              {_.sum(rowSums).toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
