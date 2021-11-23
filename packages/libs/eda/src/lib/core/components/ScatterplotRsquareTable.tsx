import {
  XYPlotDataSeries,
  XYPlotData,
} from '@veupathdb/components/lib/types/plots';
import { VariableTreeNode } from '../types/study';

interface facetDataProps {
  label: string;
  data?: XYPlotData | undefined;
}

export interface Props {
  data: XYPlotDataSeries[] | facetDataProps[] | undefined;
  isFaceted: boolean;
  overlayVariable?: VariableTreeNode;
  facetVariable?: VariableTreeNode;
}

export function ScatterplotRsquareTable({
  data,
  isFaceted,
  overlayVariable,
  facetVariable,
}: Props) {
  // non-facet or facet data
  const filteredData = !isFaceted
    ? overlayVariable != null
      ? (data as XYPlotDataSeries[])?.filter((data) =>
          data?.name?.includes(', Best fit')
        )
      : (data as XYPlotDataSeries[])?.filter((data) =>
          data?.name?.includes('Best fit')
        )
    : (data as facetDataProps[]).filter((element) => element.data != null);

  if (!isFaceted) {
    return (
      <div className={'ScatterRsquareTable'}>
        <table>
          <tbody>
            <tr>
              <th>
                {overlayVariable != null ? overlayVariable.displayName : 'Name'}
              </th>
              <th className="numeric">
                R<sup>2</sup> (Best fit)
              </th>
            </tr>
            {filteredData != null
              ? (filteredData as XYPlotDataSeries[]).map((data) => (
                  <tr>
                    <td>{data?.name?.split(', Best fit')[0]}</td>
                    <td>{data.r2 ?? 'N/A'}</td>
                  </tr>
                ))
              : ''}
          </tbody>
        </table>
      </div>
    );
  } else {
    return (
      <div
        className={'ScatterRsquareTable'}
        style={{ maxHeight: 250, overflowX: 'hidden', overflowY: 'auto' }}
      >
        <table>
          <tbody>
            <tr>
              <th>{facetVariable?.displayName}</th>
              {overlayVariable != null && (
                <th>{overlayVariable.displayName}</th>
              )}
              <th className="numeric">
                R<sup>2</sup> (Best fit)
              </th>
            </tr>
            {filteredData != null
              ? (filteredData as facetDataProps[]).map((data) => (
                  <>
                    {data?.data?.series != null
                      ? data.data.series
                          .filter((series) =>
                            overlayVariable != null
                              ? series?.name?.includes(', Best fit')
                              : series?.name?.includes('Best fit')
                          )
                          .map((series, index, array) => {
                            if (index === 0) {
                              return (
                                <tr>
                                  {/* each vocabulary/name have different number of available data ,so need to check rowSpan per data */}
                                  <td
                                    rowSpan={
                                      overlayVariable != null
                                        ? array.filter((arr) =>
                                            arr?.name?.includes(', Best fit')
                                          ).length
                                        : 1
                                    }
                                  >
                                    {data.label}
                                  </td>
                                  {overlayVariable != null && (
                                    <td>
                                      {series?.name?.split(', Best fit')[0]}
                                    </td>
                                  )}
                                  <td>{series.r2 ?? 'N/A'}</td>
                                </tr>
                              );
                            } else {
                              return (
                                <tr>
                                  {overlayVariable != null && (
                                    <td>
                                      {series?.name?.split(', Best fit')[0]}
                                    </td>
                                  )}
                                  <td>{series.r2 ?? 'N/A'}</td>
                                </tr>
                              );
                            }
                          })
                      : ''}
                  </>
                ))
              : ''}
          </tbody>
        </table>
      </div>
    );
  }
}
