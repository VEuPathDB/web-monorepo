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
  TimeDelta,
} from '@veupathdb/components/lib/types/general';
import HistogramControls from '@veupathdb/components/lib/components/plotControls/HistogramControls';
import Switch from '@veupathdb/components/lib/components/widgets/Switch';
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
import {
  ISODateStringToZuluDate,
  parseTimeDelta,
} from '../../utils/date-conversion';
import { isTimeDelta } from '@veupathdb/components/lib/types/guards';

import debounce from 'debounce-promise';

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
    enableOverlay,
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
          binWidth: undefined,
          binWidthTimeUnit: undefined, // reset binWidth if changing variables
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

  const onBinWidthChange = ({
    binWidth: newBinWidth,
  }: {
    binWidth: NumberOrTimeDelta;
  }) => {
    if (newBinWidth) {
      updateVizState({
        binWidth: isTimeDelta(newBinWidth) ? newBinWidth[0] : newBinWidth,
        binWidthTimeUnit: isTimeDelta(newBinWidth) ? newBinWidth[1] : undefined,
      });
    }
  };

  const getData = useCallback(
    debounce(
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
          enableOverlay ? overlayVariableEntity : undefined,
          enableOverlay ? overlayVariable : undefined,
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
        return histogramResponseToData(
          await response,
          independentVariable.type
        );
      },
      500
    ),
    [studyId, dataClient, sessionState.session?.filters, vizConfig]
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
        <Switch
          label="Enable overlay"
          state={enableOverlay}
          onStateChange={() => {
            updateVizState({ enableOverlay: !enableOverlay });
          }}
        />
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
          displayLegend={data.value?.series.length > 1}
        />
      )}
    </div>
  );
}

type HistogramPlotWithControlsProps = HistogramProps & {
  onBinWidthChange: ({
    binWidth: newBinWidth,
  }: {
    binWidth: NumberOrTimeDelta;
  }) => void;
};

function HistogramPlotWithControls({
  data,
  onBinWidthChange,
  ...histogramProps
}: HistogramPlotWithControlsProps) {
  // TODO Use UIState
  const barLayout = 'stack';
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Histogram
        {...histogramProps}
        data={data}
        opacity={opacity}
        displayLibraryControls={displayLibraryControls}
        showBarValues={false}
        barLayout={barLayout}
      />
      <HistogramControls
        label="Histogram Controls"
        valueType={data.valueType}
        barLayout={barLayout}
        displayLegend={false /* should not be a required prop */}
        displayLibraryControls={displayLibraryControls}
        opacity={opacity}
        orientation={histogramProps.orientation}
        binWidth={data.binWidth!}
        selectedUnit={
          data.binWidth && isTimeDelta(data.binWidth)
            ? data.binWidth[1]
            : undefined
        }
        onBinWidthChange={({ binWidth: newBinWidth }) => {
          onBinWidthChange({ binWidth: newBinWidth });
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

  const binWidth =
    type === 'number'
      ? parseInt(String(response.config.binWidth), 10) || 1
      : parseTimeDelta(response.config.binWidth as string);
  const { min, max, step } = response.config.binSlider;
  // FIXME - remove max/100 when sorted
  const binWidthRange = (type === 'number'
    ? { min, max }
    : {
        min,
        max: max / 100,
        unit: (binWidth as TimeDelta)[1],
      }) as NumberOrTimeDeltaRange;
  const binWidthStep = step || 0.1;
  return {
    series: response.data.map((data, index) => ({
      name: data.overlayVariableDetails?.value ?? `series ${index}`,
      // color: TO DO
      bins: data.value
        .map((_, index) => ({
          binStart:
            type === 'number'
              ? Number(data.binStart[index])
              : ISODateStringToZuluDate(data.binStart[index]),
          binEnd:
            type === 'number'
              ? Number(data.binEnd[index])
              : ISODateStringToZuluDate(data.binEnd[index]),
          binLabel: data.binLabel[index],
          count: data.value[index],
        }))
        .sort((a, b) => a.binStart.valueOf() - b.binStart.valueOf()),
      // TO DO: review necessity of sort if back end (or plot component) does sorting?
    })),
    valueType: type,
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
