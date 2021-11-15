// import MosaicControls from '@veupathdb/components/lib/components/plotControls/MosaicControls';
import Mosaic, {
  MosaicPlotProps as MosaicProps,
  EmptyMosaicData,
} from '@veupathdb/components/lib/plots/MosaicPlot';
import { FacetedData, MosaicData } from '@veupathdb/components/lib/types/plots';
import { ContingencyTable } from '@veupathdb/components/lib/components/ContingencyTable';
// import { ErrorManagement } from '@veupathdb/components/lib/types/general';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import _ from 'lodash';
import DataClient, {
  ContTableResponse,
  MosaicRequestParams,
  TwoByTwoResponse,
} from '../../../api/DataClient';
import { useCallback, useMemo } from 'react';
import { usePromise } from '../../../hooks/promise';
import { useFindEntityAndVariable } from '../../../hooks/study';
import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { useFindOutputEntity } from '../../../hooks/findOutputEntity';
import { Filter } from '../../../types/filter';
import { VariableDescriptor } from '../../../types/variable';
import { CoverageStatistics } from '../../../types/visualization';
import { BirdsEyeView } from '../../BirdsEyeView';
import { VariableCoverageTable } from '../../VariableCoverageTable';
import { InputVariables } from '../InputVariables';
import { OutputEntityTitle } from '../OutputEntityTitle';
import { VisualizationProps, VisualizationType } from '../VisualizationTypes';
import rxc from './selectorIcons/RxC.svg';
import twoxtwo from './selectorIcons/2x2.svg';
import TabbedDisplay from '@veupathdb/core-components/dist/components/grids/TabbedDisplay';
// import axis label unit util
import { axisLabelWithUnit } from '../../../utils/axis-label-unit';
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
import FacetedPlot from '@veupathdb/components/lib/plots/FacetedPlot';

const plotContainerStyles = {
  width: 750,
  height: 450,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

const facetedPlotContainerStyles = {
  width: plotContainerStyles.width / 1.45,
  height: plotContainerStyles.height / 1.25,
};

const plotSpacingOptions = {};

const facetedPlotSpacingOptions = {
  marginRight: 15,
  marginLeft: 15,
  marginBotton: 10,
  marginTop: 50,
};

type ContTableData = MosaicData &
  Partial<{
    pValue: number | string;
    degreesFreedom: number;
    chisq: number;
  }>;

type TwoByTwoData = MosaicData &
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

export const contTableVisualization: VisualizationType = {
  selectorComponent: ContTableSelectorComponent,
  fullscreenComponent: ContTableFullscreenComponent,
  createDefaultConfig: createDefaultConfig,
};

export const twoByTwoVisualization: VisualizationType = {
  selectorComponent: TwoByTwoSelectorComponent,
  fullscreenComponent: TwoByTwoFullscreenComponent,
  createDefaultConfig: createDefaultConfig,
};

function ContTableSelectorComponent() {
  return (
    <img
      alt="RxC contingency table"
      style={{ height: '100%', width: '100%' }}
      src={rxc}
    />
  );
}

function ContTableFullscreenComponent(props: VisualizationProps) {
  return <MosaicViz {...props} />;
}

function TwoByTwoSelectorComponent() {
  return (
    <img
      alt="2x2 contingency table"
      style={{ height: '100%', width: '100%' }}
      src={twoxtwo}
    />
  );
}

function TwoByTwoFullscreenComponent(props: VisualizationProps) {
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

type Props = VisualizationProps & {
  isTwoByTwo?: boolean;
};

function MosaicViz(props: Props) {
  const {
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
      MosaicConfig.decode(visualization.descriptor.configuration),
      getOrElse((): t.TypeOf<typeof MosaicConfig> => createDefaultConfig())
    );
  }, [visualization.descriptor.configuration]);

  const updateVizConfig = useCallback(
    (newConfig: Partial<MosaicConfig>) => {
      updateConfiguration({ ...vizConfig, ...newConfig });
    },
    [updateConfiguration, vizConfig]
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
  const onChangeHandlerFactory = useCallback(
    < ValueType,>(key: keyof MosaicConfig) => (newValue?: ValueType) => {
      updateVizConfig({
        [key]: newValue,
      });
    },
    [updateVizConfig]
  );

  const onShowMissingnessChange = onChangeHandlerFactory<boolean>(
    'showMissingness'
  );

  const findEntityAndVariable = useFindEntityAndVariable(entities);

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
    'xAxisVariable',
    entities
  );

  const data = usePromise(
    useCallback(async (): Promise<
      ContTableDataWithCoverage | TwoByTwoDataWithCoverage | undefined
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

  const xAxisLabel = axisLabelWithUnit(xAxisVariable);
  const yAxisLabel = axisLabelWithUnit(yAxisVariable);

  const plotComponent = (
    <div className="MosaicVisualization">
      <div className="MosaicVisualization-Plot">
        <TabbedDisplay
          tabs={[
            {
              displayName: 'Mosaic',
              content: (
                <MosaicPlotWithControls
                  updateThumbnail={updateThumbnail}
                  data={data.value}
                  containerStyles={
                    isFaceted(data.value)
                      ? facetedPlotContainerStyles
                      : plotContainerStyles
                  }
                  spacingOptions={
                    isFaceted(data.value)
                      ? facetedPlotSpacingOptions
                      : plotSpacingOptions
                  }
                  independentAxisLabel={xAxisLabel ?? 'X-axis'}
                  dependentAxisLabel={yAxisLabel ?? 'Y-axis'}
                  displayLegend={true}
                  interactive
                  showSpinner={data.pending}
                />
              ),
            },
            {
              displayName: 'Table',
              content: (
                <ContingencyTable
                  data={data.pending ? undefined : data.value}
                  containerStyles={{ width: plotContainerStyles.width }}
                  independentVariable={xAxisLabel ?? 'X-axis'}
                  dependentVariable={yAxisLabel ?? 'Y-axis'}
                  facetVariable={
                    facetVariable ? facetVariable.displayName : 'Facet'
                  }
                  enableSpinner={data.pending}
                />
              ),
            },
            {
              displayName: 'Statistics',
              content: isFaceted(data.value) ? (
                vizConfig.showMissingness ? (
                  'Statistics are not calculated when the "include no data" option is selected'
                ) : (
                  <table>
                    <tbody>
                      {facetVariable != null &&
                        data.value.facets.map(({ label, data }) => (
                          <>
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
                          </>
                        ))}
                    </tbody>
                  </table>
                )
              ) : isTwoByTwo ? (
                TwoByTwoStats(data.value as TwoByTwoData | undefined)
              ) : (
                ContTableStats(data.value as ContTableData | undefined)
              ),
            },
          ]}
        />
      </div>
      <div className="viz-plot-info">
        <BirdsEyeView
          completeCasesAllVars={
            data.pending ? undefined : data.value?.completeCasesAllVars
          }
          completeCasesAxesVars={
            data.pending ? undefined : data.value?.completeCasesAxesVars
          }
          filters={filters}
          outputEntity={outputEntity}
          stratificationIsActive={facetVariable != null}
          enableSpinner={
            xAxisVariable != null && yAxisVariable != null && !data.error
          }
        />
        <VariableCoverageTable
          completeCases={data.pending ? undefined : data.value?.completeCases}
          filters={filters}
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
              role: 'Facet',
              display: axisLabelWithUnit(facetVariable),
              variable: vizConfig.facetVariable,
            },
          ]}
        />
      </div>
    </div>
  );

  const outputSize =
    facetVariable != null && !vizConfig.showMissingness
      ? data.value?.completeCasesAllVars
      : data.value?.completeCasesAxesVars;

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
              name: 'facetVariable',
              label: 'Facet',
              role: 'stratification',
            },
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
          onShowMissingnessChange={onShowMissingnessChange}
          outputEntity={outputEntity}
        />
      </div>

      <PluginError error={data.error} outputSize={outputSize} />
      <OutputEntityTitle entity={outputEntity} outputSize={outputSize} />
      {plotComponent}
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
    <div className="MosaicVisualization-StatsTable">
      <table>
        {' '}
        <tbody>
          <tr>
            <th></th>
            <th>Value</th>
            <th>95% confidence interval</th>
          </tr>
          <tr>
            <th>P-value</th>
            <td>
              {props.pValue != null ? quantizePvalue(props.pValue) : 'N/A'}
            </td>
            <td>N/A</td>
          </tr>
          <tr>
            <th>Odds ratio</th>
            <td>{props.oddsRatio ?? 'N/A'}</td>
            <td>{props.orInterval ?? 'N/A'}</td>
          </tr>
          <tr>
            <th>Relative risk</th>
            <td>{props.relativeRisk ?? 'N/A'}</td>
            <td>{props.rrInterval ?? 'N/A'}</td>
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
    <div className="MosaicVisualization-StatsTable">
      <table>
        <tbody>
          <tr>
            <th>P-value</th>
            <td>
              {props.pValue != null ? quantizePvalue(props.pValue) : 'N/A'}
            </td>
          </tr>
          <tr>
            <th>Degrees of freedom</th>
            <td>{props.degreesFreedom ?? 'N/A'}</td>
          </tr>
          <tr>
            <th>Chi-squared</th>
            <td>{props.chisq ?? 'N/A'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  ) : null;
}

interface MosaicPlotWithControlsProps extends Omit<MosaicProps, 'data'> {
  data?:
    | TwoByTwoDataWithCoverage
    | TwoByTwoData
    | ContTableDataWithCoverage
    | ContTableData;
  updateThumbnail: (src: string) => void;
}

function MosaicPlotWithControls({
  data,
  updateThumbnail,
  ...mosaicProps
}: MosaicPlotWithControlsProps) {
  const displayLibraryControls = false;

  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    plotContainerStyles,
    [data]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {isFaceted(data) ? (
        <>
          <div
            style={{
              background: 'yellow',
              border: '3px dashed green',
              padding: '10px',
            }}
          >
            Custom legend, birds eye and supplementary tables go here...
          </div>

          <FacetedPlot
            component={Mosaic}
            facetedPlotRef={plotRef}
            data={data}
            props={mosaicProps}
          />
        </>
      ) : (
        <Mosaic
          {...mosaicProps}
          ref={plotRef}
          data={data}
          displayLibraryControls={displayLibraryControls}
        />
      )}
      {/* controls go here as needed */}
    </div>
  );
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
      : undefined
  );
  const facetGroupedResponseStats = _.groupBy(response.statsTable, (stats) =>
    stats.facetVariableDetails && stats.facetVariableDetails.length === 1
      ? fixLabelForNumberVariables(
          stats.facetVariableDetails[0].value,
          facetVariable
        )
      : undefined
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
    _.head(_.keys(processedData)) === 'undefined'
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
      : undefined
  );
  const facetGroupedResponseStats = _.groupBy(response.statsTable, (stats) =>
    stats.facetVariableDetails && stats.facetVariableDetails.length === 1
      ? fixLabelForNumberVariables(
          stats.facetVariableDetails[0].value,
          facetVariable
        )
      : undefined
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
        pValue: stats[0].pvalue,
        relativeRisk: stats[0].relativerisk,
        rrInterval: stats[0].rrInterval,
        oddsRatio: stats[0].oddsratio,
        orInterval: stats[0].orInterval,
      };
    }
  );

  return {
    // data
    ...(_.size(processedData) === 1
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
    // for each value in the facet vocabulary's correct order
    // find the index in the series where series.name equals that value
    const facetValues = data.facets.map((facet) => facet.label);
    const facetIndices = facetVocabulary.map((name) =>
      facetValues.indexOf(name)
    );

    return {
      ...data,
      facets: facetIndices.map((i, j) => ({
        label:
          facetVocabulary[j] +
          (data.facets[i] ? '' : ' (no plottable data for this facet)'),
        data: data.facets[i]
          ? (reorderData(
              data.facets[i].data,
              xVocabulary,
              yVocabulary,
              facetVocabulary
            ) as TwoByTwoData | ContTableData)
          : // dummy data for empty facet
            EmptyMosaicData,
      })),
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
      data.values.map((innerDim) => _.at(innerDim, xIndices)),
      yIndices
    ),
    independentLabels: _.at(data.independentLabels, xIndices),
    dependentLabels: _.at(data.dependentLabels, yIndices),
  };
}

/**
 * given an array of `labels` [ 'cat', 'dog', 'mouse' ]
 * and an array of the desired `order` [ 'mouse', 'rat', 'cat', 'dog' ]
 * return the `indices` of the labels that would put them in the right order,
 * e.g. [ 2, 0, 1 ]
 * you can use `_.at(someOtherArray, indices)` to reorder other arrays with this
 *
 * it fails nicely if the strings in `order` aren't in `labels`
 */
function indicesForCorrectOrder(labels: string[], order: string[]): number[] {
  const sortedLabels = _.sortBy(labels, (label) => order.indexOf(label));
  // [ 'mouse', 'cat', 'dog' ]
  return sortedLabels.map((label) => labels.indexOf(label));
  // [ 2, 0, 1 ]
}
