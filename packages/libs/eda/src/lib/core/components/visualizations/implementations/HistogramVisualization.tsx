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
import { HistogramData } from '@veupathdb/components/lib/types/plots';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  HistogramRequestParams,
  HistogramResponse,
} from '../../../api/DataClient/types';
import DataClient from '../../../api/DataClient';
import { usePromise } from '../../../hooks/promise';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { Filter } from '../../../types/filter';
import { StudyEntity } from '../../../types/study';
import { VariableDescriptor } from '../../../types/variable';
import { CoverageStatistics } from '../../../types/visualization';
import { VariableCoverageTable } from '../../VariableCoverageTable';
import { BirdsEyeView } from '../../BirdsEyeView';
import { isHistogramVariable } from '../../filter/guards';
import { HistogramVariable } from '../../filter/types';
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
} from '../../../utils/analysis';
import { PlotRef } from '@veupathdb/components/lib/plots/PlotlyPlot';
import { useFindEntityAndVariable } from '../../../hooks/study';
// import variable's metadata-based independent axis range utils
import { defaultIndependentAxisRange } from '../../../utils/default-independent-axis-range';
import { VariablesByInputName } from '../../../utils/data-element-constraints';

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

      if (xAxisVariable && !isHistogramVariable(xAxisVariable))
        return undefined;

      const params = getRequestParams(
        studyId,
        filters ?? [],
        valueType,
        vizConfig
      );
      const response = dataClient.getHistogram(
        computation.descriptor.type,
        params
      );
      const showMissing = vizConfig.showMissingness && overlayVariable != null;
      return omitEmptyNoDataSeries(
        grayOutLastSeries(
          reorderData(
            histogramResponseToData(await response, xAxisVariable.type),
            vocabularyWithMissingData(overlayVariable?.vocabulary, showMissing)
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
            data.value?.completeCasesAllVars !=
              data.value?.completeCasesAxesVars
          }
          showMissingness={vizConfig.showMissingness}
          onShowMissingnessChange={onShowMissingnessChange}
          outputEntity={outputEntity}
        />
      </div>

      {data.error && (
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
      <HistogramPlotWithControls
        data={data.value && !data.pending ? data.value : undefined}
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
} & Partial<CoverageStatistics>;

function HistogramPlotWithControls({
  data,
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

  useEffect(() => {
    plotRef.current
      ?.toImage({ format: 'svg', ...plotDimensions })
      .then(updateThumbnailRef.current);
  }, [data, histogramProps.dependentAxisLogScale]);

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
        />
        <div className="viz-plot-info">
          <BirdsEyeView
            completeCasesAllVars={completeCasesAllVars}
            completeCasesAxesVars={completeCasesAxesVars}
            filters={filters}
            outputEntity={outputEntity}
            stratificationIsActive={overlayVariable != null}
            enableSpinner={independentAxisVariable != null}
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
            label="Log Scale:"
            state={histogramProps.dependentAxisLogScale}
            onStateChange={onDependentAxisLogScaleChange}
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
          />
        </LabelledGroup>
      </div>
    </div>
  );
}

/**
 * Reformat response from histogram endpoints into complete HistogramData
 * @param response
 * @returns HistogramDataWithCoverageStatistics
 */
export function histogramResponseToData(
  response: HistogramResponse,
  type: HistogramVariable['type']
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
        max,
        unit: (binWidth as TimeDelta).unit,
      }) as NumberOrTimeDeltaRange;
  const binWidthStep = step || 0.1;
  return {
    series: response.histogram.data.map((data, index) => ({
      name: data.overlayVariableDetails?.value ?? `series ${index}`,
      borderColor: 'white',
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
    valueType: type === 'integer' ? 'number' : type,
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
  vizConfig: HistogramConfig
): HistogramRequestParams {
  const {
    binWidth,
    binWidthTimeUnit,
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
