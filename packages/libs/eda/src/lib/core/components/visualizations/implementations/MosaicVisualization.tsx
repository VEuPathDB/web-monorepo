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
  TwoByTwoRequestParams,
  TwoByTwoResponse,
  // 2x2 stats table content type
  twoByTwoStatsContent,
  facetVariableDetailsType,
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
import {
  InputSpec,
  InputVariables,
  requiredInputLabelStyle,
} from '../InputVariables';
import { OutputEntityTitle } from '../OutputEntityTitle';
import { VisualizationProps } from '../VisualizationTypes';
import TwoByTwoSVG from './selectorIcons/TwoByTwoSVG';
import RxCSVG from './selectorIcons/RxCSVG';
import { TabbedDisplay } from '@veupathdb/coreui';
import { Table } from '@veupathdb/coreui';
import { gray } from '@veupathdb/coreui/dist/definitions/colors';

// import axis label unit util
import { variableDisplayWithUnit } from '../../../utils/variable-display';
import {
  fixLabelForNumberVariables,
  fixLabelsForNumberVariables,
  quantizePvalue,
  vocabularyWithMissingData,
  variablesAreUnique,
  nonUniqueWarning,
  assertValidInputVariables,
} from '../../../utils/visualization';
import { VariablesByInputName } from '../../../utils/data-element-constraints';
import { Variable } from '../../../types/study';
import PluginError from '../PluginError';
import { isFaceted } from '@veupathdb/components/lib/types/guards';
import FacetedMosaicPlot from '@veupathdb/components/lib/plots/facetedPlots/FacetedMosaicPlot';
import { useVizConfig } from '../../../hooks/visualizations';
import { createVisualizationPlugin } from '../VisualizationPlugin';
import { LayoutOptions } from '../../layouts/types';
import SingleSelect from '@veupathdb/coreui/dist/components/inputs/SingleSelect';
import { useInputStyles } from '../inputStyles';
import { ClearSelectionButton } from '../../variableTrees/VariableTreeDropdown';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';
import Banner from '@veupathdb/coreui/dist/components/banners/Banner';

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

const twoByTwoInputStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '115px auto',
  marginBottom: '0.5em',
  alignItems: 'center',
};

type ContTableData = MosaicPlotData &
  Partial<{
    pValue: number | string;
    degreesFreedom: number;
    chisq: number;
  }>;

// reflecting 2x2 stats table content
type TwoByTwoData = MosaicPlotData &
  Partial<{
    chiSq: twoByTwoStatsContent;
    fisher: twoByTwoStatsContent;
    prevalence: twoByTwoStatsContent;
    oddsRatio: twoByTwoStatsContent;
    relativeRisk: twoByTwoStatsContent;
    sensitivity: twoByTwoStatsContent;
    specificity: twoByTwoStatsContent;
    posPredictiveValue: twoByTwoStatsContent;
    negPredictiveValue: twoByTwoStatsContent;
    facetVariableDetails: facetVariableDetailsType;
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
  xAxisReferenceValue: t.string,
  yAxisReferenceValue: t.string,
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
  const entities = useStudyEntities(filters);
  const dataClient: DataClient = useDataClient();

  // set default tab to Mosaic in TabbedDisplay component
  const [activeTab, setActiveTab] = useState('Mosaic');

  const [vizConfig, updateVizConfig] = useVizConfig(
    visualization.descriptor.configuration,
    MosaicConfig,
    createDefaultConfig,
    updateConfiguration
  );

  const findEntityAndVariable = useFindEntityAndVariable(filters);

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

  const xAxisReferenceValue = useMemo(() => {
    if (!isTwoByTwo || !xAxisVariable || !vizConfig.xAxisVariable) return;
    return vizConfig.xAxisReferenceValue;
  }, [
    isTwoByTwo,
    xAxisVariable,
    vizConfig.xAxisVariable,
    vizConfig.xAxisReferenceValue,
  ]);

  const yAxisReferenceValue = useMemo(() => {
    if (!isTwoByTwo || !yAxisVariable || !vizConfig.yAxisVariable) return;
    return vizConfig.yAxisReferenceValue;
  }, [
    isTwoByTwo,
    yAxisVariable,
    vizConfig.yAxisVariable,
    vizConfig.yAxisReferenceValue,
  ]);

  const handleInputVariableChange = useCallback(
    (selectedVariables: VariablesByInputName) => {
      const { xAxisVariable, yAxisVariable, facetVariable } = selectedVariables;

      updateVizConfig({
        xAxisVariable,
        yAxisVariable,
        facetVariable,
        ...(isTwoByTwo
          ? {
              xAxisReferenceValue: _.isEqual(
                xAxisVariable,
                vizConfig.xAxisVariable
              )
                ? xAxisReferenceValue
                : undefined,
              yAxisReferenceValue: _.isEqual(
                yAxisVariable,
                vizConfig.yAxisVariable
              )
                ? yAxisReferenceValue
                : undefined,
            }
          : {}),
      });
    },
    [
      isTwoByTwo,
      updateVizConfig,
      vizConfig.xAxisVariable,
      vizConfig.yAxisVariable,
      xAxisReferenceValue,
      yAxisReferenceValue,
    ]
  );

  // prettier-ignore
  // changed for consistency as now all other Vizs have this format
  const onChangeHandlerFactory = useCallback(
    <ValueType,>(key: keyof MosaicConfig, resetCheckedLegendItems?: boolean) => (newValue?: ValueType) => {
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

  const onShowMissingnessChange =
    onChangeHandlerFactory<boolean>('showMissingness');

  const onXAxisReferenceValueChange = onChangeHandlerFactory<string>(
    'xAxisReferenceValue'
  );

  const onYAxisReferenceValueChange = onChangeHandlerFactory<string>(
    'yAxisReferenceValue'
  );

  // passed into ContingencyTable and referenced in order quadrants, so memoizing will prevent unnecessary re-renders
  const selectedReferenceValues = useMemo(
    () => [xAxisReferenceValue, yAxisReferenceValue],
    [xAxisReferenceValue, yAxisReferenceValue]
  );

  // outputEntity for OutputEntityTitle's outputEntity prop and outputEntityId at getRequestParams
  const outputEntity = useFindOutputEntity(
    dataElementDependencyOrder,
    vizConfig,
    'xAxisVariable'
  );

  const selectedVariables = useMemo(
    () => ({
      xAxisVariable: vizConfig.xAxisVariable,
      yAxisVariable: vizConfig.yAxisVariable,
      facetVariable: vizConfig.facetVariable,
    }),
    [vizConfig.facetVariable, vizConfig.xAxisVariable, vizConfig.yAxisVariable]
  );

  const inputs = useMemo(
    (): InputSpec[] => [
      {
        name: 'xAxisVariable',
        label: isTwoByTwo ? 'Columns (X-axis)' : 'X-axis',
        role: 'axis',
        titleOverride: isTwoByTwo ? '2x2 table variables' : undefined,
        styleOverride: isTwoByTwo ? twoByTwoInputStyle : undefined,
      },
      {
        name: 'yAxisVariable',
        label: isTwoByTwo ? 'Rows (Y-axis)' : 'Y-axis',
        role: 'axis',
        titleOverride: isTwoByTwo ? '2x2 table variables' : undefined,
        styleOverride: isTwoByTwo ? twoByTwoInputStyle : undefined,
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
    [isTwoByTwo, options?.hideFacetInputs]
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

      assertValidInputVariables(
        inputs,
        selectedVariables,
        entities,
        dataElementConstraints
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
        if (
          !vizConfig.xAxisReferenceValue ||
          !xAxisReferenceValue ||
          !vizConfig.yAxisReferenceValue ||
          !yAxisReferenceValue
        )
          return undefined;

        const params = getRequestParams(
          studyId,
          filters ?? [],
          vizConfig.xAxisVariable,
          vizConfig.yAxisVariable,
          outputEntity?.id ?? '',
          vizConfig.facetVariable,
          vizConfig.showMissingness,
          vizConfig.xAxisReferenceValue,
          vizConfig.yAxisReferenceValue
        );

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
        const params = getRequestParams(
          studyId,
          filters ?? [],
          vizConfig.xAxisVariable,
          vizConfig.yAxisVariable,
          outputEntity?.id ?? '',
          vizConfig.facetVariable,
          vizConfig.showMissingness
        );
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
      vizConfig.xAxisVariable,
      vizConfig.yAxisVariable,
      vizConfig.xAxisReferenceValue,
      vizConfig.yAxisReferenceValue,
      vizConfig.facetVariable,
      vizConfig.showMissingness,
      xAxisVariable,
      yAxisVariable,
      facetVariable,
      inputs,
      selectedVariables,
      entities,
      dataElementConstraints,
      filters,
      isTwoByTwo,
      xAxisReferenceValue,
      yAxisReferenceValue,
      studyId,
      outputEntity?.id,
      dataClient,
      computation.descriptor.type,
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
    interactive: true,
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
            <div style={{ margin: '15px 0' }}>
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
            <div style={{ margin: '15px 0', marginLeft: '0.75rem' }}>
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
                selectedReferenceValues={selectedReferenceValues}
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
                  <>
                    {/* 2x2 stats table banner for facet variable */}
                    {isTwoByTwo && (
                      <div>
                        {/* 2x2 stats collapsible banner */}
                        <Banner
                          banner={{
                            type: 'info',
                            // message is used as a basic text
                            message:
                              'Learn about appropriate statistics for each study design.',
                            pinned: true,
                            intense: false,
                            additionalMessage: undefined,
                            // text for showMore link
                            showMoreLinkText: 'Read more...',
                            // text for showless link
                            showLessLinkText: 'Read less...',
                            // color for show more links
                            showMoreLinkColor: '#000000',
                            // is showMoreLink bold?
                            isShowMoreLinkBold: true,
                          }}
                          onClose={() => null}
                          // collapsible content: React.FC
                          CollapsibleContent={StatsCollapsibleBannerContent}
                        />
                      </div>
                    )}
                    <div
                      style={{
                        ...facetedStatsTableContainerStyles,
                        margin: '15px 0',
                      }}
                    >
                      {data.value.facets.map(({ label, data }, index) => (
                        <table key={index}>
                          <tbody>
                            <tr style={{ marginLeft: '0.75rem' }}>
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
                                {/* {' '} */}
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
                  </>
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
    const areRequiredMosaicInputsSelected = Object.entries(
      dataElementConstraints[0]
    )
      .filter((variable) => variable[1].isRequired)
      .every((reqdVar) => !!(vizConfig as any)[reqdVar[0]]);
    if (!isTwoByTwo) return areRequiredMosaicInputsSelected;
    return (
      areRequiredMosaicInputsSelected &&
      vizConfig.xAxisReferenceValue &&
      vizConfig.yAxisReferenceValue
    );
  }, [dataElementConstraints, isTwoByTwo, vizConfig]);

  const LayoutComponent = options?.layoutComponent ?? PlotLayout;

  const classes = useInputStyles();

  /**
   * TEMPORARY:
   * CoreUI's selection components need to be updated to enable disabling them. We lose the ability to convey messages via tooltips
   * and cursors when we use pointerEvents: 'none'
   *
   * In the meantime, these disabled styles are applied when a variable is missing the vocabulary property because a variable's vocabulary
   * determines the selection options.
   */
  const getReferenceValueStyles = (
    variableHasVocabulary: boolean
  ): React.CSSProperties => ({
    ...twoByTwoInputStyle,
    pointerEvents: variableHasVocabulary ? undefined : 'none',
    opacity: variableHasVocabulary ? 1 : 0.5,
  });

  const twoByTwoReferenceValueInputs = !isTwoByTwo
    ? undefined
    : [
        {
          title: (
            <>
              <span style={{ marginRight: '0.5em' }}>
                2x2 table quadrant A values
              </span>
            </>
          ),
          order: 75,
          content: (
            <>
              <div style={getReferenceValueStyles(!!xAxisVariable?.vocabulary)}>
                <Tooltip title={'Required parameter'}>
                  <span
                    className={classes.label}
                    style={
                      !xAxisReferenceValue && xAxisVariable?.vocabulary
                        ? requiredInputLabelStyle
                        : undefined
                    }
                  >
                    Columns (X-axis)<sup>*</sup>
                  </span>
                </Tooltip>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    alignItems: 'center',
                  }}
                >
                  <SingleSelect
                    items={
                      xAxisVariable?.vocabulary
                        ? xAxisVariable?.vocabulary?.map((vocab) => ({
                            display: vocab,
                            value: vocab,
                          }))
                        : []
                    }
                    value={xAxisReferenceValue}
                    onSelect={onXAxisReferenceValueChange}
                    buttonDisplayContent={
                      xAxisReferenceValue ?? 'Select a value'
                    }
                  />
                  <ClearSelectionButton
                    onClick={() => onXAxisReferenceValueChange(undefined)}
                    disabled={!xAxisReferenceValue}
                    style={{ marginLeft: '0.5em' }}
                  />
                </div>
              </div>
              <div style={getReferenceValueStyles(!!yAxisVariable?.vocabulary)}>
                <Tooltip title={'Required parameter'}>
                  <span
                    className={classes.label}
                    style={
                      !yAxisReferenceValue && yAxisVariable?.vocabulary
                        ? requiredInputLabelStyle
                        : undefined
                    }
                  >
                    Rows (Y-axis)<sup>*</sup>
                  </span>
                </Tooltip>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    alignItems: 'center',
                  }}
                >
                  <SingleSelect
                    items={
                      yAxisVariable?.vocabulary
                        ? yAxisVariable?.vocabulary?.map((vocab) => ({
                            display: vocab,
                            value: vocab,
                          }))
                        : []
                    }
                    value={yAxisReferenceValue}
                    onSelect={onYAxisReferenceValueChange}
                    buttonDisplayContent={
                      yAxisReferenceValue ?? 'Select a value'
                    }
                  />
                  <ClearSelectionButton
                    onClick={() => onYAxisReferenceValueChange(undefined)}
                    disabled={!yAxisReferenceValue}
                    style={{ marginLeft: '0.5em' }}
                  />
                </div>
              </div>
            </>
          ),
        },
      ];

  // 2x2 more information box banner content
  const MoreInfoBoxBanner = () => {
    const tableCellStyle = {
      border: '1px solid black',
      borderSpacing: '0px',
      width: '7em',
    };

    return (
      <>
        The shorthand "A, B, C, D" is used to refer to specific quadrants in the
        2x2 table:
        <table
          style={{
            borderCollapse: 'collapse',
            marginTop: '1em',
            textAlign: 'center',
          }}
        >
          <tr>
            <td style={{ width: '10em' }}>&nbsp;</td>
            <td colSpan={3}>
              <b>
                Columns (X-axis):
                <br />
              </b>{' '}
              outcome/disease status;
              <br />
              gold standard/reference test result
            </td>
          </tr>
          <tr>
            <td rowSpan={3}>
              <b>Rows (Y-axis):</b>
              <br />
              exposure/risk factor; <br />
              diagnostic test result
            </td>
            <td style={tableCellStyle}>&nbsp;</td>
            <td style={tableCellStyle}>
              <b>+</b>
            </td>
            <td style={tableCellStyle}>
              <b>-</b>
            </td>
          </tr>
          <tr>
            <td style={tableCellStyle}>
              <b>+</b>
            </td>
            <td style={tableCellStyle}>
              <b>A</b>
            </td>
            <td style={tableCellStyle}>
              <b>B</b>
            </td>
          </tr>
          <tr>
            <td style={tableCellStyle}>
              <b>-</b>
            </td>
            <td style={tableCellStyle}>
              <b>C</b>
            </td>
            <td style={tableCellStyle}>
              <b>D</b>
            </td>
          </tr>
        </table>
        <br />
        <b>
          <i>If you want to investigate a measure of association:</i>
        </b>
        <ul>
          <li>
            Columns (X-axis): select a value for Quadrant A representing the
            outcome or disease status of interest.
          </li>
          <li>
            Rows (Y-axis): select a value for Quadrant A representing the
            exposure or risk factor of interest.
          </li>
        </ul>
        <br />
        <b>
          <i>If you want to investigate diagnostic test performance:</i>
        </b>
        <ul>
          <li>
            Columns (X-axis): select a value for Quadrant A representing a
            positive result for the reference (gold standard) diagnostic test.
          </li>
          <li>
            Rows (Y-axis): select values for Quadrant A representing a positive
            result for the diagnostic test being evaluated.
          </li>
        </ul>
      </>
    );
  };

  return (
    <>
      {/* 2x2 more information box banner */}
      {isTwoByTwo && (
        <div>
          <Banner
            banner={{
              type: 'info',
              // message is used as a basic text
              message:
                'Learn how to set up a 2x2 table in order for statistics to be calculated correctly.',
              pinned: true,
              intense: false,
              additionalMessage: undefined,
              // text for showMore link
              showMoreLinkText: 'Read more...',
              // text for showless link
              showLessLinkText: 'Read less...',
              // color for show more links
              showMoreLinkColor: '#000000',
              // is showMoreLink bold?
              isShowMoreLinkBold: true,
            }}
            onClose={() => null}
            // collapsible content: React.FC
            CollapsibleContent={MoreInfoBoxBanner}
          />
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
          <InputVariables
            inputs={inputs}
            customSections={
              isTwoByTwo ? twoByTwoReferenceValueInputs : undefined
            }
            entities={entities}
            selectedVariables={selectedVariables}
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
    </>
  );
}

// 2x2 stats table content
const StatsCollapsibleBannerContent = () => {
  const tableCellStyleNormal = {
    border: '1px solid black',
    borderSpacing: '0px',
    width: '7em',
  };

  const tableCellStyleMoreWidth = {
    border: '1px solid black',
    borderSpacing: '0px',
    width: '8em',
  };

  const tableCellStyleBold = {
    border: '1px solid black',
    borderSpacing: '0px',
    width: '7em',
  };

  return (
    <div>
      The appropriate measure of association or diagnostic test performance
      depends on the study design. The shorthand "A, B, C, D" is used to refer
      to specific quadrants in the 2x2 contingency table:
      <table
        style={{
          borderCollapse: 'collapse',
          marginTop: '1em',
          textAlign: 'center',
        }}
      >
        <tr>
          <td style={{ width: '10em' }}>&nbsp;</td>
          <td colSpan={4}>
            <b>
              Columns (X-axis):
              <br />
            </b>{' '}
            outcome/disease status;
            <br />
            gold standard/reference test result
          </td>
        </tr>
        <tr>
          <td rowSpan={4}>
            <b>Rows (Y-axis):</b>
            <br />
            exposure/risk factor; <br />
            diagnostic test result
          </td>
          <td style={tableCellStyleBold}>&nbsp;</td>
          <td style={tableCellStyleBold}>
            <b>+</b>
          </td>
          <td style={tableCellStyleBold}>
            <b>-</b>
          </td>
          <td style={tableCellStyleMoreWidth}>
            <i>Row Totals</i>
          </td>
        </tr>
        <tr>
          <td style={tableCellStyleBold}>
            <b>+</b>
          </td>
          <td style={tableCellStyleBold}>
            <b>A</b>
          </td>
          <td style={tableCellStyleBold}>
            <b>B</b>
          </td>
          <td style={tableCellStyleMoreWidth}>
            <i>A + B</i>
          </td>
        </tr>
        <tr>
          <td style={tableCellStyleBold}>
            <b>-</b>
          </td>
          <td style={tableCellStyleBold}>
            <b>C</b>
          </td>
          <td style={tableCellStyleBold}>
            <b>D</b>
          </td>
          <td style={tableCellStyleMoreWidth}>
            <i>C + D</i>
          </td>
        </tr>
        <tr>
          <td style={tableCellStyleNormal}>
            <i>Column Totals</i>
          </td>
          <td style={tableCellStyleNormal}>
            <i>A + C</i>
          </td>
          <td style={tableCellStyleNormal}>
            <i>B + D</i>
          </td>
          <td style={tableCellStyleMoreWidth}>
            <i>n = A + B + C + D</i>
          </td>
        </tr>
      </table>
      <br />
      <b>All studies:</b>
      <ul>
        <li>
          <b>
            <i>
              Chi-squared Statistic (&chi;<sup>2</sup>)
            </i>
          </b>
          : &Sigma; (O<sub>i</sub> - EO<sub>i</sub>)<sup>2</sup> / EO
          <sub>i</sub>
          <ul>
            <li>
              Tests whether there is an association between the two 2x2 table
              variables.
            </li>
            <li>If sample sizes are small, use Fisher’s Exact Test.</li>
            <li>
              For more information, see:{' '}
              <a
                href="https://www.bmj.com/about-bmj/resources-readers/publications/statistics-square-one/8-chi-squared-tests"
                target="_blank"
                rel="noreferrer"
              >
                https://www.bmj.com/about-bmj/resources-readers/publications/statistics-square-one/8-chi-squared-tests
              </a>
            </li>
          </ul>
        </li>
        <li>
          <b>
            <i>Fisher’s Exact Test</i>
          </b>
          : [ (A + B)! (C + D)! (A + C)! (B + D)! ] / ( A! B! C! D! n! )
          <ul>
            <li>
              Tests whether there is an association between the two 2x2 table
              variables.
            </li>
          </ul>
        </li>
      </ul>
      <br />
      <b>Studies that use prevalence data:</b>
      <br />
      <u>Cross-sectional Studies:</u>
      <ul>
        <li>
          <b>
            <i>Prevalence</i>
          </b>
          : (A + C) / (A + B + C + D)
        </li>
        <ul>
          <li>
            The proportion of the population who have the disease specified in
            the columns (X-axis) at the examined point in time was [
            <i>Prevalence</i>].
          </li>
        </ul>
        <li>
          <b>
            <i>Odds Ratio</i>
          </b>
          : (A / B) / (C / D)
        </li>
        <ul>
          <li>
            The odds of having the disease specified in the columns (X-axis) was
            [<i>Odds Ratio</i>] times as high in those exposed to the potential
            risk factor indicated in the rows (Y-axis), as compared to those
            unexposed.
          </li>
        </ul>
      </ul>
      <u>Case-Control Studies:</u>
      <ul>
        <li>
          <b>
            <i>Odds Ratio</i>
          </b>
          : (A / B) / (C / D)
        </li>
        <ul>
          <li>
            The odds of having the disease specified in the columns (X-axis) was
            [<i>Odds Ratio</i>] times as high in those exposed to the potential
            risk factor indicated in the rows (Y-axis) in the time period of
            interest, as compared to those unexposed.
          </li>
        </ul>
      </ul>
      <br />
      <b>Studies that use incidence data:</b>
      <br />
      <u>Cohort Studies and Randomized Controlled Trials:</u>
      <ul>
        <li>
          <b>
            <i>Risk Ratio</i>
          </b>{' '}
          (for studies using a population at risk approach): [A / (A + B)] / [C
          / (C + D)]
        </li>
        <ul>
          <li>
            The risk of having the disease specified in the columns (X-axis)
            over the follow-up period was [<i>Risk Ratio</i>] times as high in
            those exposed to the potential risk factor indicated in the rows
            (Y-axis), as compared to those unexposed.
          </li>
        </ul>
      </ul>
      <br />
      <b>Studies that investigate diagnostic test performance:</b>
      <ul>
        <li>
          <b>
            <i>Sensitivity</i>
          </b>
          : A / (A + C)
        </li>
        <ul>
          <li>
            The probability of being positive by the diagnostic test indicated
            in the rows (Y-axis) when the disease specified in the columns
            (X-axis) is present is [<i>Sensitivity</i>].
          </li>
        </ul>

        <li>
          <b>
            <i>Specificity</i>
          </b>
          : D / (B + D)
        </li>
        <ul>
          <li>
            The probability of being negative by the diagnostic test indicated
            in the rows (Y-axis) when the disease specified in the columns
            (X-axis) is absent is [<i>Specificity</i>].
          </li>
        </ul>

        <li>
          <b>
            <i>Positive Predictive Value</i>
          </b>
          : A / (A + B)
        </li>
        <ul>
          <li>
            The probability that a person testing positive by the diagnostic
            test indicated in the rows (Y-axis) actually has the disease
            specified in the columns (X-axis) is [
            <i>Positive Predictive Value</i>].
          </li>
        </ul>

        <li>
          <b>
            <i>Negative Predictive Value</i>
          </b>
          : D / (C + D)
        </li>
        <ul>
          <li>
            The probability that a person testing negative by the diagnostic
            test indicated in the rows (Y-axis) does NOT actually have the
            disease specified in the columns (X-axis) is [
            <i>Negative Predictive Value</i>].
          </li>
        </ul>
      </ul>
    </div>
  );
};

function TwoByTwoStats(props?: {
  // reflecting 2x2 stats table content
  chiSq?: twoByTwoStatsContent;
  fisher?: twoByTwoStatsContent;
  prevalence?: twoByTwoStatsContent;
  oddsRatio?: twoByTwoStatsContent;
  relativeRisk?: twoByTwoStatsContent;
  sensitivity?: twoByTwoStatsContent;
  specificity?: twoByTwoStatsContent;
  posPredictiveValue?: twoByTwoStatsContent;
  negPredictiveValue?: twoByTwoStatsContent;
  facetVariableDetails?: facetVariableDetailsType;
}) {
  return props != null ? (
    <>
      {props.facetVariableDetails != null ? (
        ''
      ) : (
        <div
          style={{
            width: '750px',
            margin: '0 0 0 0.75rem',
          }}
        >
          {/* 2x2 stats table collapsible banner */}
          <Banner
            banner={{
              type: 'info',
              // message is used as a basic text
              message:
                'Learn about appropriate statistics for each study design.',
              pinned: true,
              intense: false,
              additionalMessage: undefined,
              // text for showMore link
              showMoreLinkText: 'Read more...',
              // text for showless link
              showLessLinkText: 'Read less...',
              // color for show more links
              showMoreLinkColor: '#000000',
              // is showMoreLink bold?
              isShowMoreLinkBold: true,
            }}
            onClose={() => null}
            // collapsible content: React.FC
            CollapsibleContent={StatsCollapsibleBannerContent}
          />
        </div>
      )}
      <div
        className="stats-table"
        style={
          props.facetVariableDetails != null
            ? { width: '750px' }
            : { margin: '15px 0', marginLeft: '0.75rem', width: '750px' }
        }
      >
        <table>
          {' '}
          <tbody>
            <tr>
              <td className="stats-table_top-empty-cell"></td>
              <td className="stats-table_top-empty-cell"></td>
              <th
                className="stats-table_top-left-cell"
                style={{ background: '#e0e0e0', textAlign: 'right' }}
              >
                Value
              </th>
              <th
                className="stats-table_top-cell"
                style={{
                  background: '#e0e0e0',
                  textAlign: 'center',
                  paddingLeft: '2em',
                }}
              >
                95% CI
              </th>
              <th
                className="stats-table_top-right-cell"
                style={{ background: '#e0e0e0', textAlign: 'right' }}
              >
                P-value
              </th>
            </tr>
            <tr>
              <td className="stats-table_leftmost-cell">
                Association between 2 categorical variables
              </td>
              <td className="stats-table_middle-cell">
                <b>Chi-squared (df=1)</b>
              </td>
              <td>{props.chiSq?.value ?? 'n/a'}</td>
              <td style={{ textAlign: 'center', paddingLeft: '2em' }}>
                {props.chiSq?.confidenceInterval ?? 'n/a'}
              </td>
              <td className="stats-table_rightmost-cell">
                {props.chiSq?.pvalue ?? 'n/a'}
              </td>
            </tr>
            <tr>
              <td className="stats-table_leftmost-cell">
                Association between 2 categorical variables
              </td>
              <td className="stats-table_middle-cell">
                <b>Fisher's Exact Test</b>
              </td>
              <td>{props.fisher?.value ?? 'n/a'}</td>
              <td style={{ textAlign: 'center', paddingLeft: '2em' }}>
                {props.fisher?.confidenceInterval ?? 'n/a'}
              </td>
              <td className="stats-table_rightmost-cell">
                {props.fisher?.pvalue ?? 'n/a'}
              </td>
            </tr>
            <tr>
              <td className="stats-table_leftmost-cell">
                Cross-sectional studies
              </td>
              <td className="stats-table_middle-cell">
                <b>Prevalence</b>
              </td>
              <td>{props.prevalence?.value ?? 'n/a'}</td>
              <td style={{ textAlign: 'center', paddingLeft: '2em' }}>
                {props.prevalence?.confidenceInterval ?? 'n/a'}
              </td>
              <td className="stats-table_rightmost-cell">
                {props.prevalence?.pvalue ?? 'n/a'}
              </td>
            </tr>
            <tr>
              <td className="stats-table_leftmost-cell">
                Case control & Cross-sectional studies
              </td>
              <td className="stats-table_middle-cell">
                <b>Odds Ratio</b>
              </td>
              <td>{props.oddsRatio?.value ?? 'n/a'}</td>
              <td style={{ textAlign: 'center', paddingLeft: '2em' }}>
                {props.oddsRatio?.confidenceInterval ?? 'n/a'}
              </td>
              <td className="stats-table_rightmost-cell">
                {props.oddsRatio?.pvalue ?? 'n/a'}
              </td>
            </tr>
            <tr>
              <td className="stats-table_leftmost-cell">
                Cohort studies & Randomized controlled trials
              </td>
              <td className="stats-table_middle-cell">
                <b>Risk Ratio</b>
              </td>
              <td>{props.relativeRisk?.value ?? 'n/a'}</td>
              <td style={{ textAlign: 'center', paddingLeft: '2em' }}>
                {props.relativeRisk?.confidenceInterval ?? 'n/a'}
              </td>
              <td className="stats-table_rightmost-cell">
                {props.relativeRisk?.pvalue ?? 'n/a'}
              </td>
            </tr>
            <tr>
              <td className="stats-table_leftmost-cell">
                Diagnostic test performance
              </td>
              <td className="stats-table_middle-cell">
                <b>Sensitivity</b>
              </td>
              <td>{props.sensitivity?.value ?? 'n/a'}</td>
              <td style={{ textAlign: 'center', paddingLeft: '2em' }}>
                {props.sensitivity?.confidenceInterval ?? 'n/a'}
              </td>
              <td className="stats-table_rightmost-cell">
                {props.sensitivity?.pvalue ?? 'n/a'}
              </td>
            </tr>
            <tr>
              <td className="stats-table_leftmost-cell">
                Diagnostic test performance
              </td>
              <td className="stats-table_middle-cell">
                <b>Specificity</b>
              </td>
              <td>{props.specificity?.value ?? 'n/a'}</td>
              <td style={{ textAlign: 'center', paddingLeft: '2em' }}>
                {props.specificity?.confidenceInterval ?? 'n/a'}
              </td>
              <td className="stats-table_rightmost-cell">
                {props.specificity?.pvalue ?? 'n/a'}
              </td>
            </tr>
            <tr>
              <td className="stats-table_leftmost-cell">
                Diagnostic test performance
              </td>
              <td className="stats-table_middle-cell">
                <b>Positive Predictive Value</b>
              </td>
              <td>{props.posPredictiveValue?.value ?? 'n/a'}</td>
              <td style={{ textAlign: 'center', paddingLeft: '2em' }}>
                {props.posPredictiveValue?.confidenceInterval ?? 'n/a'}
              </td>
              <td className="stats-table_rightmost-cell">
                {props.posPredictiveValue?.pvalue ?? 'n/a'}
              </td>
            </tr>
            <tr>
              <td className="stats-table_bottom-left-cell">
                Diagnostic test performance
              </td>
              <td className="stats-table_bottom-middle-cell">
                <b>Negative Predictive Value</b>
              </td>
              <td className="stats-table_bottom-cell">
                {props.negPredictiveValue?.value ?? 'n/a'}
              </td>
              <td
                className="stats-table_bottom-cell"
                style={{ textAlign: 'center', paddingLeft: '2em' }}
              >
                {props.negPredictiveValue?.confidenceInterval ?? 'n/a'}
              </td>
              <td className="stats-table_bottom-right-cell">
                {props.negPredictiveValue?.pvalue ?? 'n/a'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  ) : (
    <div
      style={{
        position: 'relative',
        margin: '15px 0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '350px',
        width: '750px',
        border: '1px solid rgb(191, 191, 191)',
      }}
    >
      <Table width={150} height={150} fill={gray[300]} />
    </div>
  );
}

function ContTableStats(props?: {
  pValue?: number | string;
  degreesFreedom?: number | string;
  chisq?: number | string;
}) {
  return props != null ? (
    <div
      className="MosaicVisualization-StatsTable"
      style={{ margin: '15px 0' }}
    >
      <table>
        <tbody>
          <tr>
            <th>P-value</th>
            <td className="numeric">
              {props.pValue != null ? quantizePvalue(props.pValue) : 'n/a'}
            </td>
          </tr>
          <tr>
            <th>Degrees of freedom</th>
            <td className="numeric">{props.degreesFreedom ?? 'n/a'}</td>
          </tr>
          <tr>
            <th>Chi-squared</th>
            <td className="numeric">{props.chisq ?? 'n/a'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  ) : (
    <div
      style={{
        position: 'relative',
        margin: '15px 0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '350px',
        width: '750px',
        border: '1px solid rgb(191, 191, 191)',
      }}
    >
      <Table width={150} height={150} fill={gray[300]} />
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
              // new 2x2 stats table content
              chiSq: stats[0].chiSq,
              fisher: stats[0].fisher,
              prevalence: stats[0].prevalence,
              oddsRatio: stats[0].oddsRatio,
              relativeRisk: stats[0].relativeRisk,
              sensitivity: stats[0].sensitivity,
              specificity: stats[0].specificity,
              posPredictiveValue: stats[0].posPredictiveValue,
              negPredictiveValue: stats[0].negPredictiveValue,
              facetVariableDetails: stats[0].facetVariableDetails,
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
  showMissingness?: boolean,
  xAxisReferenceValue?: string,
  yAxisReferenceValue?: string
): MosaicRequestParams | TwoByTwoRequestParams {
  const baseConfig = {
    studyId,
    filters,
    config: {
      // add outputEntityId
      outputEntityId,
      xAxisVariable,
      yAxisVariable,
      facetVariable: facetVariable ? [facetVariable] : [],
      showMissingness:
        facetVariable != null && showMissingness ? 'TRUE' : 'FALSE',
    },
  };
  if (!xAxisReferenceValue || !yAxisReferenceValue) {
    return baseConfig as MosaicRequestParams;
  } else {
    return {
      ...baseConfig,
      config: {
        ...baseConfig.config,
        xAxisReferenceValue,
        yAxisReferenceValue,
      },
    } as TwoByTwoRequestParams;
  }
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
