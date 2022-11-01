import React from 'react';
import {
  ScatterPlotDataSeries,
  ScatterPlotData,
  FacetedData,
} from '@veupathdb/components/lib/types/plots';
import { VariableTreeNode } from '../types/study';

type FacetDataProps = FacetedData<ScatterPlotData>['facets'];

// introduce discriminated union
type TypedScatterplotRsquareData =
  | {
      isFaceted: false;
      data?: ScatterPlotDataSeries[];
    }
  | {
      isFaceted: true;
      // FacetDataProps is already array, so not FacetDataProps[]
      data?: FacetDataProps;
    };

export interface Props {
  typedData: TypedScatterplotRsquareData;
  overlayVariable?: VariableTreeNode;
  facetVariable?: VariableTreeNode;
}

export function ScatterplotRsquareTable({
  typedData,
  overlayVariable,
  facetVariable,
}: Props) {
  // non-facet or facet data
  const typedFilteredData: TypedScatterplotRsquareData = !typedData.isFaceted
    ? {
        isFaceted: false,
        data:
          overlayVariable != null
            ? typedData.data?.filter((data) =>
                data.name?.includes(', Best fit')
              )
            : typedData.data?.filter((data) => data.name?.includes('Best fit')),
      }
    : {
        isFaceted: true,
        data: typedData.data?.filter((element) => element.data != null),
      };

  if (!typedFilteredData.isFaceted) {
    return (
      <div className={'ScatterRsquareTable'}>
        <table>
          <tbody>
            <tr>
              <th>
                {overlayVariable != null ? overlayVariable.displayName : 'Name'}
              </th>
              <th className="">
                R<sup>2</sup> (Best fit)
              </th>
            </tr>
            {typedFilteredData.data?.map((data) => (
              <tr key={data.name}>
                <td>{data?.name?.split(', Best fit')[0]}</td>
                <td>{data.r2 ?? 'N/A'}</td>
              </tr>
            ))}
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
              <th className="">
                R<sup>2</sup> (Best fit)
              </th>
            </tr>
            {typedFilteredData.data?.map((data) => (
              <React.Fragment key={data.label}>
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
                            <tr key={data.label + series.name}>
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
                                <td>{series?.name?.split(', Best fit')[0]}</td>
                              )}
                              <td>{series.r2 ?? 'N/A'}</td>
                            </tr>
                          );
                        } else {
                          return (
                            <tr key={data.label + series.name}>
                              {overlayVariable != null && (
                                <td>{series?.name?.split(', Best fit')[0]}</td>
                              )}
                              <td>{series.r2 ?? 'N/A'}</td>
                            </tr>
                          );
                        }
                      })
                  : ''}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
