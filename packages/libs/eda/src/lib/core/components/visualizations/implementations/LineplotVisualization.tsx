// load plot component
import LinePlot, {
  LinePlotProps,
} from '@veupathdb/components/lib/plots/LinePlot';

import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
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
import { VisualizationProps, VisualizationType } from '../VisualizationTypes';

import Switch from '@veupathdb/components/lib/components/widgets/Switch';
import line from './selectorIcons/line.svg';

// use lodash instead of Math.min/max
import {
  isEqual,
  min,
  max,
  groupBy,
  size,
  head,
  values,
  mapValues,
  map,
  keys,
} from 'lodash';
// directly use RadioButtonGroup instead of LinePlotControls
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import BinWidthControl from '@veupathdb/components/lib/components/plotControls/BinWidthControl';
import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import {
  NumberOrDateRange,
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
import { variableDisplayWithUnit } from '../../../utils/variable-display';
import {
  NumberVariable,
  DateVariable,
  StudyEntity,
  Variable,
  StringVariable,
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
import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots/addOns';
// import variable's metadata-based independent axis range utils
import { defaultIndependentAxisRange } from '../../../utils/default-independent-axis-range';
import { axisRangeMargin } from '../../../utils/axis-range-margin';
import { VariablesByInputName } from '../../../utils/data-element-constraints';
// util to find dependent axis range - changed the name
import { numberDateDefaultDependentAxisRange } from '../../../utils/default-dependent-axis-range';
import PluginError from '../PluginError';
// for custom legend
import PlotLegend, {
  LegendItemsProps,
} from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import { isFaceted, isTimeDelta } from '@veupathdb/components/lib/types/guards';
import FacetedLinePlot from '@veupathdb/components/lib/plots/facetedPlots/FacetedLinePlot';
import { useCheckedLegendItemsStatus } from '../../../hooks/checkedLegendItemsStatus';
import { BinSpec, BinWidthSlider } from '../../../types/general';
import { useVizConfig } from '../../../hooks/visualizations';
import PopoverButton from '@veupathdb/components/lib/components/widgets/PopoverButton';

import { useInputStyles } from '../inputStyles';

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
  xMin: number | string | undefined;
  xMax: number | string | undefined;
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
function SelectorComponent() {
  const src = line;

  return (
    <img alt="Line plot" style={{ height: '100%', width: '100%' }} src={src} />
  );
}

// Display names to internal names
const valueSpecLookup = {
  Mean: 'mean',
  Median: 'median',
  'Ratio or proportion': 'proportion',
};

function createDefaultConfig(): LineplotConfig {
  return {
    valueSpecConfig: 'Mean',
    useBinning: false,
  };
}

export type LineplotConfig = t.TypeOf<typeof LineplotConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const LineplotConfig = t.intersection([
  t.type({
    valueSpecConfig: t.keyof(valueSpecLookup),
    useBinning: t.boolean,
  }),
  t.partial({
    xAxisVariable: VariableDescriptor,
    yAxisVariable: VariableDescriptor,
    overlayVariable: VariableDescriptor,
    facetVariable: VariableDescriptor,
    binWidth: t.number,
    binWidthTimeUnit: t.string,
    showMissingness: t.boolean,
    checkedLegendItems: t.array(t.string),
    showErrorBars: t.boolean,
  }),
]);

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

  const [vizConfig, updateVizConfig] = useVizConfig(
    visualization.descriptor.configuration,
    LineplotConfig,
    createDefaultConfig,
    updateConfiguration
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
      const keepBin = isEqual(
        selectedVariables.xAxisVariable,
        vizConfig.xAxisVariable
      );
      // need to get the yAxisVariable metadata right here, right now
      // (we can't use the more generally scoped 'yAxisVariable' because it's based on vizConfig and is out of date)
      const { variable: yAxisVar } =
        findEntityAndVariable(selectedVariables.yAxisVariable) ?? {};

      const valueSpec = isSuitableCategoricalVariable(yAxisVar)
        ? 'Ratio or proportion'
        : vizConfig.valueSpecConfig === 'Ratio or proportion'
        ? createDefaultConfig().valueSpecConfig
        : vizConfig.valueSpecConfig;

      updateVizConfig({
        ...selectedVariables,
        binWidth: keepBin ? vizConfig.binWidth : undefined,
        binWidthTimeUnit: keepBin ? vizConfig.binWidthTimeUnit : undefined,
        // set valueSpec as Raw when yAxisVariable = date
        valueSpecConfig: valueSpec,
        // set undefined for variable change
        checkedLegendItems: undefined,
      });
    },
    [
      updateVizConfig,
      vizConfig.xAxisVariable,
      vizConfig.valueSpecConfig,
      vizConfig.valueSpecConfig,
      vizConfig.binWidth,
      vizConfig.binWidthTimeUnit,
      findEntityAndVariable,
    ]
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

  const onShowErrorBarsChange = onChangeHandlerFactory<boolean>(
    'showErrorBars',
    true
  );

  const onUseBinningChange = onChangeHandlerFactory<boolean>('useBinning');

  const outputEntity = useFindOutputEntity(
    dataElementDependencyOrder,
    vizConfig,
    'yAxisVariable',
    entities
  );

  const data = usePromise(
    useCallback(async (): Promise<LinePlotDataWithCoverage | undefined> => {
      if (
        outputEntity == null ||
        xAxisVariable == null ||
        yAxisVariable == null ||
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

      if (categoricalMode)
        throw new Error('Not yet implemented - no back end request made');

      // check independentValueType/dependentValueType
      const independentValueType = xAxisVariable?.type
        ? xAxisVariable.type
        : '';
      const dependentValueType = yAxisVariable?.type ? yAxisVariable.type : '';

      if (
        !categoricalMode &&
        !(dependentValueType === 'number' || dependentValueType === 'integer')
      )
        throw new Error(
          "TEMPORARY ERROR... this variable isn't suitable (possibly too many distinct values) and constraints will handle this soon..."
        );

      // add visualization.type here. valueSpec too?
      const params = getRequestParams(
        studyId,
        filters ?? [],
        vizConfig,
        xAxisVariable,
        yAxisVariable,
        outputEntity
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

      const xAxisVocabulary = fixLabelsForNumberVariables(
        xAxisVariable?.vocabulary,
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

      return lineplotResponseToData(
        response,
        visualization.descriptor.type,
        independentValueType,
        dependentValueType,
        showMissingOverlay,
        xAxisVocabulary,
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
      vizConfig.useBinning,
      vizConfig.showErrorBars,
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
    // extend range due to potential binStart/Ends being outside provided range
    const extendedIndependentRange =
      data.value?.xMin != null &&
      data.value?.xMax != null &&
      defaultIndependentRange != null
        ? ({
            min:
              data.value.xMin < defaultIndependentRange.min
                ? data.value.xMin
                : defaultIndependentRange.min,
            max:
              data.value.xMax > defaultIndependentRange.max
                ? data.value.xMax
                : defaultIndependentRange.max,
          } as NumberOrDateRange)
        : defaultIndependentRange;
    return axisRangeMargin(extendedIndependentRange, xAxisVariable?.type);
  }, [xAxisVariable, data.value]);

  // find deependent axis range and its margin
  const defaultDependentRangeMargin = useMemo(() => {
    //K set yMinMaxRange using yMin/yMax obtained from processInputData()
    const yMinMaxRange =
      data.value != null
        ? { min: data.value.yMin, max: data.value?.yMax }
        : undefined;

    const defaultDependentRange = numberDateDefaultDependentAxisRange(
      yAxisVariable,
      'lineplot',
      yMinMaxRange
    );

    return axisRangeMargin(defaultDependentRange, yAxisVariable?.type);
  }, [data, yAxisVariable]);

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
      independentAxisLabel={variableDisplayWithUnit(xAxisVariable) ?? 'X-axis'}
      dependentAxisLabel={variableDisplayWithUnit(yAxisVariable) ?? 'Y-axis'}
      // variable's metadata-based independent axis range with margin
      independentAxisRange={defaultIndependentRangeMargin}
      // new dependent axis range
      dependentAxisRange={data.value ? defaultDependentRangeMargin : undefined}
      // set valueSpec as Raw when yAxisVariable = date
      onBinWidthChange={onBinWidthChange}
      vizType={visualization.descriptor.type}
      interactive={!isFaceted(data.value) ? true : false}
      showSpinner={filteredCounts.pending || data.pending}
      independentValueType={
        NumberVariable.is(xAxisVariable)
          ? 'number'
          : StringVariable.is(xAxisVariable)
          ? 'string'
          : 'date'
      }
      dependentValueType={NumberVariable.is(yAxisVariable) ? 'number' : 'date'}
      legendTitle={variableDisplayWithUnit(overlayVariable)}
      checkedLegendItems={checkedLegendItems}
      onCheckedLegendItemsChange={onCheckedLegendItemsChange}
      useBinning={vizConfig.useBinning}
      onUseBinningChange={onUseBinningChange}
      showErrorBars={vizConfig.showErrorBars ?? false}
      onShowErrorBarsChange={onShowErrorBarsChange}
    />
  );

  const legendNode = !data.pending && data.value != null && (
    <PlotLegend
      legendItems={legendItems}
      checkedLegendItems={checkedLegendItems}
      legendTitle={variableDisplayWithUnit(overlayVariable)}
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
            display: variableDisplayWithUnit(xAxisVariable),
            variable: vizConfig.xAxisVariable,
          },
          {
            role: 'Y-axis',
            required: true,
            display: variableDisplayWithUnit(yAxisVariable),
            variable: vizConfig.yAxisVariable,
          },
          {
            role: 'Overlay',
            display: variableDisplayWithUnit(overlayVariable),
            variable: vizConfig.overlayVariable,
          },
          {
            role: 'Facet',
            display: variableDisplayWithUnit(facetVariable),
            variable: vizConfig.facetVariable,
          },
        ]}
      />
    </>
  );

  const classes = useInputStyles();

  const categoricalMode = isSuitableCategoricalVariable(yAxisVariable);

  const disabledValueSpecs =
    yAxisVariable == null
      ? []
      : categoricalMode
      ? ['Mean', 'Median']
      : ['Ratio or proportion'];

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

      <div className={classes.inputs}>
        <div className={classes.inputGroup}>
          <div className={classes.fullRow}>
            <h4>Y-axis aggregation</h4>
          </div>
          <div className={classes.input}>
            <RadioButtonGroup
              options={keys(valueSpecLookup)}
              selectedOption={vizConfig.valueSpecConfig}
              onOptionSelected={onValueSpecChange}
              disabledList={disabledValueSpecs}
              orientation={'horizontal'}
              labelPlacement={'end'}
              buttonColor={'primary'}
              itemMarginRight={50}
            />
          </div>
        </div>

        {vizConfig.valueSpecConfig === 'Ratio or proportion' && (
          <div className={classes.inputGroup}>
            <div className={classes.fullRow}>
              <h4>Build your own ratio or proportion</h4>
            </div>
            <div className={classes.input}>
              <div className={classes.label}>
                Value(s) of interest (numerator)
              </div>
              <PopoverButton
                label="will be vizConfig.numerator summary"
                key="numerator"
              >
                {' '}
                fun times{' '}
              </PopoverButton>
            </div>
            <div className={classes.input}>
              <div className={classes.label}>
                Value(s) of interest (denominator)
              </div>
              <PopoverButton
                label="will be vizConfig.numerator summary"
                key="denominator"
              >
                {' '}
                fun times{' '}
              </PopoverButton>
            </div>
          </div>
        )}
      </div>

      <PluginError error={data.error} outputSize={outputSize} />
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
  onBinWidthChange: (newBinWidth: NumberOrTimeDelta) => void;
  updateThumbnail: (src: string) => void;
  vizType: string;
  // custom legend
  checkedLegendItems: string[] | undefined;
  onCheckedLegendItemsChange: (checkedLegendItems: string[]) => void;
  useBinning: boolean;
  onUseBinningChange: (newValue: boolean) => void;
  showErrorBars: boolean;
  onShowErrorBarsChange: (newValue: boolean) => void;
};

function LineplotWithControls({
  data,
  // LinePlotControls: set initial value as 'raw' ('Raw')
  onBinWidthChange,
  vizType,
  updateThumbnail,
  // custom legend
  checkedLegendItems,
  onCheckedLegendItemsChange,
  useBinning,
  onUseBinningChange,
  showErrorBars,
  onShowErrorBarsChange,
  ...lineplotProps
}: LineplotWithControlsProps) {
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

  const neverUseBinning = data0?.binWidthSlider == null; // for ordinal string x-variables
  const neverShowErrorBars = lineplotProps.dependentValueType === 'date';

  return (
    <>
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
          <Switch
            label={`Binning ${useBinning ? 'on' : 'off'}`}
            state={useBinning}
            onStateChange={onUseBinningChange}
            disabled={neverUseBinning}
          />
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
            disabled={!useBinning}
          />
        </LabelledGroup>
        <LabelledGroup label="Y-axis">
          <Switch
            label="Show error bars (95% C.I.)"
            state={showErrorBars}
            onStateChange={onShowErrorBarsChange}
            disabled={neverShowErrorBars}
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
  xAxisVocabulary: string[] = [],
  overlayVocabulary: string[] = [],
  overlayVariable?: Variable,
  showMissingFacet: boolean = false,
  facetVocabulary: string[] = [],
  facetVariable?: Variable
): LinePlotDataWithCoverage {
  const modeValue: LinePlotDataSeries['mode'] = 'lines+markers';

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
    const { dataSetProcess, yMin, yMax, xMin, xMax } = processInputData(
      reorderResponseLineplotData(
        // reorder by overlay var within each facet
        group,
        xAxisVocabulary,
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
      overlayVariable
    );

    return {
      dataSetProcess: dataSetProcess,
      yMin,
      yMax,
      xMin,
      xMax,
    };
  });

  const xMin = min(map(processedData, ({ xMin }) => xMin));
  const xMax = max(map(processedData, ({ xMax }) => xMax));
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
    xMin,
    xMax,
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
  yAxisVariableMetadata: Variable,
  outputEntity?: StudyEntity
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
    useBinning,
  } = vizConfig;

  const binSpec = binWidth
    ? {
        binSpec: {
          type: 'binWidth',
          ...(useBinning
            ? {
                value: binWidth,
                ...(xAxisVariableMetadata?.type === 'date'
                  ? { units: binWidthTimeUnit }
                  : {}),
              } // not binning
            : xAxisVariableMetadata?.type === 'date'
            ? { value: 1, units: 'day' }
            : { value: 0 }),
        },
      }
    : { binSpec: { type: 'binWidth' } };

  return {
    studyId,
    filters,
    config: {
      // add outputEntityId
      outputEntityId: outputEntity?.id,
      // LinePlotControls
      valueSpec: valueSpecLookup[valueSpecConfig],
      xAxisVariable: xAxisVariable,
      yAxisVariable: yAxisVariable,
      ...binSpec,
      overlayVariable: overlayVariable,
      facetVariable: facetVariable ? [facetVariable] : [],
      showMissingness: showMissingness ? 'TRUE' : 'FALSE',
      // no error bars for date variables (error bar toggle switch is also disabled)
      errorBars:
        vizConfig.showErrorBars && yAxisVariableMetadata.type !== 'date'
          ? 'TRUE'
          : 'FALSE',
    },
  } as LineplotRequestParams;
}

// making plotly input data
function processInputData(
  responseLineplotData: LineplotResponse['lineplot']['data'],
  vizType: string,
  // line, marker,
  modeValue: LinePlotDataSeries['mode'],
  // use independentValueType & dependentValueType to distinguish btw number and date string
  independentValueType: string,
  dependentValueType: string,
  showMissingness: boolean,
  hasMissingData: boolean,
  binSpec?: BinSpec,
  binWidthSlider?: BinWidthSlider,
  overlayVariable?: Variable
) {
  // set fillAreaValue for densityplot
  const fillAreaValue: LinePlotDataSeries['fill'] =
    vizType === 'densityplot' ? 'toself' : undefined;

  // catch the case when the back end has returned valid but completely empty data
  if (
    responseLineplotData.every(
      (data) => data.seriesX?.length === 0 && data.seriesY?.length === 0
    )
  ) {
    return {
      dataSetProcess: { series: [] },
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

  const markerSymbol = (index: number): string =>
    showMissingness && index === responseLineplotData.length - 1
      ? 'x'
      : 'circle';

  const binWidthSliderData =
    binSpec != null && binWidthSlider != null
      ? {
          binWidthSlider: {
            binWidth:
              independentValueType === 'number' ||
              independentValueType === 'integer'
                ? binSpec.value || 1
                : {
                    value: binSpec.value || 1,
                    unit: binSpec.units || 'month',
                  },
            binWidthRange: (independentValueType === 'number' ||
            independentValueType === 'integer'
              ? { min: binWidthSlider.min, max: binWidthSlider.max }
              : {
                  min: binWidthSlider.min,
                  max:
                    // back end seems to fall over with any values >99 but 60 is used in subsetting
                    binWidthSlider?.max != null && binWidthSlider?.max > 60
                      ? 60
                      : binWidthSlider.max,
                  unit: binSpec.units,
                }) as NumberOrTimeDeltaRange,
            binWidthStep: binWidthSlider.step || 0.1,
          },
        }
      : {};

  let dataSetProcess: LinePlotDataSeries[] = [];
  responseLineplotData.some(function (el, index) {
    if (el.seriesX && el.seriesY) {
      if (el.seriesX.length !== el.seriesY.length) {
        throw new Error(
          'The number of X data is not equal to the number of Y data'
        );
      }

      // use seriesX when binning is off or binStart when binned, and decode numbers where necessary
      const xData =
        binSpec == null || binSpec.value === 0 ? el.seriesX : el.binStart;

      if (xData == null)
        throw new Error('response did not contain binStart data');
      const seriesX =
        independentValueType === 'number' || independentValueType === 'integer'
          ? xData.map(Number)
          : xData;

      // decode numbers in y axis where necessary
      const seriesY =
        dependentValueType === 'number' || dependentValueType === 'integer'
          ? el.seriesY.map(Number)
          : el.seriesY;

      dataSetProcess.push({
        x: seriesX.length ? seriesX : (([null] as unknown) as number[]), // [null] hack required to make sure
        y: seriesY.length ? seriesY : (([null] as unknown) as number[]), // Plotly has a legend entry for empty traces
        ...(binSpec?.value ? { binLabel: el.seriesX } : {}),
        ...(el.errorBars != null
          ? {
              // TEMPORARY fix for empty arrays coming from back end
              yErrorBarUpper: el.errorBars.map((eb) =>
                Array.isArray(eb.upperBound) ? null : eb.upperBound
              ),
              yErrorBarLower: el.errorBars.map((eb) =>
                Array.isArray(eb.lowerBound) ? null : eb.lowerBound
              ),
            }
          : {}),
        ...(el.binSampleSize != null
          ? {
              sampleSize: el.binSampleSize.map((bss) => bss.N),
            }
          : {}),
        name:
          el.overlayVariableDetails?.value != null
            ? fixLabelForNumberVariables(
                el.overlayVariableDetails.value,
                overlayVariable
              )
            : 'Data',
        mode: modeValue,
        fill: fillAreaValue,
        opacity: 0.7,
        marker: {
          color: markerColor(index),
          symbol: markerSymbol(index),
        },
        // this needs to be here for the case of markers with line or lineplot.
        line: { color: markerColor(index), shape: 'linear' },
      });

      return breakAfterThisSeries(index);
    }
    return false;
  });

  const xValues = dataSetProcess.flatMap<string | number>((series) => series.x);
  // get all values of y (including error bars if present) in a kind of clunky way...
  const yValues = dataSetProcess
    .flatMap<string | number>((series) => series.y)
    .concat(
      dataSetProcess
        .flatMap((series) => series.yErrorBarLower ?? [])
        .filter((val): val is number | string => val != null)
    )
    .concat(
      dataSetProcess
        .flatMap((series) => series.yErrorBarUpper ?? [])
        .filter((val): val is number | string => val != null)
    );

  return {
    dataSetProcess: {
      series: dataSetProcess,
      ...binWidthSliderData,
    },
    xMin: min(xValues),
    xMax: max(xValues),
    yMin: min(yValues),
    yMax: max(yValues),
  };
}

/*
 * Utility functions for processInputData()
 */

function reorderResponseLineplotData(
  data: LinePlotDataResponse['lineplot']['data'],
  xAxisVocabulary: string[] = [],
  overlayVocabulary: string[] = [],
  overlayVariable?: Variable
) {
  const xAxisOrderedSeries = data.map((series) => {
    if (xAxisVocabulary.length > 0) {
      // for each label in the vocabulary's correct order,
      // find the index of that label in the provided series' label array
      const labelIndices = xAxisVocabulary.map((label) =>
        series.seriesX.indexOf(label)
      );
      // now return the data from the other array(s) in the same order
      // any missing labels will be mapped to `undefined` (indexing an array with -1)
      // note that series.binStart and series.binEnd are not present when there is an xAxisVocabulary
      // because no binning can be done on these variables
      return {
        ...series,
        seriesX: labelIndices.map(
          (i, j) => series.seriesX[i] ?? xAxisVocabulary[j]
        ),
        seriesY: labelIndices.map((i) => series.seriesY[i]),
        ...(series.errorBars != null
          ? {
              errorBars: labelIndices.map((i) =>
                series.errorBars && series.errorBars[i]
                  ? series.errorBars[i]
                  : { lowerBound: null, upperBound: null, error: 'no data' }
              ),
            }
          : {}),
        ...(series.binSampleSize != null
          ? {
              binSampleSize: labelIndices.map((i) =>
                series.binSampleSize && series.binSampleSize[i]
                  ? series.binSampleSize[i]
                  : { N: 0 }
              ),
            }
          : {}),
      };
    } else {
      return series;
    }
  });

  if (overlayVocabulary.length > 0) {
    // for each value in the overlay vocabulary's correct order
    // find the index in the series where series.name equals that value
    const overlayValues = xAxisOrderedSeries
      .map((series) => series.overlayVariableDetails?.value)
      .filter((value) => value != null)
      .map((value) => fixLabelForNumberVariables(value!, overlayVariable));
    const overlayIndices = overlayVocabulary.map((name) =>
      overlayValues.indexOf(name)
    );
    return overlayIndices.map(
      (i, j) =>
        xAxisOrderedSeries[i] ?? {
          // if there is no series, insert a dummy series
          overlayVariableDetails: {
            value: overlayVocabulary[j],
          },
          seriesX: [],
          seriesY: [],
        }
    );
  } else {
    return xAxisOrderedSeries;
  }
}

/**
 * TEMPORARY function to determine if we are dealing with a categorical variable
 */
function isSuitableCategoricalVariable(variable?: Variable): boolean {
  return (
    variable?.vocabulary != null &&
    variable?.distinctValuesCount != null &&
    variable?.distinctValuesCount <= 8
  );
}
