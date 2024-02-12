// load Barplot component
import Barplot, { BarplotProps } from '@veupathdb/components/lib/plots/Barplot';
import FacetedBarplot from '@veupathdb/components/lib/plots/facetedPlots/FacetedBarplot';
import {
  BarplotData,
  BarplotDataSeries,
  FacetedData,
} from '@veupathdb/components/lib/types/plots';
import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import { Toggle } from '@veupathdb/coreui';

import * as t from 'io-ts';
import { useCallback, useMemo, useState, useEffect } from 'react';
import PluginError from '../PluginError';

// need to set for Barplot
import DataClient, {
  BarplotResponse,
  BarplotRequestParams,
} from '../../../api/DataClient';

import { usePromise } from '../../../hooks/promise';
import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
import {
  useDataClient,
  useStudyMetadata,
  useFindEntityAndVariable,
  useStudyEntities,
} from '../../../hooks/workspace';
import { Filter } from '../../../types/filter';
import { StudyEntity, Variable } from '../../../types/study';
import { VariableDescriptor } from '../../../types/variable';

import { VariableCoverageTable } from '../../VariableCoverageTable';
import { CoverageStatistics } from '../../../types/visualization';
import { BirdsEyeView } from '../../BirdsEyeView';
import { PlotLayout } from '../../layouts/PlotLayout';

import { InputSpec, InputVariables } from '../InputVariables';
import { OutputEntityTitle } from '../OutputEntityTitle';
import { VisualizationProps } from '../VisualizationTypes';

import BarSVG from './selectorIcons/BarSVG';
// import axis label unit util
import { variableDisplayWithUnit } from '../../../utils/variable-display';
import {
  fixLabelForNumberVariables,
  fixLabelsForNumberVariables,
  grayOutLastSeries,
  vocabularyWithMissingData,
  variablesAreUnique,
  nonUniqueWarning,
  hasIncompleteCases,
  assertValidInputVariables,
  substituteUnselectedToken,
} from '../../../utils/visualization';
import { VariablesByInputName } from '../../../utils/data-element-constraints';
// use lodash instead of Math.min/max
import {
  groupBy,
  mapValues,
  size,
  map,
  head,
  values,
  keys,
  isEqual,
  pick,
} from 'lodash';
import { isFaceted } from '@veupathdb/components/lib/types/guards';
// for custom legend
import PlotLegend from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';

// import { gray } from '../colors';
import {
  ColorPaletteDefault,
  SequentialGradientColorscale,
} from '@veupathdb/components/lib/types/plots/addOns';
// a custom hook to preserve the status of checked legend items
import { useCheckedLegendItems } from '../../../hooks/checkedLegendItemsStatus';

// concerning axis range control
import { NumberOrDateRange, NumberRange } from '../../../types/general';
import { NumberRangeInput } from '@veupathdb/components/lib/components/widgets/NumberAndDateRangeInputs';
// reusable util for computing truncationConfig
import { truncationConfig } from '../../../utils/truncation-config-utils';
// use Notification for truncation warning message
import Notification from '@veupathdb/components/lib/components/widgets//Notification';
import { useDefaultAxisRange } from '../../../hooks/computeDefaultAxisRange';
import {
  useNeutralPaletteProps,
  useVizConfig,
} from '../../../hooks/visualizations';
import {
  barplotDefaultDependentAxisMax,
  barplotDefaultDependentAxisMinPos,
} from '../../../utils/axis-range-calculations';
import { createVisualizationPlugin } from '../VisualizationPlugin';
import { LayoutOptions, TitleOptions } from '../../layouts/types';
import { OverlayOptions, RequestOptions } from '../options/types';
import { useDeepValue } from '../../../hooks/immutability';

// reset to defaults button
import { ResetButtonCoreUI } from '../../ResetButton';
import { useFindOutputEntity } from '../../../hooks/findOutputEntity';

// export
export type BarplotDataWithStatistics = (
  | BarplotData
  | FacetedData<BarplotData>
) &
  CoverageStatistics;

const plotContainerStyles = {
  height: 450,
  width: 750,
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

export const barplotVisualization = createVisualizationPlugin({
  selectorIcon: BarSVG,
  fullscreenComponent: FullscreenComponent,
  createDefaultConfig: createDefaultConfig,
});

interface Options
  extends LayoutOptions,
    OverlayOptions,
    TitleOptions,
    RequestOptions<BarplotConfig, {}, BarplotRequestParams> {}

function FullscreenComponent(props: VisualizationProps<Options>) {
  return <BarplotViz {...props} />;
}

function createDefaultConfig(): BarplotConfig {
  return {
    dependentAxisLogScale: false,
    valueSpec: 'count',
    dependentAxisValueSpec: 'Full',
  };
}

type ValueSpec = t.TypeOf<typeof ValueSpec>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const ValueSpec = t.keyof({ count: null, proportion: null });

// export
export type BarplotConfig = t.TypeOf<typeof BarplotConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const BarplotConfig = t.intersection([
  t.type({
    dependentAxisLogScale: t.boolean,
    valueSpec: ValueSpec,
  }),
  t.partial({
    xAxisVariable: VariableDescriptor,
    overlayVariable: VariableDescriptor,
    facetVariable: VariableDescriptor,
    showMissingness: t.boolean,
    // for custom legend: vizconfig.checkedLegendItems
    checkedLegendItems: t.array(t.string),
    // dependent axis range control
    dependentAxisRange: NumberRange,
    dependentAxisValueSpec: t.string,
  }),
]);

function BarplotViz(props: VisualizationProps<Options>) {
  const {
    options,
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
    hideInputsAndControls,
    plotContainerStyleOverrides,
  } = props;
  const studyMetadata = useStudyMetadata();
  const { id: studyId } = studyMetadata;
  const entities = useStudyEntities(filters);
  const dataClient: DataClient = useDataClient();
  const finalPlotContainerStyles = useMemo(
    () => ({
      ...plotContainerStyles,
      ...plotContainerStyleOverrides,
    }),
    [plotContainerStyleOverrides]
  );

  // use useVizConfig hook
  const [vizConfig, updateVizConfig] = useVizConfig(
    visualization.descriptor.configuration,
    BarplotConfig,
    createDefaultConfig,
    updateConfiguration
  );

  // set the state of truncation warning message here
  const [truncatedDependentAxisWarning, setTruncatedDependentAxisWarning] =
    useState<string>('');

  // TODO Handle facetVariable
  const handleInputVariableChange = useCallback(
    (selectedVariables: VariablesByInputName) => {
      // check xAxisVariable is changed
      const keepDependentAxisSettings = isEqual(
        selectedVariables.xAxisVariable,
        vizConfig.xAxisVariable
      );

      const { xAxisVariable, overlayVariable, facetVariable } =
        selectedVariables;
      updateVizConfig({
        xAxisVariable,
        overlayVariable,
        facetVariable,
        // set undefined for variable change
        checkedLegendItems: undefined,
        dependentAxisRange: keepDependentAxisSettings
          ? vizConfig.dependentAxisRange
          : undefined,
        dependentAxisLogScale: keepDependentAxisSettings
          ? vizConfig.dependentAxisLogScale
          : false,
        dependentAxisValueSpec: keepDependentAxisSettings
          ? vizConfig.dependentAxisValueSpec
          : 'Full',
      });
      // close truncation warnings
      setTruncatedDependentAxisWarning('');
    },
    [
      updateVizConfig,
      vizConfig.dependentAxisLogScale,
      vizConfig.dependentAxisRange,
      vizConfig.dependentAxisValueSpec,
      vizConfig.xAxisVariable,
    ]
  );

  // prettier-ignore
  const onChangeHandlerFactory = useCallback(
    < ValueType,>(key: keyof BarplotConfig, resetCheckedLegendItems?: boolean, resetAxisRanges?: boolean) => (newValue?: ValueType) => {
      const newPartialConfig = {
        [key]: newValue,
        ...(resetCheckedLegendItems ? { checkedLegendItems: undefined } : {}),
	      ...(resetAxisRanges ? { dependentAxisRange: undefined } : {}),
      };
      updateVizConfig(newPartialConfig);
      if (resetAxisRanges)
	setTruncatedDependentAxisWarning('');
    },
    [updateVizConfig]
  );

  const onDependentAxisLogScaleChange = onChangeHandlerFactory<boolean>(
    'dependentAxisLogScale',
    false,
    true
  );
  const onValueSpecChange = onChangeHandlerFactory<ValueSpec>(
    'valueSpec',
    false,
    true
  );

  const onDependentAxisValueSpecChange = onChangeHandlerFactory<string>(
    'dependentAxisValueSpec',
    false,
    true
  );

  // set checkedLegendItems: undefined for the change of showMissingness
  const onShowMissingnessChange = onChangeHandlerFactory<boolean>(
    'showMissingness',
    true,
    true
  );

  const getOverlayVariable = options?.getOverlayVariable;

  const providedOverlayVariableDescriptor = useMemo(
    () => getOverlayVariable?.(computation.descriptor.configuration),
    [getOverlayVariable, computation.descriptor.configuration]
  );

  const selectedVariables = useDeepValue({
    xAxisVariable: vizConfig.xAxisVariable,
    overlayVariable:
      vizConfig.overlayVariable &&
      (providedOverlayVariableDescriptor ?? vizConfig.overlayVariable),
    facetVariable: vizConfig.facetVariable,
  });

  const findEntityAndVariable = useFindEntityAndVariable(filters);
  const {
    variable,
    overlayVariable,
    providedOverlayVariable,
    overlayEntity,
    facetVariable,
    facetEntity,
  } = useMemo(() => {
    const xAxisVariable = findEntityAndVariable(vizConfig.xAxisVariable);
    const overlayVariable = findEntityAndVariable(vizConfig.overlayVariable);
    const providedOverlayVariable = findEntityAndVariable(
      providedOverlayVariableDescriptor
    );
    const facetVariable = findEntityAndVariable(vizConfig.facetVariable);
    return {
      variable: xAxisVariable?.variable,
      overlayVariable: overlayVariable?.variable,
      providedOverlayVariable: providedOverlayVariable?.variable,
      overlayEntity: overlayVariable?.entity,
      facetVariable: facetVariable?.variable,
      facetEntity: facetVariable?.entity,
    };
  }, [
    findEntityAndVariable,
    vizConfig.xAxisVariable,
    vizConfig.overlayVariable,
    vizConfig.facetVariable,
    providedOverlayVariableDescriptor,
  ]);

  const outputEntity = useFindOutputEntity(
    dataElementDependencyOrder,
    vizConfig,
    'xAxisVariable'
  );

  const inputs = useMemo(
    (): InputSpec[] => [
      {
        name: 'xAxisVariable',
        label: 'Main',
        role: 'axis',
      },
      {
        name: 'overlayVariable',
        label: 'Overlay',
        role: 'stratification',
        providedOptionalVariable: providedOverlayVariableDescriptor,
        readonlyValue:
          options?.getOverlayVariable != null
            ? providedOverlayVariableDescriptor
              ? variableDisplayWithUnit(providedOverlayVariable)
              : 'None. ' + options?.getOverlayVariableHelp?.() ?? ''
            : undefined,
      },
      ...(options?.hideFacetInputs
        ? []
        : [
            {
              name: 'facetVariable',
              label: 'Facet',
              role: 'stratification',
            } as const,
          ]),
    ],
    [options, providedOverlayVariable, providedOverlayVariableDescriptor]
  );

  const dataRequestConfig: DataRequestConfig = useDeepValue(
    pick(vizConfig, [
      'xAxisVariable',
      'overlayVariable',
      'facetVariable',
      'valueSpec',
      'showMissingness',
    ])
  );

  const data = usePromise(
    useCallback(async (): Promise<BarplotDataWithStatistics | undefined> => {
      if (
        variable == null ||
        outputEntity == null ||
        filteredCounts.pending ||
        filteredCounts.value == null
      )
        return undefined;

      if (
        !variablesAreUnique([
          variable,
          overlayVariable && (providedOverlayVariable ?? overlayVariable),
          facetVariable,
        ])
      )
        throw new Error(nonUniqueWarning);

      assertValidInputVariables(
        inputs,
        selectedVariables,
        entities,
        dataElementConstraints,
        dataElementDependencyOrder
      );

      const params =
        options?.getRequestParams?.({
          studyId,
          filters,
          vizConfig: dataRequestConfig,
          outputEntityId: outputEntity.id,
        }) ??
        getRequestParams(
          studyId,
          filters ?? [],
          dataRequestConfig,
          outputEntity
        );

      const response = await dataClient.getBarplot(
        computation.descriptor.type,
        params
      );

      // figure out if we need to show the missing data for the stratification variables
      // if it has no incomplete cases we don't have to
      const showMissingOverlay =
        dataRequestConfig.showMissingness &&
        hasIncompleteCases(
          overlayEntity,
          overlayVariable,
          outputEntity,
          filteredCounts.value,
          response.completeCasesTable
        );
      const showMissingFacet =
        dataRequestConfig.showMissingness &&
        hasIncompleteCases(
          facetEntity,
          facetVariable,
          outputEntity,
          filteredCounts.value,
          response.completeCasesTable
        );

      const vocabulary = fixLabelsForNumberVariables(
        variable?.vocabulary,
        variable
      );
      const overlayVocabulary =
        (overlayVariable && options?.getOverlayVocabulary?.()) ??
        fixLabelsForNumberVariables(
          overlayVariable?.vocabulary,
          overlayVariable
        );
      const facetVocabulary = fixLabelsForNumberVariables(
        facetVariable?.vocabulary,
        facetVariable
      );

      return grayOutLastSeries(
        substituteUnselectedToken(
          reorderData(
            barplotResponseToData(
              response,
              variable,
              overlayVariable,
              facetVariable
            ),
            vocabulary,
            vocabularyWithMissingData(overlayVocabulary, showMissingOverlay),
            vocabularyWithMissingData(facetVocabulary, showMissingFacet)
          )
        ),
        showMissingOverlay
      );
    }, [
      variable,
      outputEntity,
      filteredCounts.pending,
      filteredCounts.value,
      overlayVariable,
      facetVariable,
      inputs,
      selectedVariables,
      entities,
      dataElementConstraints,
      dataElementDependencyOrder,
      filters,
      studyId,
      dataRequestConfig,
      dataClient,
      computation.descriptor.type,
      overlayEntity,
      facetEntity,
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
      : data.value?.facets.find(
          ({ data }) => data != null && data.series.length > 0
        )?.data?.series;

    return legendData != null
      ? legendData.map((dataItem: BarplotDataSeries, index: number) => {
          return {
            label: dataItem.name,
            // barplot does not have mode, so set to square
            marker: 'square',
            markerColor:
              dataItem.name === 'No data'
                ? '#E8E8E8'
                : ColorPaletteDefault[index],
            // [undefined, undefined, ...] for filtered out case and no data so need to do a deep comparison
            hasData: !isFaceted(data.value) // no faceted plot
              ? dataItem.value.some((el) => el != null)
                ? true
                : false
              : data.value?.facets
                  .map((el: { label: string; data?: BarplotData }) => {
                    // faceted plot: here data.value is full data
                    // need to check whether el.data.series[index] exists
                    return el.data?.series[index]?.value.some(
                      (el: number) => el != null
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

  // set checkedLegendItems to either the config-stored items, or all items if
  // nothing stored (or if no overlay locally configured)
  const [checkedLegendItems, setCheckedLegendItems] = useCheckedLegendItems(
    legendItems,
    vizConfig.overlayVariable
      ? options?.getCheckedLegendItems?.(
          computation.descriptor.configuration
        ) ?? vizConfig.checkedLegendItems
      : undefined,
    updateVizConfig
  );

  const minPos = useMemo(() => barplotDefaultDependentAxisMinPos(data), [data]);
  const max = useMemo(() => barplotDefaultDependentAxisMax(data), [data]);
  const minPosMax = useMemo(
    () =>
      minPos != null && max != null ? { min: minPos, max: max } : undefined,
    [max, minPos]
  );
  const dependentMinPosMax = useMemo(() => {
    return minPosMax != null && minPosMax.min != null && minPosMax.max != null
      ? {
          min: minPosMax.min,
          // override max to be exactly 1 in proportion mode (rounding errors can make it slightly greater than 1)
          max:
            vizConfig.valueSpec === 'proportion' &&
            vizConfig.dependentAxisValueSpec === 'Full'
              ? 1
              : minPosMax.max,
        }
      : undefined;
  }, [minPosMax, vizConfig.valueSpec, vizConfig.dependentAxisValueSpec]);

  // using custom hook
  const defaultDependentAxisRange = useDefaultAxisRange(
    null,
    0,
    dependentMinPosMax?.min,
    dependentMinPosMax?.max,
    vizConfig.dependentAxisLogScale,
    vizConfig.dependentAxisValueSpec
  ) as NumberRange;

  // axis range control
  const handleDependentAxisRangeChange =
    onChangeHandlerFactory<NumberRange>('dependentAxisRange');

  const handleDependentAxisSettingsReset = useCallback(() => {
    updateVizConfig({
      dependentAxisRange: undefined,
      dependentAxisLogScale: false,
      dependentAxisValueSpec: 'Full',
    });
    // add reset for truncation message as well
    setTruncatedDependentAxisWarning('');
  }, [updateVizConfig]);

  // set truncation flags: will see if this is reusable with other application
  const {
    truncationConfigIndependentAxisMin,
    truncationConfigIndependentAxisMax,
    truncationConfigDependentAxisMin,
    truncationConfigDependentAxisMax,
  } = truncationConfig(
    {
      ...(minPosMax != null && minPosMax.min != null && minPosMax.max != null
        ? { dependentAxisRange: minPosMax }
        : {}),
    },
    vizConfig,
    {}, // no overrides
    true // use inclusive less than equal for the range min
  );

  useEffect(() => {
    if (truncationConfigDependentAxisMin || truncationConfigDependentAxisMax) {
      setTruncatedDependentAxisWarning(
        'Data may have been truncated by range selection, as indicated by the yellow shading'
      );
    }
  }, [truncationConfigDependentAxisMin, truncationConfigDependentAxisMax]);

  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    finalPlotContainerStyles,
    // The dependencies for needing to generate a new thumbnail
    [
      data,
      vizConfig.checkedLegendItems,
      vizConfig.dependentAxisRange,
      vizConfig.dependentAxisLogScale,
      vizConfig.dependentAxisValueSpec,
    ]
  );

  const overlayLabel = variableDisplayWithUnit(overlayVariable);
  const neutralPaletteProps = useNeutralPaletteProps(
    vizConfig.overlayVariable,
    providedOverlayVariableDescriptor
  );

  // these props are passed to either a single plot
  // or by FacetedPlot to each individual facet plot (where some will be overridden)
  const plotProps: BarplotProps = {
    containerStyles: !isFaceted(data.value)
      ? finalPlotContainerStyles
      : undefined,
    spacingOptions: !isFaceted(data.value) ? plotSpacingOptions : undefined,
    orientation: 'vertical',
    barLayout: 'group',
    displayLegend: false,
    independentAxisLabel: variableDisplayWithUnit(variable) ?? 'Main',
    dependentAxisLabel:
      vizConfig.valueSpec === 'count' ? 'Count' : 'Proportion',
    legendTitle: overlayLabel,
    interactive: !isFaceted(data.value) ? true : false,
    showSpinner: data.pending || filteredCounts.pending,
    showExportButton: true,
    dependentAxisLogScale: vizConfig.dependentAxisLogScale,
    // set dependent axis range for log scale
    // truncation axis range control
    dependentAxisRange:
      vizConfig.dependentAxisRange ?? defaultDependentAxisRange,
    displayLibraryControls: false,
    // for faceted plot, add axisTruncationConfig props here
    axisTruncationConfig: {
      independentAxis: {
        min: truncationConfigIndependentAxisMin,
        max: truncationConfigIndependentAxisMax,
      },
      dependentAxis: {
        min: truncationConfigDependentAxisMin,
        max: truncationConfigDependentAxisMax,
      },
    },
    colorPalette:
      options?.getOverlayType?.() === 'continuous'
        ? SequentialGradientColorscale
        : ColorPaletteDefault,
    ...neutralPaletteProps,
  };

  const plotNode = (
    <>
      {isFaceted(data.value) ? (
        <FacetedBarplot
          data={data.value}
          componentProps={plotProps}
          modalComponentProps={{
            independentAxisLabel: plotProps.independentAxisLabel,
            dependentAxisLabel: plotProps.dependentAxisLabel,
            displayLegend: plotProps.displayLegend,
            containerStyles: modalPlotContainerStyles,
          }}
          facetedPlotRef={plotRef}
          // for custom legend
          checkedLegendItems={checkedLegendItems}
        />
      ) : (
        <Barplot
          data={data.value}
          ref={plotRef}
          // for custom legend: pass checkedLegendItems to PlotlyPlot
          checkedLegendItems={checkedLegendItems}
          {...plotProps}
        />
      )}
    </>
  );

  const controlsNode = (
    <>
      {/* pre-occupied space for banner */}
      <div style={{ width: 750, marginLeft: '1em', height: '5.1em' }} />
      {/* Plot mode */}
      <RadioButtonGroup
        label="Plot mode"
        selectedOption={vizConfig.valueSpec}
        options={['count', 'proportion']}
        optionLabels={['Count', 'Proportion']}
        buttonColor={'primary'}
        margins={['0em', '0', '0', '1em']}
        onOptionSelected={(newOption) => {
          if (newOption === 'proportion') {
            onValueSpecChange('proportion');
          } else {
            onValueSpecChange('count');
          }
        }}
      />

      {/* Y-axis range control */}
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* set Undo icon and its behavior */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <LabelledGroup
              label={
                <div css={{ display: 'flex', alignItems: 'center' }}>
                  Y-axis controls
                  <ResetButtonCoreUI
                    size={'medium'}
                    text={''}
                    themeRole={'primary'}
                    tooltip={'Reset to defaults'}
                    disabled={false}
                    onPress={handleDependentAxisSettingsReset}
                  />
                </div>
              }
            >
              <Toggle
                label={'Log scale'}
                value={vizConfig.dependentAxisLogScale}
                onChange={onDependentAxisLogScaleChange}
                themeRole="primary"
              />
            </LabelledGroup>
          </div>

          <LabelledGroup
            label="Y-axis range"
            containerStyles={{
              fontSize: '0.9em',
              // width: '350px',
            }}
          >
            <RadioButtonGroup
              options={['Full', 'Auto-zoom', 'Custom']}
              selectedOption={vizConfig.dependentAxisValueSpec ?? 'Full'}
              onOptionSelected={(newAxisRangeOption: string) => {
                onDependentAxisValueSpecChange(newAxisRangeOption);
              }}
              orientation={'horizontal'}
              labelPlacement={'end'}
              buttonColor={'primary'}
              margins={['0em', '0', '0', '0em']}
              itemMarginRight={25}
            />

            {/* Y-axis range control */}
            <NumberRangeInput
              label="Range"
              // add range
              range={vizConfig.dependentAxisRange ?? defaultDependentAxisRange}
              onRangeChange={(newRange?: NumberOrDateRange) => {
                handleDependentAxisRangeChange(newRange as NumberRange);
              }}
              allowPartialRange={false}
              // set maxWidth
              containerStyles={{ maxWidth: '350px' }}
              disabled={
                vizConfig.dependentAxisValueSpec === 'Full' ||
                vizConfig.dependentAxisValueSpec === 'Auto-zoom'
              }
            />
            {/* truncation notification */}
            {truncatedDependentAxisWarning ? (
              <Notification
                title={''}
                text={truncatedDependentAxisWarning}
                // this was defined as LIGHT_BLUE
                color={'#5586BE'}
                onAcknowledgement={() => {
                  setTruncatedDependentAxisWarning('');
                }}
                showWarningIcon={true}
                // change maxWidth
                containerStyles={{ maxWidth: '350px' }}
              />
            ) : null}
          </LabelledGroup>
        </div>
      </div>
    </>
  );

  const showOverlayLegend =
    vizConfig.overlayVariable != null && legendItems.length > 0;
  const legendNode = legendItems != null && !data.pending && data != null && (
    <PlotLegend
      type="list"
      legendItems={legendItems}
      checkedLegendItems={checkedLegendItems}
      onCheckedLegendItemsChange={setCheckedLegendItems}
      legendTitle={overlayLabel}
      // add a condition to show legend even for single overlay data and check legendItems exist
      showOverlayLegend={showOverlayLegend}
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
        enableSpinner={vizConfig.xAxisVariable != null && !data.error}
        totalCounts={totalCounts.value}
        filteredCounts={filteredCounts.value}
      />
      <VariableCoverageTable
        completeCases={data.pending ? undefined : data.value?.completeCases}
        filteredCounts={filteredCounts}
        outputEntityId={outputEntity?.id}
        variableSpecs={[
          {
            role: 'Main',
            required: true,
            display: variableDisplayWithUnit(variable),
            variable: vizConfig.xAxisVariable,
          },
          {
            role: 'Overlay',
            display: overlayLabel,
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

  const areRequiredInputsSelected =
    !dataElementConstraints ||
    Object.entries(dataElementConstraints[0])
      .filter((variable) => variable[1].isRequired)
      .every((reqdVar) => !!(vizConfig as any)[reqdVar[0]]);

  const LayoutComponent = options?.layoutComponent ?? PlotLayout;
  const plotSubtitle = options?.getPlotSubtitle?.();

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
        {!hideInputsAndControls && (
          <InputVariables
            inputs={inputs}
            entities={entities}
            selectedVariables={selectedVariables}
            onChange={handleInputVariableChange}
            constraints={dataElementConstraints}
            dataElementDependencyOrder={dataElementDependencyOrder}
            starredVariables={starredVariables}
            enableShowMissingnessToggle={
              (overlayVariable != null || facetVariable != null) &&
              data.value?.completeCasesAllVars !==
                data.value?.completeCasesAxesVars
            }
            toggleStarredVariable={toggleStarredVariable}
            // this can be used to show and hide no data control
            onShowMissingnessChange={
              computation.descriptor.type === 'pass'
                ? onShowMissingnessChange
                : undefined
            }
            showMissingness={vizConfig.showMissingness}
            outputEntity={outputEntity}
          />
        )}
      </div>

      <PluginError error={data.error} outputSize={outputSize} />
      {!hideInputsAndControls && (
        <OutputEntityTitle
          entity={outputEntity}
          outputSize={outputSize}
          subtitle={plotSubtitle}
        />
      )}
      <LayoutComponent
        isFaceted={isFaceted(data.value)}
        plotNode={plotNode}
        controlsNode={controlsNode}
        legendNode={showOverlayLegend ? legendNode : null}
        tableGroupNode={tableGroupNode}
        showRequiredInputsPrompt={!areRequiredInputsSelected}
        hideControls={hideInputsAndControls}
      />
    </div>
  );
}

/**
 * Reformat response from Barplot endpoints into complete BarplotData
 * @param response
 * @returns BarplotData & completeCases & completeCasesAllVars & completeCasesAxesVars
 */
export function barplotResponseToData(
  response: BarplotResponse,
  variable: Variable,
  overlayVariable?: Variable,
  facetVariable?: Variable
): BarplotDataWithStatistics {
  // group by facet variable value (if only one facet variable in response - there may be up to two in future)
  // BM tried to factor this out into a function in utils/visualization.ts but got bogged down in TS issues
  const facetGroupedResponseData = groupBy(response.barplot.data, (data) =>
    data.facetVariableDetails && data.facetVariableDetails.length === 1
      ? fixLabelForNumberVariables(
          data.facetVariableDetails[0].value,
          facetVariable
        )
      : '__NO_FACET__'
  );

  // process data and overlay value within each facet grouping
  const processedData = mapValues(facetGroupedResponseData, (group) => {
    const facetIsEmpty = group.every(
      (data) => data.label.length === 0 && data.value.length === 0
    );
    return {
      series: facetIsEmpty
        ? []
        : group.map((data) => ({
            // name has value if using overlay variable
            name:
              data.overlayVariableDetails?.value != null
                ? fixLabelForNumberVariables(
                    data.overlayVariableDetails.value,
                    overlayVariable
                  )
                : '',
            label: fixLabelsForNumberVariables(data.label, variable),
            value: data.value,
          })),
    };
  });

  return {
    // data
    ...(size(processedData) === 1 &&
    head(keys(processedData)) === '__NO_FACET__'
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
    completeCasesAllVars: response.barplot.config.completeCasesAllVars,
    completeCasesAxesVars: response.barplot.config.completeCasesAxesVars,
  } as BarplotDataWithStatistics; // sorry, but seemed necessary!
}

type DataRequestConfig = Pick<
  BarplotConfig,
  | 'xAxisVariable'
  | 'overlayVariable'
  | 'facetVariable'
  | 'valueSpec'
  | 'showMissingness'
>;

function getRequestParams(
  studyId: string,
  filters: Filter[],
  config: DataRequestConfig,
  outputEntity: StudyEntity
): BarplotRequestParams {
  return {
    studyId,
    filters,
    config: {
      // is outputEntityId correct?
      outputEntityId: outputEntity.id,
      xAxisVariable: config.xAxisVariable!,
      overlayVariable: config.overlayVariable,
      facetVariable: config.facetVariable ? [config.facetVariable] : [],
      // valueSpec: manually inputted for now
      valueSpec: config.valueSpec,
      barMode: 'group', // or 'stack'
      showMissingness: config.showMissingness ? 'TRUE' : 'FALSE',
    },
  };
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
  data: BarplotDataWithStatistics | BarplotData,
  labelVocabulary: string[] = [],
  overlayVocabulary: string[] = [],
  facetVocabulary: string[] = []
): BarplotDataWithStatistics | BarplotData {
  // If faceted, reorder the facets and within the facets
  if (isFaceted(data)) {
    if (facetVocabulary.length === 0) return data; // FIX-ME stop-gap for vocabulary-less numeric variables

    // for each value in the facet vocabulary's correct order
    // find the index in the series where series.name equals that value
    const facetValues = data.facets.map((facet) => facet.label);
    const facetIndices = facetVocabulary.map((name) =>
      facetValues.indexOf(name)
    );

    return {
      ...data,
      facets: facetIndices.map((i, j) => {
        const facetData = data.facets[i]?.data;
        return {
          label: facetVocabulary[j],
          data:
            facetData != null
              ? (reorderData(
                  facetData,
                  labelVocabulary,
                  overlayVocabulary
                ) as BarplotData)
              : undefined,
        };
      }),
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
        value: labelIndices.map((i) => series.value[i]),
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
            value: labelVocabulary.map(() => undefined),
          }
      ),
    };
  } else {
    return { ...data, series: labelOrderedSeries };
  }
}
