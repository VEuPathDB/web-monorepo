// load Barplot component
import Barplot, { BarplotProps } from '@veupathdb/components/lib/plots/Barplot';
import FacetedPlot from '@veupathdb/components/lib/plots/FacetedPlot';
import {
  BarplotData,
  BarplotDataSeries,
  FacetedData,
} from '@veupathdb/components/lib/types/plots';
import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import Switch from '@veupathdb/components/lib/components/widgets/Switch';

import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { useCallback, useMemo } from 'react';
import PluginError from '../PluginError';

// need to set for Barplot
import DataClient, {
  BarplotResponse,
  BarplotRequestParams,
} from '../../../api/DataClient';

import { usePromise } from '../../../hooks/promise';
import { useFindEntityAndVariable } from '../../../hooks/study';
import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { Filter } from '../../../types/filter';
import { Variable } from '../../../types/study';
import { VariableDescriptor } from '../../../types/variable';

import { VariableCoverageTable } from '../../VariableCoverageTable';
import { CoverageStatistics } from '../../../types/visualization';
import { BirdsEyeView } from '../../BirdsEyeView';
import { PlotLayout } from '../../layouts/PlotLayout';

import { InputVariables } from '../InputVariables';
import { OutputEntityTitle } from '../OutputEntityTitle';
import { VisualizationProps, VisualizationType } from '../VisualizationTypes';

import bar from './selectorIcons/bar.svg';
// import axis label unit util
import { axisLabelWithUnit } from '../../../utils/axis-label-unit';
import {
  fixLabelForNumberVariables,
  fixLabelsForNumberVariables,
  grayOutLastSeries,
  omitEmptyNoDataSeries,
  vocabularyWithMissingData,
  variablesAreUnique,
  nonUniqueWarning,
} from '../../../utils/visualization';
import { VariablesByInputName } from '../../../utils/data-element-constraints';
// use lodash instead of Math.min/max
import { max, groupBy, mapValues, size, map, head, values, keys } from 'lodash';
import { isFaceted } from '@veupathdb/components/lib/types/guards';
// for custom legend
import PlotLegend, {
  LegendItemsProps,
} from '@veupathdb/components/lib/components/plotControls/PlotLegend';
// import { gray } from '../colors';
import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots/addOns';

type BarplotDataWithStatistics = (BarplotData | FacetedData<BarplotData>) &
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
  marginRight: 10,
  marginLeft: 10,
  marginBotton: 10,
  marginTop: 50,
};

export const barplotVisualization: VisualizationType = {
  selectorComponent: SelectorComponent,
  fullscreenComponent: FullscreenComponent,
  createDefaultConfig: createDefaultConfig,
};

function SelectorComponent() {
  return (
    <img alt="Bar plot" style={{ height: '100%', width: '100%' }} src={bar} />
  );
}

function FullscreenComponent(props: VisualizationProps) {
  return <BarplotViz {...props} />;
}

function createDefaultConfig(): BarplotConfig {
  return {
    dependentAxisLogScale: false,
    valueSpec: 'count',
  };
}

type ValueSpec = t.TypeOf<typeof ValueSpec>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const ValueSpec = t.keyof({ count: null, proportion: null });

type BarplotConfig = t.TypeOf<typeof BarplotConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const BarplotConfig = t.intersection([
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
  }),
]);

function BarplotViz(props: VisualizationProps) {
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
      BarplotConfig.decode(visualization.descriptor.configuration),
      getOrElse((): t.TypeOf<typeof BarplotConfig> => createDefaultConfig())
    );
  }, [visualization.descriptor.configuration]);

  const updateVizConfig = useCallback(
    (newConfig: Partial<BarplotConfig>) => {
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
      updateVizConfig({
        xAxisVariable,
        overlayVariable,
        facetVariable,
        // set undefined for variable change
        checkedLegendItems: undefined,
      });
    },
    [updateVizConfig]
  );

  // prettier-ignore
  const onChangeHandlerFactory = useCallback(
    < ValueType,>(key: keyof BarplotConfig) => (newValue?: ValueType) => {
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

  // for custom legend: vizconfig.checkedLegendItems
  const onCheckedLegendItemsChange = onChangeHandlerFactory<string[]>(
    'checkedLegendItems'
  );

  const findEntityAndVariable = useFindEntityAndVariable(entities);
  const { variable, entity, overlayVariable, facetVariable } = useMemo(() => {
    const xAxisVariable = findEntityAndVariable(vizConfig.xAxisVariable);
    const overlayVariable = findEntityAndVariable(vizConfig.overlayVariable);
    const facetVariable = findEntityAndVariable(vizConfig.facetVariable);
    return {
      variable: xAxisVariable?.variable,
      entity: xAxisVariable?.entity,
      overlayVariable: overlayVariable?.variable,
      facetVariable: facetVariable?.variable,
    };
  }, [
    findEntityAndVariable,
    vizConfig.xAxisVariable,
    vizConfig.overlayVariable,
    vizConfig.facetVariable,
  ]);

  const data = usePromise(
    useCallback(async (): Promise<BarplotDataWithStatistics | undefined> => {
      if (variable == null) return undefined;

      if (!variablesAreUnique([variable, overlayVariable, facetVariable]))
        throw new Error(nonUniqueWarning);

      const params = getRequestParams(studyId, filters ?? [], vizConfig);

      const response = dataClient.getBarplot(
        computation.descriptor.type,
        params as BarplotRequestParams
      );

      const showMissing =
        vizConfig.showMissingness &&
        (overlayVariable != null || facetVariable != null);
      const showMissingOverlay =
        vizConfig.showMissingness && overlayVariable != null;
      const vocabulary = fixLabelsForNumberVariables(
        variable?.vocabulary,
        variable
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
            barplotResponseToData(
              await response,
              variable,
              overlayVariable,
              facetVariable
            ),
            vocabulary,
            vocabularyWithMissingData(overlayVocabulary, showMissing),
            vocabularyWithMissingData(facetVocabulary, showMissing)
          ),
          showMissingOverlay
        ),
        showMissing
      );
    }, [
      // using vizConfig only causes issue with onCheckedLegendItemsChange
      studyId,
      filters,
      dataClient,
      vizConfig.xAxisVariable,
      vizConfig.overlayVariable,
      vizConfig.facetVariable,
      vizConfig.valueSpec,
      vizConfig.showMissingness,
      variable,
      overlayVariable,
      computation.descriptor.type,
    ])
  );

  const outputSize =
    (overlayVariable != null || facetVariable != null) &&
    !vizConfig.showMissingness
      ? data.value?.completeCasesAllVars
      : data.value?.completeCasesAxesVars;

  // find dependent axis max value
  const defaultDependentMaxValue = useMemo(() => {
    if (isFaceted(data?.value)) {
      return data?.value?.facets != null
        ? max(
            data.value.facets
              .filter((facet) => facet.data != null)
              .flatMap((facet) => facet.data?.series.flatMap((o) => o.value))
          )
        : undefined;
    } else {
      return data?.value?.series != null
        ? max(data.value.series.flatMap((o) => o.value))
        : undefined;
    }
  }, [data]);

  // set min/max
  const dependentAxisRange =
    defaultDependentMaxValue != null
      ? {
          // set min as 0 (count, proportion) or 0.001 (proportion log scale)
          min:
            vizConfig.valueSpec === 'count'
              ? vizConfig.dependentAxisLogScale
                ? 0.1
                : 0
              : vizConfig.dependentAxisLogScale
              ? 0.001
              : 0,
          // add 5 % margin
          max: defaultDependentMaxValue * 1.05,
        }
      : undefined;

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
                    return el.data?.series[index].value.some(
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

  // set checkedLegendItems
  const checkedLegendItems = useMemo(() => {
    return (
      vizConfig.checkedLegendItems ?? legendItems.map((item) => item.label)
    );
  }, [vizConfig.checkedLegendItems, legendItems]);

  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    plotContainerStyles,
    [data, vizConfig.checkedLegendItems]
  );

  // these props are passed to either a single plot
  // or by FacetedPlot to each individual facet plot (where some will be overridden)
  const plotProps: BarplotProps = {
    containerStyles: isFaceted(data.value)
      ? facetedPlotContainerStyles
      : plotContainerStyles,
    spacingOptions: isFaceted(data.value)
      ? facetedPlotSpacingOptions
      : plotSpacingOptions,
    orientation: 'vertical',
    barLayout: 'group',
    displayLegend: false,
    independentAxisLabel: axisLabelWithUnit(variable) ?? 'Main',
    dependentAxisLabel:
      vizConfig.valueSpec === 'count' ? 'Count' : 'Proportion',
    legendTitle: overlayVariable?.displayName,
    interactive: true,
    showSpinner: data.pending,
    dependentAxisLogScale: vizConfig.dependentAxisLogScale,
    // set dependent axis range for log scale
    dependentAxisRange: dependentAxisRange,
    displayLibraryControls: false,
  };

  const plotNode = (
    <>
      {isFaceted(data.value) ? (
        <FacetedPlot
          component={Barplot}
          data={data.value}
          props={plotProps}
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

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <LabelledGroup label="Y-axis">
          <Switch
            label="Log Scale:"
            state={vizConfig.dependentAxisLogScale}
            onStateChange={onDependentAxisLogScaleChange}
          />
          <RadioButtonGroup
            selectedOption={vizConfig.valueSpec}
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
      </div>
    </>
  );

  const legendNode = legendItems != null && !data.pending && data != null && (
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
        outputEntity={entity}
        stratificationIsActive={overlayVariable != null}
        enableSpinner={vizConfig.xAxisVariable != null && !data.error}
        totalCounts={totalCounts}
        filteredCounts={filteredCounts}
      />
      <VariableCoverageTable
        completeCases={data.pending ? undefined : data.value?.completeCases}
        filters={filters}
        outputEntityId={vizConfig.xAxisVariable?.entityId}
        variableSpecs={[
          {
            role: 'Main',
            required: true,
            display: axisLabelWithUnit(variable),
            variable: vizConfig.xAxisVariable,
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
              label: 'Main',
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
            overlayVariable: vizConfig.overlayVariable,
            facetVariable: vizConfig.facetVariable,
          }}
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
          onShowMissingnessChange={onShowMissingnessChange}
          showMissingness={vizConfig.showMissingness}
          outputEntity={entity}
        />
      </div>

      <PluginError error={data.error} outputSize={outputSize} />
      <OutputEntityTitle entity={entity} outputSize={outputSize} />
      <PlotLayout
        isFaceted={isFaceted(data.value)}
        plotNode={plotNode}
        legendNode={legendNode}
        tableGroupNode={tableGroupNode}
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

function getRequestParams(
  studyId: string,
  filters: Filter[],
  vizConfig: BarplotConfig
): BarplotRequestParams {
  return {
    studyId,
    filters,
    config: {
      // is outputEntityId correct?
      outputEntityId: vizConfig.xAxisVariable!.entityId,
      xAxisVariable: vizConfig.xAxisVariable!,
      overlayVariable: vizConfig.overlayVariable,
      facetVariable: vizConfig.facetVariable ? [vizConfig.facetVariable] : [],
      // valueSpec: manually inputted for now
      valueSpec: vizConfig.valueSpec,
      barMode: 'group', // or 'stack'
      showMissingness: vizConfig.showMissingness ? 'TRUE' : 'FALSE',
    },
  } as BarplotRequestParams;
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
