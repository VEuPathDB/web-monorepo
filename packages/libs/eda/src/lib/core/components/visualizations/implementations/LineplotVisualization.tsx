// load plot component
import LinePlot, {
  LinePlotProps,
} from '@veupathdb/components/lib/plots/LinePlot';

import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { useCallback, useMemo } from 'react';

import DataClient, {
  LineplotRequestParams,
  LineplotResponse,
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

import line from './selectorIcons/line.svg';

// use lodash instead of Math.min/max
import {
  isEqual,
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
// directly use RadioButtonGroup instead of LinePlotControls
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import BinWidthControl from '@veupathdb/components/lib/components/plotControls/BinWidthControl';
import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import {
  NumberOrTimeDelta,
  NumberOrTimeDeltaRange,
  TimeDelta,
} from '@veupathdb/components/lib/types/general';
import {
  LinePlotDataSeries,
  LinePlotData,
  FacetedData,
} from '@veupathdb/components/lib/types/plots';
import { CoverageStatistics } from '../../../types/visualization';
// import axis label unit util
import { axisLabelWithUnit } from '../../../utils/axis-label-unit';
import {
  NumberVariable,
  DateVariable,
  StudyEntity,
  Variable,
} from '../../../types/study';
import {
  fixLabelForNumberVariables,
  fixLabelsForNumberVariables,
  variablesAreUnique,
  nonUniqueWarning,
  vocabularyWithMissingData,
  hasIncompleteCases,
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
import { isFaceted, isTimeDelta } from '@veupathdb/components/lib/types/guards';
import FacetedLinePlot from '@veupathdb/components/lib/plots/facetedPlots/FacetedLinePlot';
// for converting rgb() to rgba()
import * as ColorMath from 'color-math';
//DKDK a custom hook to preserve the status of checked legend items
import { useCheckedLegendItemsStatus } from '../../../hooks/checkedLegendItemsStatus';
import { BinSpec, BinWidthSlider } from '../../../types/general';

const plotContainerStyles = {
  width: 750,
  height: 450,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

const plotSpacingOptions = {};

const modalPlotContainerStyles = {
  width: '85%',
  height: '100%',
  margin: 'auto',
};

// define LinePlotDataWithCoverage
interface LinePlotDataWithCoverage extends CoverageStatistics {
  dataSetProcess: LinePlotData | FacetedData<LinePlotData>;
  // change these types to be compatible with new axis range
  yMin: number | string | undefined;
  yMax: number | string | undefined;
}

// define LinePlotDataResponse
type LinePlotDataResponse = LineplotResponse;

export const lineplotVisualization: VisualizationType = {
  selectorComponent: SelectorComponent,
  fullscreenComponent: LineplotViz,
  createDefaultConfig: createDefaultConfig,
};

// this needs a handling of text/image for scatter, line, and density plots
function SelectorComponent({ name }: SelectorProps) {
  const src = line;

  return (
    <img alt="Line plot" style={{ height: '100%', width: '100%' }} src={src} />
  );
}

function createDefaultConfig(): LineplotConfig {
  return {
    valueSpecConfig: 'Median',
  };
}

export type LineplotConfig = t.TypeOf<typeof LineplotConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const LineplotConfig = t.partial({
  xAxisVariable: VariableDescriptor,
  yAxisVariable: VariableDescriptor,
  overlayVariable: VariableDescriptor,
  facetVariable: VariableDescriptor,
  valueSpecConfig: t.string,
  binWidth: t.number,
  binWidthTimeUnit: t.string,
  showMissingness: t.boolean,
  // for vizconfig.checkedLegendItems
  checkedLegendItems: t.array(t.string),
});

function LineplotViz(props: VisualizationProps) {
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
      LineplotConfig.decode(visualization.descriptor.configuration),
      getOrElse((): t.TypeOf<typeof LineplotConfig> => createDefaultConfig())
    );
  }, [visualization.descriptor.configuration]);

  const updateVizConfig = useCallback(
    (newConfig: Partial<LineplotConfig>) => {
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
    overlayEntity,
    facetVariable,
    facetEntity,
  } = useMemo(() => {
    const { variable: xAxisVariable } =
      findEntityAndVariable(vizConfig.xAxisVariable) ?? {};
    const { variable: yAxisVariable } =
      findEntityAndVariable(vizConfig.yAxisVariable) ?? {};
    const { variable: overlayVariable, entity: overlayEntity } =
      findEntityAndVariable(vizConfig.overlayVariable) ?? {};
    const { variable: facetVariable, entity: facetEntity } =
      findEntityAndVariable(vizConfig.facetVariable) ?? {};
    return {
      xAxisVariable,
      yAxisVariable,
      overlayVariable,
      overlayEntity,
      facetVariable,
      facetEntity,
    };
  }, [
    findEntityAndVariable,
    vizConfig.xAxisVariable,
    vizConfig.yAxisVariable,
    vizConfig.overlayVariable,
    vizConfig.facetVariable,
  ]);

  const handleInputVariableChange = useCallback(
    (selectedVariables: VariablesByInputName) => {
      const {
        xAxisVariable,
        yAxisVariable,
        overlayVariable,
        facetVariable,
      } = selectedVariables;
      const keepBin = isEqual(xAxisVariable, vizConfig.xAxisVariable);
      updateVizConfig({
        xAxisVariable,
        yAxisVariable,
        overlayVariable,
        facetVariable,
        binWidth: keepBin ? vizConfig.binWidth : undefined,
        binWidthTimeUnit: keepBin ? vizConfig.binWidthTimeUnit : undefined,
        // set valueSpec as Raw when yAxisVariable = date
        valueSpecConfig: vizConfig.valueSpecConfig,
        // set undefined for variable change
        checkedLegendItems: undefined,
      });
    },
    [updateVizConfig, findEntityAndVariable, vizConfig.valueSpecConfig]
  );

  const onBinWidthChange = useCallback(
    (newBinWidth: NumberOrTimeDelta) => {
      if (newBinWidth) {
        updateVizConfig({
          binWidth: isTimeDelta(newBinWidth) ? newBinWidth.value : newBinWidth,
          binWidthTimeUnit: isTimeDelta(newBinWidth)
            ? newBinWidth.unit
            : undefined,
        });
      }
    },
    [updateVizConfig]
  );

  // prettier-ignore
  // allow 2nd parameter of resetCheckedLegendItems for checking legend status
  const onChangeHandlerFactory = useCallback(
    < ValueType,>(key: keyof LineplotConfig, resetCheckedLegendItems?: boolean) => (newValue?: ValueType) => {
      const newPartialConfig = resetCheckedLegendItems
        ? {
            [key]: newValue,
            checkedLegendItems: undefined
          }
        : {
          [key]: newValue
        };
       updateVizConfig(newPartialConfig);
    },
    [updateVizConfig]
  );

  // set checkedLegendItems: undefined for the change of both plot options and showMissingness
  const onValueSpecChange = onChangeHandlerFactory<string>(
    'valueSpecConfig',
    true
  );
  const onShowMissingnessChange = onChangeHandlerFactory<boolean>(
    'showMissingness',
    true
  );

  // for vizconfig.checkedLegendItems
  const onCheckedLegendItemsChange = onChangeHandlerFactory<string[]>(
    'checkedLegendItems'
  );

  const { xAxisVariableMetadata, outputEntity } = useMemo(() => {
    const { entity, variable } =
      findEntityAndVariable(vizConfig.xAxisVariable) ?? {};
    return {
      outputEntity: entity,
      xAxisVariableMetadata: variable,
    };
  }, [findEntityAndVariable, vizConfig.xAxisVariable]);

  const data = usePromise(
    useCallback(async (): Promise<LinePlotDataWithCoverage | undefined> => {
      if (
        outputEntity == null ||
        xAxisVariableMetadata == null ||
        filteredCounts.pending ||
        filteredCounts.value == null
      )
        return undefined;

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
        xAxisVariableMetadata,
        outputEntity,
        visualization.descriptor.type
      );

      const response = await dataClient.getLineplot(
        computation.descriptor.type,
        params as LineplotRequestParams
      );

      const showMissingOverlay =
        vizConfig.showMissingness &&
        hasIncompleteCases(
          overlayEntity,
          overlayVariable,
          outputEntity,
          filteredCounts.value,
          response.completeCasesTable
        );
      const showMissingFacet =
        vizConfig.showMissingness &&
        hasIncompleteCases(
          facetEntity,
          facetVariable,
          outputEntity,
          filteredCounts.value,
          response.completeCasesTable
        );

      const overlayVocabulary = fixLabelsForNumberVariables(
        overlayVariable?.vocabulary,
        overlayVariable
      );
      const facetVocabulary = fixLabelsForNumberVariables(
        facetVariable?.vocabulary,
        facetVariable
      );
      return lineplotResponseToData(
        response,
        visualization.descriptor.type,
        independentValueType,
        dependentValueType,
        showMissingOverlay,
        overlayVocabulary,
        overlayVariable,
        showMissingFacet,
        facetVocabulary,
        facetVariable
      );
    }, [
      studyId,
      filters,
      dataClient,
      xAxisVariable,
      yAxisVariable,
      overlayVariable,
      facetVariable,
      // simply using vizConfig causes issue with onCheckedLegendItemsChange
      // it is because vizConfig also contains vizConfig.checkedLegendItems
      vizConfig.xAxisVariable,
      vizConfig.yAxisVariable,
      vizConfig.overlayVariable,
      vizConfig.facetVariable,
      vizConfig.binWidth,
      vizConfig.binWidthTimeUnit,
      vizConfig.valueSpecConfig,
      vizConfig.showMissingness,
      computation.descriptor.type,
      visualization.descriptor.type,
      outputEntity,
      filteredCounts,
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
      'lineplot'
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
      'lineplot',
      yMinMaxRange
    );

    return axisRangeMargin(defaultDependentRange, yAxisVariable?.type);
  }, [data, yAxisVariable]);

  const { url } = useRouteMatch();

  // custom legend list
  const legendItems: LegendItemsProps[] = useMemo(() => {
    const allData = data.value?.dataSetProcess;

    const legendData = !isFaceted(allData)
      ? allData?.series
      : allData?.facets.find(
          ({ data }) => data != null && data.series.length > 0
        )?.data?.series;

    return legendData != null
      ? // the name 'dataItem' is used inside the map() to distinguish from the global 'data' variable
        legendData.map((dataItem: LinePlotDataSeries, index: number) => {
          return {
            label: dataItem.name ?? '',
            // maing marker info appropriately
            marker: 'line',
            // set marker colors appropriately
            markerColor:
              dataItem?.name === 'No data'
                ? '#E8E8E8'
                : ColorPaletteDefault[index], // set first color for no overlay variable selected
            // simplifying the check with the presence of data: be carefule of y:[null] case in Scatter plot
            hasData: !isFaceted(allData)
              ? dataItem.y != null &&
                dataItem.y.length > 0 &&
                dataItem.y[0] !== null
                ? true
                : false
              : allData.facets
                  .map((facet) => facet.data)
                  .filter((data): data is LinePlotData => data != null)
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
  }, [
    data,
    vizConfig.overlayVariable,
    vizConfig.showMissingness,
    vizConfig.valueSpecConfig,
  ]);

  // set checkedLegendItems: not working well with plot options
  const checkedLegendItems = useCheckedLegendItemsStatus(
    legendItems,
    vizConfig.checkedLegendItems
  );

  const plotNode = (
    <LineplotWithControls
      // data.value
      data={data.value?.dataSetProcess}
      updateThumbnail={updateThumbnail}
      containerStyles={
        !isFaceted(data.value?.dataSetProcess) ? plotContainerStyles : undefined
      }
      spacingOptions={
        !isFaceted(data.value?.dataSetProcess) ? plotSpacingOptions : undefined
      }
      // title={'Line plot'}
      displayLegend={false}
      independentAxisLabel={axisLabelWithUnit(xAxisVariable) ?? 'X-axis'}
      dependentAxisLabel={axisLabelWithUnit(yAxisVariable) ?? 'Y-axis'}
      // variable's metadata-based independent axis range with margin
      independentAxisRange={defaultIndependentRangeMargin}
      // new dependent axis range
      dependentAxisRange={data.value ? defaultDependentRangeMargin : undefined}
      // set valueSpec as Raw when yAxisVariable = date
      valueSpec={vizConfig.valueSpecConfig}
      onValueSpecChange={onValueSpecChange}
      // send visualization.type here
      onBinWidthChange={onBinWidthChange}
      vizType={visualization.descriptor.type}
      interactive={!isFaceted(data.value) ? true : false}
      showSpinner={data.pending}
      // add plotOptions to control the list of plot options
      plotOptions={['Median', 'Mean']}
      // disabledList prop is used to disable radio options (grayed out)
      disabledList={[]}
      independentValueType={
        NumberVariable.is(xAxisVariable) ? 'number' : 'date'
      }
      dependentValueType={NumberVariable.is(yAxisVariable) ? 'number' : 'date'}
      legendTitle={axisLabelWithUnit(overlayVariable)}
      // pass checked state of legend checkbox to PlotlyPlot
      checkedLegendItems={checkedLegendItems}
      // for vizconfig.checkedLegendItems
      onCheckedLegendItemsChange={onCheckedLegendItemsChange}
    />
  );

  const legendNode = !data.pending && data.value != null && (
    <PlotLegend
      legendItems={legendItems}
      checkedLegendItems={checkedLegendItems}
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
        totalCounts={totalCounts.value}
        filteredCounts={filteredCounts.value}
      />
      <VariableCoverageTable
        completeCases={
          data.value && !data.pending ? data.value?.completeCases : undefined
        }
        filteredCounts={filteredCounts}
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

type LineplotWithControlsProps = Omit<LinePlotProps, 'data'> & {
  data?: LinePlotData | FacetedData<LinePlotData>;
  valueSpec: string | undefined;
  onValueSpecChange: (value: string) => void;
  onBinWidthChange: (newBinWidth: NumberOrTimeDelta) => void;
  updateThumbnail: (src: string) => void;
  vizType: string;
  plotOptions: string[];
  // add disabledList
  disabledList: string[];
  // custom legend
  checkedLegendItems: string[] | undefined;
  onCheckedLegendItemsChange: (checkedLegendItems: string[]) => void;
};

function LineplotWithControls({
  data,
  // LinePlotControls: set initial value as 'raw' ('Raw')
  valueSpec = 'Median',
  onValueSpecChange,
  onBinWidthChange,
  vizType,
  // add plotOptions
  plotOptions,
  // add disabledList
  disabledList,
  updateThumbnail,
  // custom legend
  checkedLegendItems,
  onCheckedLegendItemsChange,
  ...lineplotProps
}: LineplotWithControlsProps) {
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

  const widgetHeight = '4em';

  // controls need the bin info from just one facet (not an empty one)
  const data0 = isFaceted(data)
    ? data.facets.find(({ data }) => data != null && data.series.length > 0)
        ?.data
    : data;

  return (
    <>
      <RadioButtonGroup
        label="Y-axis aggregation:"
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

      {isFaceted(data) ? (
        <FacetedLinePlot
          data={data}
          componentProps={lineplotProps}
          modalComponentProps={{
            independentAxisLabel: lineplotProps.independentAxisLabel,
            dependentAxisLabel: lineplotProps.dependentAxisLabel,
            displayLegend: lineplotProps.displayLegend,
            containerStyles: modalPlotContainerStyles,
          }}
          facetedPlotRef={plotRef}
          checkedLegendItems={checkedLegendItems}
        />
      ) : (
        <LinePlot
          {...lineplotProps}
          ref={plotRef}
          data={data}
          // add controls
          displayLibraryControls={false}
          // custom legend: pass checkedLegendItems to PlotlyPlot
          checkedLegendItems={checkedLegendItems}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <LabelledGroup label="X-axis">
          <BinWidthControl
            binWidth={data0?.binWidthSlider?.binWidth}
            onBinWidthChange={onBinWidthChange}
            binWidthRange={data0?.binWidthSlider?.binWidthRange}
            binWidthStep={data0?.binWidthSlider?.binWidthStep}
            valueType={data0?.binWidthSlider?.valueType}
            binUnit={
              data0?.binWidthSlider?.valueType === 'date'
                ? (data0?.binWidthSlider?.binWidth as TimeDelta).unit
                : undefined
            }
            binUnitOptions={
              data0?.binWidthSlider?.valueType === 'date'
                ? ['day', 'week', 'month', 'year']
                : undefined
            }
            containerStyles={{
              minHeight: widgetHeight,
            }}
          />
        </LabelledGroup>
      </div>
    </>
  );
}

/**
 * Reformat response from Line Plot endpoints into complete LinePlotData
 * @param response
 * @returns LinePlotData
 */
export function lineplotResponseToData(
  response: LinePlotDataResponse,
  // vizType may be used for handling other plots in this component like line and density
  vizType: string,
  independentValueType: string,
  dependentValueType: string,
  showMissingOverlay: boolean = false,
  overlayVocabulary: string[] = [],
  overlayVariable?: Variable,
  showMissingFacet: boolean = false,
  facetVocabulary: string[] = [],
  facetVariable?: Variable
): LinePlotDataWithCoverage {
  const modeValue = 'lines+markers';

  const hasMissingData =
    response.lineplot.config.completeCasesAllVars !==
    response.lineplot.config.completeCasesAxesVars;

  const facetGroupedResponseData = groupBy(response.lineplot.data, (data) =>
    data.facetVariableDetails && data.facetVariableDetails.length === 1
      ? fixLabelForNumberVariables(
          data.facetVariableDetails[0].value,
          facetVariable
        )
      : '__NO_FACET__'
  );

  const processedData = mapValues(facetGroupedResponseData, (group) => {
    const { dataSetProcess, yMin, yMax } = processInputData(
      reorderResponseLineplotData(
        // reorder by overlay var within each facet
        group,
        vocabularyWithMissingData(overlayVocabulary, showMissingOverlay),
        overlayVariable
      ),
      vizType,
      modeValue,
      independentValueType,
      dependentValueType,
      showMissingOverlay,
      hasMissingData,
      response.lineplot.config.binSpec,
      response.lineplot.config.binSlider,
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
            showMissingFacet
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
    completeCasesAllVars: response.lineplot.config.completeCasesAllVars,
    completeCasesAxesVars: response.lineplot.config.completeCasesAxesVars,
  } as LinePlotDataWithCoverage;
}

// add an extended type including dataElementDependencyOrder
type getRequestParamsProps = LineplotRequestParams & { vizType?: string };

function getRequestParams(
  studyId: string,
  filters: Filter[],
  vizConfig: LineplotConfig,
  xAxisVariableMetadata: Variable,
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
    binWidth = NumberVariable.is(xAxisVariableMetadata) ||
    DateVariable.is(xAxisVariableMetadata)
      ? xAxisVariableMetadata.binWidthOverride ?? xAxisVariableMetadata.binWidth
      : undefined,
    binWidthTimeUnit = xAxisVariableMetadata?.type === 'date'
      ? xAxisVariableMetadata.binUnits
      : undefined,
  } = vizConfig;

  const binSpec = binWidth
    ? {
        binSpec: {
          type: 'binWidth',
          value: binWidth,
          ...(xAxisVariableMetadata?.type === 'date'
            ? { units: binWidthTimeUnit }
            : {}),
        },
      }
    : { binSpec: { type: 'binWidth' } };

  // valueSpec
  let valueSpecValue = 'median';
  if (valueSpecConfig === 'Mean') {
    valueSpecValue = 'mean';
  }

  return {
    studyId,
    filters,
    config: {
      // add outputEntityId
      outputEntityId: outputEntity?.id,
      // LinePlotControls
      valueSpec: valueSpecValue,
      xAxisVariable: xAxisVariable,
      yAxisVariable: yAxisVariable,
      ...binSpec,
      overlayVariable: overlayVariable,
      facetVariable: facetVariable ? [facetVariable] : [],
      showMissingness: showMissingness ? 'TRUE' : 'FALSE',
    },
  } as LineplotRequestParams;
}

// making plotly input data
function processInputData<T extends number | string>(
  responseLineplotData: LineplotResponse['lineplot']['data'],
  vizType: string,
  // line, marker,
  modeValue: string,
  // use independentValueType & dependentValueType to distinguish btw number and date string
  independentValueType: string,
  dependentValueType: string,
  showMissingness: boolean,
  hasMissingData: boolean,
  binSpec: BinSpec,
  binWidthSlider: BinWidthSlider,
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
    responseLineplotData.every(
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
    if (showMissingness && index === responseLineplotData.length - 1) {
      return gray;
    } else {
      return ColorPaletteDefault[index] ?? 'black'; // TO DO: decide on overflow behaviour
    }
  };

  // determine conditions for not adding empty "No data" traces
  // we want to stop at the penultimate series if showMissing is active and there is actually no missing data
  // 'break' from the for loops (array.some(...)) if this is true
  const breakAfterThisSeries = (index: number) => {
    return (
      showMissingness &&
      !hasMissingData &&
      index === responseLineplotData.length - 2
    );
  };

  const markerSymbol = (index: number) =>
    showMissingness && index === responseLineplotData.length - 1
      ? 'x'
      : 'circle';

  // use type: scatter for faceted plot, otherwise scattergl
  const linePlotType = facetVariable != null ? 'scatter' : 'scattergl';

  const binWidth =
    independentValueType === 'number' || independentValueType === 'integer'
      ? binSpec.value || 1
      : {
          value: binSpec.value || 1,
          unit: binSpec.units || 'month',
        };
  const binWidthRange = (independentValueType === 'number' ||
  independentValueType === 'integer'
    ? { min, max }
    : {
        min: binWidthSlider.min,
        max: binWidthSlider.max > 60 ? 60 : binWidthSlider.max, // back end seems to fall over with any values >99 but 60 is used in subsetting
        unit: (binWidth as TimeDelta).unit,
      }) as NumberOrTimeDeltaRange;
  const binWidthStep = binWidthSlider.step || 0.1;

  // set dataSetProcess as any for now
  let dataSetProcess: any = [];

  // drawing raw data (markers) at first
  responseLineplotData.some(function (el: any, index: number) {
    // initialize seriesX/Y
    let seriesX: string[] = [];
    let seriesY: string[] = [];
    let binStart: string[] = [];
    let binEnd: string[] = [];

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
      **/
      if (independentValueType === 'date') {
        seriesX = el.seriesX;
        binStart = el.binStart;
        binEnd = el.binEnd;
      } else {
        seriesX = el.seriesX.map(Number);
        binStart = el.binStart.map(Number);
        binEnd = el.binEnd.map(Number);
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
        type: linePlotType, // for the raw data
        fill: fillAreaValue,
        opacity: 0.7,
        marker: {
          color: markerColor(index),
          symbol: markerSymbol(index),
        },
        // this needs to be here for the case of markers with line or lineplot.
        line: { color: markerColor(index), shape: 'linear' },
        bins: seriesY.map((_, index) => ({
          binStart: binStart[index],
          binEnd: binEnd[index],
          binLabel: el.binLabel[index],
          value: seriesY[index],
        })),
      });
      return breakAfterThisSeries(index);
    }
    return false;
  });

  return {
    dataSetProcess: {
      series: dataSetProcess,
      binWidthSlider: {
        valueType: independentValueType,
        binWidth,
        binWidthRange,
        binWidthStep,
      },
    },
    yMin,
    yMax,
  };
}

/*
 * Utility functions for processInputData()
 */

function reorderResponseLineplotData(
  data: LinePlotDataResponse['lineplot']['data'],
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
