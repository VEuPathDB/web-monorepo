import Histogram, {
  HistogramProps,
} from '@veupathdb/components/lib/plots/Histogram';
import BinWidthControl from '@veupathdb/components/lib/components/plotControls/BinWidthControl';
import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import Switch from '@veupathdb/components/lib/components/widgets/Switch';
import {
  NumberOrTimeDelta,
  NumberOrTimeDeltaRange,
  TimeDelta,
} from '@veupathdb/components/lib/types/general';
import { isTimeDelta } from '@veupathdb/components/lib/types/guards';
import {
  HistogramData,
  HistogramDataSeries,
} from '@veupathdb/components/lib/types/plots';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { isEqual, min, max } from 'lodash';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  DataClient,
  HistogramRequestParams,
  HistogramResponse,
} from '../../../api/data-api';
import { usePromise } from '../../../hooks/promise';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { Filter } from '../../../types/filter';
import {
  DateVariable,
  NumberVariable,
  StudyEntity,
  Variable,
} from '../../../types/study';
import { VariableDescriptor } from '../../../types/variable';
import { CoverageStatistics } from '../../../types/visualization';
import { VariableCoverageTable } from '../../VariableCoverageTable';
import { BirdsEyeView } from '../../BirdsEyeView';
import { InputVariables } from '../InputVariables';
import { OutputEntityTitle } from '../OutputEntityTitle';
import { VisualizationProps, VisualizationType } from '../VisualizationTypes';
import histogram from './selectorIcons/histogram.svg';
// import axis label unit util
import { axisLabelWithUnit } from '../../../utils/axis-label-unit';
import {
  vocabularyWithMissingData,
  grayOutLastSeries,
  omitEmptyNoDataSeries,
  fixLabelForNumberVariables,
  fixLabelsForNumberVariables,
} from '../../../utils/analysis';
import { PlotRef } from '@veupathdb/components/lib/plots/PlotlyPlot';
import { useFindEntityAndVariable } from '../../../hooks/study';
// import variable's metadata-based independent axis range utils
import { defaultIndependentAxisRange } from '../../../utils/default-independent-axis-range';
import { VariablesByInputName } from '../../../utils/data-element-constraints';
import PluginError from '../PluginError';
//DKDK
import PlotLegend, {
  LegendItemsProps,
} from '@veupathdb/components/lib/components/plotControls/PlotLegend';
// import { gray } from '../colors';
import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots/addOns';

type HistogramDataWithCoverageStatistics = HistogramData & CoverageStatistics;

const plotDimensions = {
  width: 750,
  height: 400,
};

export const histogramVisualization: VisualizationType = {
  selectorComponent: SelectorComponent,
  fullscreenComponent: HistogramViz,
  createDefaultConfig: createDefaultConfig,
};

function SelectorComponent() {
  return (
    <img
      alt="Histogram"
      style={{ height: '100%', width: '100%' }}
      src={histogram}
    />
  );
}

function createDefaultConfig(): HistogramConfig {
  return {
    dependentAxisLogScale: false,
    valueSpec: 'count',
  };
}

type ValueSpec = t.TypeOf<typeof ValueSpec>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const ValueSpec = t.keyof({ count: null, proportion: null });

type HistogramConfig = t.TypeOf<typeof HistogramConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const HistogramConfig = t.intersection([
  t.type({
    dependentAxisLogScale: t.boolean,
    valueSpec: ValueSpec,
  }),
  t.partial({
    xAxisVariable: VariableDescriptor,
    overlayVariable: VariableDescriptor,
    facetVariable: VariableDescriptor,
    binWidth: t.number,
    binWidthTimeUnit: t.string, // TO DO: constrain to weeks, months etc like Unit from date-arithmetic and/or R
    showMissingness: t.boolean,
  }),
]);

function HistogramViz(props: VisualizationProps) {
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
      HistogramConfig.decode(visualization.descriptor.configuration),
      getOrElse((): t.TypeOf<typeof HistogramConfig> => createDefaultConfig())
    );
  }, [visualization.descriptor.configuration]);

  const updateVizConfig = useCallback(
    (newConfig: Partial<HistogramConfig>) => {
      updateConfiguration({ ...vizConfig, ...newConfig });
    },
    [updateConfiguration, vizConfig]
  );

  // TODO Handle facetVariable
  const handleInputVariableChange = useCallback(
    (selectedVariables: VariablesByInputName) => {
      const {
        xAxisVariable,
        overlayVariable,
        facetVariable,
      } = selectedVariables;
      const keepBin = isEqual(xAxisVariable, vizConfig.xAxisVariable);
      updateVizConfig({
        xAxisVariable,
        overlayVariable,
        facetVariable,
        binWidth: keepBin ? vizConfig.binWidth : undefined,
        binWidthTimeUnit: keepBin ? vizConfig.binWidthTimeUnit : undefined,
      });
    },
    [updateVizConfig, vizConfig]
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
  const onChangeHandlerFactory = useCallback(
    < ValueType,>(key: keyof HistogramConfig) => (newValue?: ValueType) => {
      updateVizConfig({
        [key]: newValue,
      });
    },
    [updateVizConfig]
  );
  const onDependentAxisLogScaleChange = onChangeHandlerFactory<boolean>(
    'dependentAxisLogScale'
  );
  const onValueSpecChange = onChangeHandlerFactory<ValueSpec>('valueSpec');
  const onShowMissingnessChange = onChangeHandlerFactory<boolean>(
    'showMissingness'
  );

  const findEntityAndVariable = useFindEntityAndVariable(entities);

  const { xAxisVariable, outputEntity, valueType } = useMemo(() => {
    const { entity, variable } =
      findEntityAndVariable(vizConfig.xAxisVariable) ?? {};
    const valueType: 'number' | 'date' =
      variable?.type === 'date' ? 'date' : 'number';
    return {
      outputEntity: entity,
      xAxisVariable: variable,
      valueType,
    };
  }, [findEntityAndVariable, vizConfig.xAxisVariable]);

  const overlayVariable = useMemo(() => {
    const { variable } = findEntityAndVariable(vizConfig.overlayVariable) ?? {};
    return variable;
  }, [findEntityAndVariable, vizConfig.overlayVariable]);

  const data = usePromise(
    useCallback(async (): Promise<
      HistogramDataWithCoverageStatistics | undefined
    > => {
      if (vizConfig.xAxisVariable == null || xAxisVariable == null)
        return undefined;

      if (
        xAxisVariable &&
        !NumberVariable.is(xAxisVariable) &&
        !DateVariable.is(xAxisVariable)
      )
        return undefined;

      if (xAxisVariable === overlayVariable)
        throw new Error(
          'The X and Overlay variables must not be the same. Please choose different variables for X and Overlay.'
        );

      const params = getRequestParams(
        studyId,
        filters ?? [],
        valueType,
        vizConfig,
        xAxisVariable
      );
      const response = dataClient.getHistogram(
        computation.descriptor.type,
        params
      );
      const showMissing = vizConfig.showMissingness && overlayVariable != null;
      const vocabulary = fixLabelsForNumberVariables(
        overlayVariable?.vocabulary,
        overlayVariable
      );
      return omitEmptyNoDataSeries(
        grayOutLastSeries(
          reorderData(
            histogramResponseToData(
              await response,
              xAxisVariable,
              overlayVariable
            ),
            vocabularyWithMissingData(vocabulary, showMissing)
          ),
          showMissing
        ),
        showMissing
      );
    }, [
      vizConfig.xAxisVariable,
      vizConfig.binWidth,
      vizConfig.binWidthTimeUnit,
      vizConfig.overlayVariable,
      vizConfig.facetVariable,
      vizConfig.valueSpec,
      vizConfig.showMissingness,
      studyId,
      filters,
      dataClient,
      computation.descriptor.type,
      xAxisVariable,
      overlayVariable,
    ])
  );

  // variable's metadata-based independent axis range with margin
  const defaultIndependentRange = useMemo(
    () => defaultIndependentAxisRange(xAxisVariable, 'histogram'),
    [xAxisVariable]
  );

  // find max of stacked array, especially with overlayVariable
  const defaultDependentAxisMinMax = useMemo(
    () =>
      data.value && data.value.series.length > 0
        ? findMinMaxOfStackedArray(data.value.series)
        : undefined,
    [data]
  );

  // set default dependent axis range for better displaying tick labels in log-scale
  const defaultDependentAxisRange =
    defaultDependentAxisMinMax?.min != null &&
    defaultDependentAxisMinMax?.max != null
      ? {
          // set min as 0 (count, proportion) for non-logscale
          min:
            vizConfig.valueSpec === 'count'
              ? 0
              : vizConfig.dependentAxisLogScale
              ? // determine min based on data for log-scale at proportion
                defaultDependentAxisMinMax.min < 0.001
                ? defaultDependentAxisMinMax.min * 0.8
                : 0.001
              : 0,
          max: defaultDependentAxisMinMax.max * 1.05,
        }
      : undefined;

  console.log('data.value?.series =', data.value?.series);

  //DKDK checkbox of custom legend
  const legendItems: LegendItemsProps[] = useMemo(() => {
    return data.value != null
      ? data.value?.series
          .map((data: HistogramDataSeries, index: number) => {
            return {
              label: data.name,
              // histogram plot does not have mode, so set to square for now
              marker: 'square',
              //DKDK think markerColor needs to be added here
              markerColor:
                data.name === 'No data'
                  ? '#E8E8E8'
                  : ColorPaletteDefault[index],
              // simplifying check with the presence of data
              hasData: data.bins != null && data.bins.length > 0 ? true : false,
              group: 1,
              rank: 1,
            };
            // histogram viz uses stack option so reverse the legend order!
          })
          .reverse()
      : [];
  }, [data, filters]);

  //DKDK
  console.log('data.value?.series =', data.value?.series);

  //DKDK set useState to track checkbox status
  const [checkedLegendItems, setCheckedLegendItems] = useState<string[]>([]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
        <InputVariables
          inputs={[
            {
              name: 'xAxisVariable',
              label: 'Main',
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
            overlayVariable: vizConfig.overlayVariable,
          }}
          onChange={handleInputVariableChange}
          constraints={dataElementConstraints}
          dataElementDependencyOrder={dataElementDependencyOrder}
          starredVariables={starredVariables}
          toggleStarredVariable={toggleStarredVariable}
          enableShowMissingnessToggle={
            overlayVariable != null &&
            data.value?.completeCasesAllVars !==
              data.value?.completeCasesAxesVars
          }
          showMissingness={vizConfig.showMissingness}
          onShowMissingnessChange={onShowMissingnessChange}
          outputEntity={outputEntity}
        />
      </div>

      <PluginError error={data.error} />
      <HistogramPlotWithControls
        data={data.value}
        error={data.error}
        onBinWidthChange={onBinWidthChange}
        dependentAxisLogScale={vizConfig.dependentAxisLogScale}
        onDependentAxisLogScaleChange={onDependentAxisLogScaleChange}
        valueSpec={vizConfig.valueSpec}
        onValueSpecChange={onValueSpecChange}
        updateThumbnail={updateThumbnail}
        containerStyles={plotDimensions}
        spacingOptions={{
          marginTop: 50,
        }}
        orientation={'vertical'}
        barLayout={'stack'}
        displayLegend={
          data.value &&
          (data.value.series.length > 1 || vizConfig.overlayVariable != null)
        }
        outputEntity={outputEntity}
        independentAxisVariable={vizConfig.xAxisVariable}
        independentAxisLabel={axisLabelWithUnit(xAxisVariable) ?? 'Main'}
        // variable's metadata-based independent axis range
        independentAxisRange={defaultIndependentRange}
        // add dependent axis range for better displaying tick labels in log-scale
        dependentAxisRange={defaultDependentAxisRange}
        interactive
        showSpinner={data.pending}
        filters={filters}
        completeCases={data.pending ? undefined : data.value?.completeCases}
        completeCasesAllVars={
          data.pending ? undefined : data.value?.completeCasesAllVars
        }
        completeCasesAxesVars={
          data.pending ? undefined : data.value?.completeCasesAxesVars
        }
        showMissingness={vizConfig.showMissingness ?? false}
        overlayVariable={vizConfig.overlayVariable}
        overlayLabel={axisLabelWithUnit(overlayVariable)}
        legendTitle={axisLabelWithUnit(overlayVariable)}
        dependentAxisLabel={
          vizConfig.valueSpec === 'count' ? 'Count' : 'Proportion'
        }
        //DKDK pass checked state of legend checkbox to PlotlyPlot
        dataPending={data.pending}
        legendItems={legendItems}
        checkedLegendItems={checkedLegendItems}
        setCheckedLegendItems={setCheckedLegendItems}
      />
    </div>
  );
}

type HistogramPlotWithControlsProps = HistogramProps & {
  onBinWidthChange: (newBinWidth: NumberOrTimeDelta) => void;
  onDependentAxisLogScaleChange: (newState?: boolean) => void;
  filters?: Filter[];
  outputEntity?: StudyEntity;
  independentAxisVariable?: VariableDescriptor;
  overlayVariable?: VariableDescriptor;
  overlayLabel?: string;
  valueSpec: ValueSpec;
  onValueSpecChange: (newValueSpec: ValueSpec) => void;
  showMissingness: boolean;
  updateThumbnail: (src: string) => void;
  error: unknown;
  //DKDK add props for PlotLegend
  dataPending: boolean;
  legendItems: LegendItemsProps[];
  checkedLegendItems: string[];
  setCheckedLegendItems: (checkedItems: string[]) => void;
} & Partial<CoverageStatistics>;

function HistogramPlotWithControls({
  data,
  error,
  onBinWidthChange,
  onDependentAxisLogScaleChange,
  filters,
  completeCases,
  completeCasesAllVars,
  completeCasesAxesVars,
  outputEntity,
  independentAxisVariable,
  overlayVariable,
  overlayLabel,
  valueSpec,
  onValueSpecChange,
  showMissingness,
  updateThumbnail,
  //DKDK add props for PlotLegend
  dataPending,
  legendItems,
  checkedLegendItems,
  setCheckedLegendItems,
  ...histogramProps
}: HistogramPlotWithControlsProps) {
  const barLayout = 'stack';
  const displayLibraryControls = false;
  const opacity = 100;

  const outputSize =
    overlayVariable != null && !showMissingness
      ? completeCasesAllVars
      : completeCasesAxesVars;

  const plotRef = useRef<PlotRef>(null);

  const updateThumbnailRef = useRef(updateThumbnail);
  useEffect(() => {
    updateThumbnailRef.current = updateThumbnail;
  });

  //DKDK add async/await for correct thumbnail capture
  useEffect(() => {
    (async () => {
      if (data != null) {
        // use this to set all checked
        await setCheckedLegendItems(legendItems.map((item) => item.label));
      }
      await plotRef.current
        ?.toImage({ format: 'svg', ...plotDimensions })
        .then(updateThumbnailRef.current);
    })();
  }, [data, histogramProps.dependentAxisLogScale, legendItems]);

  const widgetHeight = '4em';

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <OutputEntityTitle entity={outputEntity} outputSize={outputSize} />
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        <Histogram
          {...histogramProps}
          ref={plotRef}
          data={data}
          opacity={opacity}
          displayLibraryControls={displayLibraryControls}
          showValues={false}
          barLayout={barLayout}
          //DKDK pass checkedLegendItems to PlotlyPlot
          checkedLegendItems={checkedLegendItems}
        />

        {/* DKDK custom legend */}
        {legendItems != null && !histogramProps.showSpinner && data != null && (
          <div style={{ marginLeft: '2em' }}>
            <PlotLegend
              legendItems={legendItems}
              checkedLegendItems={checkedLegendItems}
              setCheckedLegendItems={setCheckedLegendItems}
              //DKDK pass legend title
              legendTitle={histogramProps.legendTitle}
            />
          </div>
        )}

        <div className="viz-plot-info">
          <BirdsEyeView
            completeCasesAllVars={completeCasesAllVars}
            completeCasesAxesVars={completeCasesAxesVars}
            filters={filters}
            outputEntity={outputEntity}
            stratificationIsActive={overlayVariable != null}
            enableSpinner={independentAxisVariable != null && !error}
          />
          <VariableCoverageTable
            completeCases={completeCases}
            filters={filters}
            outputEntityId={independentAxisVariable?.entityId}
            variableSpecs={[
              {
                role: 'Main',
                required: true,
                display: histogramProps.independentAxisLabel,
                variable: independentAxisVariable,
              },
              {
                role: 'Overlay',
                display: overlayLabel,
                variable: overlayVariable,
              },
            ]}
          />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <LabelledGroup label="Y-axis">
          <Switch
            label="Log scale"
            state={histogramProps.dependentAxisLogScale}
            onStateChange={onDependentAxisLogScaleChange}
            containerStyles={{
              minHeight: widgetHeight,
            }}
          />
          <RadioButtonGroup
            selectedOption={valueSpec}
            options={['count', 'proportion']}
            onOptionSelected={(newOption) => {
              if (newOption === 'proportion') {
                onValueSpecChange('proportion');
              } else {
                onValueSpecChange('count');
              }
            }}
          />
        </LabelledGroup>
        <LabelledGroup label="X-axis">
          <BinWidthControl
            binWidth={data?.binWidth}
            onBinWidthChange={onBinWidthChange}
            binWidthRange={data?.binWidthRange}
            binWidthStep={data?.binWidthStep}
            valueType={data?.valueType}
            binUnit={
              data?.valueType === 'date'
                ? (data?.binWidth as TimeDelta).unit
                : undefined
            }
            binUnitOptions={
              data?.valueType === 'date'
                ? ['day', 'week', 'month', 'year']
                : undefined
            }
            containerStyles={{
              minHeight: widgetHeight,
            }}
          />
        </LabelledGroup>
      </div>
    </div>
  );
}

/**
 * Reformat response from histogram endpoints into complete HistogramData
 * @param response
 * @param main variable
 * @returns HistogramDataWithCoverageStatistics
 */
export function histogramResponseToData(
  response: HistogramResponse,
  { type }: Variable,
  overlayVariable?: Variable
): HistogramDataWithCoverageStatistics {
  if (response.histogram.data.length === 0)
    throw Error(`Expected one or more data series, but got zero`);

  const binWidth =
    type === 'number' || type === 'integer'
      ? response.histogram.config.binSpec.value || 1
      : {
          value: response.histogram.config.binSpec.value || 1,
          unit: response.histogram.config.binSpec.units || 'month',
        };
  const { min, max, step } = response.histogram.config.binSlider;
  const binWidthRange = (type === 'number' || type === 'integer'
    ? { min, max }
    : {
        min,
        max: max > 60 ? 60 : max, // back end seems to fall over with any values >99 but 60 is used in subsetting
        unit: (binWidth as TimeDelta).unit,
      }) as NumberOrTimeDeltaRange;
  const binWidthStep = step || 0.1;
  return {
    series: response.histogram.data.map((data) => ({
      name:
        data.overlayVariableDetails?.value != null
          ? fixLabelForNumberVariables(
              data.overlayVariableDetails.value,
              overlayVariable
            )
          : '',
      bins: data.value.map((_, index) => ({
        binStart:
          type === 'number' || type === 'integer'
            ? Number(data.binStart[index])
            : String(data.binStart[index]),
        binEnd:
          type === 'number' || type === 'integer'
            ? Number(data.binEnd[index])
            : String(data.binEnd[index]),
        binLabel: data.binLabel[index],
        count: data.value[index],
      })),
    })),
    valueType: type === 'integer' || type === 'number' ? 'number' : 'date',
    binWidth,
    binWidthRange,
    binWidthStep,
    completeCases: response.completeCasesTable,
    completeCasesAllVars: response.histogram.config.completeCasesAllVars,
    completeCasesAxesVars: response.histogram.config.completeCasesAxesVars,
  };
}

function getRequestParams(
  studyId: string,
  filters: Filter[],
  valueType: 'number' | 'date',
  vizConfig: HistogramConfig,
  variable?: Variable
): HistogramRequestParams {
  const {
    binWidth = NumberVariable.is(variable) || DateVariable.is(variable)
      ? variable.binWidthOverride ?? variable.binWidth
      : undefined,
    binWidthTimeUnit = variable?.type === 'date'
      ? variable.binUnits
      : undefined,
    valueSpec,
    overlayVariable,
    xAxisVariable,
  } = vizConfig;

  const binSpec = binWidth
    ? {
        binSpec: {
          type: 'binWidth',
          value: binWidth,
          ...(valueType === 'date' ? { units: binWidthTimeUnit } : {}),
        },
      }
    : { binSpec: { type: 'binWidth' } };

  return {
    studyId,
    filters,
    config: {
      outputEntityId: xAxisVariable!.entityId,
      xAxisVariable,
      barMode: 'stack',
      overlayVariable,
      valueSpec,
      ...binSpec,
      showMissingness: vizConfig.showMissingness ? 'TRUE' : 'FALSE',
    },
  } as HistogramRequestParams;
}

function reorderData(
  data: HistogramDataWithCoverageStatistics,
  overlayVocabulary: string[] = []
) {
  if (overlayVocabulary.length > 0) {
    // for each value in the overlay vocabulary's correct order
    // find the index in the series where series.name equals that value
    const overlayValues = data.series.map((series) => series.name);
    const overlayIndices = overlayVocabulary.map((name) =>
      overlayValues.indexOf(name)
    );
    return {
      ...data,
      // return the series in overlay vocabulary order
      series: overlayIndices.map(
        (i, j) =>
          data.series[i] ?? {
            // if there is no series, insert a dummy series
            name: overlayVocabulary[j],
            bins: [],
          }
      ),
    };
  } else {
    return data;
  }
}

/**
 * find min and max of the sum of multiple arrays
 * it is because histogram viz uses "stack" option for display
 * Also, each data with overlayVariable has different bins
 * For this purpose, binStart is used as array index to map corresponding count
 * Need to make stacked count array and then max
 */

function findMinMaxOfStackedArray(data: HistogramDataSeries[]) {
  // calculate the sum of all the counts from bins with the same label
  const sumsByLabel = data
    .flatMap(
      // make an array of [ [ label, count ], [ label, count ], ... ] from all series
      (series) => series.bins.map((bin) => [bin.binLabel, bin.count])
    )
    // then do a sum of counts per label
    .reduce<Record<string, number>>(
      (map, [label, count]) => {
        if (map[label] == null) map[label] = 0;
        map[label] = map[label] + (count as number);
        return map;
      },
      // empty map for reduce to start with
      {}
    );

  return {
    min: min(Object.values(sumsByLabel)),
    max: max(Object.values(sumsByLabel)),
  };
}
