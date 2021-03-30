import { VisualizationProps, VisualizationType } from '../VisualizationTypes';

import React, { CSSProperties, useCallback, useMemo } from 'react';
import { StudyEntity, StudyVariable } from '../../../../core';
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
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { usePromise } from '../../../hooks/promise';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import {
  DataClient,
  DateHistogramRequestParams,
  NumericHistogramRequestParams,
} from '../../../api/data-api';
import { PromiseType } from '../../../types/utility';
import { Filter } from '../../../types/filter';
import { HistogramVariable } from '../../filter/types';
import { isHistogramVariable } from '../../filter/guards';
import { VariableTree } from '../../VariableTree';
import {
  ISODateStringToZuluDate,
  parseTimeDelta,
} from '../../../utils/date-conversion';
import { isTimeDelta } from '@veupathdb/components/lib/types/guards';

import debounce from 'debounce-promise';
import * as t from 'io-ts';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { pipe } from 'fp-ts/lib/function';
import { getOrElse } from 'fp-ts/lib/Either';

export const histogramVisualization: VisualizationType = {
  type: 'histogram',
  displayName: 'Unnamed Histogram',
  gridComponent: GridComponent,
  selectorComponent: SelectorComponent,
  fullscreenComponent: FullscreenComponent,
  createDefaultConfig: createDefaultConfig,
};

function GridComponent(props: VisualizationProps) {
  const { visualization, computation, filters } = props;
  return (
    <HistogramViz
      visualization={visualization}
      computation={computation}
      filters={filters}
      fullscreen={false}
    />
  );
}

function SelectorComponent() {
  return <div>Pick me, I'm a histogram!</div>;
}

function FullscreenComponent(props: VisualizationProps) {
  const { visualization, updateVisualization, computation, filters } = props;
  return (
    <HistogramViz
      visualization={visualization}
      updateVisualization={updateVisualization}
      computation={computation}
      filters={filters}
      fullscreen={true}
    />
  );
}

function createDefaultConfig(): HistogramConfig {
  return {
    enableOverlay: true,
  };
}

type HistogramConfig = t.TypeOf<typeof HistogramConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const HistogramConfig = t.intersection([
  t.type({
    enableOverlay: t.boolean,
  }),
  t.partial({
    independentVariable: StudyVariable,
    independentVariableEntity: StudyEntity,
    overlayVariable: StudyVariable,
    overlayVariableEntity: StudyEntity,
    binWidth: t.number,
    binWidthTimeUnit: t.string, // TO DO: constrain to weeks, months etc like Unit from date-arithmetic and/or R
  }),
]);

type Props = VisualizationProps & {
  fullscreen: boolean;
};

function HistogramViz(props: Props) {
  const { visualization, updateVisualization, filters, fullscreen } = props;
  const studyMetadata = useStudyMetadata();
  const { id: studyId } = studyMetadata;
  const entities = Array.from(
    preorder(studyMetadata.rootEntity, (e) => e.children || [])
  );
  const dataClient: DataClient = useDataClient();

  const vizConfig = useMemo(() => {
    return pipe(
      HistogramConfig.decode(visualization.configuration),
      getOrElse((): t.TypeOf<typeof HistogramConfig> => createDefaultConfig())
    );
  }, [visualization.configuration]);

  const {
    independentVariable,
    independentVariableEntity,
    overlayVariable,
    overlayVariableEntity,
    enableOverlay,
  } = vizConfig;

  const updateVizConfig = useCallback(
    (newConfig: Partial<HistogramConfig>) => {
      if (updateVisualization) {
        updateVisualization({
          ...visualization,
          configuration: {
            ...vizConfig,
            ...newConfig,
          },
        });
      }
    },
    [updateVisualization, visualization, vizConfig]
  );

  const onMainVariableChange = useCallback(
    (term: string) => {
      if (term) {
        const { entity: newEntity, variable: newVariable } = splitTerm(
          term,
          entities
        );
        if (newEntity && newVariable) {
          updateVizConfig({
            independentVariable: newVariable,
            independentVariableEntity: newEntity,
            binWidth: undefined,
            binWidthTimeUnit: undefined, // reset binWidth if changing variables
          });
        }
      }
    },
    [updateVizConfig, entities]
  );

  const onOverlayVariableChange = useCallback(
    (term: string) => {
      if (term) {
        const { entity: newEntity, variable: newVariable } = splitTerm(
          term,
          entities
        );
        if (newEntity && newVariable) {
          updateVizConfig({
            overlayVariable: newVariable,
            overlayVariableEntity: newEntity,
          });
        }
      }
    },
    [updateVizConfig, entities]
  );

  const onBinWidthChange = useCallback(
    ({ binWidth: newBinWidth }: { binWidth: NumberOrTimeDelta }) => {
      if (newBinWidth) {
        updateVizConfig({
          binWidth: isTimeDelta(newBinWidth) ? newBinWidth[0] : newBinWidth,
          binWidthTimeUnit: isTimeDelta(newBinWidth)
            ? newBinWidth[1]
            : undefined,
        });
      }
    },
    [updateVizConfig]
  );

  const getData = useMemo(
    () =>
      debounce(
        async ({
          enableOverlay,
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
            filters ?? [],
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
    [studyId, filters, dataClient]
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
      {fullscreen && (
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
              updateVizConfig({ enableOverlay: !enableOverlay });
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
      )}
      {data.pending && (
        <Loading style={{ position: 'absolute', top: '-1.5em' }} radius={2} />
      )}
      {data.error && <pre>{String(data.error)}</pre>}
      {data.value &&
        (fullscreen ? (
          <HistogramPlotWithControls
            data={data.value}
            onBinWidthChange={onBinWidthChange}
            width={800}
            height={400}
            orientation={'vertical'}
            barLayout={'stack'}
            displayLegend={data.value?.series.length > 1}
          />
        ) : (
          // thumbnail/grid view
          <Histogram
            data={data.value}
            width={300}
            height={250}
            orientation={'vertical'}
            barLayout={'stack'}
            displayLibraryControls={false}
            displayLegend={false}
            independentAxisLabel=""
            dependentAxisLabel=""
          />
        ))}
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
