import { TypeOf, Decoder } from 'io-ts';
import { v4 as uuid } from 'uuid';

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
  StandaloneMapMarkersResponse,
  StandaloneMapMarkersRequestParams,
  StandaloneMapBubblesResponse,
  StandaloneMapBubblesRequestParams,
  ContinousVariableMetadataRequestParams,
  ContinousVariableMetadataResponse,
  StandaloneMapBubblesLegendRequestParams,
  StandaloneMapBubblesLegendResponse,
} from './types';
import { NoDataError } from './NoDataError';

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
        transformResponse: nullResponseInterceptor(decoder),
      })
    );
  }

  // Histogram
  getHistogram(
    computationName: string,
    pluginName: string, // now handles timeline and histogram
    params: HistogramRequestParams
  ): Promise<HistogramResponse> {
    return this.getVisualizationData(
      computationName,
      pluginName,
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
    pluginName: string,
    params: LineplotRequestParams
  ): Promise<LineplotResponse> {
    return this.getVisualizationData(
      computationName,
      pluginName,
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

  // standalone map-markers
  getStandaloneMapMarkers(
    computationName: string,
    params: StandaloneMapMarkersRequestParams
  ): Promise<StandaloneMapMarkersResponse> {
    return this.getVisualizationData(
      computationName,
      'map-markers',
      params,
      StandaloneMapMarkersResponse
    );
  }

  // standalone bubble markers
  getStandaloneBubbles(
    computationName: string,
    params: StandaloneMapBubblesRequestParams
  ): Promise<StandaloneMapBubblesResponse> {
    return this.getVisualizationData(
      computationName,
      'map-markers/bubbles',
      params,
      StandaloneMapBubblesResponse
    );
  }

  getStandaloneBubblesLegend(
    computationName: string,
    params: StandaloneMapBubblesLegendRequestParams
  ): Promise<StandaloneMapBubblesLegendResponse> {
    return this.getVisualizationData(
      computationName,
      'map-markers/bubbles/legend',
      params,
      StandaloneMapBubblesLegendResponse
    );
  }

  // filter-aware continuous overlay variable metadata
  getContinousVariableMetadata(
    params: ContinousVariableMetadataRequestParams
  ): Promise<ContinousVariableMetadataResponse> {
    return this.fetch(
      createJsonRequest({
        method: 'POST',
        path: `/filter-aware-metadata/continuous-variable`,
        body: params,
        transformResponse: nullResponseInterceptor(
          ContinousVariableMetadataResponse
        ),
      })
    );
  }
}

// intercept a null body response and throw a '204' internally
function nullResponseInterceptor<T>(decoder: Decoder<unknown, T>) {
  return function (body: unknown) {
    if (body == null) {
      throw new NoDataError(
        'The visualization cannot be made because no data remains after filtering.',
        'No data',
        204,
        uuid()
      );
    }
    return ioTransformer(decoder)(body);
  };
}

export * from './types';
