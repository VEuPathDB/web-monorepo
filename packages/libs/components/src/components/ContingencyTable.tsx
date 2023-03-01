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
  selectedReferenceValues?: Array<string | undefined>;
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
  const { data, selectedReferenceValues } = props;

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

  /**
   * JM: This is a hack to get 2x2 table data in the correct quadrants without affecting the mosaic plots.
   * The selectedReferenceValues (note that these are considered the quadrant A values in the UI) determine
   * the top-left quadrant (A), from which the converse relationships can naturally populate the remaining quadrants.
   *
   * For example, with the following variable selections in GEMS1 Case Control:
   *  - Columns (X-axis) var: Case or control participant
   *  - Columns (X-axis) reference var: Case
   *  - Rows (Y-axis) var: Rotavirus, by ELISA
   *  - Rows (Y-axis) reference var: No
   * We know 'Case' would be the left column and 'No' would be the top row, thus should render in quadrant A
   * From there, we know 'Control' must be the right column and 'Yes' the bottom row.
   */
  const orderedData = useMemo(() => {
    const dataCopy = { ...data };
    if (
      !selectedReferenceValues ||
      !selectedReferenceValues[0] ||
      !selectedReferenceValues[1]
    )
      return data;

    /**
     * If the selected xAxisRefValue doesn't match the first xAxis label, then
     *   1. reverse the column labels
     *   2. reverse the column data
     */
    if (selectedReferenceValues[0] !== data.independentLabels[0]) {
      dataCopy.independentLabels = [...data.independentLabels].reverse();
      dataCopy.values = [...data.values].map((arr) => arr.reverse());
    }

    /**
     * If the selected yAxisRefValue doesn't match the first yAxis label, then
     *   1. reverse the row labels
     *   2. check if column data was reversed
     *      Yes -> use dataCopy object to reverse the rows, thus capturing the previous column reversal
     *       No -> use data object to reverse rows
     */
    if (selectedReferenceValues[1] !== data.dependentLabels[0]) {
      dataCopy.dependentLabels = [...data.dependentLabels.reverse()];
      dataCopy.values =
        selectedReferenceValues[0] !== data.independentLabels[0]
          ? [dataCopy.values[1], dataCopy.values[0]]
          : [data.values[1], data.values[0]];
    }
    return dataCopy as MosaicPlotData;
  }, [data, selectedReferenceValues]);

  const rowSums = orderedData.values.map((row) => _.sum(row));

  return (
    <div className="contingency-table" style={props.tableContainerStyles}>
      <table>
        <tbody>
          <tr>
            <td className="contingency-table_top-left-corner" colSpan={1}></td>
            <th
              className="contingency-table_column-header"
              colSpan={orderedData.independentLabels.length + 1}
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
            {orderedData.independentLabels.map((label) => (
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
          {orderedData.values.map((row, i) => (
            <tr key={orderedData.dependentLabels[i]}>
              <th className="contingency-table_row-label">
                {orderedData.dependentLabels[i]}
              </th>
              {row.map((value, j) => (
                <td
                  key={`${orderedData.dependentLabels[i]}-${orderedData.independentLabels[j]}`}
                  className="contingency-table_value"
                  style={
                    i < orderedData.values.length - 1
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
            {_.unzip(orderedData.values).map((col, i) => (
              <td
                key={orderedData.independentLabels[i]}
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
