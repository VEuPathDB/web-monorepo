// load Boxplot component
import BoxplotEDA from '@veupathdb/components/lib/plots/BoxplotEDA';
import { ErrorManagement } from '@veupathdb/components/lib/types/general';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import React, { useCallback, useMemo } from 'react';

// need to set for Boxplot
import { DataClient, BoxplotRequestParams } from '../../../api/data-api';

import { usePromise } from '../../../hooks/promise';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { Filter } from '../../../types/filter';
import { PromiseType } from '../../../types/utility';
import { Variable } from '../../../types/variable';

// tableVariable/isTableVariable fit to the condition of overlayVariable
import { isScatterplotVariable, isTableVariable } from '../../filter/guards';
// import { ScatterplotVariable } from '../../filter/types';

import { InputVariables } from '../InputVariables';
import { VisualizationProps, VisualizationType } from '../VisualizationTypes';

export const boxplotVisualization: VisualizationType = {
  gridComponent: GridComponent,
  selectorComponent: SelectorComponent,
  fullscreenComponent: FullscreenComponent,
  createDefaultConfig: createDefaultConfig,
};

function GridComponent(props: VisualizationProps) {
  const { visualization, computation, filters } = props;
  return (
    <BoxplotViz
      visualization={visualization}
      computation={computation}
      filters={filters}
      fullscreen={false}
    />
  );
}

// this needs a handling of text/image for scatter, line, and density plots
function SelectorComponent() {
  return <div>Pick me, I'm a Box Plot!</div>;
}

function FullscreenComponent(props: VisualizationProps) {
  return <BoxplotViz {...props} fullscreen />;
}

function createDefaultConfig(): BoxplotConfig {
  return {
    enableOverlay: true,
  };
}

type BoxplotConfig = t.TypeOf<typeof BoxplotConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const BoxplotConfig = t.intersection([
  t.type({
    enableOverlay: t.boolean,
  }),
  t.partial({
    xAxisVariable: Variable,
    yAxisVariable: Variable,
    overlayVariable: Variable,
  }),
]);

type Props = VisualizationProps & {
  fullscreen: boolean;
};

function BoxplotViz(props: Props) {
  const {
    computation,
    visualization,
    updateVisualization,
    filters,
    fullscreen,
    dataElementConstraints,
    dataElementDependencyOrder,
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
      BoxplotConfig.decode(visualization.configuration),
      getOrElse((): t.TypeOf<typeof BoxplotConfig> => createDefaultConfig())
    );
  }, [visualization.configuration]);

  const updateVizConfig = useCallback(
    (newConfig: Partial<BoxplotConfig>) => {
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
      const { xAxisVariable, yAxisVariable, overlayVariable } = values;
      updateVizConfig({
        xAxisVariable,
        yAxisVariable,
        overlayVariable,
      });
    },
    [updateVizConfig, vizConfig]
  );

  const findVariable = useCallback(
    (variable?: Variable) => {
      if (variable == null) return undefined;
      return entities
        .find((e) => e.id === variable.entityId)
        ?.variables.find((v) => v.id === variable.variableId);
    },
    [entities]
  );

  const data = usePromise(
    // set any for now
    // useCallback(async (): Promise<BoxplotData> => {
    useCallback(async (): Promise<any> => {
      const xAxisVariable = findVariable(vizConfig.xAxisVariable);
      const yAxisVariable = findVariable(vizConfig.yAxisVariable);

      // check variable inputs and add densityplot
      if (vizConfig.xAxisVariable == null || xAxisVariable == null)
        return Promise.reject(new Error('Please choose a X-axis variable'));
      else if (vizConfig.yAxisVariable == null || yAxisVariable == null)
        return Promise.reject(new Error('Please choose a Y-axis variable'));
      // add a condition to check whether xAxisVariable == yxAxisVariable
      else if (xAxisVariable === yAxisVariable)
        return Promise.reject(
          new Error(
            'Please choose different variables between X- and Y-axis variable'
          )
        );

      // add visualization.type here. valueSpec too?
      const params = getRequestParams(
        studyId,
        filters ?? [],
        vizConfig.xAxisVariable,
        vizConfig.yAxisVariable,
        vizConfig.enableOverlay ? vizConfig.overlayVariable : undefined,
        // add visualization.type
        visualization.type
      );

      // boxplot
      const response = dataClient.getBoxplot(
        computation.type,
        params as BoxplotRequestParams
      );

      // send visualization.type as well
      return boxplotResponseToData(await response, visualization.type);
    }, [
      studyId,
      filters,
      dataClient,
      vizConfig,
      findVariable,
      computation.type,
      visualization.type,
    ])
  );

  console.log('const boxplot data = ', data);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/*  change title at viz page */}
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
              {
                name: 'overlayVariable',
                label: 'Overlay variable (Optional)',
              },
            ]}
            entities={entities}
            values={{
              xAxisVariable: vizConfig.xAxisVariable,
              yAxisVariable: vizConfig.yAxisVariable,
              overlayVariable: vizConfig.overlayVariable,
            }}
            onChange={handleInputVariableChange}
            constraints={dataElementConstraints}
            dataElementDependencyOrder={dataElementDependencyOrder}
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
      {data.value ? (
        fullscreen ? (
          <BoxplotWithControls
            // data.value
            data={data.value.series}
            // width={1000}
            // height={600}
            vizType={visualization.type}
            // title={'boxplot'}
            orientation={'vertical'}
            // orientation={'horizontal'}
            points={'outliers'}
            // points={'all'}
            //DKDK check this option later
            independentAxisLabel={
              findVariable(vizConfig.xAxisVariable)?.displayName
            }
            dependentAxisLabel={
              findVariable(vizConfig.yAxisVariable)?.displayName
            }
            showMean={true}
          />
        ) : (
          // thumbnail/grid view
          <BoxplotEDA
            data={data.value.series}
            width={230}
            height={165}
            orientation={'vertical'}
            // orientation={'horizontal'}
            points={'outliers'}
            // points={'all'}
            //DKDK show/hide independent/dependent axis tick label
            showIndependentAxisTickLabel={false}
            showDependentAxisTickLabel={false}
            showMean={true}
            staticPlot={true}
            displayLegend={false}
            displayLibraryControls={false}
            margin={{ l: 30, r: 20, b: 0, t: 20 }}
          />
        )
      ) : (
        //DKDK no data or data error case: with control
        <>
          <BoxplotEDA
            data={[]}
            width={fullscreen ? 1000 : 230}
            height={fullscreen ? 600 : 165}
            orientation={'vertical'}
            points={'outliers'}
            independentAxisLabel={
              fullscreen
                ? findVariable(vizConfig.xAxisVariable)
                  ? findVariable(vizConfig.xAxisVariable)?.displayName
                  : 'Label'
                : undefined
            }
            dependentAxisLabel={
              fullscreen
                ? findVariable(vizConfig.yAxisVariable)
                  ? findVariable(vizConfig.yAxisVariable)?.displayName
                  : 'Count'
                : undefined
            }
            //DKDK show/hide independent/dependent axis tick label
            showIndependentAxisTickLabel={fullscreen ? undefined : false}
            showDependentAxisTickLabel={fullscreen ? undefined : false}
            displayLegend={fullscreen ? true : false}
            displayLibraryControls={false}
            staticPlot={fullscreen ? false : true}
            showMean={fullscreen ? false : true}
            margin={fullscreen ? {} : { l: 30, r: 20, b: 0, t: 20 }}
          />
        </>
      )}
    </div>
  );
}

function BoxplotWithControls({
  data,
  vizType,
  ...BoxplotProps
}: //
// }: BoxplotWithControlsProps) {
any) {
  // TODO Use UIState
  const errorManagement = useMemo((): ErrorManagement => {
    return {
      errors: [],
      addError: (error: Error) => {},
      removeError: (error: Error) => {},
      clearAllErrors: () => {},
    };
  }, []);

  // console.log('BoxplotWithControls.data = ', data);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <BoxplotEDA
        {...BoxplotProps}
        data={data}
        // add controls
        displayLegend={data.length > 1}
        displayLibraryControls={false}
      />
      {/* DKDK potential BoxplotControls: commented out for now  */}
      {/* <BoxplotControls
          // label="Box Plot Controls"
          errorManagement={errorManagement}
        /> */}
    </div>
  );
}

/**
 * Reformat response from Scatter Plot endpoints into complete BoxplotData
 * @param response
 * @returns BoxplotData
 */
//DKDK add densityplot
export function boxplotResponseToData(
  response: PromiseType<ReturnType<DataClient['getBoxplot']>>,
  // vizType may be used for handling other plots in this component like line and density
  vizType: string
): any {
  // console.log('visualization type at BoxplotResponseToData = ', vizType);
  console.log('response.data =', response);

  return {
    series: response.boxplot.data.map((data, index) => ({
      seriesX: data.seriesX,
      seriesY: data.seriesY,
      overlayVariableDetails: data.overlayVariableDetails
        ? data.overlayVariableDetails
        : '',
    })),
  };
}

// add an extended type
type getRequestParamsProps = BoxplotRequestParams & { vizType?: string };

function getRequestParams(
  studyId: string,
  filters: Filter[],
  xAxisVariable: Variable,
  //DKDK set yAxisVariable as optional for densityplot
  yAxisVariable?: Variable,
  overlayVariable?: Variable,
  // add visualization.type
  vizType?: string
): getRequestParamsProps {
  return {
    studyId,
    filters,
    config: {
      // is outputEntityId correct?
      outputEntityId: xAxisVariable.entityId,
      //DKDK post options
      // points: 'outliers',
      points: 'all',
      mean: 'true',
      xAxisVariable: xAxisVariable,
      yAxisVariable: yAxisVariable,
      overlayVariable: overlayVariable,
    },
  } as BoxplotRequestParams;
}
