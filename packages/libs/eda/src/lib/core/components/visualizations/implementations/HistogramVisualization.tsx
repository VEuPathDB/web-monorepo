import Histogram, {
  HistogramProps,
} from '@veupathdb/components/lib/plots/Histogram';
import BinWidthControl from '@veupathdb/components/lib/components/plotControls/BinWidthControl';
import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import Switch from '@veupathdb/components/lib/components/widgets/Switch';
import {
  ErrorManagement,
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
import React, { useCallback, useMemo } from 'react';
import {
  CompleteCasesTable,
  DataClient,
  HistogramRequestParams,
  HistogramResponse,
} from '../../../api/data-api';
import { usePromise } from '../../../hooks/promise';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { Filter } from '../../../types/filter';
import { StudyEntity } from '../../../types/study';
import { VariableDescriptor } from '../../../types/variable';
import { findEntityAndVariable } from '../../../utils/study-metadata';
import { VariableCoverageTable } from '../../VariableCoverageTable';
import { isHistogramVariable } from '../../filter/guards';
import { HistogramVariable } from '../../filter/types';
import { InputVariables } from '../InputVariables';
import { OutputEntityTitle } from '../OutputEntityTitle';
import { VisualizationProps, VisualizationType } from '../VisualizationTypes';
import histogram from './selectorIcons/histogram.svg';

type HistogramDataWithCoverageStatistics = HistogramData & {
  completeCases: CompleteCasesTable;
  outputSize: number;
};

export const histogramVisualization: VisualizationType = {
  gridComponent: GridComponent,
  selectorComponent: SelectorComponent,
  fullscreenComponent: FullscreenComponent,
  createDefaultConfig: createDefaultConfig,
};

function GridComponent(props: VisualizationProps) {
  return <HistogramViz {...props} fullscreen={false} />;
}

function SelectorComponent() {
  return (
    <img
      alt="Histogram"
      style={{ height: '100%', width: '100%' }}
      src={histogram}
    />
  );
}

function FullscreenComponent(props: VisualizationProps) {
  return <HistogramViz {...props} fullscreen />;
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
  }),
]);

type Props = VisualizationProps & {
  fullscreen: boolean;
};

function HistogramViz(props: Props) {
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
      HistogramConfig.decode(visualization.configuration),
      getOrElse((): t.TypeOf<typeof HistogramConfig> => createDefaultConfig())
    );
  }, [visualization.configuration]);

  const updateVizConfig = useCallback(
    (newConfig: Partial<HistogramConfig>) => {
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
      const { xAxisVariable, overlayVariable, facetVariable } = values;
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

  const onDependentAxisLogScaleChange = useCallback(
    (newState?: boolean) => {
      updateVizConfig({
        dependentAxisLogScale: newState,
      });
    },
    [updateVizConfig]
  );

  const onValueSpecChange = useCallback(
    (newValueSpec: ValueSpec) => {
      updateVizConfig({
        valueSpec: newValueSpec,
      });
    },
    [updateVizConfig]
  );

  const { xAxisVariable, outputEntity, valueType } = useMemo(() => {
    const { entity, variable } =
      findEntityAndVariable(entities, vizConfig.xAxisVariable) ?? {};
    const valueType: 'number' | 'date' =
      variable?.type === 'date' ? 'date' : 'number';
    return {
      outputEntity: entity,
      xAxisVariable: variable,
      valueType,
    };
  }, [entities, vizConfig.xAxisVariable]);

  const overlayVariable = useMemo(() => {
    const { variable } =
      findEntityAndVariable(entities, vizConfig.overlayVariable) ?? {};
    return variable;
  }, [entities, vizConfig.overlayVariable]);

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
      const response = dataClient.getHistogram(computation.type, params);
      return histogramResponseToData(await response, xAxisVariable.type);
    }, [
      vizConfig.xAxisVariable,
      vizConfig.binWidth,
      vizConfig.binWidthTimeUnit,
      vizConfig.overlayVariable,
      vizConfig.facetVariable,
      vizConfig.valueSpec,
      studyId,
      filters,
      dataClient,
      computation.type,
    ])
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {fullscreen && (
        <div style={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
          <InputVariables
            inputs={[
              {
                name: 'xAxisVariable',
                label: 'Main',
              },
              {
                name: 'overlayVariable',
                label: 'Overlay (optional)',
              },
              {
                name: 'facetVariable',
                label: 'Facet (optional)',
              },
            ]}
            entities={entities}
            values={{
              xAxisVariable: vizConfig.xAxisVariable,
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
        <HistogramPlotWithControls
          data={data.value && !data.pending ? data.value : undefined}
          onBinWidthChange={onBinWidthChange}
          dependentAxisLogScale={vizConfig.dependentAxisLogScale}
          onDependentAxisLogScaleChange={onDependentAxisLogScaleChange}
          valueSpec={vizConfig.valueSpec}
          onValueSpecChange={onValueSpecChange}
          containerStyles={{
            width: '750px',
            height: '400px',
          }}
          orientation={'vertical'}
          barLayout={'stack'}
          displayLegend={
            data.value &&
            (data.value.series.length > 1 || vizConfig.overlayVariable != null)
          }
          outputEntity={outputEntity}
          independentAxisVariable={vizConfig.xAxisVariable}
          independentAxisLabel={xAxisVariable?.displayName ?? 'Main'}
          interactive
          showSpinner={data.pending}
          filters={filters}
          completeCases={data.pending ? undefined : data.value?.completeCases}
          outputSize={data.pending ? undefined : data.value?.outputSize}
          overlayVariable={vizConfig.overlayVariable}
          overlayLabel={overlayVariable?.displayName}
          legendTitle={
            findEntityAndVariable(entities, vizConfig.overlayVariable)?.variable
              .displayName
          }
          dependentAxisLabel={
            vizConfig.valueSpec === 'count' ? 'Count' : 'Proportion'
          }
        />
      ) : (
        // thumbnail/grid view
        <Histogram
          data={data.value && !data.pending ? data.value : undefined}
          containerStyles={{
            width: '250px',
            height: '180px',
          }}
          spacingOptions={{
            marginLeft: 0,
            marginRight: 30,
            marginTop: 30,
            marginBottom: 0,
          }}
          orientation={'vertical'}
          barLayout={'stack'}
          displayLibraryControls={false}
          displayLegend={false}
          independentAxisLabel=""
          dependentAxisLabel=""
          dependentAxisLogScale={vizConfig.dependentAxisLogScale}
          interactive={false}
          showSpinner={data.pending}
        />
      )}
    </div>
  );
}

type HistogramPlotWithControlsProps = HistogramProps & {
  onBinWidthChange: (newBinWidth: NumberOrTimeDelta) => void;
  onDependentAxisLogScaleChange: (newState?: boolean) => void;
  filters: Filter[];
  completeCases?: CompleteCasesTable;
  outputSize?: number;
  outputEntity?: StudyEntity;
  independentAxisVariable?: VariableDescriptor;
  overlayVariable?: VariableDescriptor;
  overlayLabel?: string;
  valueSpec: ValueSpec;
  onValueSpecChange: (newValueSpec: ValueSpec) => void;
};

function HistogramPlotWithControls({
  data,
  onBinWidthChange,
  onDependentAxisLogScaleChange,
  filters,
  completeCases,
  outputSize,
  outputEntity,
  independentAxisVariable,
  overlayVariable,
  overlayLabel,
  valueSpec,
  onValueSpecChange,
  ...histogramProps
}: HistogramPlotWithControlsProps) {
  const barLayout = 'stack';
  const displayLibraryControls = false;
  const opacity = 100;

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
          data={data}
          opacity={opacity}
          displayLibraryControls={displayLibraryControls}
          showValues={false}
          barLayout={barLayout}
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
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <LabelledGroup label="Y-axis">
          <Switch
            label="Log Scale:"
            state={histogramProps.dependentAxisLogScale}
            onStateChange={onDependentAxisLogScaleChange}
          />
          <RadioButtonGroup
            selectedOption={
              valueSpec === 'proportion' ? 'proportional' : 'count'
            }
            options={['count', 'proportional']}
            onOptionSelected={(newOption) => {
              if (newOption === 'proportional') {
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
    type === 'number'
      ? response.histogram.config.binSpec.value || 1
      : {
          value: response.histogram.config.binSpec.value || 1,
          unit: response.histogram.config.binSpec.units || 'month',
        };
  const { min, max, step } = response.histogram.config.binSlider;
  const binWidthRange = (type === 'number'
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
      // color: TO DO
      bins: data.value.map((_, index) => ({
        binStart:
          type === 'number'
            ? Number(data.binStart[index])
            : String(data.binStart[index]),
        binEnd:
          type === 'number'
            ? Number(data.binEnd[index])
            : String(data.binEnd[index]),
        binLabel: data.binLabel[index],
        count: data.value[index],
      })),
    })),
    valueType: type,
    binWidth,
    binWidthRange,
    binWidthStep,
    completeCases: response.completeCasesTable,
    outputSize: response.histogram.config.completeCases,
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
      overlayVariable,
      valueSpec,
      ...binSpec,
    },
  } as HistogramRequestParams;
}
