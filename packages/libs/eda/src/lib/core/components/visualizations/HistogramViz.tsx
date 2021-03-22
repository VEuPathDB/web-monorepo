import React, { useCallback, useState } from 'react';
import { SessionState, StudyEntity, StudyMetadata } from '../../../core';
import Histogram, {
  HistogramProps,
} from '@veupathdb/components/lib/plots/Histogram';
import { HistogramData } from '@veupathdb/components/lib/types/plots';
import { NumberOrTimeDelta } from '@veupathdb/components/lib/types/general';
import usePlotControls from '@veupathdb/components/lib/hooks/usePlotControls';
import HistogramControls from '@veupathdb/components/lib/components/plotControls/HistogramControls';
import { useDataClient } from '../../hooks/workspace';
import { StudyVariable } from '../../types/study';
import { usePromise } from '../../hooks/promise';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import {
  DataClient,
  DateHistogramRequestParams,
  NumericHistogramRequestParams,
} from '../../api/data-api';
import { PromiseType } from '../../types/utility';
import { Filter } from '../../types/filter';
import { HistogramVariable } from '../filter/types';
import { isHistogramVariable } from '../filter/guards';
import { VariableTree } from '../VariableTree';
import { HistogramConfig } from '../../types/visualization';

interface Props {
  studyMetadata: StudyMetadata;
  sessionState: SessionState;
  vizState: HistogramConfig;
  onVizStateChange: (newState: HistogramConfig) => void;
  entities: StudyEntity[];
}

export default function HistogramViz(props: Props) {
  const {
    entities,
    sessionState,
    vizState,
    onVizStateChange,
    studyMetadata,
  } = props;
  const { id: studyId } = studyMetadata;
  const dataClient: DataClient = useDataClient();

  // Entity and variable for main histogram x-axis variable
  const [variable, entity] = [
    vizState.independentVariable,
    vizState.independentVariableEntity,
  ];

  // TO DO: if/when VariableTree can take a callback, use something like this
  const onVariableChange = (
    newEntity: StudyEntity,
    newVariable: StudyVariable
  ) => {
    if (newEntity && newVariable) {
      onVizStateChange({
        ...vizState,
        independentVariable: newVariable,
        independentVariableEntity: newEntity,
      });
    }
  };

  // Entity and variable for the first 'overlay' stratification
  const [overlayVariable, overlayEntity] = [
    vizState.overlayVariable,
    vizState.overlayVariableEntity,
  ];
  const onOverlayVariableChange = (
    newEntity: StudyEntity,
    newVariable: StudyVariable
  ) => {
    if (newEntity && newVariable) {
      onVizStateChange({
        ...vizState,
        overlayVariable: newVariable,
        overlayVariableEntity: newEntity,
      });
    }
  };

  const getData = useCallback(
    async (dataParams?: GetDataParams): Promise<HistogramData> => {
      if (!variable || !entity)
        return Promise.reject(new Error('Please choose a main variable'));

      if (variable && !isHistogramVariable(variable))
        return Promise.reject(
          new Error(
            `Please choose another main variable. '${variable.displayName}' is not suitable for histograms`
          )
        );

      const params = getRequestParams(
        studyId,
        sessionState.session?.filters ?? [],
        entity,
        variable as HistogramVariable,
        overlayEntity,
        overlayVariable,
        dataParams
      );
      const response =
        variable.type === 'date'
          ? dataClient.getDateHistogramBinWidth(
              params as DateHistogramRequestParams
            )
          : dataClient.getNumericHistogramBinWidth(
              params as NumericHistogramRequestParams
            );
      return histogramResponseToData(await response);
    },
    [
      studyId,
      entity,
      variable,
      dataClient,
      sessionState.session?.filters,
      overlayEntity,
      overlayVariable,
    ]
  );

  const data = usePromise(getData);
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div>
        <h1>Histogram</h1>
        <h2>Choose the main variable</h2>
        <div style={{ height: 200, overflow: 'auto' }}>
          <VariableTree
            entities={entities}
            entityId={entity.id}
            variableId={variable.id}
          />
        </div>
        <h2>Choose the overlay variable</h2>
        <div style={{ height: 200, overflow: 'auto' }}>
          <VariableTree
            entities={entities}
            entityId={entity.id}
            variableId={variable.id}
          />
        </div>
      </div>
      {data.pending && (
        <Loading style={{ position: 'absolute', top: '-1.5em' }} radius={2} />
      )}
      {data.error && <pre>{String(data.error)}</pre>}
      {data.value && (
        <HistogramPlotWithControls
          data={data.value}
          getData={getData}
          width={800}
          height={400}
          orientation={'horizontal'}
          barLayout={'overlay'}
        />
      )}
    </div>
  );
}

type GetDataParams = {
  binWidth?: NumberOrTimeDelta;
  selectedUnit?: string;
};

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

/**
 * Reformat response from histogram endpoints into complete HistogramData
 * @param response
 * @returns HistogramData
 */
export function histogramResponseToData(
  response: PromiseType<
    ReturnType<
      DataClient['getDateHistogramBinWidth' | 'getNumericHistogramBinWidth']
    >
  >
): HistogramData {
  if (response.data.length === 0)
    throw Error(`Expected one or more data series, but got zero`);
  return {
    series: response.data.map((data, index) => ({
      name: `series ${index}`, // TO DO get from res
      // color: TO DO
      bins: data.value.map((_, index) => ({
        binStart: Number(data.binStart[index]),
        binEnd: Number(data.binStart[index]) + Number(response.config.binWidth),
        binLabel: data.binLabel[index],
        count: data.value[index],
      })),
    })),
    // TO DO binWidthStuff
  };
}

function getRequestParams(
  studyId: string,
  filters: Filter[],
  entity: StudyEntity,
  variable: HistogramVariable,
  overlayEntity?: StudyEntity,
  overlayVariable?: StudyVariable, // TO DO: ?CategoricalVariable?
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
      outputEntityId: entity.id,
      valueSpec: 'count',
      xAxisVariable: {
        entityId: entity.id,
        variableId: variable.id,
      },
      overlayVariable:
        overlayEntity && overlayVariable
          ? {
              entityId: overlayEntity.id,
              variableId: overlayVariable.id,
            }
          : undefined,
      ...binOption,
    },
  } as NumericHistogramRequestParams | DateHistogramRequestParams;
}
