// load Boxplot component
import Boxplot, { BoxplotProps } from '@veupathdb/components/lib/plots/Boxplot';
import FacetedPlot from '@veupathdb/components/lib/plots/FacetedPlot';

import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { useCallback, useEffect, useMemo } from 'react';

// need to set for Boxplot
import DataClient, {
  BoxplotRequestParams,
  BoxplotResponse,
} from '../../../api/DataClient';

import { usePromise } from '../../../hooks/promise';
import { useFindEntityAndVariable } from '../../../hooks/study';
import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { useFindOutputEntity } from '../../../hooks/findOutputEntity';
import { Filter } from '../../../types/filter';
import { VariableDescriptor } from '../../../types/variable';

import { VariableCoverageTable } from '../../VariableCoverageTable';

import { InputVariables } from '../InputVariables';
import { OutputEntityTitle } from '../OutputEntityTitle';
import { VisualizationProps, VisualizationType } from '../VisualizationTypes';
import box from './selectorIcons/box.svg';
import {
  BoxplotData as BoxplotSeries,
  FacetedData,
  BoxplotDataObject,
} from '@veupathdb/components/lib/types/plots';
import { CoverageStatistics } from '../../../types/visualization';
import { BirdsEyeView } from '../../BirdsEyeView';
import PluginError from '../PluginError';

import {
  at,
  sortBy,
  groupBy,
  mapValues,
  size,
  head,
  map,
  values,
} from 'lodash';
// import axis label unit util
import { axisLabelWithUnit } from '../../../utils/axis-label-unit';
import {
  fixLabelForNumberVariables,
  fixLabelsForNumberVariables,
  grayOutLastSeries,
  omitEmptyNoDataSeries,
  variablesAreUnique,
  vocabularyWithMissingData,
} from '../../../utils/visualization';
import { VariablesByInputName } from '../../../utils/data-element-constraints';
import { Variable } from '../../../types/study';
import { isFaceted } from '@veupathdb/components/lib/types/guards';
// custom legend
import PlotLegend, {
  LegendItemsProps,
} from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots/addOns';

type BoxplotData = { series: BoxplotSeries };

type BoxplotDataWithCoverage = (BoxplotData | FacetedData<BoxplotData>) &
  CoverageStatistics;

const plotContainerStyles = {
  height: 450,
  width: 750,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

const facetedPlotContainerStyles = {
  height: plotContainerStyles.height / 1.5,
  width: plotContainerStyles.width / 2,
};

const plotSpacingOptions = {};
const facetedPlotSpacingOptions = {
  marginRight: 15,
  marginLeft: 15,
  marginBotton: 10,
  marginTop: 50,
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
  // for custom legend: vizconfig.checkedLegendItems
  checkedLegendItems: t.array(t.string),
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

  const {
    xAxisVariable,
    yAxisVariable,
    overlayVariable,
    facetVariable,
  } = useMemo(() => {
    const { variable: xAxisVariable } =
      findEntityAndVariable(vizConfig.xAxisVariable) ?? {};
    const { variable: yAxisVariable } =
      findEntityAndVariable(vizConfig.yAxisVariable) ?? {};
    const { variable: overlayVariable } =
      findEntityAndVariable(vizConfig.overlayVariable) ?? {};
    const { variable: facetVariable } =
      findEntityAndVariable(vizConfig.facetVariable) ?? {};
    return {
      xAxisVariable,
      yAxisVariable,
      overlayVariable,
      facetVariable,
    };
  }, [
    findEntityAndVariable,
    vizConfig.xAxisVariable,
    vizConfig.yAxisVariable,
    vizConfig.overlayVariable,
    vizConfig.facetVariable,
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

  // for custom legend: vizconfig.checkedLegendItems
  const onCheckedLegendItemsChange = onChangeHandlerFactory<string[]>(
    'checkedLegendItems'
  );

  // outputEntity for OutputEntityTitle's outputEntity prop and outputEntityId at getRequestParams
  const outputEntity = useFindOutputEntity(
    dataElementDependencyOrder,
    vizConfig,
    'xAxisVariable',
    entities
  );

  const data = usePromise(
    useCallback(async (): Promise<BoxplotDataWithCoverage | undefined> => {
      if (vizConfig.xAxisVariable == null || xAxisVariable == null)
        return undefined;
      else if (vizConfig.yAxisVariable == null || yAxisVariable == null)
        return undefined;

      if (
        !variablesAreUnique([
          xAxisVariable,
          yAxisVariable,
          overlayVariable,
          facetVariable,
        ])
      )
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
        vizConfig.facetVariable,
        // pass outputEntity.id
        outputEntity?.id,
        vizConfig.showMissingness
      );

      // boxplot
      const response = dataClient.getBoxplot(
        computation.descriptor.type,
        params as BoxplotRequestParams
      );

      const showMissing =
        vizConfig.showMissingness &&
        (overlayVariable != null || facetVariable != null);
      const showMissingOverlay =
        vizConfig.showMissingness && overlayVariable != null;
      const vocabulary = fixLabelsForNumberVariables(
        xAxisVariable.vocabulary,
        xAxisVariable
      );
      const overlayVocabulary = fixLabelsForNumberVariables(
        overlayVariable?.vocabulary,
        overlayVariable
      );
      const facetVocabulary = fixLabelsForNumberVariables(
        facetVariable?.vocabulary,
        facetVariable
      );
      return omitEmptyNoDataSeries(
        grayOutLastSeries(
          reorderData(
            boxplotResponseToData(
              await response,
              xAxisVariable,
              overlayVariable,
              facetVariable
            ),
            vocabulary,
            vocabularyWithMissingData(overlayVocabulary, showMissing),
            vocabularyWithMissingData(facetVocabulary, showMissing)
          ),
          showMissingOverlay,
          '#a0a0a0'
        ),
        showMissing
      );
    }, [
      studyId,
      filters,
      dataClient,
      // using vizConfig only causes issue with onCheckedLegendItemsChange
      vizConfig.xAxisVariable,
      vizConfig.yAxisVariable,
      vizConfig.overlayVariable,
      vizConfig.facetVariable,
      vizConfig.showMissingness,
      computation.descriptor.type,
      outputEntity?.id,
    ])
  );

  const outputSize =
    (overlayVariable != null || facetVariable != null) &&
    !vizConfig.showMissingness
      ? data.value?.completeCasesAllVars
      : data.value?.completeCasesAxesVars;

  // custom legend items for checkbox
  const legendItems: LegendItemsProps[] = useMemo(() => {
    const legendData = !isFaceted(data.value)
      ? data.value?.series
      : data.value?.facets[0].data.series;

    return legendData != null
      ? legendData.map((dataItem: BoxplotDataObject, index: number) => {
          return {
            label: dataItem.name ?? '',
            // histogram plot does not have mode, so set to square for now
            marker: 'lightSquareBorder',
            markerColor:
              dataItem.name === 'No data'
                ? // boxplot uses slightly fainted color
                  'rgb(191, 191, 191)' // #bfbfbf
                : ColorPaletteDefault[index],
            // deep comparison is required for faceted plot
            hasData: !isFaceted(data.value) // no faceted plot
              ? dataItem.q1.some((el: number | string) => el != null)
                ? true
                : false
              : data.value?.facets
                  .map((el: { label: string; data: BoxplotData }) => {
                    // faceted plot: here data.value is full data
                    return el.data.series[index].q1.some(
                      (el: number | string) => el != null
                    );
                  })
                  .includes(true)
              ? true
              : false,
            group: 1,
            rank: 1,
          };
        })
      : [];
  }, [data]);

  // use this to set all checked
  useEffect(() => {
    if (data != null) {
      // use this to set all checked
      onCheckedLegendItemsChange(legendItems.map((item) => item.label));
    }
  }, [data, legendItems]);

  console.log('data at boxplot viz =', data);
  console.log('legendItems = ', legendItems);

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
            {
              name: 'facetVariable',
              label: 'Facet',
              role: 'stratification',
            },
          ]}
          entities={entities}
          selectedVariables={{
            xAxisVariable: vizConfig.xAxisVariable,
            yAxisVariable: vizConfig.yAxisVariable,
            overlayVariable: vizConfig.overlayVariable,
            facetVariable: vizConfig.facetVariable,
          }}
          onChange={handleInputVariableChange}
          constraints={dataElementConstraints}
          dataElementDependencyOrder={dataElementDependencyOrder}
          starredVariables={starredVariables}
          toggleStarredVariable={toggleStarredVariable}
          enableShowMissingnessToggle={
            (overlayVariable != null || facetVariable != null) &&
            data.value?.completeCasesAllVars !==
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
          data={data.value}
          updateThumbnail={updateThumbnail}
          containerStyles={
            isFaceted(data.value)
              ? facetedPlotContainerStyles
              : plotContainerStyles
          }
          spacingOptions={
            isFaceted(data.value)
              ? facetedPlotSpacingOptions
              : plotSpacingOptions
          }
          orientation={'vertical'}
          // add condition to show legend when overlayVariable is used
          displayLegend={
            data.value &&
            !isFaceted(data.value) &&
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
          // for custom legend passing checked state in the  checkbox to PlotlyPlot
          legendItems={legendItems}
          checkedLegendItems={vizConfig.checkedLegendItems}
          onCheckedLegendItemsChange={onCheckedLegendItemsChange}
        />

        {/* custom legend */}
        {legendItems != null && !data.pending && data != null && (
          <div style={{ marginLeft: '2em' }}>
            <PlotLegend
              legendItems={legendItems}
              checkedLegendItems={vizConfig.checkedLegendItems}
              legendTitle={axisLabelWithUnit(overlayVariable)}
              onCheckedLegendItemsChange={onCheckedLegendItemsChange}
            />
          </div>
        )}

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
            stratificationIsActive={
              overlayVariable != null || facetVariable != null
            }
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
              {
                role: 'Facet',
                display: axisLabelWithUnit(facetVariable),
                variable: vizConfig.facetVariable,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

type BoxplotWithControlsProps = Omit<BoxplotProps, 'data'> & {
  data?: BoxplotDataWithCoverage;
  updateThumbnail: (src: string) => void;
  // add props for custom legend
  legendItems: LegendItemsProps[];
  checkedLegendItems: string[] | undefined;
  onCheckedLegendItemsChange: (checkedLegendItems: string[]) => void;
};

function BoxplotWithControls({
  data,
  updateThumbnail,
  // add props for custom legend
  legendItems,
  checkedLegendItems,
  onCheckedLegendItemsChange,
  ...boxplotComponentProps
}: BoxplotWithControlsProps) {
  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    plotContainerStyles,
    [data, checkedLegendItems]
  );

  // TO DO: standardise web-components/BoxplotData to have `series` key
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {isFaceted(data) ? (
        <>
          <div
            style={{
              background: 'yellow',
              border: '3px dashed green',
              padding: '10px',
            }}
          >
            Custom legend, birds eye and supplementary tables go here...
          </div>

          <FacetedPlot
            component={Boxplot}
            data={{
              ...data,
              facets: data.facets.map(({ label, data }) => ({
                label,
                data: data.series,
              })),
            }}
            props={boxplotComponentProps}
            facetedPlotRef={plotRef}
            // for custom legend: pass checkedLegendItems to PlotlyPlot
            checkedLegendItems={checkedLegendItems}
          />
        </>
      ) : (
        <Boxplot
          data={data?.series}
          ref={plotRef}
          // for custom legend: pass checkedLegendItems to PlotlyPlot
          checkedLegendItems={checkedLegendItems}
          {...boxplotComponentProps}
        />
      )}
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
  response: BoxplotResponse,
  variable: Variable,
  overlayVariable?: Variable,
  facetVariable?: Variable
): BoxplotDataWithCoverage {
  // group by facet variable value (if only one facet variable in response - there may be up to two in future)
  const facetGroupedResponseData = groupBy(response.boxplot.data, (data) =>
    data.facetVariableDetails && data.facetVariableDetails.length === 1
      ? fixLabelForNumberVariables(
          data.facetVariableDetails[0].value,
          facetVariable
        )
      : undefined
  );

  // process data and overlay value within each facet grouping
  const processedData = mapValues(facetGroupedResponseData, (group) => {
    const facetIsEmpty = group.every(
      (data) => data.label.length === 0 && data.median.length === 0
    );
    return {
      series: facetIsEmpty
        ? []
        : group.map((data) => ({
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
            name:
              data.overlayVariableDetails?.value != null
                ? fixLabelForNumberVariables(
                    data.overlayVariableDetails.value,
                    overlayVariable
                  )
                : '',
            label: fixLabelsForNumberVariables(data.label, variable),
          })),
    };
  });

  return {
    // data
    ...(size(processedData) === 1
      ? // unfaceted
        head(values(processedData))
      : // faceted
        {
          facets: map(processedData, (value, key) => ({
            label: key,
            data: value,
          })),
        }),

    // CoverageStatistics
    completeCases: response.completeCasesTable,
    completeCasesAllVars: response.boxplot.config.completeCasesAllVars,
    completeCasesAxesVars: response.boxplot.config.completeCasesAxesVars,
  } as BoxplotDataWithCoverage;
}

// add an extended type
type getRequestParamsProps = BoxplotRequestParams;

function getRequestParams(
  studyId: string,
  filters: Filter[],
  xAxisVariable: VariableDescriptor,
  yAxisVariable: VariableDescriptor,
  overlayVariable?: VariableDescriptor,
  facetVariable?: VariableDescriptor,
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
      facetVariable: facetVariable ? [facetVariable] : [],
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
  data: BoxplotDataWithCoverage | BoxplotData,
  labelVocabulary: string[] = [],
  overlayVocabulary: string[] = [],
  facetVocabulary: string[] = []
): BoxplotDataWithCoverage | BoxplotData {
  if (isFaceted(data)) {
    // reorder within each facet with call to this function
    return {
      ...data,
      facets: sortBy(data.facets, ({ label }) =>
        facetVocabulary.indexOf(label)
      ).map(({ label, data }) => ({
        label,
        data: reorderData(
          data,
          labelVocabulary,
          overlayVocabulary
        ) as BoxplotData,
      })),
    };
  }

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
