// load scatter plot component
import XYPlot, { XYPlotProps } from '@veupathdb/components/lib/plots/XYPlot';

import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { useCallback, useEffect, useMemo } from 'react';

// need to set for Scatterplot

import DataClient, {
  ScatterplotRequestParams,
  LineplotRequestParams,
  ScatterplotResponse,
} from '../../../api/DataClient';

import { usePromise } from '../../../hooks/promise';
import { useFindEntityAndVariable } from '../../../hooks/study';
import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { useFindOutputEntity } from '../../../hooks/findOutputEntity';
import { Filter } from '../../../types/filter';

import { VariableDescriptor } from '../../../types/variable';

import { VariableCoverageTable } from '../../VariableCoverageTable';
import { BirdsEyeView } from '../../BirdsEyeView';
import { PlotLayout } from '../../layouts/PlotLayout';

import { InputVariables } from '../InputVariables';
import { OutputEntityTitle } from '../OutputEntityTitle';
import {
  SelectorProps,
  VisualizationProps,
  VisualizationType,
} from '../VisualizationTypes';

import density from './selectorIcons/density.svg';
import line from './selectorIcons/line.svg';
import scatter from './selectorIcons/scatter.svg';

// use lodash instead of Math.min/max
import {
  min,
  max,
  lte,
  gte,
  groupBy,
  size,
  head,
  values,
  mapValues,
  map,
  keys,
  uniqBy,
} from 'lodash';
// directly use RadioButtonGroup instead of XYPlotControls
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
// import XYPlotData
import {
  XYPlotDataSeries,
  XYPlotData,
  FacetedData,
} from '@veupathdb/components/lib/types/plots';
import { CoverageStatistics } from '../../../types/visualization';
// import axis label unit util
import { axisLabelWithUnit } from '../../../utils/axis-label-unit';
import { NumberVariable, StudyEntity, Variable } from '../../../types/study';
import {
  fixLabelForNumberVariables,
  fixLabelsForNumberVariables,
  variablesAreUnique,
  nonUniqueWarning,
  vocabularyWithMissingData,
} from '../../../utils/visualization';
import { gray } from '../colors';
import {
  ColorPaletteDefault,
  ColorPaletteDark,
} from '@veupathdb/components/lib/types/plots/addOns';
// import variable's metadata-based independent axis range utils
import { defaultIndependentAxisRange } from '../../../utils/default-independent-axis-range';
import { axisRangeMargin } from '../../../utils/axis-range-margin';
import { VariablesByInputName } from '../../../utils/data-element-constraints';
// util to find dependent axis range
import { defaultDependentAxisRange } from '../../../utils/default-dependent-axis-range';
import { useRouteMatch } from 'react-router';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import PluginError from '../PluginError';
// for custom legend
import PlotLegend, {
  LegendItemsProps,
} from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import { isFaceted } from '@veupathdb/components/lib/types/guards';
import FacetedPlot from '@veupathdb/components/lib/plots/FacetedPlot';
// for converting rgb() to rgba()
import * as ColorMath from 'color-math';
// R-square table component
import { ScatterplotRsquareTable } from '../../ScatterplotRsquareTable';

const MAXALLOWEDDATAPOINTS = 100000;
const SMOOTHEDMEANTEXT = 'Smoothed mean';
const SMOOTHEDMEANSUFFIX = `, ${SMOOTHEDMEANTEXT}`;
const CI95TEXT = '95% Confidence interval';
const CI95SUFFIX = `, ${CI95TEXT}`;
const BESTFITTEXT = 'Best fit';
const BESTFITSUFFIX = `, ${BESTFITTEXT}`;

const plotContainerStyles = {
  width: 750,
  height: 450,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

const facetedPlotContainerStyles = {
  height: plotContainerStyles.height / 1.75,
  width: plotContainerStyles.width / 2,
};

const plotSpacingOptions = {};

const facetedPlotSpacingOptions = {
  marginTop: 30,
  marginBottom: 40,
  marginLeft: 50,
  marginRight: 20,
};

// define XYPlotDataWithCoverage
interface XYPlotDataWithCoverage extends CoverageStatistics {
  dataSetProcess: XYPlotData | FacetedData<XYPlotData>;
  // change these types to be compatible with new axis range
  yMin: number | string | undefined;
  yMax: number | string | undefined;
}

// define XYPlotDataResponse
type XYPlotDataResponse = ScatterplotResponse;

export const scatterplotVisualization: VisualizationType = {
  selectorComponent: SelectorComponent,
  fullscreenComponent: ScatterplotViz,
  createDefaultConfig: createDefaultConfig,
};

// this needs a handling of text/image for scatter, line, and density plots
function SelectorComponent({ name }: SelectorProps) {
  const src =
    name === 'lineplot' ? line : name === 'densityplot' ? density : scatter;

  return (
    <img
      alt="Scatter plot"
      style={{ height: '100%', width: '100%' }}
      src={src}
    />
  );
}

function createDefaultConfig(): ScatterplotConfig {
  return {
    valueSpecConfig: 'Raw',
  };
}

export type ScatterplotConfig = t.TypeOf<typeof ScatterplotConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ScatterplotConfig = t.partial({
  xAxisVariable: VariableDescriptor,
  yAxisVariable: VariableDescriptor,
  overlayVariable: VariableDescriptor,
  facetVariable: VariableDescriptor,
  valueSpecConfig: t.string,
  showMissingness: t.boolean,
  // for vizconfig.checkedLegendItems
  checkedLegendItems: t.array(t.string),
});

function ScatterplotViz(props: VisualizationProps) {
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
    totalCounts,
    filteredCounts,
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
      ScatterplotConfig.decode(visualization.descriptor.configuration),
      getOrElse((): t.TypeOf<typeof ScatterplotConfig> => createDefaultConfig())
    );
  }, [visualization.descriptor.configuration]);

  const updateVizConfig = useCallback(
    (newConfig: Partial<ScatterplotConfig>) => {
      updateConfiguration({ ...vizConfig, ...newConfig });
    },
    [updateConfiguration, vizConfig]
  );

  // moved the location of this findEntityAndVariable
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
        // set valueSpec as Raw when yAxisVariable = date
        valueSpecConfig:
          findEntityAndVariable(yAxisVariable)?.variable.type === 'date'
            ? 'Raw'
            : vizConfig.valueSpecConfig,
      });
    },
    [updateVizConfig, findEntityAndVariable, vizConfig.valueSpecConfig]
  );

  // prettier-ignore
  const onChangeHandlerFactory = useCallback(
    < ValueType,>(key: keyof ScatterplotConfig) => (newValue?: ValueType) => {
      updateVizConfig({
        [key]: newValue,
      });
    },
    [updateVizConfig]
  );
  const onValueSpecChange = onChangeHandlerFactory<string>('valueSpecConfig');
  const onShowMissingnessChange = onChangeHandlerFactory<boolean>(
    'showMissingness'
  );

  // for vizconfig.checkedLegendItems
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
    useCallback(async (): Promise<XYPlotDataWithCoverage | undefined> => {
      if (
        !variablesAreUnique([
          xAxisVariable,
          yAxisVariable,
          overlayVariable,
          facetVariable,
        ])
      )
        throw new Error(nonUniqueWarning);

      // check independentValueType/dependentValueType
      const independentValueType = xAxisVariable?.type
        ? xAxisVariable.type
        : '';
      const dependentValueType = yAxisVariable?.type ? yAxisVariable.type : '';

      // check variable inputs: this is necessary to prevent from data post
      if (vizConfig.xAxisVariable == null || xAxisVariable == null)
        return undefined;
      else if (vizConfig.yAxisVariable == null || yAxisVariable == null)
        return undefined;

      const vars = [xAxisVariable, yAxisVariable, overlayVariable];
      const unique = vars.filter((item, i, ar) => ar.indexOf(item) === i);
      if (vars.length !== unique.length)
        throw new Error(
          'Variables must be unique. Please choose different variables.'
        );

      // add visualization.type here. valueSpec too?
      const params = getRequestParams(
        studyId,
        filters ?? [],
        vizConfig,
        outputEntity,
        visualization.descriptor.type
      );

      // scatterplot, lineplot
      const response =
        visualization.descriptor.type === 'lineplot'
          ? dataClient.getLineplot(
              computation.descriptor.type,
              params as LineplotRequestParams
            )
          : // set default as scatterplot/getScatterplot
            dataClient.getScatterplot(
              computation.descriptor.type,
              params as ScatterplotRequestParams
            );

      const showMissing =
        vizConfig.showMissingness &&
        (overlayVariable != null || facetVariable != null);
      const overlayVocabulary = fixLabelsForNumberVariables(
        overlayVariable?.vocabulary,
        overlayVariable
      );
      const facetVocabulary = fixLabelsForNumberVariables(
        facetVariable?.vocabulary,
        facetVariable
      );
      return scatterplotResponseToData(
        await response,
        visualization.descriptor.type,
        independentValueType,
        dependentValueType,
        showMissing,
        overlayVocabulary,
        overlayVariable,
        facetVocabulary,
        facetVariable
      );
    }, [
      studyId,
      filters,
      dataClient,
      // simply using vizConfig causes issue with onCheckedLegendItemsChange
      // it is because vizConfig also contains vizConfig.checkedLegendItems
      vizConfig.xAxisVariable,
      vizConfig.yAxisVariable,
      vizConfig.overlayVariable,
      vizConfig.facetVariable,
      vizConfig.valueSpecConfig,
      vizConfig.showMissingness,
      computation.descriptor.type,
      visualization.descriptor.type,
      outputEntity,
    ])
  );

  const outputSize =
    overlayVariable != null && !vizConfig.showMissingness
      ? data.value?.completeCasesAllVars
      : data.value?.completeCasesAxesVars;

  // variable's metadata-based independent axis range with margin
  const defaultIndependentRangeMargin = useMemo(() => {
    const defaultIndependentRange = defaultIndependentAxisRange(
      xAxisVariable,
      'scatterplot'
    );
    return axisRangeMargin(defaultIndependentRange, xAxisVariable?.type);
  }, [xAxisVariable]);

  // find deependent axis range and its margin
  const defaultDependentRangeMargin = useMemo(() => {
    //K set yMinMaxRange using yMin/yMax obtained from processInputData()
    const yMinMaxRange =
      data.value != null
        ? { min: data.value.yMin, max: data.value?.yMax }
        : undefined;

    const defaultDependentRange = defaultDependentAxisRange(
      yAxisVariable,
      'scatterplot',
      yMinMaxRange
    );

    return axisRangeMargin(defaultDependentRange, yAxisVariable?.type);
  }, [data, yAxisVariable]);

  const { url } = useRouteMatch();

  // custom legend list
  const legendItems: LegendItemsProps[] = useMemo(() => {
    const allData = data.value?.dataSetProcess;

    /**
     * It was found for some faceted data involving Smoothed mean and or Best fit option,
     * each facet does not always have full Smoothed mean and/or Best fit info
     * thus, uniqBy is introduced to find a full list of legend items
     * However, using uniqBy for faceted data does not always guarantee that the Smoothed mean, CI, or Best fit items are correctly ordered
     * for this reason, a new array of objects that is partially sorted is made in the following
     * this may need a revisit in the future for overall improvement/rescheme
     */

    const legendData = !isFaceted(allData)
      ? allData?.series
      : uniqBy(
          allData.facets
            .flatMap((facet) => facet?.data?.series)
            .filter((element): element is XYPlotDataSeries => element != null),
          'name'
        );

    // logic for setting markerColor correctly
    // find raw legend label (excluding No data as well)
    const legendLabel =
      legendData != null
        ? legendData
            .filter(
              (data) =>
                !data?.name?.includes(SMOOTHEDMEANSUFFIX) &&
                !data?.name?.includes(CI95SUFFIX) &&
                !data?.name?.includes(BESTFITSUFFIX) &&
                !data?.name?.includes('No data')
            )
            .map((data) => data.name)
        : [];

    // construct a kind of a lookup table
    const legendLabelColor = legendLabel?.map((label, index) => {
      return {
        label: label,
        color: ColorPaletteDefault[index],
      };
    });

    // find the number Raw legend items considering No data case
    const numberLegendRawItems = vizConfig.showMissingness
      ? legendLabel.length + 1
      : legendLabel.length;

    // count will be used for Smoothed mean option as it consists of a pair of smoothed mean and CI per vocabulary
    let count = 0;

    // new array of objects based on legendData array (a kind of partial sort)
    // raw data is in the correct order, but not always for smoothed mean, CI, and Best fit
    // e.g., showing 'data1' (raw), 'data2' (raw), 'data2, Best fit', 'data1, Best fit' in order
    // needed to have complex conditions for treating Smoothed mean, CI, Best fit, No data, etc.
    const sortedLegendData =
      isFaceted(allData) && vizConfig.valueSpecConfig !== 'Raw'
        ? legendData
            ?.flatMap((dataItem, index) => {
              if (index < numberLegendRawItems) {
                // Raw data is ordered correctly
                return dataItem;
              } else if (
                vizConfig.valueSpecConfig === 'Best fit line with raw'
              ) {
                // Best fit
                return legendData.filter((element) => {
                  // checking No data case
                  if (vizConfig.showMissingness) {
                    if (index < legendData.length - 1) {
                      return element.name?.includes(
                        legendLabel[index - numberLegendRawItems] +
                          BESTFITSUFFIX
                      );
                    } else {
                      // No data case
                      return element.name?.includes('No data' + BESTFITSUFFIX);
                    }
                  } else {
                    return element.name?.includes(
                      legendLabel[index - numberLegendRawItems] + BESTFITSUFFIX
                    );
                  }
                });
                // Smoothed mean and CI
              } else if (
                vizConfig.valueSpecConfig === 'Smoothed mean with raw'
              ) {
                if (
                  vizConfig.showMissingness == null ||
                  !vizConfig.showMissingness
                ) {
                  if (dataItem?.name?.includes(SMOOTHEDMEANSUFFIX)) {
                    return legendData.filter((element) => {
                      return element.name?.includes(
                        legendLabel[index - (numberLegendRawItems + count)] +
                          SMOOTHEDMEANSUFFIX
                      );
                    });
                  } else if (dataItem?.name?.includes(CI95SUFFIX)) {
                    // increase count here
                    ++count;
                    return legendData.filter((element) => {
                      return element.name?.includes(
                        legendLabel[index - (numberLegendRawItems + count)] +
                          CI95SUFFIX
                      );
                    });
                  }
                  // the case No data exists
                } else {
                  if (dataItem?.name?.includes(SMOOTHEDMEANSUFFIX)) {
                    if (index < legendData.length - 2) {
                      return legendData.filter((element) => {
                        return element.name?.includes(
                          legendLabel[index - (numberLegendRawItems + count)] +
                            SMOOTHEDMEANSUFFIX
                        );
                      });
                    } else {
                      // No data case
                      return legendData.filter((element) => {
                        return element.name?.includes(
                          'No data' + SMOOTHEDMEANSUFFIX
                        );
                      });
                    }
                  } else if (dataItem?.name?.includes(CI95SUFFIX)) {
                    // increase count here
                    ++count;
                    if (index < legendData.length - 2) {
                      return legendData.filter((element) => {
                        return element.name?.includes(
                          legendLabel[index - (numberLegendRawItems + count)] +
                            CI95SUFFIX
                        );
                      });
                    } else {
                      return legendData.filter((element) => {
                        return element.name?.includes('No data' + CI95SUFFIX);
                      });
                    }
                  }
                }
              }
              return [];
              // observed No data is often undefined during data loading by toggling showMissingness for large scatter data/graphics
            })
            .filter((element) => element != null)
        : legendData;

    return sortedLegendData != null
      ? // the name 'dataItem' is used inside the map() to distinguish from the global 'data' variable
        sortedLegendData.map((dataItem: XYPlotDataSeries, index: number) => {
          return {
            label: dataItem.name ?? '',
            // maing marker info appropriately
            marker:
              dataItem.mode != null
                ? dataItem.name === 'No data'
                  ? 'x'
                  : dataItem.mode === 'markers'
                  ? 'circle'
                  : dataItem.mode === 'lines'
                  ? 'line'
                  : ''
                : dataItem?.fill === 'tozeroy'
                ? 'fainted'
                : '',
            // set marker colors appropriately
            markerColor:
              dataItem.name != null &&
              (dataItem?.name === 'No data' ||
                dataItem.name?.includes('No data,'))
                ? '#A6A6A6'
                : // if there is no overlay variable, then marker colors should be the same for Data, Smoothed mean, 95% CI, and Best fit
                vizConfig.overlayVariable != null
                ? dataItem.name != null
                  ? legendLabelColor
                      ?.map((legend) => {
                        if (
                          dataItem.name != null &&
                          legend.label != null &&
                          dataItem.name.includes(legend.label)
                        )
                          return legend.color;
                        else return '';
                      })
                      .filter((n: string) => n !== '')
                      .toString()
                  : '#ffffff' // just set not to be empty
                : ColorPaletteDefault[0], // set first color for no overlay variable selected
            // simplifying the check with the presence of data: be carefule of y:[null] case in Scatter plot
            hasData: !isFaceted(allData)
              ? dataItem.y != null &&
                dataItem.y.length > 0 &&
                dataItem.y[0] !== null
                ? true
                : false
              : allData.facets
                  .map((facet) => facet.data)
                  .filter((data): data is XYPlotData => data != null)
                  .map(
                    (data) =>
                      data.series[index]?.y != null &&
                      data.series[index].y.length > 0 &&
                      data.series[index].y[0] !== null
                  )
                  .includes(true),
            group: 1,
            rank: 1,
          };
        })
      : [];
  }, [data]);

  useEffect(() => {
    if (data != null) {
      // use this to set all legend checked at first
      onCheckedLegendItemsChange(legendItems.map((item) => item.label));
    }
  }, [data, legendItems]);

  const plotNode = (
    <ScatterplotWithControls
      // data.value
      data={data.value?.dataSetProcess}
      updateThumbnail={updateThumbnail}
      containerStyles={
        isFaceted(data.value?.dataSetProcess)
          ? facetedPlotContainerStyles
          : plotContainerStyles
      }
      spacingOptions={
        isFaceted(data.value?.dataSetProcess)
          ? facetedPlotSpacingOptions
          : plotSpacingOptions
      }
      // title={'Scatter plot'}
      displayLegend={false}
      independentAxisLabel={axisLabelWithUnit(xAxisVariable) ?? 'X-axis'}
      dependentAxisLabel={axisLabelWithUnit(yAxisVariable) ?? 'Y-axis'}
      // variable's metadata-based independent axis range with margin
      independentAxisRange={defaultIndependentRangeMargin}
      // new dependent axis range
      dependentAxisRange={data.value ? defaultDependentRangeMargin : undefined}
      // set valueSpec as Raw when yAxisVariable = date
      valueSpec={
        yAxisVariable?.type === 'date' ? 'Raw' : vizConfig.valueSpecConfig
      }
      onValueSpecChange={onValueSpecChange}
      // send visualization.type here
      vizType={visualization.descriptor.type}
      interactive={true}
      showSpinner={data.pending}
      // add plotOptions to control the list of plot options
      plotOptions={['Raw', 'Smoothed mean with raw', 'Best fit line with raw']}
      // disabledList prop is used to disable radio options (grayed out)
      disabledList={
        yAxisVariable?.type === 'date'
          ? ['Smoothed mean with raw', 'Best fit line with raw']
          : []
      }
      independentValueType={
        NumberVariable.is(xAxisVariable) ? 'number' : 'date'
      }
      dependentValueType={NumberVariable.is(yAxisVariable) ? 'number' : 'date'}
      legendTitle={axisLabelWithUnit(overlayVariable)}
      // pass checked state of legend checkbox to PlotlyPlot
      checkedLegendItems={vizConfig.checkedLegendItems}
      // for vizconfig.checkedLegendItems
      onCheckedLegendItemsChange={onCheckedLegendItemsChange}
    />
  );

  const legendNode = !data.pending && data.value != null && (
    <PlotLegend
      legendItems={legendItems}
      checkedLegendItems={vizConfig.checkedLegendItems}
      legendTitle={axisLabelWithUnit(overlayVariable)}
      onCheckedLegendItemsChange={onCheckedLegendItemsChange}
    />
  );

  const tableGroupNode = (
    <>
      <BirdsEyeView
        completeCasesAllVars={
          data.pending ? undefined : data.value?.completeCasesAllVars
        }
        completeCasesAxesVars={
          data.pending ? undefined : data.value?.completeCasesAxesVars
        }
        outputEntity={outputEntity}
        stratificationIsActive={overlayVariable != null}
        enableSpinner={
          xAxisVariable != null && yAxisVariable != null && !data.error
        }
        totalCounts={totalCounts}
        filteredCounts={filteredCounts}
      />
      <VariableCoverageTable
        completeCases={
          data.value && !data.pending ? data.value?.completeCases : undefined
        }
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
      {/* R-square table component: only display when overlay and/or facet variable exist */}
      {vizConfig.valueSpecConfig === 'Best fit line with raw' &&
        data.value != null &&
        !data.pending &&
        (vizConfig.overlayVariable != null ||
          vizConfig.facetVariable != null) && (
          <ScatterplotRsquareTable
            typedData={
              !isFaceted(data.value.dataSetProcess)
                ? { isFaceted: false, data: data.value.dataSetProcess.series }
                : { isFaceted: true, data: data.value.dataSetProcess.facets }
            }
            overlayVariable={overlayVariable}
            facetVariable={facetVariable}
          />
        )}
    </>
  );

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

      <PluginError
        error={data.error}
        outputSize={outputSize}
        customCases={[
          (errorString) =>
            errorString.match(/400.+too large/is) ? (
              <span>
                Your plot currently has too many points (&gt;
                {MAXALLOWEDDATAPOINTS.toLocaleString()}) to display in a
                reasonable time. Please either add filters in the{' '}
                <Link replace to={url.replace(/visualizations.+/, 'variables')}>
                  Browse and subset
                </Link>{' '}
                tab to reduce the number, or consider using a summary plot such
                as histogram or boxplot.
              </span>
            ) : undefined,
        ]}
      />
      <OutputEntityTitle entity={outputEntity} outputSize={outputSize} />
      <PlotLayout
        isFaceted={isFaceted(data.value?.dataSetProcess)}
        legendNode={legendNode}
        plotNode={plotNode}
        tableGroupNode={tableGroupNode}
      />
    </div>
  );
}

type ScatterplotWithControlsProps = Omit<XYPlotProps, 'data'> & {
  data?: XYPlotData | FacetedData<XYPlotData>;
  valueSpec: string | undefined;
  onValueSpecChange: (value: string) => void;
  updateThumbnail: (src: string) => void;
  vizType: string;
  plotOptions: string[];
  // add disabledList
  disabledList: string[];
  // custom legend
  checkedLegendItems: string[] | undefined;
  onCheckedLegendItemsChange: (checkedLegendItems: string[]) => void;
};

function ScatterplotWithControls({
  data,
  // XYPlotControls: set initial value as 'raw' ('Raw')
  valueSpec = 'Raw',
  onValueSpecChange,
  vizType,
  // add plotOptions
  plotOptions,
  // add disabledList
  disabledList,
  updateThumbnail,
  // custom legend
  checkedLegendItems,
  onCheckedLegendItemsChange,
  ...scatterplotProps
}: ScatterplotWithControlsProps) {
  // TODO Use UIState
  // const errorManagement = useMemo((): ErrorManagement => {
  //   return {
  //     errors: [],
  //     addError: (_: Error) => {},
  //     removeError: (_: Error) => {},
  //     clearAllErrors: () => {},
  //   };
  // }, []);

  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    plotContainerStyles,
    [data, checkedLegendItems]
  );

  return (
    <>
      {isFaceted(data) ? (
        <FacetedPlot
          data={data}
          props={scatterplotProps}
          component={XYPlot}
          facetedPlotRef={plotRef}
          checkedLegendItems={checkedLegendItems}
        />
      ) : (
        <XYPlot
          {...scatterplotProps}
          ref={plotRef}
          data={data}
          // add controls
          displayLibraryControls={false}
          // custom legend: pass checkedLegendItems to PlotlyPlot
          checkedLegendItems={checkedLegendItems}
        />
      )}
      {/*  XYPlotControls: check vizType (only for scatterplot for now) */}
      {vizType === 'scatterplot' && (
        // use RadioButtonGroup directly instead of XYPlotControls
        <RadioButtonGroup
          label="Plot Modes"
          options={plotOptions}
          selectedOption={valueSpec}
          onOptionSelected={onValueSpecChange}
          // disabledList prop is used to disable radio options (grayed out)
          disabledList={disabledList}
          orientation={'horizontal'}
          labelPlacement={'end'}
          buttonColor={'primary'}
          margins={['1em', '0', '0', '6em']}
          itemMarginRight={50}
        />
      )}
    </>
  );
}

/**
 * Reformat response from Scatter Plot endpoints into complete ScatterplotData
 * @param response
 * @returns ScatterplotData
 */
export function scatterplotResponseToData(
  response: XYPlotDataResponse,
  // vizType may be used for handling other plots in this component like line and density
  vizType: string,
  independentValueType: string,
  dependentValueType: string,
  showMissingness: boolean = false,
  overlayVocabulary: string[] = [],
  overlayVariable?: Variable,
  facetVocabulary: string[] = [],
  facetVariable?: Variable
): XYPlotDataWithCoverage {
  const modeValue = vizType === 'lineplot' ? 'lines' : 'markers'; // for scatterplot

  const hasMissingData =
    response.scatterplot.config.completeCasesAllVars !==
    response.scatterplot.config.completeCasesAxesVars;

  const facetGroupedResponseData = groupBy(response.scatterplot.data, (data) =>
    data.facetVariableDetails && data.facetVariableDetails.length === 1
      ? fixLabelForNumberVariables(
          data.facetVariableDetails[0].value,
          facetVariable
        )
      : '__NO_FACET__'
  );

  const processedData = mapValues(facetGroupedResponseData, (group) => {
    const { dataSetProcess, yMin, yMax } = processInputData(
      reorderResponseScatterplotData(
        // reorder by overlay var within each facet
        group,
        vocabularyWithMissingData(overlayVocabulary, showMissingness),
        overlayVariable
      ),
      vizType,
      modeValue,
      independentValueType,
      dependentValueType,
      showMissingness,
      hasMissingData,
      overlayVariable,
      // pass facetVariable to determine either scatter or scattergl
      facetVariable
    );

    return {
      dataSetProcess: dataSetProcess,
      yMin: yMin,
      yMax: yMax,
    };
  });

  const yMin = min(map(processedData, ({ yMin }) => yMin));
  const yMax = max(map(processedData, ({ yMax }) => yMax));

  const dataSetProcess =
    size(processedData) === 1 && head(keys(processedData)) === '__NO_FACET__'
      ? // unfaceted
        head(values(processedData))?.dataSetProcess
      : // faceted
        {
          facets: vocabularyWithMissingData(
            facetVocabulary,
            showMissingness
          ).map((facetValue) => ({
            label: facetValue,
            data: processedData[facetValue]?.dataSetProcess ?? undefined,
          })),
        };

  return {
    dataSetProcess,
    // calculated y axis limits
    yMin,
    yMax,
    // CoverageStatistics
    completeCases: response.completeCasesTable,
    completeCasesAllVars: response.scatterplot.config.completeCasesAllVars,
    completeCasesAxesVars: response.scatterplot.config.completeCasesAxesVars,
  } as XYPlotDataWithCoverage;
}

// add an extended type including dataElementDependencyOrder
type getRequestParamsProps =
  | (ScatterplotRequestParams & {
      vizType?: string;
    })
  | (LineplotRequestParams & {
      vizType?: string;
    });

function getRequestParams(
  studyId: string,
  filters: Filter[],
  vizConfig: ScatterplotConfig,
  outputEntity?: StudyEntity,
  vizType?: string
): getRequestParamsProps {
  const {
    xAxisVariable,
    yAxisVariable,
    overlayVariable,
    facetVariable,
    valueSpecConfig,
    showMissingness,
  } = vizConfig;

  // valueSpec
  let valueSpecValue = 'raw';
  if (valueSpecConfig === 'Smoothed mean with raw') {
    valueSpecValue = 'smoothedMeanWithRaw';
  } else if (valueSpecConfig === 'Best fit line with raw') {
    valueSpecValue = 'bestFitLineWithRaw';
  }

  if (vizType === 'lineplot') {
    return {
      studyId,
      filters,
      config: {
        // add outputEntityId
        outputEntityId: outputEntity?.id,
        xAxisVariable: xAxisVariable,
        yAxisVariable: yAxisVariable,
        overlayVariable: overlayVariable,
        facetVariable: facetVariable ? [facetVariable] : [],
        showMissingness: showMissingness ? 'TRUE' : 'FALSE',
      },
    } as LineplotRequestParams;
  } else {
    // scatterplot
    return {
      studyId,
      filters,
      config: {
        // add outputEntityId
        outputEntityId: outputEntity?.id,
        // XYPlotControls
        valueSpec: valueSpecValue,
        xAxisVariable: xAxisVariable,
        yAxisVariable: yAxisVariable,
        overlayVariable: overlayVariable,
        facetVariable: facetVariable ? [facetVariable] : [],
        showMissingness: showMissingness ? 'TRUE' : 'FALSE',
        maxAllowedDataPoints: MAXALLOWEDDATAPOINTS,
      },
    } as ScatterplotRequestParams;
  }
}

// making plotly input data
function processInputData<T extends number | string>(
  responseScatterplotData: ScatterplotResponse['scatterplot']['data'],
  vizType: string,
  // line, marker,
  modeValue: string,
  // use independentValueType & dependentValueType to distinguish btw number and date string
  independentValueType: string,
  dependentValueType: string,
  showMissingness: boolean,
  hasMissingData: boolean,
  overlayVariable?: Variable,
  // pass facetVariable to determine either scatter or scattergl
  facetVariable?: Variable
) {
  // set fillAreaValue for densityplot
  const fillAreaValue = vizType === 'densityplot' ? 'toself' : '';

  // set variables for x- and yaxis ranges: no default values are set
  let yMin: number | string | undefined;
  let yMax: number | string | undefined;

  // catch the case when the back end has returned valid but completely empty data
  if (
    responseScatterplotData.every(
      (data) => data.seriesX?.length === 0 && data.seriesY?.length === 0
    )
  ) {
    return {
      dataSetProcess: { series: [] }, // BM doesn't think this should be `undefined` for empty facets - the back end doesn't return *any* data for empty facets.
      yMin,
      yMax,
    };
  }

  // function to return color or gray where needed if showMissingness == true
  const markerColor = (index: number) => {
    if (showMissingness && index === responseScatterplotData.length - 1) {
      return gray;
    } else {
      return ColorPaletteDefault[index] ?? 'black'; // TO DO: decide on overflow behaviour
    }
  };

  // using dark color: function to return color or gray where needed if showMissingness == true
  const markerColorDark = (index: number) => {
    if (showMissingness && index === responseScatterplotData.length - 1) {
      return gray;
    } else {
      return ColorPaletteDark[index] ?? 'black'; // TO DO: decide on overflow behaviour
    }
  };

  // determine conditions for not adding empty "No data" traces
  // we want to stop at the penultimate series if showMissing is active and there is actually no missing data
  // 'break' from the for loops (array.some(...)) if this is true
  const breakAfterThisSeries = (index: number) => {
    return (
      showMissingness &&
      !hasMissingData &&
      index === responseScatterplotData.length - 2
    );
  };

  const markerSymbol = (index: number) =>
    showMissingness && index === responseScatterplotData.length - 1
      ? 'x'
      : 'circle-open';

  // use type: scatter for faceted plot, otherwise scattergl
  const scatterPlotType = facetVariable != null ? 'scatter' : 'scattergl';

  // set dataSetProcess as any for now
  let dataSetProcess: any = [];

  // drawing raw data (markers) at first
  responseScatterplotData.some(function (el: any, index: number) {
    // initialize seriesX/Y
    let seriesX = [];
    let seriesY = [];

    // series is for scatter plot
    if (el.seriesX && el.seriesY) {
      // check the number of x = number of y
      if (el.seriesX.length !== el.seriesY.length) {
        // alert('The number of X data is not equal to the number of Y data');
        throw new Error(
          'The number of X data is not equal to the number of Y data'
        );
      }

      /*
        For raw data, there are two cases:
          a) X: number string; Y: date string
          b) X: date string; Y: number string
        For the case of b), smoothed mean and best fit line option would get backend response error
      **/
      if (independentValueType === 'date') {
        seriesX = el.seriesX;
      } else {
        seriesX = el.seriesX.map(Number);
      }
      if (dependentValueType === 'date') {
        seriesY = el.seriesY;
      } else {
        seriesY = el.seriesY.map(Number);
      }

      // compute yMin/yMax
      if (seriesY.length) {
        yMin =
          yMin != null
            ? lte(yMin, min(seriesY))
              ? yMin
              : min(seriesY)
            : min(seriesY);
        yMax =
          yMax != null
            ? gte(yMax, max(seriesY))
              ? yMax
              : max(seriesY)
            : max(seriesY);
      }

      // add scatter data considering input options
      dataSetProcess.push({
        x: seriesX.length ? seriesX : [null], // [null] hack required to make sure
        y: seriesY.length ? seriesY : [null], // Plotly has a legend entry for empty traces
        // distinguish X/Y Data from Overlay
        name:
          el.overlayVariableDetails?.value != null
            ? fixLabelForNumberVariables(
                el.overlayVariableDetails.value,
                overlayVariable
              )
            : 'Data',
        mode: modeValue,
        type:
          vizType === 'lineplot'
            ? 'scatter'
            : vizType === 'densityplot'
            ? 'scatter'
            : scatterPlotType,
        fill: fillAreaValue,
        opacity: 0.7,
        marker: {
          color: markerColor(index),
          symbol: markerSymbol(index),
        },
        // this needs to be here for the case of markers with line or lineplot.
        // always use spline?
        line: { color: markerColor(index), shape: 'spline' },
      });
      return breakAfterThisSeries(index);
    }
    return false;
  });

  // after drawing raw data, smoothedMean and bestfitline plots are displayed
  responseScatterplotData.some(function (el: any, index: number) {
    // initialize variables: setting with union type for future, but this causes typescript issue in the current version
    let xIntervalLineValue: T[] = [];
    let yIntervalLineValue: number[] = [];
    let standardErrorValue: number[] = []; // this is for standardError

    let xIntervalBounds: T[] = [];
    let yIntervalBounds: number[] = [];

    // initialize smoothedMeanX, bestFitLineX
    let smoothedMeanX = [];
    let bestFitLineX = [];

    // check if smoothedMean prop exists
    if (el.smoothedMeanX && el.smoothedMeanY && el.smoothedMeanSE) {
      // check the number of x = number of y or standardError
      if (el.smoothedMeanX.length !== el.smoothedMeanY.length) {
        throw new Error(
          'The number of X data is not equal to the number of Y data or standardError data'
        );
      }

      // change string array to number array for numeric data
      if (independentValueType === 'date') {
        smoothedMeanX = el.smoothedMeanX;
      } else {
        smoothedMeanX = el.smoothedMeanX.map(Number);
      }
      // smoothedMeanY/SE are number[]

      // the date format, yyyy-mm-dd works with sort, so no change in the following is required
      // sorting function
      //1) combine the arrays: including standardError
      let combinedArrayInterval = [];
      for (let j = 0; j < smoothedMeanX.length; j++) {
        combinedArrayInterval.push({
          xValue: smoothedMeanX[j],
          yValue: el.smoothedMeanY[j],
          zValue: el.smoothedMeanSE[j],
        });
      }
      //2) sort:
      combinedArrayInterval.sort(function (a, b) {
        return a.xValue < b.xValue ? -1 : a.xValue === b.xValue ? 0 : 1;
      });
      //3) separate them back out:
      for (let k = 0; k < combinedArrayInterval.length; k++) {
        xIntervalLineValue[k] = combinedArrayInterval[k].xValue;
        yIntervalLineValue[k] = combinedArrayInterval[k].yValue;
        standardErrorValue[k] = combinedArrayInterval[k].zValue;
      }

      // add additional condition for the case of smoothedMean (without series data)
      // need to check whether data is empty
      if (yIntervalLineValue.length) {
        yMin = el.seriesY.length
          ? lte(yMin, min(yIntervalLineValue))
            ? yMin
            : min(yIntervalLineValue)
          : min(yIntervalLineValue);
        yMax = el.seriesY.length
          ? gte(yMax, max(yIntervalLineValue))
            ? yMax
            : max(yIntervalLineValue)
          : max(yIntervalLineValue);
      }

      // store data for smoothed mean: this is not affected by plot options (e.g., showLine etc.)
      dataSetProcess.push({
        x: xIntervalLineValue,
        y: yIntervalLineValue,
        // name: 'Smoothed mean',
        name: el.overlayVariableDetails
          ? fixLabelForNumberVariables(
              el.overlayVariableDetails.value,
              overlayVariable
            ) + SMOOTHEDMEANSUFFIX
          : SMOOTHEDMEANTEXT,
        mode: 'lines', // no data point is displayed: only line
        line: {
          // use darker color for smoothed mean line
          color: markerColorDark(index),
          shape: 'spline',
          width: 2,
        },
        type: scatterPlotType,
      });

      // make Confidence Interval (CI) or Bounds (filled area)
      xIntervalBounds = xIntervalLineValue;
      xIntervalBounds = xIntervalBounds.concat(
        xIntervalLineValue.map((element) => element).reverse()
      );

      // finding upper and lower bound values.
      const { yUpperValues, yLowerValues } = getBounds(
        yIntervalLineValue,
        standardErrorValue
      );

      // make upper and lower bounds plotly format
      yIntervalBounds = yUpperValues;
      yIntervalBounds = yIntervalBounds.concat(
        yLowerValues.map((element) => element).reverse()
      );

      // set variables for y-axes ranges including CI/bounds
      if (yLowerValues.length) {
        yMin = lte(yMin, min(yLowerValues)) ? yMin : min(yLowerValues);
        yMax = gte(yMax, max(yUpperValues)) ? yMax : max(yUpperValues);
      }

      // store data for CI/bounds
      dataSetProcess.push({
        x: xIntervalBounds,
        y: yIntervalBounds,
        // name: '95% Confidence interval',
        name: el.overlayVariableDetails
          ? fixLabelForNumberVariables(
              el.overlayVariableDetails.value,
              overlayVariable
            ) + CI95SUFFIX
          : CI95TEXT,
        // this is better to be tozeroy, not tozerox
        fill: 'tozeroy',
        // opacity only works for type: scattergl
        opacity: 0.2,
        // use darker color for smoothed mean's confidence interval
        // when using scatter, fillColor should be rgba() format
        fillcolor:
          facetVariable != null
            ? ColorMath.evaluate(
                markerColorDark(index) + ' @a 20%'
              ).result.css()
            : markerColorDark(index),
        type: scatterPlotType,
        // here, line means upper and lower bounds
        line: { color: 'transparent', shape: 'spline' },
      });
    }

    // accomodating bestFitLineWithRaw
    // check if bestFitLineX/Y props exist
    if (el.bestFitLineX && el.bestFitLineY) {
      // check the number of x = number of y
      if (el.bestFitLineX.length !== el.bestFitLineY.length) {
        throw new Error(
          'The number of X data is not equal to the number of Y data or standardError data'
        );
      }

      // change string array to number array for numeric data
      if (independentValueType === 'date') {
        bestFitLineX = el.bestFitLineX;
      } else {
        bestFitLineX = el.bestFitLineX.map(Number);
      }

      // add additional condition for the case of smoothedMean (without series data)
      if (el.bestFitLineY.length) {
        yMin = el.seriesY
          ? lte(yMin, min(el.bestFitLineY))
            ? yMin
            : min(el.bestFitLineY)
          : min(el.bestFitLineY);
        yMax = el.seriesY
          ? gte(yMax, max(el.bestFitLineY))
            ? yMax
            : max(el.bestFitLineY)
          : max(el.bestFitLineY);
      }

      // store data for fitting line: this is not affected by plot options (e.g., showLine etc.)
      dataSetProcess.push({
        x: bestFitLineX,
        y: el.bestFitLineY,
        r2: el.r2,
        // display R-square value at legend for no overlay and facet variable
        name:
          overlayVariable == null && facetVariable == null
            ? 'Best fit, R² = ' + el.r2
            : el.overlayVariableDetails
            ? fixLabelForNumberVariables(
                el.overlayVariableDetails.value,
                overlayVariable
              ) + BESTFITSUFFIX
            : BESTFITTEXT,
        mode: 'lines', // no data point is displayed: only line
        line: {
          // use darker color for best fit line
          color: markerColorDark(index),
          shape: 'spline',
        },
        type: scatterPlotType,
      });
    }
    return breakAfterThisSeries(index);
  });

  return { dataSetProcess: { series: dataSetProcess }, yMin, yMax };
}

/*
 * Utility functions for processInputData()
 */

function getBounds<T extends number | string>(
  values: T[],
  standardErrors: T[]
): {
  yUpperValues: T[];
  yLowerValues: T[];
} {
  const yUpperValues = values.map((value, idx) => {
    const tmp = Number(value) + 2 * Number(standardErrors[idx]);
    return tmp as T;
  });
  const yLowerValues = values.map((value, idx) => {
    const tmp = Number(value) - 2 * Number(standardErrors[idx]);
    return tmp as T;
  });

  return { yUpperValues, yLowerValues };
}

function reorderResponseScatterplotData(
  data: XYPlotDataResponse['scatterplot']['data'],
  overlayVocabulary: string[] = [],
  overlayVariable?: Variable
) {
  if (overlayVocabulary.length > 0) {
    // for each value in the overlay vocabulary's correct order
    // find the index in the series where series.name equals that value
    const overlayValues = data
      .map((series) => series.overlayVariableDetails?.value)
      .filter((value) => value != null)
      .map((value) => fixLabelForNumberVariables(value!, overlayVariable));
    const overlayIndices = overlayVocabulary.map((name) =>
      overlayValues.indexOf(name)
    );
    return overlayIndices.map(
      (i, j) =>
        data[i] ?? {
          // if there is no series, insert a dummy series
          overlayVariableDetails: {
            value: overlayVocabulary[j],
          },
          seriesX: [],
          seriesY: [],
        }
    );
  } else {
    return data;
  }
}
