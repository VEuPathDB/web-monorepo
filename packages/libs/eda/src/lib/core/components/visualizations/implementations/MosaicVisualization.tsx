// import MosaicControls from '@veupathdb/components/lib/components/plotControls/MosaicControls';
import Mosaic, {
  MosaicPlotProps,
} from '@veupathdb/components/lib/plots/MosaicPlot';
import {
  FacetedData,
  MosaicPlotData,
} from '@veupathdb/components/lib/types/plots';
import { ContingencyTable } from '@veupathdb/components/lib/components/ContingencyTable';
import * as t from 'io-ts';
import _ from 'lodash';
import DataClient, {
  ContTableResponse,
  MosaicRequestParams,
  TwoByTwoResponse,
} from '../../../api/DataClient';
import { useCallback, useMemo, useState } from 'react';
import { usePromise } from '../../../hooks/promise';
import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
import {
  useDataClient,
  useStudyMetadata,
  useFindEntityAndVariable,
  useStudyEntities,
} from '../../../hooks/workspace';
import { useFindOutputEntity } from '../../../hooks/findOutputEntity';
import { Filter } from '../../../types/filter';
import { VariableDescriptor } from '../../../types/variable';
import { CoverageStatistics } from '../../../types/visualization';
import { BirdsEyeView } from '../../BirdsEyeView';
import { VariableCoverageTable } from '../../VariableCoverageTable';
import { PlotLayout } from '../../layouts/PlotLayout';
import { InputVariables } from '../InputVariables';
import { OutputEntityTitle } from '../OutputEntityTitle';
import { VisualizationProps } from '../VisualizationTypes';
import TwoByTwoSVG from './selectorIcons/TwoByTwoSVG';
import RxCSVG from './selectorIcons/RxCSVG';
import { TabbedDisplay } from '@veupathdb/coreui';

// import axis label unit util
import { variableDisplayWithUnit } from '../../../utils/variable-display';
import {
  fixLabelForNumberVariables,
  fixLabelsForNumberVariables,
  quantizePvalue,
  vocabularyWithMissingData,
  variablesAreUnique,
  nonUniqueWarning,
} from '../../../utils/visualization';
import { VariablesByInputName } from '../../../utils/data-element-constraints';
import { Variable } from '../../../types/study';
import PluginError from '../PluginError';
import { isFaceted } from '@veupathdb/components/lib/types/guards';
import FacetedMosaicPlot from '@veupathdb/components/lib/plots/facetedPlots/FacetedMosaicPlot';
import { useVizConfig } from '../../../hooks/visualizations';
import { createVisualizationPlugin } from '../VisualizationPlugin';
import { LayoutOptions } from '../../layouts/types';

const plotContainerStyles = {
  width: 750,
  height: 450,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

const plotSpacingOptions = {};

const statsTableStyles = {
  width: plotContainerStyles.width,
};

const facetedStatsTableStyles = {};

const facetedStatsTableContainerStyles = {
  display: 'grid',
  gridAutoFlow: 'column',
  gridAutoColumns: 'max-content',
  alignItems: 'flex-start',
  width: '100%',
  overflow: 'auto',
  gap: '0.5em',
};

const modalPlotContainerStyles = {
  width: '85%',
  height: '100%',
  margin: 'auto',
};

type ContTableData = MosaicPlotData &
  Partial<{
    pValue: number | string;
    degreesFreedom: number;
    chisq: number;
  }>;

type TwoByTwoData = MosaicPlotData &
  Partial<{
    pValue: number | string;
    relativeRisk: number;
    rrInterval: string;
    oddsRatio: number;
    orInterval: string;
  }>;

type ContTableDataWithCoverage = (ContTableData | FacetedData<ContTableData>) &
  CoverageStatistics;
type TwoByTwoDataWithCoverage = (TwoByTwoData | FacetedData<TwoByTwoData>) &
  CoverageStatistics;

export const contTableVisualization = createVisualizationPlugin({
  selectorIcon: RxCSVG,
  fullscreenComponent: ContTableFullscreenComponent,
  createDefaultConfig: createDefaultConfig,
});

export const twoByTwoVisualization = createVisualizationPlugin({
  selectorIcon: TwoByTwoSVG,
  fullscreenComponent: TwoByTwoFullscreenComponent,
  createDefaultConfig: createDefaultConfig,
});

interface Options extends LayoutOptions {}

function ContTableFullscreenComponent(props: VisualizationProps<Options>) {
  return <MosaicViz {...props} />;
}

function TwoByTwoFullscreenComponent(props: VisualizationProps<Options>) {
  return <MosaicViz {...props} isTwoByTwo />;
}

function createDefaultConfig(): MosaicConfig {
  return {};
}

type MosaicConfig = t.TypeOf<typeof MosaicConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const MosaicConfig = t.partial({
  xAxisVariable: VariableDescriptor,
  yAxisVariable: VariableDescriptor,
  facetVariable: VariableDescriptor,
  showMissingness: t.boolean,
});

type Props<T> = VisualizationProps<T> & {
  isTwoByTwo?: boolean;
};

function MosaicViz(props: Props<Options>) {
  const {
    options,
    computation,
    visualization,
    updateThumbnail,
    updateConfiguration,
    filters,
    isTwoByTwo = false,
    dataElementConstraints,
    dataElementDependencyOrder,
    starredVariables,
    toggleStarredVariable,
    totalCounts,
    filteredCounts,
  } = props;
  const studyMetadata = useStudyMetadata();
  const { id: studyId } = studyMetadata;
  const entities = useStudyEntities();
  const dataClient: DataClient = useDataClient();

  // set default tab to Mosaic in TabbedDisplay component
  const [activeTab, setActiveTab] = useState('Mosaic');

  const [vizConfig, updateVizConfig] = useVizConfig(
    visualization.descriptor.configuration,
    MosaicConfig,
    createDefaultConfig,
    updateConfiguration
  );

  const handleInputVariableChange = useCallback(
    (selectedVariables: VariablesByInputName) => {
      const { xAxisVariable, yAxisVariable, facetVariable } = selectedVariables;

      updateVizConfig({
        xAxisVariable,
        yAxisVariable,
        facetVariable,
      });
    },
    [updateVizConfig]
  );

  // prettier-ignore
  // changed for consistency as now all other Vizs have this format
  const onChangeHandlerFactory = useCallback(
    < ValueType,>(key: keyof MosaicConfig, resetCheckedLegendItems?: boolean) => (newValue?: ValueType) => {
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

  const onShowMissingnessChange = onChangeHandlerFactory<boolean>(
    'showMissingness'
  );

  const findEntityAndVariable = useFindEntityAndVariable();

  const { xAxisVariable, yAxisVariable, facetVariable } = useMemo(() => {
    const xAxisVariable = findEntityAndVariable(vizConfig.xAxisVariable);
    const yAxisVariable = findEntityAndVariable(vizConfig.yAxisVariable);
    const facetVariable = findEntityAndVariable(vizConfig.facetVariable);

    return {
      xAxisVariable: xAxisVariable?.variable,
      yAxisVariable: yAxisVariable?.variable,
      facetVariable: facetVariable?.variable,
    };
  }, [
    findEntityAndVariable,
    vizConfig.xAxisVariable,
    vizConfig.yAxisVariable,
    vizConfig.facetVariable,
  ]);

  // outputEntity for OutputEntityTitle's outputEntity prop and outputEntityId at getRequestParams
  const outputEntity = useFindOutputEntity(
    dataElementDependencyOrder,
    vizConfig,
    'xAxisVariable'
  );

  const data = usePromise(
    useCallback(async (): Promise<
      TwoByTwoDataWithCoverage | ContTableDataWithCoverage | undefined
    > => {
      if (
        vizConfig.xAxisVariable == null ||
        xAxisVariable == null ||
        vizConfig.yAxisVariable == null ||
        yAxisVariable == null
      )
        return undefined;

      if (!variablesAreUnique([xAxisVariable, yAxisVariable, facetVariable]))
        throw new Error(nonUniqueWarning);

      const params = getRequestParams(
        studyId,
        filters ?? [],
        vizConfig.xAxisVariable,
        vizConfig.yAxisVariable,
        outputEntity?.id ?? '',
        vizConfig.facetVariable,
        vizConfig.showMissingness
      );

      const xAxisVocabulary = fixLabelsForNumberVariables(
        xAxisVariable.vocabulary,
        xAxisVariable
      );
      const yAxisVocabulary = fixLabelsForNumberVariables(
        yAxisVariable.vocabulary,
        yAxisVariable
      );
      const facetVocabulary = fixLabelsForNumberVariables(
        facetVariable?.vocabulary,
        facetVariable
      );

      if (isTwoByTwo) {
        const response = dataClient.getTwoByTwo(
          computation.descriptor.type,
          params
        );

        return reorderData(
          twoByTwoResponseToData(
            await response,
            xAxisVariable,
            yAxisVariable,
            facetVariable
          ),
          xAxisVocabulary,
          yAxisVocabulary,
          vocabularyWithMissingData(facetVocabulary, vizConfig.showMissingness)
        ) as TwoByTwoDataWithCoverage;
      } else {
        const response = dataClient.getContTable(
          computation.descriptor.type,
          params
        );

        return reorderData(
          contTableResponseToData(
            await response,
            xAxisVariable,
            yAxisVariable,
            facetVariable
          ),
          xAxisVocabulary,
          yAxisVocabulary,
          vocabularyWithMissingData(facetVocabulary, vizConfig.showMissingness)
        ) as ContTableDataWithCoverage;
      }
    }, [
      studyId,
      filters,
      dataClient,
      vizConfig,
      xAxisVariable,
      yAxisVariable,
      facetVariable,
      computation.descriptor.type,
      isTwoByTwo,
      outputEntity?.id,
    ])
  );

  const xAxisLabel = variableDisplayWithUnit(xAxisVariable);
  const yAxisLabel = variableDisplayWithUnit(yAxisVariable);

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
        stratificationIsActive={facetVariable != null}
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
            role: 'Facet',
            display: variableDisplayWithUnit(facetVariable),
            variable: vizConfig.facetVariable,
          },
        ]}
      />
    </>
  );

  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    plotContainerStyles,
    [data]
  );

  const mosaicProps: MosaicPlotProps = {
    containerStyles: !isFaceted(data.value) ? plotContainerStyles : undefined,
    spacingOptions: !isFaceted(data.value) ? plotSpacingOptions : undefined,
    independentAxisLabel: xAxisLabel ?? 'X-axis',
    dependentAxisLabel: yAxisLabel ?? 'Y-axis',
    displayLegend: false,
    interactive: !isFaceted(data.value) ? true : false,
    showSpinner: data.pending,
    displayLibraryControls: false,
  };

  const plotNode = (
    <TabbedDisplay
      themeRole="primary"
      onTabSelected={(selectedTabKey: string) => {
        if (activeTab !== selectedTabKey) setActiveTab(selectedTabKey);
      }}
      activeTab={activeTab}
      tabs={[
        {
          key: 'Mosaic',
          displayName: 'Mosaic',
          content: (
            <div style={{ marginTop: 15 }}>
              {isFaceted<ContTableData | TwoByTwoData>(data.value) ? (
                <FacetedMosaicPlot
                  facetedPlotRef={plotRef}
                  data={data.value}
                  componentProps={mosaicProps}
                  modalComponentProps={{
                    ...mosaicProps,
                    containerStyles: modalPlotContainerStyles,
                  }}
                />
              ) : (
                <Mosaic {...mosaicProps} ref={plotRef} data={data.value} />
              )}
            </div>
          ),
        },
        {
          key: 'Table',
          displayName: 'Table',
          content: (
            <div style={{ marginTop: 15 }}>
              <ContingencyTable
                data={data.pending ? undefined : data.value}
                tableContainerStyles={
                  isFaceted(data.value)
                    ? facetedStatsTableStyles
                    : statsTableStyles
                }
                facetedContainerStyles={facetedStatsTableContainerStyles}
                independentVariable={xAxisLabel ?? 'X-axis'}
                dependentVariable={yAxisLabel ?? 'Y-axis'}
                facetVariable={
                  facetVariable ? facetVariable.displayName : 'Facet'
                }
                enableSpinner={data.pending}
              />
            </div>
          ),
        },
        {
          key: 'Statistics',
          displayName: 'Statistics',
          content: isFaceted(data.value)
            ? vizConfig.showMissingness
              ? 'Statistics are not calculated when the "include no data" option is selected'
              : facetVariable != null && (
                  <div
                    style={{
                      ...facetedStatsTableContainerStyles,
                      marginTop: 15,
                    }}
                  >
                    {data.value.facets.map(({ label, data }, index) => (
                      <table key={index}>
                        <tbody>
                          <tr>
                            <th
                              style={{
                                border: 'none' /* cancel WDK style! */,
                              }}
                            >
                              {facetVariable.displayName}: {label}
                            </th>
                          </tr>
                          <tr>
                            <td>
                              {' '}
                              {isTwoByTwo
                                ? TwoByTwoStats(
                                    data as TwoByTwoData | undefined
                                  )
                                : ContTableStats(
                                    data as ContTableData | undefined
                                  )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    ))}
                  </div>
                )
            : isTwoByTwo
            ? TwoByTwoStats(data.value as TwoByTwoData | undefined)
            : ContTableStats(data.value as ContTableData | undefined),
        },
      ]}
    />
  );

  const controlsNode = <>{/* controls would go here */}</>;

  const outputSize =
    facetVariable != null && !vizConfig.showMissingness
      ? data.value?.completeCasesAllVars
      : data.value?.completeCasesAxesVars;

  const areRequiredInputsSelected = useMemo(() => {
    if (!dataElementConstraints) return false;
    return Object.entries(dataElementConstraints[0])
      .filter((variable) => variable[1].isRequired)
      .every((reqdVar) => !!(vizConfig as any)[reqdVar[0]]);
  }, [
    dataElementConstraints,
    vizConfig.xAxisVariable,
    vizConfig.yAxisVariable,
  ]);

  const LayoutComponent = options?.layoutComponent ?? PlotLayout;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
        <InputVariables
          inputs={[
            {
              name: 'xAxisVariable',
              label: 'X-axis',
              role: 'axis',
            },
            {
              name: 'yAxisVariable',
              label: 'Y-axis',
              role: 'axis',
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
          ]}
          entities={entities}
          selectedVariables={{
            xAxisVariable: vizConfig.xAxisVariable,
            yAxisVariable: vizConfig.yAxisVariable,
            facetVariable: vizConfig.facetVariable,
          }}
          onChange={handleInputVariableChange}
          constraints={dataElementConstraints}
          dataElementDependencyOrder={dataElementDependencyOrder}
          starredVariables={starredVariables}
          toggleStarredVariable={toggleStarredVariable}
          enableShowMissingnessToggle={
            facetVariable != null &&
            data.value?.completeCasesAllVars !==
              data.value?.completeCasesAxesVars
          }
          showMissingness={vizConfig.showMissingness}
          // this can be used to show and hide no data control
          onShowMissingnessChange={
            computation.descriptor.type === 'pass'
              ? onShowMissingnessChange
              : undefined
          }
          outputEntity={outputEntity}
        />
      </div>

      <PluginError error={data.error} outputSize={outputSize} />
      <OutputEntityTitle entity={outputEntity} outputSize={outputSize} />
      <LayoutComponent
        isFaceted={isFaceted(data.value)}
        plotNode={plotNode}
        controlsNode={controlsNode}
        tableGroupNode={tableGroupNode}
        showRequiredInputsPrompt={!areRequiredInputsSelected}
        isMosaicPlot={true}
      />
    </div>
  );
}

function TwoByTwoStats(props?: {
  pValue?: number | string;
  oddsRatio?: number | string;
  orInterval?: number | string;
  relativeRisk?: number | string;
  rrInterval?: number | string;
}) {
  // Temporarily disabled---See https://github.com/VEuPathDB/web-eda/issues/463
  if (1) return <i>Stats table coming soon!</i>;

  return props != null ? (
    <div className="MosaicVisualization-StatsTable" style={{ marginTop: 15 }}>
      <table>
        {' '}
        <tbody>
          <tr>
            <th></th>
            <th className="numeric-header">Value</th>
            <th className="numeric-header">95% confidence interval</th>
          </tr>
          <tr>
            <th>P-value</th>
            <td className="numeric">
              {props.pValue != null ? quantizePvalue(props.pValue) : 'N/A'}
            </td>
            <td className="numeric">N/A</td>
          </tr>
          <tr>
            <th>Odds ratio</th>
            <td className="numeric">{props.oddsRatio ?? 'N/A'}</td>
            <td className="numeric">{props.orInterval ?? 'N/A'}</td>
          </tr>
          <tr>
            <th>Relative risk</th>
            <td className="numeric">{props.relativeRisk ?? 'N/A'}</td>
            <td className="numeric">{props.rrInterval ?? 'N/A'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  ) : null;
}

function ContTableStats(props?: {
  pValue?: number | string;
  degreesFreedom?: number | string;
  chisq?: number | string;
}) {
  return props != null ? (
    <div className="MosaicVisualization-StatsTable" style={{ marginTop: 15 }}>
      <table>
        <tbody>
          <tr>
            <th>P-value</th>
            <td className="numeric">
              {props.pValue != null ? quantizePvalue(props.pValue) : 'N/A'}
            </td>
          </tr>
          <tr>
            <th>Degrees of freedom</th>
            <td className="numeric">{props.degreesFreedom ?? 'N/A'}</td>
          </tr>
          <tr>
            <th>Chi-squared</th>
            <td className="numeric">{props.chisq ?? 'N/A'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  ) : null;
}

/**
 * Reformat response from mosaic endpoints into complete MosaicData
 * @param response
 * @returns MosaicData
 */
export function contTableResponseToData(
  response: ContTableResponse,
  xVariable: Variable,
  yVariable: Variable,
  facetVariable?: Variable
): ContTableDataWithCoverage {
  const facetGroupedResponseData = _.groupBy(response.mosaic.data, (data) =>
    data.facetVariableDetails && data.facetVariableDetails.length === 1
      ? fixLabelForNumberVariables(
          data.facetVariableDetails[0].value,
          facetVariable
        )
      : '__NO_FACET__'
  );
  const facetGroupedResponseStats = _.groupBy(response.statsTable, (stats) =>
    stats.facetVariableDetails && stats.facetVariableDetails.length === 1
      ? fixLabelForNumberVariables(
          stats.facetVariableDetails[0].value,
          facetVariable
        )
      : '__NO_FACET__'
  );

  const processedData = _.mapValues(
    facetGroupedResponseData,
    (group, facetKey) => {
      const stats = facetGroupedResponseStats[facetKey];
      if (group.length !== 1 && stats.length !== 1)
        throw Error(
          `Expected exactly one set of data and stats per (optional) facet variable value, but didn't.`
        );

      return {
        values: _.unzip(group[0].value), // Transpose data table to match mosaic component expectations
        independentLabels: fixLabelsForNumberVariables(
          group[0].xLabel,
          xVariable
        ),
        dependentLabels: fixLabelsForNumberVariables(
          group[0].yLabel[0],
          yVariable
        ),
        ...(stats != null
          ? {
              pValue: stats[0].pvalue,
              degreesFreedom: stats[0].degreesFreedom,
              chisq: stats[0].chisq,
            }
          : {}),
      };
    }
  );

  return {
    // data
    ...(_.size(processedData) === 1 &&
    _.head(_.keys(processedData)) === '__NO_FACET__'
      ? // unfaceted
        _.head(_.values(processedData))
      : // faceted
        {
          facets: _.map(processedData, (value, key) => ({
            label: key,
            data: value,
          })),
        }),

    // CoverageStatistics
    completeCases: response.completeCasesTable,
    completeCasesAllVars: response.mosaic.config.completeCasesAllVars,
    completeCasesAxesVars: response.mosaic.config.completeCasesAxesVars,
  } as ContTableDataWithCoverage;
}

/**
 * Reformat response from mosaic endpoints into complete MosaicData
 * @param response
 * @returns MosaicData
 */
export function twoByTwoResponseToData(
  response: TwoByTwoResponse,
  xVariable: Variable,
  yVariable: Variable,
  facetVariable?: Variable
): TwoByTwoDataWithCoverage {
  const facetGroupedResponseData = _.groupBy(response.mosaic.data, (data) =>
    data.facetVariableDetails && data.facetVariableDetails.length === 1
      ? fixLabelForNumberVariables(
          data.facetVariableDetails[0].value,
          facetVariable
        )
      : '__NO_FACET__'
  );
  const facetGroupedResponseStats = _.groupBy(response.statsTable, (stats) =>
    stats.facetVariableDetails && stats.facetVariableDetails.length === 1
      ? fixLabelForNumberVariables(
          stats.facetVariableDetails[0].value,
          facetVariable
        )
      : '__NO_FACET__'
  );

  const processedData = _.mapValues(
    facetGroupedResponseData,
    (group, facetKey) => {
      const stats = facetGroupedResponseStats[facetKey];
      if (group.length !== 1 && stats.length !== 1)
        throw Error(
          `Expected exactly one set of data and stats per (optional) facet variable value, but didn't.`
        );

      return {
        values: _.unzip(group[0].value), // Transpose data table to match mosaic component expectations
        independentLabels: fixLabelsForNumberVariables(
          group[0].xLabel,
          xVariable
        ),
        dependentLabels: fixLabelsForNumberVariables(
          group[0].yLabel[0],
          yVariable
        ),
        ...(stats != null
          ? {
              pValue: stats[0].pvalue,
              relativeRisk: stats[0].relativerisk,
              rrInterval: stats[0].rrInterval,
              oddsRatio: stats[0].oddsratio,
              orInterval: stats[0].orInterval,
            }
          : {}),
      };
    }
  );

  return {
    // data
    ...(_.size(processedData) === 1 &&
    _.head(_.keys(processedData)) === '__NO_FACET__'
      ? // unfaceted
        _.head(_.values(processedData))
      : // faceted
        {
          facets: _.map(processedData, (value, key) => ({
            label: key,
            data: value,
          })),
        }),

    // CoverageStatistics
    completeCases: response.completeCasesTable,
    completeCasesAllVars: response.mosaic.config.completeCasesAllVars,
    completeCasesAxesVars: response.mosaic.config.completeCasesAxesVars,
  } as TwoByTwoDataWithCoverage;
}

function getRequestParams(
  studyId: string,
  filters: Filter[],
  xAxisVariable: VariableDescriptor,
  yAxisVariable: VariableDescriptor,
  outputEntityId: string,
  facetVariable?: VariableDescriptor,
  showMissingness?: boolean
): MosaicRequestParams {
  return {
    studyId,
    filters,
    config: {
      // add outputEntityId
      outputEntityId: outputEntityId,
      xAxisVariable: xAxisVariable,
      yAxisVariable: yAxisVariable,
      facetVariable: facetVariable ? [facetVariable] : [],
      showMissingness:
        facetVariable != null && showMissingness ? 'TRUE' : 'FALSE',
    },
  };
}

function reorderData(
  data:
    | TwoByTwoDataWithCoverage
    | TwoByTwoData
    | ContTableDataWithCoverage
    | ContTableData,
  xVocabulary: string[] = [],
  yVocabulary: string[] = [],
  facetVocabulary: string[] = []
):
  | TwoByTwoDataWithCoverage
  | TwoByTwoData
  | ContTableDataWithCoverage
  | ContTableData {
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
              ? (reorderData(facetData, xVocabulary, yVocabulary) as
                  | TwoByTwoData
                  | ContTableData)
              : undefined,
        };
      }),
    };
  }

  const xIndices =
    xVocabulary.length > 0
      ? indicesForCorrectOrder(data.independentLabels, xVocabulary)
      : Array.from(data.independentLabels.keys()); // [0,1,2,3,...] - effectively a no-op

  const yIndices =
    yVocabulary.length > 0
      ? indicesForCorrectOrder(data.dependentLabels, yVocabulary)
      : Array.from(data.dependentLabels.keys());

  return {
    ...data,
    values: _.at(
      data.values.map((innerDim) =>
        _.at(innerDim, xIndices).map((i) => i ?? 0)
      ),
      yIndices
    ).map((j) => j ?? xIndices.map((_) => 0)), // fill in with an entire row/column of zeroes
    independentLabels: xVocabulary,
    dependentLabels: yVocabulary,
  };
}

/**
 * given an array of `labels` [ 'cat', 'dog', 'mouse' ]
 * and an array of the desired `order` [ 'mouse', 'rat', 'cat', 'dog' ]
 * return the `indices` of the labels that would put them in the right order,
 * with -1 for labels that are missing from `labels`
 * e.g. [ 2, -1, 0, 1 ]
 * you can use `_.at(someOtherArray, indices).map((x) => x ?? 0)` to reorder other arrays with
 * this and put zeros for missing values.
 *
 */
function indicesForCorrectOrder(labels: string[], order: string[]): number[] {
  return order.map((label) => labels.indexOf(label));
}
