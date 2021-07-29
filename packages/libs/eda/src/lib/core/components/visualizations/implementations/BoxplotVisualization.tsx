// load Boxplot component
import Boxplot, { BoxplotProps } from '@veupathdb/components/lib/plots/Boxplot';
import { ErrorManagement } from '@veupathdb/components/lib/types/general';

import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import React, { useCallback, useMemo } from 'react';

// need to set for Boxplot
import {
  DataClient,
  BoxplotRequestParams,
  CompleteCasesTable,
} from '../../../api/data-api';

import { usePromise } from '../../../hooks/promise';
import { useFindEntityAndVariable } from '../../../hooks/study';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { Filter } from '../../../types/filter';
import { PromiseType } from '../../../types/utility';
import { VariableDescriptor } from '../../../types/variable';

import { VariableCoverageTable } from '../../VariableCoverageTable';

import { InputVariables } from '../InputVariables';
import { OutputEntityTitle } from '../OutputEntityTitle';
import { VisualizationProps, VisualizationType } from '../VisualizationTypes';
import box from './selectorIcons/box.svg';
import { BoxplotData } from '@veupathdb/components/lib/types/plots';

interface PromiseBoxplotData {
  series: BoxplotData;
  // add more props with variable coverage table
  completeCases: CompleteCasesTable;
  outputSize: number;
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

  const findEntityAndVariable = useFindEntityAndVariable(entities);

  // outputEntity for OutputEntityTitle's outputEntity prop and outputEntityId at getRequestParams
  const outputEntity = useMemo(() => {
    const outputEntityVariableName =
      dataElementDependencyOrder != null &&
      dataElementDependencyOrder[0] === 'yAxisVariable'
        ? vizConfig.yAxisVariable
        : vizConfig.xAxisVariable;
    return findEntityAndVariable(outputEntityVariableName)?.entity;
  }, [dataElementDependencyOrder, vizConfig, findEntityAndVariable]);

  const data = usePromise(
    useCallback(async (): Promise<PromiseBoxplotData | undefined> => {
      const xAxisVariable = findEntityAndVariable(vizConfig.xAxisVariable);
      const yAxisVariable = findEntityAndVariable(vizConfig.yAxisVariable);

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
        vizConfig.overlayVariable,
        // pass outputEntity.id
        outputEntity?.id
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
      findEntityAndVariable,
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
        <>
          <OutputEntityTitle
            entity={outputEntity}
            outputSize={data.pending ? undefined : data.value?.outputSize}
          />
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
            }}
          >
            <BoxplotWithControls
              // data.value
              data={data.value && !data.pending ? data.value.series : []}
              containerStyles={{
                width: '750px',
                height: '450px',
              }}
              orientation={'vertical'}
              // add condition to show legend when overlayVariable is used
              displayLegend={
                data.value &&
                (data.value.series.length > 1 ||
                  vizConfig.overlayVariable != null)
              }
              independentAxisLabel={
                findEntityAndVariable(vizConfig.xAxisVariable)?.variable
                  .displayName ?? 'X-Axis'
              }
              dependentAxisLabel={
                findEntityAndVariable(vizConfig.yAxisVariable)?.variable
                  .displayName ?? 'Y-Axis'
              }
              // show/hide independent/dependent axis tick label
              showIndependentAxisTickLabel={true}
              showDependentAxisTickLabel={true}
              showMean={true}
              interactive={true}
              showSpinner={data.pending}
              showRawData={true}
              legendTitle={
                findEntityAndVariable(vizConfig.overlayVariable)?.variable
                  .displayName
              }
            />
            <VariableCoverageTable
              completeCases={
                data.pending ? undefined : data.value?.completeCases
              }
              filters={filters}
              outputEntityId={outputEntity?.id}
              variableSpecs={[
                {
                  role: 'X-axis',
                  required: true,
                  display: findEntityAndVariable(vizConfig.xAxisVariable)
                    ?.variable.displayName,
                  variable: vizConfig.xAxisVariable,
                },
                {
                  role: 'Y-axis',
                  required: true,
                  display: findEntityAndVariable(vizConfig.yAxisVariable)
                    ?.variable.displayName,
                  variable: vizConfig.yAxisVariable,
                },
                {
                  role: 'Overlay',
                  display: findEntityAndVariable(vizConfig.overlayVariable)
                    ?.variable.displayName,
                  variable: vizConfig.overlayVariable,
                },
              ]}
            />
          </div>
        </>
      ) : (
        // thumbnail/grid view
        <Boxplot
          data={data.value && !data.pending ? data.value.series : []}
          containerStyles={{
            width: '230px',
            height: '150px',
          }}
          orientation={'vertical'}
          // show/hide independent/dependent axis tick label
          showIndependentAxisTickLabel={false}
          showDependentAxisTickLabel={false}
          showMean={true}
          interactive={false}
          displayLegend={false}
          displayLibraryControls={false}
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
        label: data.label, // [response.boxplot.config.xVariableDetails.variableId],
      })
    ),
    completeCases: response.completeCasesTable,
    outputSize: response.boxplot.config.completeCases,
  };
}

// add an extended type
type getRequestParamsProps = BoxplotRequestParams;

function getRequestParams(
  studyId: string,
  filters: Filter[],
  xAxisVariable: VariableDescriptor,
  yAxisVariable: VariableDescriptor,
  overlayVariable?: VariableDescriptor,
  // pass outputEntityId
  outputEntityId?: string
): getRequestParamsProps {
  return {
    studyId,
    filters,
    config: {
      // add outputEntityId per dataElementDependencyOrder
      outputEntityId: outputEntityId,
      // post options: 'all', 'outliers'
      points: 'outliers',
      mean: 'TRUE',
      xAxisVariable: xAxisVariable,
      yAxisVariable: yAxisVariable,
      overlayVariable: overlayVariable,
    },
  } as BoxplotRequestParams;
}
