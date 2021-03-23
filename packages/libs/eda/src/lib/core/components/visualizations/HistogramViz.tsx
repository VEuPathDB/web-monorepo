import React, { CSSProperties, useCallback, useState } from 'react';
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

  const {
    independentVariable,
    independentVariableEntity,
    overlayVariable,
    overlayVariableEntity,
  } = vizState;

  const onVariableChange = (term: string) => {
    if (term) {
      const [newEntityId, newVariableId] = term.split('/');
      const newEntity = entities.find((entity) => entity.id === newEntityId);
      const newVariable = newEntity?.variables.find(
        (variable) => variable.id === newVariableId
      );
      if (newEntity && newVariable) {
        onVizStateChange({
          ...vizState,
          independentVariable: newVariable,
          independentVariableEntity: newEntity,
        });
      }
    }
  };

  const onOverlayVariableChange = (term: string) => {
    if (term) {
      const [newEntityId, newVariableId] = term.split('/');
      const newEntity = entities.find((entity) => entity.id === newEntityId);
      const newVariable = newEntity?.variables.find(
        (variable) => variable.id === newVariableId
      );
      if (newEntity && newVariable) {
        onVizStateChange({
          ...vizState,
          overlayVariable: newVariable,
          overlayVariableEntity: newEntity,
        });
      }
    }
  };

  const getData = useCallback(
    async (dataParams?: GetDataParams): Promise<HistogramData> => {
      if (!independentVariable || !independentVariableEntity)
        return Promise.reject(new Error('Please choose a main variable'));

      if (independentVariable && !isHistogramVariable(independentVariable))
        return Promise.reject(
          new Error(
            `Please choose another main variable. '${independentVariable.displayName}' is not suitable for histograms`
          )
        );

      const params = getRequestParams(
        studyId,
        sessionState.session?.filters ?? [],
        independentVariableEntity,
        independentVariable,
        overlayVariableEntity,
        overlayVariable,
        dataParams
      );
      const response =
        independentVariable.type === 'date'
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
      independentVariableEntity,
      independentVariable,
      dataClient,
      sessionState.session?.filters,
      overlayVariableEntity,
      overlayVariable,
    ]
  );

  const variableTreeContainerCSS: CSSProperties = {
    border: '1px solid',
    borderRadius: '.25em',
    padding: '.5em',
    height: '30vh',
    width: '30em',
    overflow: 'auto',
    position: 'relative',
  };

  const data = usePromise(getData);
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div>
        <h1>Histogram</h1>
        <h2>Choose the main variable</h2>
        <div style={variableTreeContainerCSS}>
          <VariableTree
            entities={entities}
            entityId={independentVariableEntity?.id}
            variableId={independentVariable?.id}
            onActiveFieldChange={onVariableChange}
          />
        </div>
        <h2>Choose the overlay variable</h2>
        <div style={variableTreeContainerCSS}>
          <VariableTree
            entities={entities}
            entityId={overlayVariableEntity?.id}
            variableId={overlayVariable?.id}
            onActiveFieldChange={onOverlayVariableChange}
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
      name: data.overlayVariableDetails?.value ?? `series ${index}`,
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
