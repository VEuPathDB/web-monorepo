// load Boxplot component
import Boxplot, { BoxplotProps } from '@veupathdb/components/lib/plots/Boxplot';
import { ErrorManagement } from '@veupathdb/components/lib/types/general';

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
import { VariableDescriptor } from '../../../types/variable';

import { InputVariables } from '../InputVariables';
import { VisualizationProps, VisualizationType } from '../VisualizationTypes';
import box from './selectorIcons/box.svg';
import { BoxplotData } from '@veupathdb/components/lib/types/plots';

interface PromiseBoxplotData {
  series: BoxplotData;
}

export const boxplotVisualization: VisualizationType = {
  gridComponent: GridComponent,
  selectorComponent: SelectorComponent,
  fullscreenComponent: FullscreenComponent,
  createDefaultConfig: createDefaultConfig,
};

function GridComponent(props: VisualizationProps) {
  return <BoxplotViz {...props} fullscreen={false} />;
}

function SelectorComponent() {
  return (
    <img alt="Box plot" style={{ height: '100%', width: '100%' }} src={box} />
  );
}

function FullscreenComponent(props: VisualizationProps) {
  return <BoxplotViz {...props} fullscreen />;
}

function createDefaultConfig(): BoxplotConfig {
  return {};
}

type BoxplotConfig = t.TypeOf<typeof BoxplotConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const BoxplotConfig = t.partial({
  xAxisVariable: VariableDescriptor,
  yAxisVariable: VariableDescriptor,
  overlayVariable: VariableDescriptor,
  facetVariable: VariableDescriptor,
});

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
    starredVariables,
    toggleStarredVariable,
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

  // TODO Handle facetVariable
  const handleInputVariableChange = useCallback(
    (
      values: Record<
        string,
        { entityId: string; variableId: string } | undefined
      >
    ) => {
      const {
        xAxisVariable,
        yAxisVariable,
        overlayVariable,
        facetVariable,
      } = values;
      updateVizConfig({
        xAxisVariable,
        yAxisVariable,
        overlayVariable,
        facetVariable,
      });
    },
    [updateVizConfig]
  );

  const findVariable = useCallback(
    (variable?: VariableDescriptor) => {
      if (variable == null) return undefined;
      return entities
        .find((e) => e.id === variable.entityId)
        ?.variables.find((v) => v.id === variable.variableId);
    },
    [entities]
  );

  const data = usePromise(
    useCallback(async (): Promise<PromiseBoxplotData | undefined> => {
      const xAxisVariable = findVariable(vizConfig.xAxisVariable);
      const yAxisVariable = findVariable(vizConfig.yAxisVariable);

      // check variable inputs and add densityplot
      if (vizConfig.xAxisVariable == null || xAxisVariable == null)
        return undefined;
      else if (vizConfig.yAxisVariable == null || yAxisVariable == null)
        return undefined;

      if (xAxisVariable === yAxisVariable)
        throw new Error(
          'The X and Y variables should not be the same. Please choose different variables for X and Y.'
        );

      // add visualization.type here. valueSpec too?
      const params = getRequestParams(
        studyId,
        filters ?? [],
        vizConfig.xAxisVariable,
        vizConfig.yAxisVariable,
        vizConfig.overlayVariable
      );

      // boxplot
      const response = dataClient.getBoxplot(
        computation.type,
        params as BoxplotRequestParams
      );

      // send visualization.type as well
      return boxplotResponseToData(await response);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/*  change title at viz page */}
      {fullscreen && (
        <div style={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
          <InputVariables
            inputs={[
              {
                name: 'xAxisVariable',
                label: 'X-axis',
              },
              {
                name: 'yAxisVariable',
                label: 'Y-axis',
              },
              {
                name: 'overlayVariable',
                label: 'Overlay (Optional)',
              },
              {
                name: 'facetVariable',
                label: 'Facet (Optional)',
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
            starredVariables={starredVariables}
            toggleStarredVariable={toggleStarredVariable}
          />
        </div>
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
      {fullscreen ? (
        <BoxplotWithControls
          // data.value
          data={data.value && !data.pending ? data.value.series : []}
          containerStyles={{
            width: '100%',
            height: 450,
          }}
          // title={'boxplot'}
          orientation={'vertical'}
          // orientation={'horizontal'}
          // add condition to show legend when overlayVariable is used
          displayLegend={
            data.value &&
            (data.value.series.length > 1 || vizConfig.overlayVariable != null)
          }
          independentAxisLabel={
            findVariable(vizConfig.xAxisVariable)?.displayName
          }
          dependentAxisLabel={
            findVariable(vizConfig.yAxisVariable)?.displayName
          }
          // show/hide independent/dependent axis tick label
          showIndependentAxisTickLabel={true}
          showDependentAxisTickLabel={true}
          showMean={true}
          interactive={true}
          showSpinner={data.pending}
          // this is required for date type
          // not sure why enrollment year's type is number, not date
          dependentValueType={findVariable(vizConfig.yAxisVariable)?.type}
          showRawData={true}
          legendTitle={findVariable(vizConfig.overlayVariable)?.displayName}
        />
      ) : (
        // thumbnail/grid view
        <Boxplot
          data={data.value && !data.pending ? data.value.series : []}
          containerStyles={{
            width: 230,
            height: 165,
          }}
          orientation={'vertical'}
          // orientation={'horizontal'}
          // show/hide independent/dependent axis tick label
          showIndependentAxisTickLabel={false}
          showDependentAxisTickLabel={false}
          showMean={true}
          interactive={false}
          displayLegend={false}
          displayLibraryControls={false}
          // margin={{ l: 30, r: 20, b: 0, t: 20 }}
          // margin is replaced with spacingOptions
          spacingOptions={{
            marginTop: 20,
            marginRight: 20,
            marginBottom: 0,
            marginLeft: 30,
          }}
          showSpinner={data.pending}
        />
      )}
    </div>
  );
}

type BoxplotWithControlsProps = BoxplotProps;

function BoxplotWithControls({
  data,
  ...BoxplotComponentProps
}: BoxplotWithControlsProps) {
  // TODO Use UIState
  const errorManagement = useMemo((): ErrorManagement => {
    return {
      errors: [],
      addError: (_: Error) => {},
      removeError: (_: Error) => {},
      clearAllErrors: () => {},
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Boxplot
        {...BoxplotComponentProps}
        data={data}
        // add controls
        // displayLegend={data && data.length > 1}
        displayLibraryControls={false}
      />
      {/* potential BoxplotControls: commented out for now  */}
      {/* <BoxplotControls
          // label="Box Plot Controls"
          errorManagement={errorManagement}
        /> */}
    </div>
  );
}

/**
 * Reformat response from Box Plot endpoints into complete PromiseBoxplotData
 * @param response
 * @returns PromiseBoxplotData
 */
export function boxplotResponseToData(
  response: PromiseType<ReturnType<DataClient['getBoxplot']>>
): PromiseBoxplotData {
  return {
    series: response.boxplot.data.map(
      (data: { [key: string]: any }, index) => ({
        lowerfence: data.lowerfence,
        upperfence: data.upperfence,
        q1: data.q1,
        q3: data.q3,
        median: data.median,
        mean: data.mean ? data.mean : undefined,
        outliers: data.outliers ? data.outliers : undefined,
        // currently returns seriesX and seriesY for points: 'all' option
        // it is necessary to rely on rawData (or seriesX/Y) for boxplot if points: 'all'
        rawData: data.rawData ? data.rawData : undefined,
        // this will be used as legend
        name: data.overlayVariableDetails
          ? data.overlayVariableDetails.value
          : 'Data',
        // this will be used as x-axis tick labels
        label: data[response.boxplot.config.xVariableDetails.variableId],
      })
    ),
  };
}

// add an extended type
type getRequestParamsProps = BoxplotRequestParams;

function getRequestParams(
  studyId: string,
  filters: Filter[],
  xAxisVariable: VariableDescriptor,
  yAxisVariable: VariableDescriptor,
  overlayVariable?: VariableDescriptor
): getRequestParamsProps {
  return {
    studyId,
    filters,
    config: {
      // is outputEntityId correct?
      outputEntityId: xAxisVariable.entityId,
      // post options
      points: 'outliers',
      // points: 'all',
      mean: 'true',
      xAxisVariable: xAxisVariable,
      yAxisVariable: yAxisVariable,
      overlayVariable: overlayVariable,
    },
  } as BoxplotRequestParams;
}
