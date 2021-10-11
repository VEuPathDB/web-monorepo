// load Boxplot component
import Boxplot, { BoxplotProps } from '@veupathdb/components/lib/plots/Boxplot';

import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

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
import { BirdsEyeView } from '../../BirdsEyeView';
import PluginError from '../PluginError';

import { at } from 'lodash';
// import axis label unit util
import { axisLabelWithUnit } from '../../../utils/axis-label-unit';
import {
  grayOutLastSeries,
  omitEmptyNoDataSeries,
  vocabularyWithMissingData,
} from '../../../utils/analysis';
import { PlotRef } from '@veupathdb/components/lib/plots/PlotlyPlot';
import { VariablesByInputName } from '../../../utils/data-element-constraints';

interface PromiseBoxplotData extends CoverageStatistics {
  series: BoxplotData;
}

const plotDimensions = {
  height: 450,
  width: 750,
};

export const boxplotVisualization: VisualizationType = {
  selectorComponent: SelectorComponent,
  fullscreenComponent: FullscreenComponent,
  createDefaultConfig: createDefaultConfig,
};

function SelectorComponent() {
  return (
    <img alt="Box plot" style={{ height: '100%', width: '100%' }} src={box} />
  );
}

function FullscreenComponent(props: VisualizationProps) {
  return <BoxplotViz {...props} />;
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

function BoxplotViz(props: VisualizationProps) {
  const {
    computation,
    visualization,
    updateConfiguration,
    updateThumbnail,
    filters,
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
      BoxplotConfig.decode(visualization.descriptor.configuration),
      getOrElse((): t.TypeOf<typeof BoxplotConfig> => createDefaultConfig())
    );
  }, [visualization.descriptor.configuration]);

  const updateVizConfig = useCallback(
    (newConfig: Partial<BoxplotConfig>) => {
      updateConfiguration({ ...vizConfig, ...newConfig });
    },
    [updateConfiguration, vizConfig]
  );

  // TODO Handle facetVariable
  const handleInputVariableChange = useCallback(
    (selectedVariables: VariablesByInputName) => {
      const {
        xAxisVariable,
        yAxisVariable,
        overlayVariable,
        facetVariable,
      } = selectedVariables;
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

      const vars = [xAxisVariable, yAxisVariable, overlayVariable];
      const unique = vars.filter((item, i, ar) => ar.indexOf(item) === i);
      if (vars.length != unique.length)
        throw new Error(
          'Variables must be unique. Please choose different variables.'
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
        computation.descriptor.type,
        params as BoxplotRequestParams
      );

      const showMissing = vizConfig.showMissingness && overlayVariable != null;
      return omitEmptyNoDataSeries(
        grayOutLastSeries(
          reorderData(
            boxplotResponseToData(await response),
            xAxisVariable.vocabulary,
            vocabularyWithMissingData(overlayVariable?.vocabulary, showMissing)
          ),
          showMissing
        ),
        showMissing
      );
    }, [
      studyId,
      filters,
      dataClient,
      vizConfig,
      xAxisVariable,
      yAxisVariable,
      overlayVariable,
      computation.descriptor.type,
      visualization.descriptor.type,
    ])
  );

  const outputSize =
    overlayVariable != null && !vizConfig.showMissingness
      ? data.value?.completeCasesAllVars
      : data.value?.completeCasesAxesVars;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
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
              label: 'Overlay',
              role: 'stratification',
            },
          ]}
          entities={entities}
          selectedVariables={{
            xAxisVariable: vizConfig.xAxisVariable,
            yAxisVariable: vizConfig.yAxisVariable,
            overlayVariable: vizConfig.overlayVariable,
          }}
          onChange={handleInputVariableChange}
          constraints={dataElementConstraints}
          dataElementDependencyOrder={dataElementDependencyOrder}
          starredVariables={starredVariables}
          toggleStarredVariable={toggleStarredVariable}
          enableShowMissingnessToggle={
            overlayVariable != null &&
            data.value?.completeCasesAllVars !=
              data.value?.completeCasesAxesVars
          }
          showMissingness={vizConfig.showMissingness}
          onShowMissingnessChange={onShowMissingnessChange}
          outputEntity={outputEntity}
        />
      </div>

      <PluginError error={data.error} outputSize={outputSize} />
      <OutputEntityTitle entity={outputEntity} outputSize={outputSize} />
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        <BoxplotWithControls
          // data.value
          data={data.value && !data.pending ? data.value.series : undefined}
          updateThumbnail={updateThumbnail}
          containerStyles={plotDimensions}
          orientation={'vertical'}
          // add condition to show legend when overlayVariable is used
          displayLegend={
            data.value &&
            (data.value.series.length > 1 || vizConfig.overlayVariable != null)
          }
          independentAxisLabel={axisLabelWithUnit(xAxisVariable) ?? 'X-axis'}
          dependentAxisLabel={axisLabelWithUnit(yAxisVariable) ?? 'Y-axis'}
          // show/hide independent/dependent axis tick label
          showIndependentAxisTickLabel={true}
          showDependentAxisTickLabel={true}
          showMean={true}
          interactive={true}
          showSpinner={data.pending}
          showRawData={true}
          legendTitle={axisLabelWithUnit(overlayVariable)}
        />
        <div className="viz-plot-info">
          <BirdsEyeView
            completeCasesAllVars={
              data.pending ? undefined : data.value?.completeCasesAllVars
            }
            completeCasesAxesVars={
              data.pending ? undefined : data.value?.completeCasesAxesVars
            }
            filters={filters}
            outputEntity={outputEntity}
            stratificationIsActive={overlayVariable != null}
            enableSpinner={
              xAxisVariable != null && yAxisVariable != null && !data.error
            }
          />
          <VariableCoverageTable
            completeCases={data.pending ? undefined : data.value?.completeCases}
            filters={filters}
            outputEntityId={outputEntity?.id}
            variableSpecs={[
              {
                role: 'X-axis',
                required: true,
                display: axisLabelWithUnit(xAxisVariable),
                variable: vizConfig.xAxisVariable,
              },
              {
                role: 'Y-axis',
                required: true,
                display: axisLabelWithUnit(yAxisVariable),
                variable: vizConfig.yAxisVariable,
              },
              {
                role: 'Overlay',
                display: axisLabelWithUnit(overlayVariable),
                variable: vizConfig.overlayVariable,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

interface BoxplotWithControlsProps extends BoxplotProps {
  updateThumbnail: (src: string) => void;
}

function BoxplotWithControls({
  data,
  updateThumbnail,
  ...boxplotComponentProps
}: BoxplotWithControlsProps) {
  const plotRef = useRef<PlotRef>(null);

  const updateThumbnailRef = useRef(updateThumbnail);
  useEffect(() => {
    updateThumbnailRef.current = updateThumbnail;
  });

  useEffect(() => {
    plotRef.current
      ?.toImage({ format: 'svg', ...plotDimensions })
      .then(updateThumbnailRef.current);
  }, [data]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Boxplot
        {...boxplotComponentProps}
        ref={plotRef}
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
  const responseIsEmpty = response.boxplot.data.every(
    (data) => data.label.length === 0 && data.median.length === 0
  );
  return {
    series: responseIsEmpty
      ? []
      : response.boxplot.data.map((data) => ({
          lowerfence: data.lowerfence,
          upperfence: data.upperfence,
          q1: data.q1,
          q3: data.q3,
          median: data.median,
          mean: data.mean,
          // correct the {} from back end into []
          outliers: data.outliers
            ? data.outliers.map((x: number[] | {}) =>
                Array.isArray(x) ? x : []
              )
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
    completeCasesAllVars: response.boxplot.config.completeCasesAllVars,
    completeCasesAxesVars: response.boxplot.config.completeCasesAxesVars,
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
