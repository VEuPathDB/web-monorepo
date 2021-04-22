//DKDK block histogram stuffs
// import HistogramControls from '@veupathdb/components/lib/components/plotControls/HistogramControls';
//DKDK scatter plot props may be imported but for now manually set here before changing
// import Histogram, {
//   HistogramProps,
// } from '@veupathdb/components/lib/plots/Histogram';
import PlotlyPlot, {
  PlotProps,
  ModebarDefault,
} from '@veupathdb/components/lib/plots//PlotlyPlot';
// need to export Scatterplot or add @types/plotly.js
// import { Layout, PlotData } from 'plotly.js';

//DKDK load src for changing, esp. props
import ScatterAndLinePlotGeneral from '@veupathdb/components/lib/plots/ScatterAndLinePlotGeneral';
// import ScatterAndLinePlotGeneral from '@veupathdb/components/src/plots/ScatterAndLinePlotGeneral';

import {
  ErrorManagement,
  NumberOrTimeDelta,
  NumberOrTimeDeltaRange,
  TimeDelta,
} from '@veupathdb/components/lib/types/general';
import { isTimeDelta } from '@veupathdb/components/lib/types/guards';

//DKDK may need to make a new ScatterplotData ts
// import { HistogramData } from '@veupathdb/components/lib/types/plots';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { isEqual } from 'lodash';
import React, { useCallback, useMemo } from 'react';

//DKDK need to set for Scatterplot
import {
  DataClient,
  ScatterplotRequestParams,
  // DateHistogramRequestParams,
  // NumericHistogramRequestParams,
} from '../../../api/data-api';

import { usePromise } from '../../../hooks/promise';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { Filter } from '../../../types/filter';
import { PromiseType } from '../../../types/utility';
import { Variable } from '../../../types/variable';
import { DataElementConstraint } from '../../../types/visualization';
import {
  ISODateStringToZuluDate,
  parseTimeDelta,
} from '../../../utils/date-conversion';

//DKDK need to make ts for Scatterplot?
// import { isHistogramVariable } from '../../filter/guards';
// import { HistogramVariable } from '../../filter/types';

import { InputVariables } from '../InputVariables';
import { VisualizationProps, VisualizationType } from '../VisualizationTypes';

export const scatterplotVisualization: VisualizationType = {
  gridComponent: GridComponent,
  selectorComponent: SelectorComponent,
  fullscreenComponent: FullscreenComponent,
  createDefaultConfig: createDefaultConfig,
};

//DKDK copy Scatter Plot props here for now
//DKDK change interface a bit more: this could avoid error on data type

// interface ScatterplotProps<T extends keyof PlotData> extends PlotProps {
interface ScatterplotProps<T extends keyof any> extends PlotProps {
  //DKDK temporarily set any before resolving @types/plotly.js
  // data: Pick<PlotData, T>[];
  data: any;
  xLabel: string;
  yLabel: string;
  plotTitle: string;
  //DKDK involving CI, x & y range may need to be set
  xRange?: number[] | Date[];
  yRange?: number[] | Date[];
  showLegend?: boolean;
}

//DKDK from ScatterAndLinePlotGeneral component
interface ScatterPlotData<T extends number | Date> {
  data: Array<{
    series: {
      x: T[]; //DKDK perhaps string[] is better despite Date format, e.g., ISO format?
      y: T[]; //DKDK will y data have a Date?
      popupContent?: string;
    };
    interval?: {
      x: T[]; //DKDK perhaps string[] is better despite Date format, e.g., ISO format?
      y: T[]; //DKDK will y data have a Date?
      orientation: string;
      standardError: number[];
    };
    color?: string;
    label: string;
    //DKDK for general scatter component
    showLines?: boolean;
    showMarkers?: boolean;
    fillArea?: boolean;
    useSpline?: boolean;
  }>;
  opacity?: number;
}

function GridComponent(props: VisualizationProps) {
  const { visualization, computation, filters } = props;
  return (
    <ScatterplotViz
      visualization={visualization}
      computation={computation}
      filters={filters}
      fullscreen={false}
    />
  );
}

function SelectorComponent() {
  return <div>Pick me, I'm a Scatter Plot!</div>;
}

function FullscreenComponent(props: VisualizationProps) {
  const {
    visualization,
    updateVisualization,
    computation,
    filters,
    dataElementConstraints,
  } = props;
  return (
    <ScatterplotViz
      visualization={visualization}
      updateVisualization={updateVisualization}
      computation={computation}
      filters={filters}
      fullscreen={true}
      constraints={dataElementConstraints}
    />
  );
}

function createDefaultConfig(): ScatterplotConfig {
  return {
    //DKDK default is true but changed to false for scatterplot
    enableOverlay: true,
  };
}

type ScatterplotConfig = t.TypeOf<typeof ScatterplotConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const ScatterplotConfig = t.intersection([
  t.type({
    enableOverlay: t.boolean,
  }),
  t.partial({
    xAxisVariable: Variable,
    //DKDK yAxisVariable
    yAxisVariable: Variable,
    overlayVariable: Variable,
    // binWidth: t.number,
    // binWidthTimeUnit: t.string, // TO DO: constrain to weeks, months etc like Unit from date-arithmetic and/or R
  }),
]);

type Props = VisualizationProps & {
  fullscreen: boolean;
  constraints?: Record<string, DataElementConstraint>[];
};

function ScatterplotViz(props: Props) {
  const {
    computation,
    visualization,
    updateVisualization,
    filters,
    fullscreen,
    constraints,
  } = props;
  const studyMetadata = useStudyMetadata();
  const { id: studyId } = studyMetadata;
  const entities = useMemo(
    () =>
      Array.from(preorder(studyMetadata.rootEntity, (e) => e.children || [])),
    [studyMetadata]
  );
  const dataClient: DataClient = useDataClient();

  const vizConfig = useMemo(() => {
    return pipe(
      ScatterplotConfig.decode(visualization.configuration),
      getOrElse((): t.TypeOf<typeof ScatterplotConfig> => createDefaultConfig())
    );
  }, [visualization.configuration]);

  const updateVizConfig = useCallback(
    (newConfig: Partial<ScatterplotConfig>) => {
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

  const handleInputVariableChange = useCallback(
    (
      values: Record<
        string,
        { entityId: string; variableId: string } | undefined
      >
    ) => {
      //DKDK yAxisVariable
      const { xAxisVariable, yAxisVariable, overlayVariable } = values;
      // const keepBin = isEqual(xAxisVariable, vizConfig.xAxisVariable);
      updateVizConfig({
        xAxisVariable,
        //DKDK yAxisVariable
        yAxisVariable,
        overlayVariable,
        //DKDK block below
        // binWidth: keepBin ? vizConfig.binWidth : undefined,
        // binWidthTimeUnit: keepBin ? vizConfig.binWidthTimeUnit : undefined,
      });
    },
    [updateVizConfig, vizConfig]
  );

  //DKDK block
  // const onBinWidthChange = useCallback(
  //   ({ binWidth: newBinWidth }: { binWidth: NumberOrTimeDelta }) => {
  //     if (newBinWidth) {
  //       updateVizConfig({
  //         binWidth: isTimeDelta(newBinWidth) ? newBinWidth[0] : newBinWidth,
  //         binWidthTimeUnit: isTimeDelta(newBinWidth)
  //           ? newBinWidth[1]
  //           : undefined,
  //       });
  //     }
  //   },
  //   [updateVizConfig]
  // );

  const findVariable = useCallback(
    (variable?: Variable) => {
      if (variable == null) return undefined;
      return entities
        .find((e) => e.id === variable.entityId)
        ?.variables.find((v) => v.id === variable.variableId);
    },
    [entities]
  );

  const data: any = usePromise(
    //DKDK set any for now
    // useCallback(async (): Promise<ScatterplotData> => {
    useCallback(async (): Promise<any> => {
      const xAxisVariable = findVariable(vizConfig.xAxisVariable);
      //DKDK yAxisVariable
      const yAxisVariable = findVariable(vizConfig.yAxisVariable);
      //DKDK yAxisVariable
      if (vizConfig.xAxisVariable == null || xAxisVariable == null)
        return Promise.reject(new Error('Please choose a X-axis variable'));
      else if (vizConfig.yAxisVariable == null || yAxisVariable == null)
        return Promise.reject(new Error('Please choose a Y-axis variable'));

      //DKDK isHistogramVariable is a type guard
      // if (xAxisVariable && !isHistogramVariable(xAxisVariable))
      // if (xAxisVariable)
      //   throw new Error(
      //     `Please choose another main variable. '${xAxisVariable.displayName}' is not suitable for Scatter Plots`
      //   );

      const params = getRequestParams(
        studyId,
        filters ?? [],
        vizConfig.xAxisVariable,
        //DKDK yAxisVariable
        vizConfig.yAxisVariable,
        //DKDK
        // xAxisVariable.type,
        vizConfig.enableOverlay ? vizConfig.overlayVariable : undefined
        // vizConfig.enableOverlay ? vizConfig.overlayVariable : undefined,
        // vizConfig.binWidth,
        // vizConfig.binWidthTimeUnit,
      );

      // DKDK
      console.log('params = ', params);
      console.log('computation = ', computation);

      //DKDK
      const response = dataClient.getScatterplot(
        computation.type,
        params as ScatterplotRequestParams
      );

      console.log('dataClient->response = ', response);

      //DKDK send visualization.type as well
      return scatterplotResponseToData(await response);
    }, [
      studyId,
      filters,
      dataClient,
      vizConfig,
      findVariable,
      computation.type,
    ])
  );

  //DKDK
  console.log('const data = ', data);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {fullscreen && <h1>Scatter Plot</h1>}
      {fullscreen && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <InputVariables
            inputs={[
              {
                name: 'xAxisVariable',
                label: 'x-axis variable',
              },
              {
                name: 'yAxisVariable',
                label: 'y-axis variable',
              },
              // DKDK block this for now
              // {
              //   name: 'overlayVariable',
              //   label: 'Overlay variable',
              // },
            ]}
            entities={entities}
            values={{
              xAxisVariable: vizConfig.xAxisVariable,
              //DKDK yAxisVariable
              yAxisVariable: vizConfig.yAxisVariable,
              //DKDK block this for now
              // overlayVariable: vizConfig.overlayVariable,
            }}
            onChange={handleInputVariableChange}
            constraints={constraints}
          />
        </div>
      )}

      {data.pending && (
        <Loading style={{ position: 'absolute', top: '-1.5em' }} radius={2} />
      )}
      {data.error && fullscreen && (
        <div
          style={{
            fontSize: '1.2em',
            padding: '1em',
            background: 'rgb(255, 233, 233) none repeat scroll 0% 0%',
            borderRadius: '.5em',
            margin: '.5em 0',
            color: '#333',
            border: '1px solid #d9cdcd',
            display: 'flex',
          }}
        >
          <i className="fa fa-warning" style={{ marginRight: '1ex' }}></i>{' '}
          {data.error instanceof Error
            ? data.error.message
            : String(data.error)}
        </div>
      )}
      {/* DKDK no data.value ?*/}
      {data.value ? (
        fullscreen ? (
          <ScatterplotWithControls
            //DKDK data.value
            data={[data.value]}
            width={1000}
            height={600}
            xLabel={'xLabel'}
            yLabel={'yLabel'}
            plotTitle={'plotTitle'}
          />
        ) : (
          // thumbnail/grid view
          <ScatterAndLinePlotGeneral
            //DKDK data.value
            data={[data.value]}
            width={350}
            height={280}
            // height={200}
            xLabel={'xLabel'}
            yLabel={'yLabel'}
            plotTitle={'plotTitle'}
          />
        )
      ) : (
        <i
          className="fa fa-line-chart"
          style={{
            fontSize: fullscreen ? '34em' : '12em',
            color: '#aaa',
          }}
        ></i>
      )}
    </div>
  );
}

// //DKDK block some
// type ScatterplotWithControlsProps = ScatterplotProps;

function ScatterplotWithControls({
  data,
  // onBinWidthChange,
  ...ScatterplotProps
}: //DKDK
// }: ScatterplotWithControlsProps) {
any) {
  // TODO Use UIState
  const displayLibraryControls = false;
  const errorManagement = useMemo((): ErrorManagement => {
    return {
      errors: [],
      addError: (error: Error) => {},
      removeError: (error: Error) => {},
      clearAllErrors: () => {},
    };
  }, []);

  //DKDK
  console.log('ScatterplotWithControls.data = ', data);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <ScatterAndLinePlotGeneral
        {...ScatterplotProps}
        data={data}
        displayLibraryControls={displayLibraryControls}
      />
    </div>
  );
}

/**
 * Reformat response from Scatter Plot endpoints into complete ScatterplotData
 * @param response
 * @returns ScatterplotData
 */
export function scatterplotResponseToData(
  //DKDK getScatterplot may also need to be changed in the future for hosting other plots
  response: PromiseType<ReturnType<DataClient['getScatterplot']>>
): any {
  if (response.data.length === 0)
    throw Error(`Expected one or more data series, but got zero`);
  else console.log('Im at scatterplotResponseToData');

  console.log('response.data =', response);

  return {
    x: response.data[0]['series.x'],
    y: response.data[0]['series.y'],
    name: 'hardcorded label',
    mode: 'markers',
    type: 'scatter',
    // fill: fillAreaValue,
    marker: { color: 'blue', size: 12 },
    line: { color: 'blue', shape: 'spline' },
  };
}

function getRequestParams(
  studyId: string,
  filters: Filter[],
  xAxisVariable: Variable,
  yAxisVariable: Variable,
  overlayVariable?: Variable
): ScatterplotRequestParams {
  return {
    studyId,
    filters,
    config: {
      //DKDK is this correct???
      outputEntityId: xAxisVariable.entityId,
      //DKDK valueSpect may be used in the future
      valueSpec: 'raw',
      // valueSpec: 'smoothedMean',
      // valueSpec: 'smoothedMeanWithRaw',
      // smoothedMean: true,
      xAxisVariable: xAxisVariable,
      yAxisVariable: yAxisVariable,
      //DKDK think about overlayVariable later
      // overlayVariable: overlayVariable,
    },
  } as ScatterplotRequestParams;
}
