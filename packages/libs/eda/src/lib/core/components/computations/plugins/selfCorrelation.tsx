import { useMemo } from 'react';
import { VariableTreeNode, useFindEntityAndVariableCollection } from '../../..';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { partial } from 'lodash';
import {
  useConfigChangeHandler,
  assertComputationWithConfig,
  isNotAbsoluteAbundanceVariableCollection,
} from '../Utils';
import { Computation } from '../../../types/visualization';
import { ComputationStepContainer } from '../ComputationStepContainer';
import './Plugins.scss';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { H6 } from '@veupathdb/coreui';
import { bipartiteNetworkVisualization } from '../../visualizations/implementations/BipartiteNetworkVisualization';
import { VariableCollectionSelectList } from '../../variableSelectors/VariableCollectionSingleSelect';
import SingleSelect, {
  ItemGroup,
} from '@veupathdb/coreui/lib/components/inputs/SingleSelect';
import {
  entityTreeToArray,
  findEntityAndVariableCollection,
  isVariableCollectionDescriptor,
} from '../../../utils/study-metadata';
import { IsEnabledInPickerParams } from '../../visualizations/VisualizationTypes';
import { ancestorEntitiesForEntityId } from '../../../utils/data-element-constraints';
import { NumberInput } from '@veupathdb/components/lib/components/widgets/NumberAndDateInputs';
import ExpandablePanel from '@veupathdb/coreui/lib/components/containers/ExpandablePanel';
import { variableCollectionsAreUnique } from '../../../utils/visualization';
import PluginError from '../../visualizations/PluginError';
import {
  CompleteSelfCorrelationConfig,
  SelfCorrelationConfig,
} from '../../../types/apps';

const cx = makeClassNameHelper('AppStepConfigurationContainer');

/**
 * Self-Correlation
 *
 * The Correlation app takes all collections and visualizes the correlation between a collection and itself.
 * For example, if the collection is a set of genes, the app will show the correlation between every pair of genes in the collection.
 *
 * As of 05/14/24, this app will only be available for mbio assay data.
 */

export const plugin: ComputationPlugin = {
  configurationComponent: SelfCorrelationConfiguration,
  configurationDescriptionComponent: SelfCorrelationConfigDescriptionComponent,
  createDefaultConfiguration: () => ({
    prefilterThresholds: {
      proportionNonZero: DEFAULT_PROPORTION_NON_ZERO_THRESHOLD,
      variance: DEFAULT_VARIANCE_THRESHOLD,
      standardDeviation: DEFAULT_STANDARD_DEVIATION_THRESHOLD,
    },
  }),
  isConfigurationComplete: (configuration) => {
    // First, the configuration must be complete
    // ANN CLEAN
    if (!CompleteSelfCorrelationConfig.is(configuration)) return false;
    return true;
  },
  visualizationPlugins: {
    bipartitenetwork: bipartiteNetworkVisualization.withOptions({
      getLegendTitle(config) {
        if (SelfCorrelationConfig.is(config)) {
          return ['absolute correlation coefficient', 'correlation direction'];
        } else {
          return [];
        }
      },
      // makeGetNodeMenuActions(studyMetadata) {
      //   const entities = entityTreeToArray(studyMetadata.rootEntity);
      //   const variables = entities.flatMap((e) => e.variables);
      //   const collections = entities.flatMap(
      //     (entity) => entity.collections ?? []
      //   );
      //   const hostCollection = collections.find(
      //     (c) => c.id === 'EUPATH_0005050'
      //   );
      //   const parasiteCollection = collections.find(
      //     (c) => c.id === 'EUPATH_0005051'
      //   );
      //   return function getNodeActions(nodeId: string) {
      //     const [, variableId] = nodeId.split('.');
      //     const variable = variables.find((v) => v.id === variableId);
      //     if (variable == null) return [];

      //     // E.g., "qa."
      //     const urlPrefix = window.location.host.replace(
      //       /(plasmodb|hostdb)\.org/,
      //       ''
      //     );

      //     const href = parasiteCollection?.memberVariableIds.includes(
      //       variable.id
      //     )
      //       ? `//${urlPrefix}plasmodb.org/plasmo/app/search/transcript/GenesByRNASeqpfal3D7_Lee_Gambian_ebi_rnaSeq_RSRCWGCNAModules?param.wgcnaParam=${variable.displayName.toLowerCase()}&autoRun=1`
      //       : hostCollection?.memberVariableIds.includes(variable.id)
      //       ? `//${urlPrefix}hostdb.org/hostdb/app/search/transcript/GenesByRNASeqhsapREF_Lee_Gambian_ebi_rnaSeq_RSRCWGCNAModules?param.wgcnaParam=${variable.displayName.toLowerCase()}&autoRun=1`
      //       : undefined;
      //     if (href == null) return [];
      //     return [
      //       {
      //         label: 'See list of genes',
      //         href,
      //       },
      //     ];
      //   };
      // },
      // getParitionNames(studyMetadata, config) {
      //   if (CorrelationConfig.is(config)) {
      //     const entities = entityTreeToArray(studyMetadata.rootEntity);
      //     const partition1Name = findEntityAndVariableCollection(
      //       entities,
      //       config.data1?.collectionSpec
      //     )?.variableCollection.displayName;
      //     const partition2Name =
      //       config.data2?.dataType === 'collection'
      //         ? findEntityAndVariableCollection(
      //             entities,
      //             config.data2?.collectionSpec
      //           )?.variableCollection.displayName
      //         : 'Continuous metadata variables';
      //     return { partition1Name, partition2Name };
      //   }
      // },
    }), // Must match name in data service and in visualization.tsx
  },
  isEnabledInPicker: isEnabledInPicker,
  studyRequirements:
    'These visualizations are only available for studies with compatible metadata.',
};

// Renders on the thumbnail page to give a summary of the app instance
function SelfCorrelationConfigDescriptionComponent({
  computation,
}: {
  computation: Computation;
}) {
  const findEntityAndVariableCollection = useFindEntityAndVariableCollection();
  assertComputationWithConfig(computation, SelfCorrelationConfig);

  const { data1, correlationMethod } = computation.descriptor.configuration;

  const entityAndCollectionVariableTreeNode =
    findEntityAndVariableCollection(data1);

  const correlationMethodDisplayName = correlationMethod
    ? CORRELATION_METHODS.find((method) => method.value === correlationMethod)
        ?.displayName
    : undefined;

  return (
    <div className="ConfigDescriptionContainer">
      <h4>
        Data 1:{' '}
        <span>
          {entityAndCollectionVariableTreeNode ? (
            `${entityAndCollectionVariableTreeNode.entity.displayName} > ${entityAndCollectionVariableTreeNode.variableCollection.displayName}`
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
      {/* The method should be disabled unti lthe data is chosen */}
      <h4>
        Method:{' '}
        <span>
          {correlationMethod ? (
            correlationMethodDisplayName
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
    </div>
  );
}

const CORRELATION_METHODS = [
  { value: 'spearman', displayName: 'Spearman' },
  { value: 'pearson', displayName: 'Pearson' },
  { value: 'sparcc', displayName: 'SparCC' },
];
const DEFAULT_PROPORTION_NON_ZERO_THRESHOLD = 0.05;
const DEFAULT_VARIANCE_THRESHOLD = 0;
const DEFAULT_STANDARD_DEVIATION_THRESHOLD = 0;

// Shows as Step 1 in the full screen visualization page
export function SelfCorrelationConfiguration(props: ComputationConfigProps) {
  const {
    computationAppOverview,
    computation,
    analysisState,
    visualizationId,
  } = props;

  const configuration = computation.descriptor
    .configuration as SelfCorrelationConfig;

  assertComputationWithConfig(computation, SelfCorrelationConfig);

  const changeConfigHandler = useConfigChangeHandler(
    analysisState,
    computation,
    visualizationId
  );

  // Content for the expandable help section
  // Note the text is dependent on the context, for example in genomics we'll use different
  // language than in mbio.
  const helpContent = (
    <div className={cx('-HelpInfoContainer')}>
      <H6>What is correlation?</H6>
      <p>
        The correlation between two variables (genes, sample metadata, etc.)
        describes the degree to which their presence in samples co-fluctuate.
        For example, the Age and Shoe Size of children are correlated since as a
        child ages, their feet grow.
      </p>
      {/* ANN FILL IN */}
    </div>
  );

  const correlationMethodSelectorText = useMemo(() => {
    if (configuration.correlationMethod) {
      return (
        CORRELATION_METHODS.find(
          (method) => method.value === configuration.correlationMethod
        )?.displayName ?? 'Select a method'
      );
    } else {
      return 'Select a method';
    }
  }, [configuration.correlationMethod]);

  return (
    <ComputationStepContainer
      computationStepInfo={{
        stepNumber: 1,
        stepTitle: `Configure ${computationAppOverview.displayName}`,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className={cx()}>
          <div className={cx('-CorrelationOuterConfigContainer')}>
            <H6>Input Data</H6>
            <div className={cx('-InputContainer')}>
              <span>Data 1</span>
              <VariableCollectionSelectList
                value={configuration.data1}
                onSelect={partial(changeConfigHandler, 'data1')}
                collectionPredicate={isNotAbsoluteAbundanceVariableCollection}
              />
            </div>
          </div>
          <div className={cx('-CorrelationOuterConfigContainer')}>
            <H6>Correlation Method</H6>
            <div className={cx('-InputContainer')}>
              <span>Method</span>
              <SingleSelect
                value={configuration.correlationMethod ?? 'Select a method'}
                buttonDisplayContent={correlationMethodSelectorText}
                items={CORRELATION_METHODS.map((method) => ({
                  value: method.value,
                  display: method.displayName,
                }))}
                onSelect={partial(changeConfigHandler, 'correlationMethod')}
              />
            </div>
          </div>
          <div className={cx('-CorrelationOuterConfigContainer')}>
            <H6>Prefilter Data</H6>
            <div className={cx('-InputContainer')}>
              <span>Prevalence: </span>
              <span className={cx('-DescriptionContainer')}>
                Keep if abundance is non-zero in at least{' '}
              </span>
              <NumberInput
                minValue={0}
                maxValue={100}
                step={1}
                value={
                  // display with % value
                  configuration.prefilterThresholds?.proportionNonZero != null
                    ? configuration.prefilterThresholds?.proportionNonZero * 100
                    : DEFAULT_PROPORTION_NON_ZERO_THRESHOLD * 100
                }
                onValueChange={(newValue) => {
                  changeConfigHandler('prefilterThresholds', {
                    proportionNonZero:
                      // save as decimal point, not %
                      newValue != null
                        ? Number((newValue as number) / 100)
                        : DEFAULT_PROPORTION_NON_ZERO_THRESHOLD,
                    variance:
                      configuration.prefilterThresholds?.variance ??
                      DEFAULT_VARIANCE_THRESHOLD,
                    standardDeviation:
                      configuration.prefilterThresholds?.standardDeviation ??
                      DEFAULT_STANDARD_DEVIATION_THRESHOLD,
                  });
                }}
                containerStyles={{ width: '5.5em' }}
              />
              <span className={cx('-DescriptionContainer')}>% of samples</span>
            </div>
          </div>
        </div>
        <div>
          {/* PluginError here if the method doesn't agree with the data */}
        </div>
        <ExpandablePanel
          title="Learn more about correlation"
          subTitle={{}}
          children={helpContent}
          stylePreset="floating"
          themeRole="primary"
          styleOverrides={{ container: { marginLeft: 40 } }}
        />
      </div>
    </ComputationStepContainer>
  );
}

// The self-correlation app is only available for studies that have at least one collection.
function isEnabledInPicker({
  studyMetadata,
}: IsEnabledInPickerParams): boolean {
  if (!studyMetadata) return false;

  const entities = entityTreeToArray(studyMetadata.rootEntity);
  // Ensure there are collections in this study. Otherwise, disable app
  const studyHasCollections = entities.some(
    (entity) => !!entity.collections?.length
  );

  return studyHasCollections;
}
