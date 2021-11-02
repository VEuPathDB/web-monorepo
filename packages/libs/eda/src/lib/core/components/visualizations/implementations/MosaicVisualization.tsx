// import MosaicControls from '@veupathdb/components/lib/components/plotControls/MosaicControls';
import Mosaic, {
  MosaicPlotProps as MosaicProps,
} from '@veupathdb/components/lib/plots/MosaicPlot';
import { MosaicData } from '@veupathdb/components/lib/types/plots';
import { ContingencyTable } from '@veupathdb/components/lib/components/ContingencyTable';
// import { ErrorManagement } from '@veupathdb/components/lib/types/general';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { DataClient, MosaicRequestParams } from '../../../api/data-api';
import { usePromise } from '../../../hooks/promise';
import { useFindEntityAndVariable } from '../../../hooks/study';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { useFindOutputEntity } from '../../../hooks/findOutputEntity';
import { Filter } from '../../../types/filter';
import { PromiseType } from '../../../types/utility';
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
import { PlotRef } from '@veupathdb/components/lib/plots/PlotlyPlot';
import {
  fixLabelsForNumberVariables,
  quantizePvalue,
} from '../../../utils/visualization';
import { VariablesByInputName } from '../../../utils/data-element-constraints';
import { Variable } from '../../../types/study';
import PluginError from '../PluginError';

const plotDimensions = {
  width: 750,
  height: 450,
};

interface MosaicDataWithCoverageStatistics
  extends MosaicData,
    CoverageStatistics {}

type ContTableData = MosaicDataWithCoverageStatistics &
  Partial<{
    pValue: number | string;
    degreesFreedom: number;
    chisq: number;
  }>;

type TwoByTwoData = MosaicDataWithCoverageStatistics &
  Partial<{
    pValue: number | string;
    relativeRisk: number;
    rrInterval: string;
    oddsRatio: number;
    orInterval: string;
  }>;

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

  // TODO Handle facetVariable
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

  const findEntityAndVariable = useFindEntityAndVariable(entities);

  const { xAxisVariable, yAxisVariable } = useMemo(() => {
    const xAxisVariable = findEntityAndVariable(vizConfig.xAxisVariable);
    const yAxisVariable = findEntityAndVariable(vizConfig.yAxisVariable);

    return {
      xAxisVariable: xAxisVariable ? xAxisVariable.variable : undefined,
      yAxisVariable: yAxisVariable ? yAxisVariable.variable : undefined,
    };
  }, [findEntityAndVariable, vizConfig.xAxisVariable, vizConfig.yAxisVariable]);

  // outputEntity for OutputEntityTitle's outputEntity prop and outputEntityId at getRequestParams
  const outputEntity = useFindOutputEntity(
    dataElementDependencyOrder,
    vizConfig,
    'xAxisVariable',
    entities
  );

  const data = usePromise(
    useCallback(async (): Promise<ContTableData | TwoByTwoData | undefined> => {
      if (
        vizConfig.xAxisVariable == null ||
        xAxisVariable == null ||
        vizConfig.yAxisVariable == null ||
        yAxisVariable == null
      )
        return undefined;

      if (xAxisVariable === yAxisVariable)
        throw new Error(
          'The X and Y variables must not be the same. Please choose different variables for X and Y.'
        );

      const params = getRequestParams(
        studyId,
        filters ?? [],
        vizConfig.xAxisVariable,
        vizConfig.yAxisVariable,
        // pass outputEntity.id
        outputEntity?.id ?? ''
      );

      const xAxisVocabulary = fixLabelsForNumberVariables(
        xAxisVariable.vocabulary,
        xAxisVariable
      );
      const yAxisVocabulary = fixLabelsForNumberVariables(
        yAxisVariable.vocabulary,
        yAxisVariable
      );

      if (isTwoByTwo) {
        const response = dataClient.getTwoByTwo(
          computation.descriptor.type,
          params
        );

        return reorderData(
          twoByTwoResponseToData(await response, xAxisVariable, yAxisVariable),
          xAxisVocabulary,
          yAxisVocabulary
        );
      } else {
        const response = dataClient.getContTable(
          computation.descriptor.type,
          params
        );

        return reorderData(
          contTableResponseToData(await response, xAxisVariable, yAxisVariable),
          xAxisVocabulary,
          yAxisVocabulary
        );
      }
    }, [
      studyId,
      filters,
      dataClient,
      vizConfig,
      xAxisVariable,
      yAxisVariable,
      computation.descriptor.type,
      isTwoByTwo,
      outputEntity?.id,
    ])
  );

  let statsTable = undefined;

  if (isTwoByTwo) {
    // const twoByTwoData = data.value as TwoByTwoData | undefined;

    // Temporarily disabled---See https://github.com/VEuPathDB/web-eda/issues/463
    statsTable = (
      <div className="MosaicVisualization-StatsTable">
        {/* <table>
          <tbody>
            <tr>
              <th></th>
              <th>Value</th>
              <th>95% confidence interval</th>
            </tr>
            <tr>
              <th>P-value</th>
              <td>
                {twoByTwoData?.pValue != null
                  ? quantizePvalue(twoByTwoData.pValue)
                  : 'N/A'}
              </td>
              <td>N/A</td>
            </tr>
            <tr>
              <th>Odds ratio</th>
              <td>{twoByTwoData?.oddsRatio ?? 'N/A'}</td>
              <td>{twoByTwoData?.orInterval ?? 'N/A'}</td>
            </tr>
            <tr>
              <th>Relative risk</th>
              <td>{twoByTwoData?.relativeRisk ?? 'N/A'}</td>
              <td>{twoByTwoData?.rrInterval ?? 'N/A'}</td>
            </tr>
          </tbody>
        </table> */}
        <i>Stats table coming soon!</i>
      </div>
    );
  } else {
    const contTableData = data.value as ContTableData | undefined;

    statsTable = (
      <div className="MosaicVisualization-StatsTable">
        <table>
          <tbody>
            <tr>
              <th>P-value</th>
              <td>
                {contTableData?.pValue != null
                  ? quantizePvalue(contTableData.pValue)
                  : 'N/A'}
              </td>
            </tr>
            <tr>
              <th>Degrees of freedom</th>
              <td>{contTableData?.degreesFreedom ?? 'N/A'}</td>
            </tr>
            <tr>
              <th>Chi-squared</th>
              <td>{contTableData?.chisq ?? 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

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
                  containerStyles={plotDimensions}
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
                  data={data.value}
                  containerStyles={{ width: plotDimensions.width }}
                  independentVariable={xAxisLabel ?? 'X-axis'}
                  dependentVariable={yAxisLabel ?? 'Y-axis'}
                />
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
          stratificationIsActive={false}
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
          ]}
        />
        {statsTable}
      </div>
    </div>
  );

  const facetingIsActive = false; // placeholders
  const showMissingness = false; // for the future with faceting
  const outputSize =
    !facetingIsActive && !showMissingness
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
          ]}
          entities={entities}
          selectedVariables={{
            xAxisVariable: vizConfig.xAxisVariable,
            yAxisVariable: vizConfig.yAxisVariable,
          }}
          onChange={handleInputVariableChange}
          constraints={dataElementConstraints}
          dataElementDependencyOrder={dataElementDependencyOrder}
          starredVariables={starredVariables}
          toggleStarredVariable={toggleStarredVariable}
        />
      </div>

      <PluginError error={data.error} outputSize={outputSize} />
      <OutputEntityTitle entity={outputEntity} outputSize={outputSize} />
      {plotComponent}
    </div>
  );
}

interface MosaicPlotWithControlsProps extends MosaicProps {
  updateThumbnail: (src: string) => void;
}

function MosaicPlotWithControls({
  data,
  updateThumbnail,
  ...mosaicProps
}: MosaicPlotWithControlsProps) {
  const displayLibraryControls = false;

  const plotRef = useRef<PlotRef>(null);

  const updateThumbnailRef = useRef(updateThumbnail);
  useEffect(() => {
    updateThumbnailRef.current = updateThumbnail;
  });

  useEffect(() => {
    plotRef.current
      ?.toImage({ format: 'svg', ...plotDimensions })
      .then(updateThumbnailRef.current);
  }, [data]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Mosaic
        {...mosaicProps}
        ref={plotRef}
        data={data}
        displayLibraryControls={displayLibraryControls}
      />
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
  response: PromiseType<ReturnType<DataClient['getContTable']>>,
  xVariable: Variable,
  yVariable: Variable
): ContTableData {
  if (response.mosaic.data.length === 0)
    throw Error(`Expected one or more data series, but got zero`);

  // Transpose data table to match mosaic component expectations
  const data = _.unzip(response.mosaic.data[0].value);

  return {
    values: data,
    independentLabels: fixLabelsForNumberVariables(
      response.mosaic.data[0].xLabel,
      xVariable
    ),
    dependentLabels: fixLabelsForNumberVariables(
      response.mosaic.data[0].yLabel[0],
      yVariable
    ),
    pValue: response.statsTable[0].pvalue,
    degreesFreedom: response.statsTable[0].degreesFreedom,
    chisq: response.statsTable[0].chisq,
    completeCases: response.completeCasesTable,
    completeCasesAllVars: response.mosaic.config.completeCasesAllVars,
    completeCasesAxesVars: response.mosaic.config.completeCasesAxesVars,
  };
}

/**
 * Reformat response from mosaic endpoints into complete MosaicData
 * @param response
 * @returns MosaicData
 */
export function twoByTwoResponseToData(
  response: PromiseType<ReturnType<DataClient['getTwoByTwo']>>,
  xVariable: Variable,
  yVariable: Variable
): TwoByTwoData {
  if (response.mosaic.data.length === 0)
    throw Error(`Expected one or more data series, but got zero`);

  // Transpose data table to match mosaic component expectations
  const data = _.unzip(response.mosaic.data[0].value);

  return {
    values: data,
    independentLabels: fixLabelsForNumberVariables(
      response.mosaic.data[0].xLabel,
      xVariable
    ),
    dependentLabels: fixLabelsForNumberVariables(
      response.mosaic.data[0].yLabel[0],
      yVariable
    ),
    pValue: response.statsTable[0].pvalue,
    relativeRisk: response.statsTable[0].relativerisk,
    rrInterval: response.statsTable[0].rrInterval,
    oddsRatio: response.statsTable[0].oddsratio,
    orInterval: response.statsTable[0].orInterval,
    completeCases: response.completeCasesTable,
    completeCasesAllVars: response.mosaic.config.completeCasesAllVars,
    completeCasesAxesVars: response.mosaic.config.completeCasesAxesVars,
  };
}

function getRequestParams(
  studyId: string,
  filters: Filter[],
  xAxisVariable: VariableDescriptor,
  yAxisVariable: VariableDescriptor,
  // pass outputEntityId
  outputEntityId: string
): MosaicRequestParams {
  return {
    studyId,
    filters,
    config: {
      // add outputEntityId
      outputEntityId: outputEntityId,
      xAxisVariable: xAxisVariable,
      yAxisVariable: yAxisVariable,
    },
  };
}

function reorderData<T extends TwoByTwoData | ContTableData>(
  data: T,
  xVocabulary: string[] = [],
  yVocabulary: string[] = []
): T {
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
