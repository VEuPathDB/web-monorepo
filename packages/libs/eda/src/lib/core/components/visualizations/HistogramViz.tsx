import React, { CSSProperties, useCallback, useMemo, useState } from 'react';
import { SessionState, StudyEntity, StudyMetadata } from '../../../core';
import Histogram, {
  HistogramProps,
} from '@veupathdb/components/lib/plots/Histogram';
import { HistogramData } from '@veupathdb/components/lib/types/plots';
import {
  ErrorManagement,
  NumberOrTimeDelta,
  NumberOrTimeDeltaRange,
} from '@veupathdb/components/lib/types/general';
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
  vizConfig: HistogramConfig;
  onVizConfigChange: (newConfig: HistogramConfig) => void;
  entities: StudyEntity[];
}

export default function HistogramViz(props: Props) {
  const {
    entities,
    sessionState,
    vizConfig,
    onVizConfigChange,
    studyMetadata,
  } = props;
  const { id: studyId } = studyMetadata;
  const dataClient: DataClient = useDataClient();

  const {
    independentVariable,
    independentVariableEntity,
    overlayVariable,
    overlayVariableEntity,
    binWidth,
    binWidthTimeUnit,
  } = vizConfig;

  const updateVizState = (newConfig: Partial<HistogramConfig>) => {
    onVizConfigChange({
      ...vizConfig,
      ...newConfig,
    });
  };

  const onMainVariableChange = (term: string) => {
    if (term) {
      const { entity: newEntity, variable: newVariable } = splitTerm(
        term,
        entities
      );
      if (newEntity && newVariable) {
        updateVizState({
          independentVariable: newVariable,
          independentVariableEntity: newEntity,
        });
      }
    }
  };

  const onOverlayVariableChange = (term: string) => {
    if (term) {
      const { entity: newEntity, variable: newVariable } = splitTerm(
        term,
        entities
      );
      if (newEntity && newVariable) {
        updateVizState({
          overlayVariable: newVariable,
          overlayVariableEntity: newEntity,
        });
      }
    }
  };

  const onBinWidthChange = (newBinWidth: number) => {
    console.log(`in onBinWidthChange ${newBinWidth}`);
    if (newBinWidth) {
      updateVizState({ binWidth: newBinWidth });
    }
  };

  const getData = useCallback(
    async ({
      independentVariable,
      independentVariableEntity,
      overlayVariable,
      overlayVariableEntity,
      binWidth,
      binWidthTimeUnit,
    }: HistogramConfig): Promise<HistogramData> => {
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
        binWidth,
        binWidthTimeUnit
      );
      const response =
        independentVariable.type === 'date'
          ? dataClient.getDateHistogramBinWidth(
              params as DateHistogramRequestParams
            )
          : dataClient.getNumericHistogramBinWidth(
              params as NumericHistogramRequestParams
            );
      return histogramResponseToData(await response, independentVariable.type);
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

  //  const data = usePromise(
  //    useCallback(() => getData(uiState), [getData, uiState])
  //  );

  const data = usePromise(
    useCallback(() => getData(vizConfig), [getData, vizConfig])
  );
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
            onActiveFieldChange={onMainVariableChange}
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
          onBinWidthChange={onBinWidthChange}
          width={800}
          height={400}
          orientation={'vertical'}
          barLayout={'stack'}
        />
      )}
    </div>
  );
}

type HistogramPlotWithControlsProps = HistogramProps & {
  onBinWidthChange: (newBinWidth: number) => void;
};

function HistogramPlotWithControls({
  data,
  onBinWidthChange,
  ...histogramProps
}: HistogramPlotWithControlsProps) {
  const handleBinWidthChange = useCallback(
    ({ binWidth }: { binWidth: NumberOrTimeDelta }) => {
      console.log(`handleBinWidthChange ${binWidth}`);
      const newBinWidth = typeof binWidth === 'number' ? binWidth : binWidth[0];
      onBinWidthChange(newBinWidth);
    },
    [onBinWidthChange]
  );

  // TODO Use UIState
  const barLayout = 'stack';
  const displayLegend = true;
  const displayLibraryControls = false;
  const opacity = 100;
  const errorManagement = useMemo((): ErrorManagement => {
    return {
      errors: [],
      addError: (error: Error) => {},
      removeError: (error: Error) => {},
      clearAllErrors: () => {},
    };
  }, []);
  console.log(data.binWidthRange);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Histogram
        {...histogramProps}
        data={data}
        opacity={opacity}
        displayLegend={displayLegend}
        displayLibraryControls={displayLibraryControls}
        barLayout={barLayout}
      />
      <HistogramControls
        label="Histogram Controls"
        valueType={data.valueType}
        barLayout={barLayout}
        displayLegend={displayLegend}
        displayLibraryControls={displayLibraryControls}
        opacity={opacity}
        orientation={histogramProps.orientation}
        binWidth={data.binWidth!}
        onBinWidthChange={(val) => {
          console.log(val);
          handleBinWidthChange(val);
        }}
        binWidthRange={data.binWidthRange!}
        binWidthStep={data.binWidthStep!}
        errorManagement={errorManagement}
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
  >,
  type: HistogramVariable['type']
): HistogramData {
  if (response.data.length === 0)
    throw Error(`Expected one or more data series, but got zero`);

  const binWidth = parseInt(String(response.config.binWidth), 10) || 1;
  const { min, max, step } = response.config.binSlider;
  const binWidthRange = (type === 'number'
    ? { min, max }
    : { min, max, unit: 'day' }) as NumberOrTimeDeltaRange;
  const binWidthStep = step || 0.1;
  console.log(
    `response binwidth ${binWidth} and range ${binWidthRange.min} - ${binWidthRange.max}`
  );
  return {
    series: response.data.map((data, index) => ({
      name: data.overlayVariableDetails?.value ?? `series ${index}`,
      // color: TO DO
      bins: data.value
        .map((_, index) => ({
          binStart:
            type === 'number'
              ? Number(data.binStart[index])
              : new Date(data.binStart[index] + 'Z'),
          binEnd:
            type === 'number'
              ? Number(data.binEnd[index])
              : new Date(data.binEnd[index] + 'Z'),
          binLabel: data.binLabel[index],
          count: data.value[index],
        }))
        .sort((a, b) => a.binStart.valueOf() - b.binStart.valueOf()),
      // TO DO: review necessity of sort if back end (or plot component) does sorting?
    })),
    binWidth,
    binWidthRange,
    binWidthStep,
  };
}

function getRequestParams(
  studyId: string,
  filters: Filter[],
  entity: StudyEntity,
  variable: HistogramVariable,
  overlayEntity?: StudyEntity,
  overlayVariable?: StudyVariable, // TO DO: ?CategoricalVariable?
  binWidth?: number,
  binWidthTimeUnit?: string
): NumericHistogramRequestParams | DateHistogramRequestParams {
  const binOption = binWidth
    ? {
        binWidth:
          variable.type === 'number'
            ? binWidth
            : `${binWidth} ${binWidthTimeUnit}`,
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

function splitTerm(term: string, entities: StudyEntity[]) {
  if (term) {
    const [newEntityId, newVariableId] = term.split('/');
    const newEntity = entities.find((entity) => entity.id === newEntityId);
    const newVariable = newEntity?.variables.find(
      (variable) => variable.id === newVariableId
    ) as StudyVariable;
    return { entity: newEntity, variable: newVariable };
  }
  return {};
}
