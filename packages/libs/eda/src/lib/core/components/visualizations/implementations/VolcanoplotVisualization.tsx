// load scatter plot component
import VolcanoPlot, {
  VolcanoPlotProps,
} from '@veupathdb/components/lib/plots/VolcanoPlot';

import * as t from 'io-ts';
import { useCallback, useMemo, useState, useEffect } from 'react';

import { usePromise } from '../../../hooks/promise';
import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
import {
  useDataClient,
  useFindEntityAndVariable,
  useStudyEntities,
  useStudyMetadata,
} from '../../../hooks/workspace';
import { findEntityAndVariable as findCollectionVariableEntityAndVariable } from '../../../utils/study-metadata';

import { VariableDescriptor } from '../../../types/variable';

import { PlotLayout } from '../../layouts/PlotLayout';

import {
  ComputedVariableDetails,
  VisualizationProps,
} from '../VisualizationTypes';

// use lodash instead of Math.min/max
import {
  min,
  max,
  lte,
  gte,
  gt,
  groupBy,
  size,
  head,
  values,
  mapValues,
  map,
  keys,
  uniqBy,
  filter,
  isEqual,
} from 'lodash';

import { gray } from '../colors';

import { useRouteMatch } from 'react-router';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import PluginError from '../PluginError';
// for custom legend
import PlotLegend from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';

// a custom hook to preserve the status of checked legend items
import { useCheckedLegendItems } from '../../../hooks/checkedLegendItemsStatus';

// concerning axis range control
import { NumberRange } from '../../../types/general';
// reusable util for computing truncationConfig
import { truncationConfig } from '../../../utils/truncation-config-utils';
// use Notification for truncation warning message
import Notification from '@veupathdb/components/lib/components/widgets//Notification';
import AxisRangeControl from '@veupathdb/components/lib/components/plotControls/AxisRangeControl';
import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import { useVizConfig } from '../../../hooks/visualizations';
import { createVisualizationPlugin } from '../VisualizationPlugin';

import { LayoutOptions, TitleOptions } from '../../layouts/types';
import { OverlayOptions, RequestOptions } from '../options/types';

// reset to defaults button
import { ResetButtonCoreUI } from '../../ResetButton';

// add Slider and SliderWidgetProps
import SliderWidget, {
  SliderWidgetProps,
} from '@veupathdb/components/lib/components/widgets/Slider';

// Volcano plot imports
import DataClient, {
  VolcanoPlotRequestParams,
  VolcanoplotResponse,
} from '../../../api/DataClient';
import { VolcanoPlotData } from '@veupathdb/components/lib/types/plots/volcanoplot';
import VolcanoSVG from './selectorIcons/VolcanoSVG';
import { FloatingScatterplotExtraProps } from '../../../../map/analysis/hooks/plugins/scatterplot';

// end imports

// Constants and styles
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

const MAXALLOWEDDATAPOINTS = 100000;

// Types

export const volcanoplotVisualization = createVisualizationPlugin({
  selectorIcon: VolcanoSVG,
  fullscreenComponent: VolcanoplotViz,
  createDefaultConfig: createDefaultConfig,
});

function createDefaultConfig(): VolcanoPlotConfig {
  return {
    log2FoldChangeThreshold: 3,
    significanceThreshold: 0.05,
    // independentAxisValueSpec: 'Full',
    // dependentAxisValueSpec: 'Full',
    markerBodyOpacity: 0.5,
  };
}

export type VolcanoPlotConfig = t.TypeOf<typeof VolcanoPlotConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const VolcanoPlotConfig = t.partial({
  log2FoldChangeThreshold: t.number,
  significanceThreshold: t.number,
  // for vizconfig.checkedLegendItems
  // checkedLegendItems: t.array(t.string), // not yet implemented
  // axis range control
  // independentAxisRange: NumberOrDateRange, // not yet implemented
  // dependentAxisRange: NumberOrDateRange, // not yet implemented
  // independentAxisValueSpec: t.string,  // not yet implemented
  // dependentAxisValueSpec: t.string,  // not yet implemented
  markerBodyOpacity: t.number,
});

interface Options
  extends LayoutOptions,
    RequestOptions<VolcanoPlotConfig, {}, VolcanoPlotRequestParams> {}

function VolcanoplotViz(props: VisualizationProps<Options>) {
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
    computeJobStatus,
  } = props;

  const studyMetadata = useStudyMetadata();
  const { id: studyId } = studyMetadata;
  const entities = useStudyEntities(filters);
  const dataClient: DataClient = useDataClient();

  const [vizConfig, updateVizConfig] = useVizConfig(
    visualization.descriptor.configuration,
    VolcanoPlotConfig,
    createDefaultConfig,
    updateConfiguration
  );

  // const selectedThresholdValues = useDeepValue({
  //   log2foldChangeThreshold: vizConfig.log2foldChangeThreshold,
  //   significanceThreshold: vizConfig.significanceThreshold,
  // });
  // look to handleInputVariableChange if need help setting these

  // set the state of truncation warning message NOT YET IMPLEMENTED
  const [truncatedIndependentAxisWarning, setTruncatedIndependentAxisWarning] =
    useState<string>('');
  const [truncatedDependentAxisWarning, setTruncatedDependentAxisWarning] =
    useState<string>('');

  // prettier-ignore
  // allow 2nd parameter of resetCheckedLegendItems for checking legend status
  const onChangeHandlerFactory = useCallback(
    < ValueType,>(key: keyof VolcanoPlotConfig,
      // resetCheckedLegendItems?: boolean,
      resetIndependentAxisRanges?: boolean,
      resetDependentAxisRanges?: boolean,
      ) => (newValue?: ValueType) => {
      const newPartialConfig = {
        [key]: newValue,
        // ...(resetCheckedLegendItems ? { checkedLegendItems: undefined } : {}),
        // ...(resetIndependentAxisRanges ? { independentAxisRange: undefined } : {}),
        // ...(resetDependentAxisRanges ? { dependentAxisRange: undefined } : {}),
      };
      updateVizConfig(newPartialConfig);
      if (resetIndependentAxisRanges) {
        setTruncatedIndependentAxisWarning('');
      }
      if (resetDependentAxisRanges) {
        setTruncatedDependentAxisWarning('');
      }
    },
    [updateVizConfig]
  );

  const onMarkerBodyOpacityChange = onChangeHandlerFactory<number>(
    'markerBodyOpacity',
    false,
    false
  );

  // Get the volcano plot data!
  const data = usePromise(
    useCallback(async (): Promise<VolcanoplotResponse | undefined> => {
      // Currently volcano is only tied to computes. No viz input.
      // So if the compute job status isn't complete, we shouldn't draw the plot.
      if (computeJobStatus !== 'complete') return undefined;

      // Also don't try to make a viz if the filter info isn't ready yet
      if (filteredCounts.pending || filteredCounts.value == null)
        return undefined;

      // There are _no_ viz request params for the volcano plot (config: {}).
      // The data service streams the volcano data directly from the compute service.
      const params = {
        studyId,
        filters,
        config: {},
        computeConfig: computation.descriptor.configuration,
      };
      const response = await dataClient.getVisualizationData(
        computation.descriptor.type,
        visualization.descriptor.type,
        params,
        VolcanoplotResponse
      );

      return {
        ...response,
      };
    }, [
      computeJobStatus,
      filteredCounts.pending,
      filteredCounts.value,
      entities,
      dataElementConstraints,
      dataElementDependencyOrder,
      filters,
      studyId,
      computation.descriptor.configuration,
      computation.descriptor.type,
      dataClient,
      visualization.descriptor.type,
    ])
  );

  // const outputSize = @ANN fill in?

  console.log(data); //!!!!!!!

  // default ranges. @ANN set based on data i think.
  const defaultIndependentAxisRange = { min: -5, max: 5 } as NumberRange;
  const defaultDependentAxisRange = { min: 0, max: 5 } as NumberRange;

  // TODO add truncation things

  const { url } = useRouteMatch();

  const legendTitle = 'Volcano plot'; // not sure what the title should be but it's always the same

  // custom legend list
  // const legendItems: LegendItemsProps[] = @ANN todo

  // set checkedLegendItems to either the config-stored items, or all items if
  // nothing stored
  // @ANN will need this
  // const [checkedLegendItems, setCheckedLegendItems] = useCheckedLegendItems(
  //   legendItems,
  //   vizConfig.overlayVariable
  //     ? options?.getCheckedLegendItems?.(
  //         computation.descriptor.configuration
  //       ) ?? vizConfig.checkedLegendItems
  //     : vizConfig.checkedLegendItems,
  //   updateVizConfig
  // );

  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    plotContainerStyles,
    [
      data,
      // vizConfig.checkedLegendItems,
      // vizConfig.independentAxisRange,
      // vizConfig.dependentAxisRange,
      vizConfig.markerBodyOpacity,
    ]
  );

  // set truncation flags: will see if this is reusable with other application
  // @ANN todo
  // const {
  //   truncationConfigIndependentAxisMin,
  //   truncationConfigIndependentAxisMax,
  //   truncationConfigDependentAxisMin,
  //   truncationConfigDependentAxisMax,
  // } = useMemo(
  //   () =>
  //     truncationConfig(
  //       {
  //         independentAxisRange: xMinMaxDataRange,
  //         dependentAxisRange: yMinMaxDataRange,
  //       },
  //       vizConfig,
  //       {
  //         // truncation overrides for the axis minima for log scale
  //         // only pass key/values that you want overridden
  //         // (e.g. false values will override just as much as true)
  //         ...(vizConfig.independentAxisLogScale &&
  //         xMinMaxDataRange?.min != null &&
  //         (xMinMaxDataRange.min as number) <= 0
  //           ? { truncationConfigIndependentAxisMin: true }
  //           : {}),
  //         ...(vizConfig.dependentAxisLogScale &&
  //         yMinMaxDataRange?.min != null &&
  //         (yMinMaxDataRange.min as number) <= 0
  //           ? { truncationConfigDependentAxisMin: true }
  //           : {}),
  //       }
  //     ),
  //   [xMinMaxDataRange, yMinMaxDataRange, vizConfig]
  // );

  // set useEffect for changing truncation warning message
  // useEffect(() => {
  //   if (
  //     truncationConfigIndependentAxisMin ||
  //     truncationConfigIndependentAxisMax
  //   ) {
  //     setTruncatedIndependentAxisWarning(
  //       'Data may have been truncated by range selection, as indicated by the yellow shading'
  //     );
  //   }
  // }, [
  //   truncationConfigIndependentAxisMin,
  //   truncationConfigIndependentAxisMax,
  //   setTruncatedIndependentAxisWarning,
  // ]);

  // useEffect(() => {
  //   if (
  //     // (truncationConfigDependentAxisMin || truncationConfigDependentAxisMax) &&
  //     // !scatterplotProps.showSpinner
  //     truncationConfigDependentAxisMin ||
  //     truncationConfigDependentAxisMax
  //   ) {
  //     setTruncatedDependentAxisWarning(
  //       'Data may have been truncated by range selection, as indicated by the yellow shading'
  //     );
  //   }
  // }, [
  //   truncationConfigDependentAxisMin,
  //   truncationConfigDependentAxisMax,
  //   setTruncatedDependentAxisWarning,
  // ]);

  // slider settings
  const markerBodyOpacityContainerStyles = {
    height: '4em',
    width: '20em',
    marginLeft: '1em',
    marginBottom: '0.5em',
  };

  // implement gradient color for slider opacity
  const colorSpecProps: SliderWidgetProps['colorSpec'] = {
    type: 'gradient',
    tooltip: '#aaa',
    knobColor: '#aaa',
    // normal slider color: e.g., from 0 to 1
    trackGradientStart: '#fff',
    trackGradientEnd: '#000',
  };

  const volcanoplotProps: VolcanoPlotProps = {
    // interactive: !isFaceted(data.value?.dataSetProcess) ? true : false,
    // showSpinner: filteredCounts.pending || data.pending,
    //@ts-ignore
    data: data,
    independentAxisRange: defaultIndependentAxisRange,
    dependentAxisRange: defaultDependentAxisRange,
    // axisTruncationConfig: {
    //   independentAxis: {
    //     min: truncationConfigIndependentAxisMin,
    //     max: truncationConfigIndependentAxisMax,
    //   },
    //   dependentAxis: {
    //     min: truncationConfigDependentAxisMin,
    //     max: truncationConfigDependentAxisMax,
    //   },
    // },
    markerBodyOpacity: vizConfig.markerBodyOpacity ?? 0.5,
    significantThreshold: 0.05,
    log2FoldChangeThreshold: 3,

    // ...neutralPaletteProps, // no-op. we have to handle colours here.
  };

  const plotNode = (
    <>
      {/* <VolcanoPlot
      {...volcanoplotProps}
    /> */}
    </>
  );

  // const handleIndependentAxisRangeChange = useCallback(
  //   (newRange?: NumberOrDateRange) => {
  //     updateVizConfig({
  //       independentAxisRange:
  //         newRange &&
  //         ({
  //           min:
  //             typeof newRange.min === 'string'
  //               ? padISODateTime(newRange.min)
  //               : newRange.min,
  //           max:
  //             typeof newRange.max === 'string'
  //               ? padISODateTime(newRange.max)
  //               : newRange.max,
  //         } as NumberOrDateRange),
  //     });
  //   },
  //   [updateVizConfig]
  // );

  // const handleIndependentAxisSettingsReset = useCallback(() => {
  //   updateVizConfig({
  //     independentAxisRange: undefined,
  //     independentAxisLogScale: false,
  //     independentAxisValueSpec: 'Full',
  //   });
  //   // add reset for truncation message: including dependent axis warning as well
  //   setTruncatedIndependentAxisWarning('');
  // }, [updateVizConfig, setTruncatedIndependentAxisWarning]);

  // const handleDependentAxisRangeChange = useCallback(
  //   (newRange?: NumberOrDateRange) => {
  //     updateVizConfig({
  //       dependentAxisRange:
  //         newRange &&
  //         ({
  //           min:
  //             typeof newRange.min === 'string'
  //               ? padISODateTime(newRange.min)
  //               : newRange.min,
  //           max:
  //             typeof newRange.max === 'string'
  //               ? padISODateTime(newRange.max)
  //               : newRange.max,
  //         } as NumberOrDateRange),
  //     });
  //   },
  //   [updateVizConfig]
  // );

  // const handleDependentAxisSettingsReset = useCallback(() => {
  //   updateVizConfig({
  //     dependentAxisRange: undefined,
  //     dependentAxisLogScale: false,
  //     dependentAxisValueSpec: 'Full',
  //   });
  //   // add reset for truncation message as well
  //   setTruncatedDependentAxisWarning('');
  // }, [updateVizConfig, setTruncatedDependentAxisWarning]);

  // const [
  //   dismissedIndependentAllNegativeWarning,
  //   setDismissedIndependentAllNegativeWarning,
  // ] = useState<boolean>(false);
  // const independentAllNegative =
  //   vizConfig.independentAxisLogScale &&
  //   xMinMaxDataRange?.max != null &&
  //   (xMinMaxDataRange.max as number) < 0;

  // const [
  //   dismissedDependentAllNegativeWarning,
  //   setDismissedDependentAllNegativeWarning,
  // ] = useState<boolean>(false);
  // const dependentAllNegative =
  //   vizConfig.dependentAxisLogScale &&
  //   yMinMaxDataRange?.max != null &&
  //   (yMinMaxDataRange.max as number) < 0;

  // add showBanner prop in this Viz
  const [showBanner, setShowBanner] = useState(true);

  const controlsNode = <> </>;
  // (
  //   <>
  //     {/* pre-occupied space for banner:  1 line = 2.5em */}
  //     {/* <div style={{ width: 750, marginLeft: '1em', minHeight: '2.5em' }}> */}
  //     <div
  //       style={{
  //         width: 750,
  //         marginLeft: '1em',
  //         minHeight: '5.1em',
  //         display: 'flex',
  //         flexDirection: 'column',
  //         justifyContent: 'center',
  //       }}
  //     >
  //       {/* show Banner message if no smoothed mean exists */}
  //       {!data.pending &&
  //         vizConfig.valueSpecConfig === 'Smoothed mean with raw' &&
  //         dataWithoutSmoothedMean != null &&
  //         dataWithoutSmoothedMean?.length > 0 && (
  //           <div>
  //             <Banner
  //               banner={{
  //                 type: 'warning',
  //                 message:
  //                   'Smoothed mean(s) were not calculated for one or more data series.',
  //                 pinned: true,
  //                 intense: false,
  //                 // additionalMessage is shown next to message when clicking showMoreLinkText.
  //                 // disappears when clicking showLess link
  //                 // note that this additionalMessage prop is used to determine show more/less behavior or not
  //                 // if undefined, then just show normal banner with message
  //                 additionalMessage:
  //                   'The sample size might be too small or the data too skewed.',
  //                 // text for showMore link
  //                 showMoreLinkText: 'Why?',
  //                 // text for showless link
  //                 showLessLinkText: 'Read less',
  //                 // color for show more links
  //                 showMoreLinkColor: '#006699',
  //                 spacing: {
  //                   margin: '0.3125em 0 0 0',
  //                   padding: '0.3125em 0.625em',
  //                 },
  //                 fontSize: '1em',
  //                 showBanner: showBanner,
  //                 setShowBanner: setShowBanner,
  //               }}
  //             />
  //           </div>
  //         )}

  //       {/* show Banner for continuous overlayVariable if plot option is not 'Raw' */}
  //       {!data.pending && showContinousOverlayBanner && (
  //         <div>
  //           <Banner
  //             banner={{
  //               type: 'warning',
  //               message:
  //                 'Plot modes with fitted lines are not available when continuous overlay variables are selected.',
  //               pinned: true,
  //               intense: false,
  //               // additionalMessage is shown next to message when clicking showMoreLinkText.
  //               // disappears when clicking showLess link
  //               // note that this additionalMessage prop is used to determine show more/less behavior or not
  //               // if undefined, then just show normal banner with message
  //               additionalMessage:
  //                 'Continuous overlay variable values are not binned.',
  //               // text for showMore link
  //               showMoreLinkText: 'Why?',
  //               // text for showless link
  //               showLessLinkText: 'Read less',
  //               // color for show more links
  //               showMoreLinkColor: '#006699',
  //               spacing: {
  //                 margin: '0.3125em 0 0 0',
  //                 padding: '0.3125em 0.625em',
  //               },
  //               fontSize: '1em',
  //               showBanner: showBanner,
  //               setShowBanner: setShowBanner,
  //             }}
  //           />
  //         </div>
  //       )}

  //       {/* show log scale related Banner message unless plot mode of 'Raw' */}
  //       {showLogScaleBanner && (
  //         // <div style={{ width: 750, marginLeft: '1em', height: '2.8em' }}>
  //         <div>
  //           <Banner
  //             banner={{
  //               type: 'warning',
  //               message:
  //                 'Log scale is not available for plot modes with fitted lines.',
  //               pinned: true,
  //               intense: false,
  //               // additionalMessage is shown next to message when clicking showMoreLinkText.
  //               // disappears when clicking showLess link
  //               // note that this additionalMessage prop is used to determine show more/less behavior or not
  //               // if undefined, then just show normal banner with message
  //               additionalMessage:
  //                 'Lines fitted to non-log transformed raw data cannot be accurately plotted on log scale axes.',
  //               // text for showMore link
  //               showMoreLinkText: 'Why?',
  //               // text for showless link
  //               showLessLinkText: 'Read less',
  //               // color for show more links
  //               showMoreLinkColor: '#006699',
  //               spacing: {
  //                 margin: '0.3125em 0 0 0',
  //                 padding: '0.3125em 0.625em',
  //               },
  //               fontSize: '1em',
  //               showBanner: showBanner,
  //               setShowBanner: setShowBanner,
  //             }}
  //           />
  //         </div>
  //       )}
  //     </div>

  //     {!options?.hideTrendlines && (
  //       // use RadioButtonGroup directly instead of ScatterPlotControls
  //       <RadioButtonGroup
  //         label="Plot mode"
  //         options={['Raw', 'Smoothed mean with raw', 'Best fit line with raw']}
  //         selectedOption={vizConfig.valueSpecConfig ?? 'Raw'}
  //         onOptionSelected={(newValue: string) => {
  //           onValueSpecChange(newValue);
  //           // to reuse Banner
  //           setShowBanner(true);
  //         }}
  //         // disabledList prop is used to disable radio options (grayed out)
  //         disabledList={
  //           yAxisVariable?.type === 'date'
  //             ? ['Smoothed mean with raw', 'Best fit line with raw']
  //             : []
  //         }
  //         orientation={'horizontal'}
  //         labelPlacement={'end'}
  //         buttonColor={'primary'}
  //         margins={['0em', '0', '0', '1em']}
  //         itemMarginRight={50}
  //       />
  //     )}

  //     {/* make a plot slide after plot mode for now */}
  //     <SliderWidget
  //       minimum={0}
  //       maximum={1}
  //       step={0.1}
  //       value={vizConfig.markerBodyOpacity ?? 0.5}
  //       debounceRateMs={250}
  //       onChange={(newValue: number) => {
  //         onMarkerBodyOpacityChange(newValue);
  //       }}
  //       containerStyles={markerBodyOpacityContainerStyles}
  //       showLimits={true}
  //       label={'Marker opacity'}
  //       colorSpec={colorSpecProps}
  //     />

  //     {/* axis range control UIs */}
  //     <div style={{ display: 'flex', flexDirection: 'row' }}>
  //       {/* make switch and radiobutton single line with space
  //                also marginRight at LabelledGroup is set to 0.5625em: default - 1.5625em*/}
  //       <div style={{ display: 'flex', flexDirection: 'column' }}>
  //         {/* X-axis controls   */}
  //         {/* set Undo icon and its behavior */}
  //         <div
  //           style={{
  //             display: 'flex',
  //             flexDirection: 'row',
  //             alignItems: 'center',
  //           }}
  //         >
  //           <LabelledGroup label="X-axis controls"> </LabelledGroup>
  //           <div style={{ marginLeft: '-2.6em', width: '50%' }}>
  //             <ResetButtonCoreUI
  //               size={'medium'}
  //               text={''}
  //               themeRole={'primary'}
  //               tooltip={'Reset to defaults'}
  //               disabled={false}
  //               onPress={handleIndependentAxisSettingsReset}
  //             />
  //           </div>
  //         </div>

  //         {!options?.hideLogScale && (
  //           <div
  //             style={{
  //               marginLeft: '1em',
  //               marginTop: '-0.3em',
  //               marginBottom: '0.8em',
  //             }}
  //           >
  //             <Toggle
  //               label={`Log scale ${
  //                 vizConfig.independentAxisLogScale
  //                   ? 'on (excludes values \u{2264} 0)'
  //                   : 'off'
  //               }`}
  //               value={vizConfig.independentAxisLogScale ?? false}
  //               onChange={(newValue: boolean) => {
  //                 setDismissedIndependentAllNegativeWarning(false);
  //                 onIndependentAxisLogScaleChange(newValue);
  //                 // to reuse Banner
  //                 setShowBanner(true);
  //               }}
  //               // disable log scale for date variable
  //               disabled={scatterplotProps.independentValueType === 'date'}
  //               themeRole="primary"
  //             />
  //           </div>
  //         )}
  //         {independentAllNegative &&
  //         !dismissedIndependentAllNegativeWarning &&
  //         !options?.hideLogScale ? (
  //           <Notification
  //             title={''}
  //             text={
  //               'Nothing can be plotted with log scale because all values are zero or negative'
  //             }
  //             color={'#5586BE'}
  //             onAcknowledgement={() =>
  //               setDismissedIndependentAllNegativeWarning(true)
  //             }
  //             showWarningIcon={true}
  //             containerStyles={{ maxWidth: '350px' }}
  //           />
  //         ) : null}

  //         <LabelledGroup
  //           label="X-axis range"
  //           containerStyles={{
  //             fontSize: '0.9em',
  //             // width: '350px',
  //           }}
  //         >
  //           <RadioButtonGroup
  //             options={['Full', 'Auto-zoom', 'Custom']}
  //             selectedOption={vizConfig.independentAxisValueSpec ?? 'Full'}
  //             onOptionSelected={(newAxisRangeOption: string) => {
  //               onIndependentAxisValueSpecChange(newAxisRangeOption);
  //             }}
  //             orientation={'horizontal'}
  //             labelPlacement={'end'}
  //             buttonColor={'primary'}
  //             margins={['0em', '0', '0', '0em']}
  //             itemMarginRight={25}
  //           />
  //           <AxisRangeControl
  //             range={
  //               vizConfig.independentAxisRange ?? defaultIndependentAxisRange
  //             }
  //             onRangeChange={handleIndependentAxisRangeChange}
  //             valueType={
  //               scatterplotProps.independentValueType === 'date'
  //                 ? 'date'
  //                 : 'number'
  //             }
  //             // set maxWidth
  //             containerStyles={{ maxWidth: '350px' }}
  //             logScale={vizConfig.independentAxisLogScale}
  //             disabled={
  //               vizConfig.independentAxisValueSpec === 'Full' ||
  //               vizConfig.independentAxisValueSpec === 'Auto-zoom'
  //             }
  //           />
  //           {/* truncation notification */}
  //           {truncatedIndependentAxisWarning &&
  //           !independentAllNegative &&
  //           data.value != null ? (
  //             <Notification
  //               title={''}
  //               text={truncatedIndependentAxisWarning}
  //               // this was defined as LIGHT_BLUE
  //               color={'#5586BE'}
  //               onAcknowledgement={() => {
  //                 setTruncatedIndependentAxisWarning('');
  //               }}
  //               showWarningIcon={true}
  //               containerStyles={{
  //                 maxWidth:
  //                   scatterplotProps.independentValueType === 'date'
  //                     ? '350px'
  //                     : '350px',
  //               }}
  //             />
  //           ) : null}
  //         </LabelledGroup>
  //       </div>
  //       {/* add vertical line in btw Y- and X- controls */}
  //       <div
  //         style={{
  //           display: 'inline-flex',
  //           borderLeft: '2px solid lightgray',
  //           height: '13.25em',
  //           position: 'relative',
  //           marginLeft: '-1px',
  //           top: '1.5em',
  //         }}
  //       >
  //         {' '}
  //       </div>

  //       {/* Y-axis controls   */}
  //       <div style={{ display: 'flex', flexDirection: 'column' }}>
  //         {/* set Undo icon and its behavior */}
  //         <div
  //           style={{
  //             display: 'flex',
  //             flexDirection: 'row',
  //             alignItems: 'center',
  //           }}
  //         >
  //           <LabelledGroup label="Y-axis controls"> </LabelledGroup>
  //           <div style={{ marginLeft: '-2.6em', width: '50%' }}>
  //             <ResetButtonCoreUI
  //               size={'medium'}
  //               text={''}
  //               themeRole={'primary'}
  //               tooltip={'Reset to defaults'}
  //               disabled={false}
  //               onPress={handleDependentAxisSettingsReset}
  //             />
  //           </div>
  //         </div>

  //         {!options?.hideLogScale && (
  //           <div
  //             style={{
  //               marginLeft: '1em',
  //               marginTop: '-0.3em',
  //               marginBottom: '0.8em',
  //             }}
  //           >
  //             <Toggle
  //               label={`Log scale ${
  //                 vizConfig.dependentAxisLogScale
  //                   ? 'on (excludes values \u{2264} 0)'
  //                   : 'off'
  //               }`}
  //               value={vizConfig.dependentAxisLogScale ?? false}
  //               onChange={(newValue: boolean) => {
  //                 setDismissedDependentAllNegativeWarning(false);
  //                 onDependentAxisLogScaleChange(newValue);
  //                 // to reuse Banner
  //                 setShowBanner(true);
  //               }}
  //               // disable log scale for date variable
  //               disabled={scatterplotProps.dependentValueType === 'date'}
  //               themeRole="primary"
  //             />
  //           </div>
  //         )}
  //         {dependentAllNegative &&
  //         !dismissedDependentAllNegativeWarning &&
  //         !options?.hideLogScale ? (
  //           <Notification
  //             title={''}
  //             text={
  //               'Nothing can be plotted with log scale because all values are zero or negative'
  //             }
  //             color={'#5586BE'}
  //             onAcknowledgement={() =>
  //               setDismissedDependentAllNegativeWarning(true)
  //             }
  //             showWarningIcon={true}
  //             containerStyles={{ maxWidth: '350px' }}
  //           />
  //         ) : null}

  //         <LabelledGroup
  //           label="Y-axis range"
  //           containerStyles={{
  //             fontSize: '0.9em',
  //             // width: '350px',
  //           }}
  //         >
  //           <RadioButtonGroup
  //             options={['Full', 'Auto-zoom', 'Custom']}
  //             selectedOption={vizConfig.dependentAxisValueSpec ?? 'Full'}
  //             onOptionSelected={(newAxisRangeOption: string) => {
  //               onDependentAxisValueSpecChange(newAxisRangeOption);
  //             }}
  //             orientation={'horizontal'}
  //             labelPlacement={'end'}
  //             buttonColor={'primary'}
  //             margins={['0em', '0', '0', '0em']}
  //             itemMarginRight={25}
  //           />
  //           <AxisRangeControl
  //             range={vizConfig.dependentAxisRange ?? defaultDependentAxisRange}
  //             valueType={
  //               scatterplotProps.dependentValueType === 'date'
  //                 ? 'date'
  //                 : 'number'
  //             }
  //             onRangeChange={(newRange?: NumberOrDateRange) => {
  //               handleDependentAxisRangeChange(newRange);
  //             }}
  //             // set maxWidth
  //             containerStyles={{ maxWidth: '350px' }}
  //             logScale={vizConfig.dependentAxisLogScale}
  //             disabled={
  //               vizConfig.dependentAxisValueSpec === 'Full' ||
  //               vizConfig.dependentAxisValueSpec === 'Auto-zoom'
  //             }
  //           />
  //           {/* truncation notification */}
  //           {truncatedDependentAxisWarning && !dependentAllNegative ? (
  //             <Notification
  //               title={''}
  //               text={truncatedDependentAxisWarning}
  //               // this was defined as LIGHT_BLUE
  //               color={'#5586BE'}
  //               onAcknowledgement={() => {
  //                 setTruncatedDependentAxisWarning('');
  //               }}
  //               showWarningIcon={true}
  //               containerStyles={{
  //                 maxWidth:
  //                   scatterplotProps.independentValueType === 'date'
  //                     ? '350px'
  //                     : '350px',
  //               }}
  //             />
  //           ) : null}
  //         </LabelledGroup>
  //       </div>
  //     </div>
  //   </>
  // );

  const legendNode = !data.pending && data.value != null && (
    <PlotLegend
      type="list"
      legendItems={[
        {
          label: 'label',
          marker: 'square',
          markerColor: 'red',
          hasData: true,
          group: 1,
          rank: 1,
        },
      ]}
      checkedLegendItems={[]}
      // onCheckedLegendItemsChange={() => void}
      legendTitle={legendTitle}
      showOverlayLegend={true}
      // pass markerBodyOpacity to PlotLegend to control legend color opacity
      markerBodyOpacity={vizConfig.markerBodyOpacity}
    />
  );

  const tableGroupNode = <> </>;
  // const tableGroupNode = (
  //   <>
  //     <BirdsEyeView
  //       completeCasesAllVars={
  //         data.pending ? undefined : data.value?.completeCasesAllVars
  //       }
  //       completeCasesAxesVars={
  //         data.pending ? undefined : data.value?.completeCasesAxesVars
  //       }
  //       outputEntity={outputEntity}
  //       stratificationIsActive={
  //         overlayVariable != null || computedOverlayVariableDescriptor != null
  //       }
  //       enableSpinner={
  //         xAxisVariable != null && yAxisVariable != null && !data.error
  //       }
  //       totalCounts={totalCounts.value}
  //       filteredCounts={filteredCounts.value}
  //     />
  //     <VariableCoverageTable
  //       completeCases={
  //         data.value && !data.pending ? data.value?.completeCases : undefined
  //       }
  //       filteredCounts={filteredCounts}
  //       outputEntityId={outputEntity?.id}
  //       variableSpecs={[
  //         {
  //           role: 'X-axis',
  //           required: true,
  //           display: independentAxisLabel,
  //           variable: computedXAxisDescriptor ?? vizConfig.xAxisVariable,
  //         },
  //         {
  //           role: 'Y-axis',
  //           required: !computedOverlayVariableDescriptor?.variableId,
  //           display: dependentAxisLabel,
  //           variable:
  //             !computedOverlayVariableDescriptor && computedYAxisDescriptor
  //               ? computedYAxisDescriptor
  //               : vizConfig.yAxisVariable,
  //         },
  //         {
  //           role: 'Overlay',
  //           required: !!computedOverlayVariableDescriptor,
  //           display: legendTitle,
  //           variable:
  //             computedOverlayVariableDescriptor ?? vizConfig.overlayVariable,
  //         },
  //         ...additionalVariableCoverageTableRows,
  //         {
  //           role: 'Facet',
  //           display: variableDisplayWithUnit(facetVariable),
  //           variable: vizConfig.facetVariable,
  //         },
  //       ]}
  //     />
  //     {/* R-square table component: only display when overlay and/or facet variable exist */}
  //     {vizConfig.valueSpecConfig === 'Best fit line with raw' &&
  //       data.value != null &&
  //       !data.pending &&
  //       (vizConfig.overlayVariable != null ||
  //         vizConfig.facetVariable != null) && (
  //         <ScatterplotRsquareTable
  //           typedData={
  //             !isFaceted(data.value.dataSetProcess)
  //               ? { isFaceted: false, data: data.value.dataSetProcess.series }
  //               : { isFaceted: true, data: data.value.dataSetProcess.facets }
  //           }
  //           overlayVariable={overlayVariable}
  //           facetVariable={facetVariable}
  //         />
  //       )}
  //   </>
  // );

  // plot subtitle
  const plotSubtitle = 'plot subtitle';

  const LayoutComponent = options?.layoutComponent ?? PlotLayout;

  const inputs = [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <PluginError
        error={data.error}
        outputSize={500}
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

      {/* <OutputEntityTitle
        entity={outputEntity}
        outputSize={outputSize}
        subtitle={plotSubtitle}
      /> */}
      <LayoutComponent
        isFaceted={false}
        legendNode={true}
        plotNode={plotNode}
        controlsNode={controlsNode}
        tableGroupNode={tableGroupNode}
        showRequiredInputsPrompt={false}
      />
    </div>
  );
}
