import { TypeOf, Decoder } from 'io-ts';

import {
  createJsonRequest,
  FetchClientWithCredentials,
  ioTransformer,
} from '@veupathdb/http-utils';

import {
  AppsResponse,
  HistogramRequestParams,
  HistogramResponse,
  BarplotRequestParams,
  BarplotResponse,
  ScatterplotRequestParams,
  ScatterplotResponse,
  LineplotRequestParams,
  LineplotResponse,
  MosaicRequestParams,
  ContTableResponse,
  TwoByTwoResponse,
  BoxplotRequestParams,
  BoxplotResponse,
  MapMarkersResponse,
  MapMarkersRequestParams,
  MapMarkersOverlayRequestParams,
  MapMarkersOverlayResponse,
} from './types';

export default class DataClient extends FetchClientWithCredentials {
  getApps(): Promise<TypeOf<typeof AppsResponse>> {
    return this.fetch(
      createJsonRequest({
        method: 'GET',
        path: '/apps',
        transformResponse: ioTransformer(AppsResponse),
      })
    );
  }

  getVisualizationData<T>(
    computationName: string,
    visualizationName: string,
    params: unknown,
    decoder: Decoder<unknown, T>
  ): Promise<T> {
    return this.fetch(
      createJsonRequest({
        method: 'POST',
        path: `/apps/${computationName}/visualizations/${visualizationName}`,
        body: params,
        transformResponse: ioTransformer(decoder),
      })
    );
  }

  // Histogram
  getHistogram(
    computationName: string,
    params: HistogramRequestParams
  ): Promise<HistogramResponse> {
    return this.getVisualizationData(
      computationName,
      'histogram',
      params,
      HistogramResponse
    );
  }

  // Barplot
  getBarplot(
    computationName: string,
    params: BarplotRequestParams
  ): Promise<BarplotResponse> {
    return this.getVisualizationData(
      computationName,
      'barplot',
      params,
      BarplotResponse
    );
  }

  // Scatterplot
  getScatterplot(
    computationName: string,
    params: ScatterplotRequestParams
  ): Promise<ScatterplotResponse> {
    return this.getVisualizationData(
      computationName,
      'scatterplot',
      params,
      ScatterplotResponse
    );
  }

  // Lineplot
  getLineplot(
    computationName: string,
    params: LineplotRequestParams
  ): Promise<LineplotResponse> {
    return this.getVisualizationData(
      computationName,
      'lineplot',
      params,
      LineplotResponse
    );
  }

  getContTable(
    computationName: string,
    params: MosaicRequestParams
  ): Promise<ContTableResponse> {
    return this.getVisualizationData(
      computationName,
      'conttable',
      params,
      ContTableResponse
    );
  }

  getTwoByTwo(
    computationName: string,
    params: MosaicRequestParams
  ): Promise<TwoByTwoResponse> {
    return this.getVisualizationData(
      computationName,
      'twobytwo',
      params,
      TwoByTwoResponse
    );
  }

  // boxplot
  getBoxplot(
    computationName: string,
    params: BoxplotRequestParams
  ): Promise<BoxplotResponse> {
    return this.getVisualizationData(
      computationName,
      'boxplot',
      params,
      BoxplotResponse
    );
  }

  // map-markers
  getMapMarkers(
    computationName: string,
    params: MapMarkersRequestParams
  ): Promise<MapMarkersResponse> {
    return this.getVisualizationData(
      computationName,
      'map-markers',
      params,
      MapMarkersResponse
    );
  }

  // map-markers-overlay (previously pieplot)
  getMapMarkersOverlay(
    computationName: string,
    params: MapMarkersOverlayRequestParams
  ): Promise<MapMarkersOverlayResponse> {
    return this.getVisualizationData(
      computationName,
      'map-markers-overlay',
      params,
      MapMarkersOverlayResponse
    );
  }
}

export * from './types';
