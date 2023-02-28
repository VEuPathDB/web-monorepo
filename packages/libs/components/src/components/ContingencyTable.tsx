import { CSSProperties, useMemo } from 'react';
import { MosaicPlotData } from '../types/plots/mosaicPlot';
import _ from 'lodash';
import { FacetedData } from '../types/plots';
import { isFaceted } from '../types/guards';
import Spinner from '../components/Spinner';
import { MEDIUM_DARK_GRAY, MEDIUM_GRAY } from '../constants/colors';
import { Table } from '@veupathdb/coreui';

interface ContingencyTableProps {
  data?: MosaicPlotData | FacetedData<MosaicPlotData>;
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
  /**
   * Reference values are read as [xAxisReferenceValue, yAxisReferenceValue]
   * The reference values are used to re-order the 2x2 table quadrants, as needed
   */
  referenceValues?: Array<string | undefined>;
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
  const { data, referenceValues } = props;

  if (data == null) {
    return (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '350px',
          width: '750px',
          border: '1px solid rgb(191, 191, 191)',
        }}
      >
        {props.enableSpinner && <Spinner />}
        <Table width={150} height={150} fill={MEDIUM_GRAY} />
      </div>
    );
  }

  if (isFaceted(data)) {
    return FacetedContingencyTable(props);
  }

  const processedData = useMemo(() => {
    const dataCopy = { ...data };
    if (!referenceValues || !referenceValues[0] || !referenceValues[1])
      return data;
    if (referenceValues[0] !== data.independentLabels[0]) {
      dataCopy.independentLabels = [...data.independentLabels].reverse();
      dataCopy.values = [...data.values].map((arr) => arr.reverse());
    }
    if (referenceValues[1] !== data.dependentLabels[0]) {
      dataCopy.dependentLabels = [...data.dependentLabels.reverse()];
      dataCopy.values =
        referenceValues[0] !== data.independentLabels[0]
          ? [dataCopy.values[1], dataCopy.values[0]]
          : [data.values[1], data.values[0]];
    }
    return dataCopy as MosaicPlotData;
  }, [data, referenceValues]);

  const rowSums = processedData.values.map((row) => _.sum(row));

  return (
    <div className="contingency-table" style={props.tableContainerStyles}>
      <table>
        <tbody>
          <tr>
            <td className="contingency-table_top-left-corner" colSpan={1}></td>
            <th
              className="contingency-table_column-header"
              colSpan={processedData.independentLabels.length + 1}
              style={{ background: MEDIUM_GRAY }}
            >
              {props.independentVariable}
            </th>
          </tr>
          <tr>
            <th
              className="contingency-table_row-header"
              style={{ background: MEDIUM_GRAY }}
            >
              {props.dependentVariable}
            </th>
            {processedData.independentLabels.map((label) => (
              <th key={label} className="contingency-table_column-label">
                {label}
              </th>
            ))}
            <th
              className="contingency-table_totals-column-header"
              style={{ color: MEDIUM_DARK_GRAY }}
            >
              Total
            </th>
          </tr>
          {processedData.values.map((row, i) => (
            <tr key={processedData.dependentLabels[i]}>
              <th className="contingency-table_row-label">
                {processedData.dependentLabels[i]}
              </th>
              {row.map((value, j) => (
                <td
                  key={`${processedData.dependentLabels[i]}-${processedData.independentLabels[j]}`}
                  className="contingency-table_value"
                  style={
                    i < processedData.values.length - 1
                      ? { paddingBottom: '0.75em' }
                      : {}
                  }
                >
                  {value.toLocaleString()}
                  <br />
                  {makePercentString(value, rowSums)}
                </td>
              ))}
              <td
                className="contingency-table_totals-column-value"
                style={{ color: MEDIUM_DARK_GRAY }}
              >
                {rowSums[i].toLocaleString()}
                <br />
                {makePercentString(rowSums[i], rowSums)}
              </td>
            </tr>
          ))}
          <tr>
            <th
              className="contingency-table_totals-row-header"
              style={{ color: MEDIUM_DARK_GRAY }}
            >
              Total
            </th>
            {_.unzip(processedData.values).map((col, i) => (
              <td
                key={processedData.independentLabels[i]}
                className="contingency-table_totals-row-value"
                style={{ color: MEDIUM_DARK_GRAY }}
              >
                {_.sum(col).toLocaleString()}
                <br />
                {makePercentString(_.sum(col), rowSums)}
              </td>
            ))}
            <td
              className="contingency-table_grand-total"
              style={{ color: MEDIUM_DARK_GRAY }}
            >
              {_.sum(rowSums).toLocaleString()}
              <br />
              {makePercentString(_.sum(rowSums), rowSums)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const makePercentString = (value: number, sumsArray: number[]) => {
  return (
    <span>
      ({_.round(_.divide(value, _.sum(sumsArray)) * 100, 1).toLocaleString()}%)
    </span>
  );
};
