// load Boxplot component
import Boxplot, { BoxplotProps } from '@veupathdb/components/lib/plots/Boxplot';

import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import React, { useCallback, useMemo } from 'react';

// need to set for Boxplot
import { DataClient, BoxplotRequestParams } from '../../../api/data-api';

import { usePromise } from '../../../hooks/promise';
import { useFindEntityAndVariable } from '../../../hooks/study';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { useFindOutputEntity } from '../../../hooks/findOutputEntity';
import { Filter } from '../../../types/filter';
import { PromiseType } from '../../../types/utility';
import { VariableDescriptor } from '../../../types/variable';

import { VariableCoverageTable } from '../../VariableCoverageTable';

import { InputVariables } from '../InputVariables';
import { OutputEntityTitle } from '../OutputEntityTitle';
import { VisualizationProps, VisualizationType } from '../VisualizationTypes';
import box from './selectorIcons/box.svg';
import { BoxplotData } from '@veupathdb/components/lib/types/plots';
import { CoverageStatistics } from '../../../types/visualization';

import { at } from 'lodash';
// import axis label unit util
import { axisLabelWithUnit } from '../../../utils/axis-label-unit';
import {
  grayOutLastSeries,
  vocabularyWithMissingData,
} from '../../../utils/analysis';

interface PromiseBoxplotData extends CoverageStatistics {
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
  showMissingness: t.boolean,
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

  const { xAxisVariable, yAxisVariable, overlayVariable } = useMemo(() => {
    const xAxisVariable = findEntityAndVariable(vizConfig.xAxisVariable);
    const yAxisVariable = findEntityAndVariable(vizConfig.yAxisVariable);
    const overlayVariable = findEntityAndVariable(vizConfig.overlayVariable);

    return {
      xAxisVariable: xAxisVariable ? xAxisVariable.variable : undefined,
      yAxisVariable: yAxisVariable ? yAxisVariable.variable : undefined,
      overlayVariable: overlayVariable ? overlayVariable.variable : undefined,
    };
  }, [
    findEntityAndVariable,
    vizConfig.xAxisVariable,
    vizConfig.yAxisVariable,
    vizConfig.overlayVariable,
  ]);

  // prettier-ignore
  const onChangeHandlerFactory = useCallback(
    < ValueType,>(key: keyof BoxplotConfig) => (newValue?: ValueType) => {
      updateVizConfig({
        [key]: newValue,
      });
    },
    [updateVizConfig]
  );
  const onShowMissingnessChange = onChangeHandlerFactory<boolean>(
    'showMissingness'
  );

  // outputEntity for OutputEntityTitle's outputEntity prop and outputEntityId at getRequestParams
  const outputEntity = useFindOutputEntity(
    dataElementDependencyOrder,
    vizConfig,
    'xAxisVariable',
    entities
  );

  const data = usePromise(
    useCallback(async (): Promise<PromiseBoxplotData | undefined> => {
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
        outputEntity?.id,
        vizConfig.showMissingness
      );

      // boxplot
      const response = dataClient.getBoxplot(
        computation.type,
        params as BoxplotRequestParams
      );

      // send visualization.type as well
      return grayOutLastSeries(
        reorderData(
          boxplotResponseToData(await response),
          xAxisVariable.vocabulary,
          vocabularyWithMissingData(
            overlayVariable?.vocabulary,
            vizConfig.showMissingness
          )
        ),
        vizConfig.showMissingness && overlayVariable != null
      );
    }, [
      studyId,
      filters,
      dataClient,
      vizConfig,
      xAxisVariable,
      yAxisVariable,
      overlayVariable,
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
                role: 'primary',
              },
              {
                name: 'yAxisVariable',
                label: 'Y-axis',
                role: 'primary',
              },
              {
                name: 'overlayVariable',
                label: 'Overlay (Optional)',
                role: 'stratification',
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
            enableShowMissingnessToggle={overlayVariable != null}
            showMissingness={vizConfig.showMissingness}
            onShowMissingnessChange={onShowMissingnessChange}
            outputEntity={outputEntity}
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
                axisLabelWithUnit(xAxisVariable) ?? 'X-Axis'
              }
              dependentAxisLabel={axisLabelWithUnit(yAxisVariable) ?? 'Y-Axis'}
              // show/hide independent/dependent axis tick label
              showIndependentAxisTickLabel={true}
              showDependentAxisTickLabel={true}
              showMean={true}
              interactive={true}
              showSpinner={data.pending}
              showRawData={true}
              legendTitle={overlayVariable?.displayName}
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
                  display: xAxisVariable?.displayName,
                  variable: vizConfig.xAxisVariable,
                },
                {
                  role: 'Y-axis',
                  required: true,
                  display: yAxisVariable?.displayName,
                  variable: vizConfig.yAxisVariable,
                },
                {
                  role: 'Overlay',
                  display: overlayVariable?.displayName,
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
            marginBottom: 15,
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
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Boxplot
        {...BoxplotComponentProps}
        data={data}
        // add controls
        displayLibraryControls={false}
      />
      {/* potential controls go here  */}
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
    series: response.boxplot.data.map((data) => ({
      lowerfence: data.lowerfence,
      upperfence: data.upperfence,
      q1: data.q1,
      q3: data.q3,
      median: data.median,
      mean: data.mean,
      // correct the {} from back end into []
      outliers: data.outliers
        ? data.outliers.map((x: number[] | {}) => (Array.isArray(x) ? x : []))
        : undefined,
      // currently returns seriesX and seriesY for points: 'all' option
      // it is necessary to rely on rawData (or seriesX/Y) for boxplot if points: 'all'
      rawData: data.rawData ? data.rawData : undefined,
      // this will be used as legend
      name: data.overlayVariableDetails
        ? data.overlayVariableDetails.value
        : 'Data',
      // this will be used as x-axis tick labels
      label: data.label, // [response.boxplot.config.xVariableDetails.variableId],
    })),
    completeCases: response.completeCasesTable,
    outputSize:
      response.boxplot.config.completeCases +
      response.boxplot.config.plottedIncompleteCases,
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
  outputEntityId?: string,
  showMissingness?: boolean
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
      showMissingness: showMissingness ? 'TRUE' : 'FALSE',
    },
  } as BoxplotRequestParams;
}

/**
 * reorder the series prop of the BarplotData object so that labels
 * go in the same order as the main variable's vocabulary, and the overlay
 * strata are ordered in that variable's vocabulary order too, with missing values and traces added as undefined
 *
 * NOTE: if any values are missing from the vocabulary array, then the data for that value WILL NOT BE PLOTTED
 *
 */
function reorderData(
  data: PromiseBoxplotData,
  labelVocabulary: string[] = [],
  overlayVocabulary: string[] = []
) {
  const labelOrderedSeries = data.series.map((series) => {
    if (labelVocabulary.length > 0) {
      // for each label in the vocabulary's correct order,
      // find the index of that label in the provided series' label array
      const labelIndices = labelVocabulary.map((label) =>
        series.label.indexOf(label)
      );
      // now return the data from the other array(s) in the same order
      // any missing labels will be mapped to `undefined` (indexing an array with -1)
      return {
        ...series,
        label: labelVocabulary,
        q1: dice(series.q1, labelIndices),
        q3: dice(series.q3, labelIndices),
        median: dice(series.median, labelIndices),
        ...(series.lowerfence != null
          ? { lowerfence: dice(series.lowerfence, labelIndices) }
          : {}),
        ...(series.upperfence != null
          ? { upperfence: dice(series.upperfence, labelIndices) }
          : {}),
        ...(series.mean ? { mean: dice(series.mean, labelIndices) } : {}),
        ...(series.rawData
          ? { rawData: dice2d(series.rawData, labelIndices) }
          : {}),
        ...(series.outliers
          ? { outliers: dice2d(series.outliers, labelIndices) }
          : {}),
      };
    } else {
      return series;
    }
  });

  if (overlayVocabulary.length > 0) {
    // for each value in the overlay vocabulary's correct order
    // find the index in the series where series.name equals that value
    const overlayValues = labelOrderedSeries.map((series) => series.name);
    const overlayIndices = overlayVocabulary.map((name) =>
      overlayValues.indexOf(name)
    );
    return {
      ...data,
      // return the series in overlay vocabulary order
      series: overlayIndices.map(
        (i, j) =>
          labelOrderedSeries[i] ?? {
            // if there is no series, insert a dummy series
            name: overlayVocabulary[j],
            label: labelVocabulary,
            median: labelVocabulary.map(() => undefined),
            q1: labelVocabulary.map(() => undefined),
            q3: labelVocabulary.map(() => undefined),
          }
      ),
    };
  } else {
    return { ...data, series: labelOrderedSeries };
  }
}

/**
 * dice(inArray, indices)
 *
 * lodash.at() wrapped in some TS that preserves the input type on the output (and ensures the result is not `(string | number)[]`)
 *
 * returns an array of elements of `inArray` in the order of the `indices` given
 *
 */
function dice<T extends number[] | string[]>(inArray: T, indices: number[]): T {
  return at(inArray, indices) as T;
}

/**
 * dice2d(inArray, indices)
 *
 * lodash.at() wrapped in some TS that preserves the input type on the output (and ensures the result is not `(string | number)[]`)
 *
 * returns an array of elements of `inArray` in the order of the `indices` given
 *
 * undefined elements are replaced with an empty array
 */
function dice2d<T extends number[][] | string[][]>(
  inArray: T,
  indices: number[]
): T {
  return at(inArray, indices).map((x) => x ?? []) as T;
}
