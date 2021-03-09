import HistogramControls from '@veupathdb/components/lib/components/plotControls/HistogramControls';
import usePlotControls from '@veupathdb/components/lib/hooks/usePlotControls';
import Histogram, {
  HistogramProps,
} from '@veupathdb/components/lib/plots/Histogram';
import {
  HistogramData,
  HistogramDataSeries,
} from '@veupathdb/components/lib/types/plots';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import React, { useCallback } from 'react';
import {
  DataClient,
  DateHistogramBinWidthResponse,
  DateHistogramRequestParams,
  NumericHistogramBinWidthResponse,
  NumericHistogramRequestParams,
} from '../../api/data-api';
import { usePromise } from '../../hooks/promise';
import { useDataClient } from '../../hooks/workspace';
import { Filter } from '../../types/filter';
import { StudyEntity, StudyMetadata, StudyVariable } from '../../types/study';
import { PromiseType } from '../../types/utility';
import { HistogramVariable } from './types';
import { getDistribution } from './util';

type Props = {
  studyMetadata: StudyMetadata;
  variable: HistogramVariable;
  entity: StudyEntity;
  filters?: Filter[];
};

type GetDataParams = {
  binWidth?: number;
  selectedUnit?: string;
};

export function HistogramFilter(props: Props) {
  const { variable, entity, filters, studyMetadata } = props;
  const { id: studyId } = studyMetadata;
  const dataClient = useDataClient();
  const getData = useCallback(
    async (dataParams?: GetDataParams) => {
      const distribution = await getDistribution<
        DateHistogramBinWidthResponse | NumericHistogramBinWidthResponse
      >(
        {
          entityId: entity.id,
          variableId: variable.id,
          filters,
        },
        (filters) => {
          const params = getRequestParams(
            studyId,
            filters,
            entity,
            variable,
            dataParams
          );
          return variable.type === 'date'
            ? dataClient.getDateHistogramBinWidth(
                params as DateHistogramRequestParams
              )
            : dataClient.getNumericHistogramBinWidth(
                params as NumericHistogramRequestParams
              );
        }
      );
      const series = [
        histogramResponseToDataSeries(
          `${variable.displayName} (remaining)`,
          distribution.background,
          'gray'
        ),
        histogramResponseToDataSeries(
          `${variable.displayName} (all)`,
          distribution.foreground,
          'red'
        ),
      ];
      const binWidth = parseInt(
        String(distribution.foreground.config.binWidth),
        10
      );
      const { min, max, step } = distribution.foreground.config.binSlider;
      const binWidthRange = [min, max] as [number, number];
      const binWidthStep = step;
      return {
        series,
        binWidth,
        binWidthRange,
        binWidthStep,
        variableId: variable.id,
        entityId: entity.id,
      };
    },
    [dataClient, entity, filters, studyId, variable]
  );
  const data = usePromise(getData);
  return (
    <>
      {data.pending && <Loading radius={4} />}
      {data.error && <pre>{String(data.error)}</pre>}
      {data.value &&
        data.value.variableId === variable.id &&
        data.value.entityId === entity.id && (
          <HistogramPlotWithControls
            data={data.value}
            getData={getData}
            width={1000}
            height={600}
            orientation={'horizontal'}
            barLayout={'overlay'}
          />
        )}
    </>
  );
}

type HistogramPlotWithControlsProps = HistogramProps & {
  getData: (params?: GetDataParams) => Promise<HistogramData>;
};

function HistogramPlotWithControls({
  data,
  getData,
  ...histogramProps
}: HistogramPlotWithControlsProps) {
  const plotControls = usePlotControls<HistogramData>({
    data: data,
    histogram: {
      binWidthRange: data.binWidthRange,
      binWidthStep: data.binWidthStep,
      onBinWidthChange: getData,
    },
    // onSelectedUnitChange: getData
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Histogram {...histogramProps} {...plotControls} />
      <HistogramControls
        label="Histogram Controls"
        {...plotControls}
        {...plotControls.histogram}
      />
    </div>
  );
}

function histogramResponseToDataSeries(
  name: string,
  response: PromiseType<
    ReturnType<
      DataClient['getDateHistogramBinWidth' | 'getNumericHistogramBinWidth']
    >
  >,
  color: string
): HistogramDataSeries {
  if (response.data.length !== 1)
    throw Error(
      `Expected a single data series, but got ${response.data.length}`
    );
  const data = response.data[0];
  const bins = data.value.map((_, index) => ({
    binStart: data.binStart[index],
    binLabel: data.binLabel[index],
    count: data.value[index],
  }));
  return {
    name,
    color,
    bins,
  };
}

function getRequestParams(
  studyId: string,
  filters: Filter[],
  entity: StudyEntity,
  variable: HistogramVariable,
  dataParams?: GetDataParams
): NumericHistogramRequestParams | DateHistogramRequestParams {
  const binOption = dataParams?.binWidth
    ? {
        binWidth:
          variable.type === 'number'
            ? dataParams.binWidth
            : `${dataParams.binWidth} years`,
      }
    : {
        // numBins: 10,
      };
  return {
    studyId,
    filters,
    config: {
      entityId: entity.id,
      valueSpec: 'count',
      xAxisVariable: {
        entityId: entity.id,
        variableId: variable.id,
      },
      ...binOption,
    },
  } as NumericHistogramRequestParams | DateHistogramRequestParams;
}
