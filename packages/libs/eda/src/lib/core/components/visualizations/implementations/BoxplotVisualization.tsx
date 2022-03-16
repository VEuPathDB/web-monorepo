// load Boxplot component
import Boxplot, { BoxplotProps } from '@veupathdb/components/lib/plots/Boxplot';
import FacetedBoxplot from '@veupathdb/components/lib/plots/facetedPlots/FacetedBoxplot';

import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import * as t from 'io-ts';
import { useCallback, useMemo, useState, useEffect } from 'react';

// need to set for Boxplot
import DataClient, { BoxplotResponse } from '../../../api/DataClient';

import { usePromise } from '../../../hooks/promise';
import { useFindEntityAndVariable } from '../../../hooks/study';
import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { useFindOutputEntity } from '../../../hooks/findOutputEntity';
import { VariableDescriptor } from '../../../types/variable';

import { VariableCoverageTable } from '../../VariableCoverageTable';

import { InputSpec, InputVariables } from '../InputVariables';
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
import { PlotLayout } from '../../layouts/PlotLayout';
import PluginError from '../PluginError';

import {
  at,
  groupBy,
  mapValues,
  size,
  head,
  map,
  values,
  max,
  min,
  keys,
} from 'lodash';
// import axis label unit util
import { variableDisplayWithUnit } from '../../../utils/variable-display';
import {
  fixLabelForNumberVariables,
  fixLabelsForNumberVariables,
  grayOutLastSeries,
  nonUniqueWarning,
  hasIncompleteCases,
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
// a custom hook to preserve the status of checked legend items
import { useCheckedLegendItemsStatus } from '../../../hooks/checkedLegendItemsStatus';
import { useVizConfig } from '../../../hooks/visualizations';

// concerning axis range control
import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import { NumberOrDateRange, NumberRange } from '../../../types/general';
import { NumberRangeInput } from '@veupathdb/components/lib/components/widgets/NumberAndDateRangeInputs';
// reusable util for computing truncationConfig
import { truncationConfig } from '../../../utils/truncation-config-utils-viz';
// use Notification for truncation warning message
import Notification from '@veupathdb/components/lib/components/widgets//Notification';
import Button from '@veupathdb/components/lib/components/widgets/Button';
import { useDefaultDependentAxisRange } from '../../../hooks/computeDefaultDependentAxisRange';

type BoxplotData = { series: BoxplotSeries };

// export
export type BoxplotDataWithCoverage = (BoxplotData | FacetedData<BoxplotData>) &
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

// export
export type BoxplotConfig = t.TypeOf<typeof BoxplotConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const BoxplotConfig = t.partial({
  xAxisVariable: VariableDescriptor,
  yAxisVariable: VariableDescriptor,
  overlayVariable: VariableDescriptor,
  facetVariable: VariableDescriptor,
  showMissingness: t.boolean,
  // for custom legend: vizconfig.checkedLegendItems
  checkedLegendItems: t.array(t.string),
  // dependent axis range control: NumberRange or NumberOrDateRange
  dependentAxisRange: NumberOrDateRange,
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
    BoxplotConfig,
    createDefaultConfig,
    updateConfiguration
  );

  // set the state of truncation warning message
  const [
    truncatedDependentAxisWarning,
    setTruncatedDependentAxisWarning,
  ] = useState<string>('');

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
        // set undefined for variable change
        checkedLegendItems: undefined,
        dependentAxisRange: undefined,
      });
      // close truncation warnings
      setTruncatedDependentAxisWarning('');
    },
    [updateVizConfig]
  );

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

  // prettier-ignore
  // allow 2nd parameter of resetCheckedLegendItems for checking legend status
  const onChangeHandlerFactory = useCallback(
    < ValueType,>(key: keyof BoxplotConfig, resetCheckedLegendItems?: boolean, resetAxisRanges?: boolean) => (newValue?: ValueType) => {
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

  // set checkedLegendItems: undefined for the change of showMissingness
  const onShowMissingnessChange = onChangeHandlerFactory<boolean>(
    'showMissingness',
    true,
    true
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
      if (
        vizConfig.xAxisVariable == null ||
        xAxisVariable == null ||
        (computation.descriptor.configuration == null &&
          (vizConfig.yAxisVariable == null || yAxisVariable == null)) ||
        outputEntity == null ||
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

      // add visualization.type here. valueSpec too?
      const params = {
        studyId,
        filters,
        config: {
          // add outputEntityId per dataElementDependencyOrder
          outputEntityId: computation.descriptor.configuration
            ? (computation.descriptor.configuration as any).collectionVariable
                .entityId
            : outputEntity.id,
          // post options: 'all', 'outliers'
          points: 'outliers',
          mean: 'TRUE',
          xAxisVariable: vizConfig.xAxisVariable,
          yAxisVariable: vizConfig.yAxisVariable,
          overlayVariable: vizConfig.overlayVariable,
          facetVariable: vizConfig.facetVariable
            ? [vizConfig.facetVariable]
            : [],
          showMissingness: vizConfig.showMissingness ? 'TRUE' : 'FALSE',
        },
        computeConfig: computation.descriptor.configuration ?? undefined,
      };

      // boxplot
      const response = await dataClient.getVisualizationData(
        computation.descriptor.type,
        visualization.descriptor.type,
        params,
        BoxplotResponse
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
      return grayOutLastSeries(
        reorderData(
          boxplotResponseToData(
            response,
            xAxisVariable,
            overlayVariable,
            facetVariable
          ),
          vocabulary,
          vocabularyWithMissingData(overlayVocabulary, showMissingOverlay),
          vocabularyWithMissingData(facetVocabulary, showMissingFacet)
        ),
        showMissingOverlay,
        '#a0a0a0'
      );
    }, [
      vizConfig.xAxisVariable,
      vizConfig.yAxisVariable,
      vizConfig.overlayVariable,
      vizConfig.facetVariable,
      vizConfig.showMissingness,
      xAxisVariable,
      computation.descriptor.configuration,
      computation.descriptor.type,
      yAxisVariable,
      outputEntity,
      filteredCounts.pending,
      filteredCounts.value,
      overlayVariable,
      facetVariable,
      studyId,
      filters,
      dataClient,
      visualization.descriptor.type,
      overlayEntity,
      facetEntity,
    ])
  );

  const outputSize =
    (overlayVariable != null || facetVariable != null) &&
    !vizConfig.showMissingness
      ? data.value?.completeCasesAllVars
      : data.value?.completeCasesAxesVars;

  // use custom hook
  const defaultDependentAxisRange = useDefaultDependentAxisRange(
    data,
    vizConfig,
    updateVizConfig,
    'Boxplot',
    yAxisVariable
  );

  // custom legend items for checkbox
  const legendItems: LegendItemsProps[] = useMemo(() => {
    const legendData = !isFaceted(data.value)
      ? data.value?.series
      : data.value?.facets.find(
          ({ data }) => data != null && data.series.length > 0
        )?.data?.series;

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
                  .map((el: { label: string; data?: BoxplotData }) => {
                    // faceted plot: here data.value is full data
                    // need to check whether el.data.series[index] exists
                    return el.data?.series[index]?.q1.some(
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

  // set checkedLegendItems
  const checkedLegendItems = useCheckedLegendItemsStatus(
    legendItems,
    vizConfig.checkedLegendItems
  );

  const plotNode = (
    <BoxplotWithControls
      // data.value
      data={data.value}
      updateThumbnail={updateThumbnail}
      containerStyles={!isFaceted(data.value) ? plotContainerStyles : undefined}
      spacingOptions={!isFaceted(data.value) ? plotSpacingOptions : undefined}
      orientation={'vertical'}
      displayLegend={false}
      independentAxisLabel={variableDisplayWithUnit(xAxisVariable) ?? 'X-axis'}
      dependentAxisLabel={
        variableDisplayWithUnit(yAxisVariable) ??
        computation.descriptor.type ??
        'Y-axis'
      }
      // show/hide independent/dependent axis tick label
      showIndependentAxisTickLabel={true}
      showDependentAxisTickLabel={true}
      showMean={true}
      interactive={!isFaceted(data.value) ? true : false}
      showSpinner={data.pending || filteredCounts.pending}
      showRawData={true}
      legendTitle={variableDisplayWithUnit(overlayVariable)}
      // for custom legend passing checked state in the  checkbox to PlotlyPlot
      legendItems={legendItems}
      checkedLegendItems={checkedLegendItems}
      onCheckedLegendItemsChange={onCheckedLegendItemsChange}
      // axis range control
      vizConfig={vizConfig}
      updateVizConfig={updateVizConfig}
      // add dependent axis range for better displaying tick labels in log-scale
      defaultDependentAxisRange={defaultDependentAxisRange}
      dependentAxisRange={vizConfig.dependentAxisRange}
      // pass useState of truncation warnings
      truncatedDependentAxisWarning={truncatedDependentAxisWarning}
      setTruncatedDependentAxisWarning={setTruncatedDependentAxisWarning}
    />
  );

  const legendNode = legendItems != null && !data.pending && data != null && (
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
        stratificationIsActive={
          overlayVariable != null || facetVariable != null
        }
        enableSpinner={
          xAxisVariable != null && yAxisVariable != null && !data.error
        }
        totalCounts={totalCounts.value}
        filteredCounts={filteredCounts.value}
      />
      <VariableCoverageTable
        completeCases={data.pending ? undefined : data.value?.completeCases}
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
            computation.descriptor.configuration ?? {
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
          ].filter((input): input is InputSpec => input != null)}
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
      <PlotLayout
        isFaceted={isFaceted(data.value)}
        legendNode={legendNode}
        plotNode={plotNode}
        tableGroupNode={tableGroupNode}
      />
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
  // define types for axis range control
  vizConfig: BoxplotConfig;
  updateVizConfig: (newConfig: Partial<BoxplotConfig>) => void;
  defaultDependentAxisRange: NumberRange | undefined;
  // pass useState of truncation warnings
  truncatedDependentAxisWarning: string;
  setTruncatedDependentAxisWarning: (
    truncatedDependentAxisWarning: string
  ) => void;
};

function BoxplotWithControls({
  data,
  updateThumbnail,
  // add props for custom legend
  legendItems,
  checkedLegendItems,
  onCheckedLegendItemsChange,
  // for axis range control
  vizConfig,
  updateVizConfig,
  defaultDependentAxisRange,
  // pass useState of truncation warnings
  truncatedDependentAxisWarning,
  setTruncatedDependentAxisWarning,
  ...boxplotComponentProps
}: BoxplotWithControlsProps) {
  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    plotContainerStyles,
    [data, checkedLegendItems, vizConfig.dependentAxisRange]
  );

  // axis range control
  const handleDependentAxisRangeChange = useCallback(
    (newRange?: NumberRange) => {
      updateVizConfig({
        dependentAxisRange: newRange,
      });
    },
    [updateVizConfig]
  );

  const handleDependentAxisSettingsReset = useCallback(() => {
    updateVizConfig({
      dependentAxisRange: undefined,
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
  } = useMemo(
    () =>
      // boxplot does not have independent axis range control so send undefined for defaultUIState
      truncationConfig(undefined, vizConfig, defaultDependentAxisRange),
    [
      vizConfig.xAxisVariable,
      vizConfig.dependentAxisRange,
      defaultDependentAxisRange,
    ]
  );

  useEffect(() => {
    if (truncationConfigDependentAxisMin || truncationConfigDependentAxisMax) {
      setTruncatedDependentAxisWarning(
        'Data may have been truncated by range selection, as indicated by the light gray shading'
      );
    }
  }, [truncationConfigDependentAxisMin, truncationConfigDependentAxisMax]);

  // send boxplotComponentProps with axisTruncationConfig
  const boxplotFacetProps = {
    ...boxplotComponentProps,
    dependentAxisRange:
      vizConfig.dependentAxisRange ?? defaultDependentAxisRange,
    // pass axisTruncationConfig to faceted plot
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
  };

  // TO DO: standardise web-components/BoxplotData to have `series` key
  return (
    <>
      {isFaceted(data) ? (
        <FacetedBoxplot
          data={{
            ...data,
            facets: data.facets.map(({ label, data }) => ({
              label,
              data: data?.series,
            })),
          }}
          // pass boxplotFacetProps
          componentProps={boxplotFacetProps}
          modalComponentProps={{
            independentAxisLabel: boxplotComponentProps.independentAxisLabel,
            dependentAxisLabel: boxplotComponentProps.dependentAxisLabel,
            displayLegend: boxplotComponentProps.displayLegend,
            containerStyles: modalPlotContainerStyles,
          }}
          facetedPlotRef={plotRef}
          // for custom legend: pass checkedLegendItems to PlotlyPlot
          checkedLegendItems={checkedLegendItems}
        />
      ) : (
        <Boxplot
          data={data?.series}
          ref={plotRef}
          // for custom legend: pass checkedLegendItems to PlotlyPlot
          checkedLegendItems={checkedLegendItems}
          dependentAxisRange={
            vizConfig.dependentAxisRange ?? defaultDependentAxisRange
          }
          // pass axisTruncationConfig
          axisTruncationConfig={{
            independentAxis: {
              min: truncationConfigIndependentAxisMin,
              max: truncationConfigIndependentAxisMax,
            },
            dependentAxis: {
              min: truncationConfigDependentAxisMin,
              max: truncationConfigDependentAxisMax,
            },
          }}
          {...boxplotComponentProps}
        />
      )}
      {/* potential controls go here  */}

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <LabelledGroup label="Y-axis">
          {/* Y-axis range control */}
          <NumberRangeInput
            label="Range"
            // add range: for now, handle number only
            range={
              (vizConfig.dependentAxisRange as NumberRange) ??
              defaultDependentAxisRange
            }
            onRangeChange={(newRange?: NumberOrDateRange) => {
              handleDependentAxisRangeChange(newRange as NumberRange);
            }}
            allowPartialRange={false}
            // set maxWidth
            containerStyles={{ maxWidth: '350px' }}
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
          <Button
            type={'outlined'}
            // change text
            text={'Reset to defaults'}
            onClick={handleDependentAxisSettingsReset}
            containerStyles={{
              paddingTop: '1.0em',
              width: '50%',
              float: 'right',
            }}
          />
        </LabelledGroup>
      </div>
    </>
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
      : '__NO_FACET__'
  );

  // process data and overlay value within each facet grouping
  const processedData = mapValues(facetGroupedResponseData, (group) => {
    const facetIsEmpty = group.every(
      (data) => data.label.length === 0 && data.median.length === 0
    );
    return facetIsEmpty
      ? { series: [] }
      : {
          series: group.map((data) => ({
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
    completeCasesAllVars: response.boxplot.config.completeCasesAllVars,
    completeCasesAxesVars: response.boxplot.config.completeCasesAxesVars,
  } as BoxplotDataWithCoverage;
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
    if (facetVocabulary.length === 0) return data; // FIX-ME stop-gap for vocabulary-less numeric variables

    // for each value in the facet vocabulary's correct order
    // find the index in the series where series.name equals that value
    const facetValues = data.facets.map((facet) => facet.label);
    const facetIndices = facetVocabulary.map((name) =>
      facetValues.indexOf(name)
    );

    // reorder within each facet with call to this function
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
                ) as BoxplotData)
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
