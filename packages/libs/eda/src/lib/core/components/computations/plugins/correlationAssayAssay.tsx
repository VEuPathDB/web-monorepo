import { useEffect, useMemo } from 'react';
import {
  FeaturePrefilterThresholds,
  useFindEntityAndVariableCollection,
} from '../../..';
import { VariableCollectionDescriptor } from '../../../types/variable';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { partial } from 'lodash';
import {
  useConfigChangeHandler,
  assertComputationWithConfig,
  isNotAbsoluteAbundanceVariableCollection,
  partialToCompleteCodec,
  isTaxonomicVariableCollection,
  isFunctionalCollection,
} from '../Utils';
import * as t from 'io-ts';
import { Computation } from '../../../types/visualization';
import { ComputationStepContainer } from '../ComputationStepContainer';
import './Plugins.scss';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { H6 } from '@veupathdb/coreui';
import { bipartiteNetworkVisualization } from '../../visualizations/implementations/BipartiteNetworkVisualization';
import { variableCollectionsAreUnique } from '../../../utils/visualization';
import PluginError from '../../visualizations/PluginError';
import { VariableCollectionSelectList } from '../../variableSelectors/VariableCollectionSingleSelect';
import SingleSelect from '@veupathdb/coreui/lib/components/inputs/SingleSelect';
import { IsEnabledInPickerParams } from '../../visualizations/VisualizationTypes';
import {
  entityTreeToArray,
  findEntityAndVariableCollection,
} from '../../../utils/study-metadata';
import { NumberInput } from '@veupathdb/components/lib/components/widgets/NumberAndDateInputs';
import { ExpandablePanel } from '@veupathdb/coreui';
import {
  preorder,
  preorderSeq,
} from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

const cx = makeClassNameHelper('AppStepConfigurationContainer');

/**
 * Correlation
 *
 * The Correlation Assay vs Assay app takes in a two user-selected collections (ex. Species and Pathways) and
 * runs a pairwise correlation of all the member variables of one collection against the other. The result is
 * a correlation coefficient and a significance value for each pair.
 *
 * In its current state, this app is targeted toward a specific use case of correlating
 * taxa with pathways or genes.
 */

export type CorrelationAssayAssayConfig = t.TypeOf<
  typeof CorrelationAssayAssayConfig
>;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CorrelationAssayAssayConfig = t.partial({
  collectionVariable1: VariableCollectionDescriptor,
  collectionVariable2: VariableCollectionDescriptor,
  correlationMethod: t.string,
  prefilterThresholds: FeaturePrefilterThresholds,
});

const CompleteCorrelationAssayAssayConfig = partialToCompleteCodec(
  CorrelationAssayAssayConfig
);

export const plugin: ComputationPlugin = {
  configurationComponent: CorrelationAssayAssayConfiguration,
  configurationDescriptionComponent:
    CorrelationAssayAssayConfigDescriptionComponent,
  createDefaultConfiguration: () => ({}),
  isConfigurationComplete: (configuration) => {
    return (
      CompleteCorrelationAssayAssayConfig.is(configuration) &&
      variableCollectionsAreUnique([
        configuration.collectionVariable1,
        configuration.collectionVariable2,
      ])
    );
  },
  visualizationPlugins: {
    bipartitenetwork: bipartiteNetworkVisualization.withOptions({
      getLegendTitle(config) {
        if (CorrelationAssayAssayConfig.is(config)) {
          return ['absolute correlation coefficient', 'correlation direction'];
        } else {
          return [];
        }
      },
      getParitionNames(studyMetadata, config) {
        if (CorrelationAssayAssayConfig.is(config)) {
          const entities = entityTreeToArray(studyMetadata.rootEntity);
          const partition1Name = findEntityAndVariableCollection(
            entities,
            config.collectionVariable1
          )?.variableCollection.displayName;
          const partition2Name = findEntityAndVariableCollection(
            entities,
            config.collectionVariable2
          )?.variableCollection.displayName;
          return { partition1Name, partition2Name };
        }
      },
      makeGetNodeMenuActions(studyMetadata) {
        const entities = entityTreeToArray(studyMetadata.rootEntity);
        const variables = entities.flatMap((e) => e.variables);
        const collections = entities.flatMap(
          (entity) => entity.collections ?? []
        );
        const hostCollection = collections.find(
          (c) => c.id === 'EUPATH_0005050'
        );
        const parasiteCollection = collections.find(
          (c) => c.id === 'EUPATH_0005051'
        );
        return function getNodeActions(nodeId: string) {
          const [, variableId] = nodeId.split('.');
          const variable = variables.find((v) => v.id === variableId);
          if (variable == null) return [];

          const href = parasiteCollection?.memberVariableIds.includes(
            variable.id
          )
            ? `https://qa.plasmodb.org/plasmo/app/search/transcript/GenesByRNASeqpfal3D7_Lee_Gambian_ebi_rnaSeq_RSRCWGCNAModules?param.wgcnaParam=${variable.displayName.toLowerCase()}&autoRun=1`
            : hostCollection?.memberVariableIds.includes(variable.id)
            ? `https://qa.hostdb.org/hostdb/app/search/transcript/GenesByRNASeqhsapREF_Lee_Gambian_ebi_rnaSeq_RSRCWGCNAModules?param.wgcnaParam=${variable.displayName.toLowerCase()}&autoRun=1`
            : undefined;
          if (href == null) return [];
          return [
            {
              label: 'See list of genes',
              href,
            },
          ];
        };
      },
    }), // Must match name in data service and in visualization.tsx
  },
  isEnabledInPicker: isEnabledInPicker,
  studyRequirements:
    'These visualizations are only available for studies with metagenomic data.',
};

// Renders on the thumbnail page to give a summary of the app instance
function CorrelationAssayAssayConfigDescriptionComponent({
  computation,
}: {
  computation: Computation;
}) {
  const findEntityAndVariableCollection = useFindEntityAndVariableCollection();
  assertComputationWithConfig(computation, CorrelationAssayAssayConfig);

  const { collectionVariable1, collectionVariable2, correlationMethod } =
    computation.descriptor.configuration;

  const entityAndCollectionVariableTreeNode1 =
    findEntityAndVariableCollection(collectionVariable1);
  const entityAndCollectionVariableTreeNode2 =
    findEntityAndVariableCollection(collectionVariable2);

  const correlationMethodDisplayName = correlationMethod
    ? CORRELATION_METHODS.find((method) => method.value === correlationMethod)
        ?.displayName
    : undefined;

  return (
    <div className="ConfigDescriptionContainer">
      <h4>
        Taxonomic level:{' '}
        <span>
          {entityAndCollectionVariableTreeNode1 ? (
            `${entityAndCollectionVariableTreeNode1.entity.displayName} > ${entityAndCollectionVariableTreeNode1.variableCollection.displayName}`
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
      <h4>
        Functional data:{' '}
        <span>
          {entityAndCollectionVariableTreeNode2 ? (
            `${entityAndCollectionVariableTreeNode2.entity.displayName} > ${entityAndCollectionVariableTreeNode2.variableCollection.displayName}`
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
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
];
const DEFAULT_PROPORTION_NON_ZERO_THRESHOLD = 0.05;
const DEFAULT_VARIANCE_THRESHOLD = 0;
const DEFAULT_STANDARD_DEVIATION_THRESHOLD = 0;

// Shows as Step 1 in the full screen visualization page
export function CorrelationAssayAssayConfiguration(
  props: ComputationConfigProps
) {
  const {
    computationAppOverview,
    computation,
    analysisState,
    visualizationId,
  } = props;

  assertComputationWithConfig(computation, CorrelationAssayAssayConfig);

  const { configuration } = computation.descriptor;

  const changeConfigHandler = useConfigChangeHandler(
    analysisState,
    computation,
    visualizationId
  );

  // set initial prefilterThresholds
  useEffect(() => {
    changeConfigHandler('prefilterThresholds', {
      proportionNonZero:
        configuration.prefilterThresholds?.proportionNonZero ??
        DEFAULT_PROPORTION_NON_ZERO_THRESHOLD,
      variance:
        configuration.prefilterThresholds?.variance ??
        DEFAULT_VARIANCE_THRESHOLD,
      standardDeviation:
        configuration.prefilterThresholds?.standardDeviation ??
        DEFAULT_STANDARD_DEVIATION_THRESHOLD,
    });
  }, []);

  // Content for the expandable help section
  const helpContent = (
    <div className={cx('-HelpInfoContainer')}>
      <H6>What is correlation?</H6>
      <p>
        The correlation between two variables (taxa, genes, sample metadata,
        etc.) describes the degree to which their presence in samples
        co-fluctuate. For example, the Age and Shoe Size of children are
        correlated since as a child ages, their feet grow.
      </p>
      <p>Here we look for correlation between:</p>
      <ol>
        <li>Abundance of taxa at a given taxonomic level</li>
        <li>Abundance of functional data (e.g. pathways, genes)</li>
      </ol>
      <br></br>
      <H6>Inputs:</H6>
      <p>
        <ul>
          <li>
            <strong>Taxonomic Level.</strong> The taxonomic abundance data to be
            used in the calculation.
          </li>
          <li>
            <strong>Functional Data.</strong> The pathway, metabolic, or gene
            data to be correlatd against the taxonomic abundance data.
          </li>
          <li>
            <strong>Method.</strong> The type of correlation to compute. The
            Pearson method looks for linear trends in the data, while the
            Spearman method looks for a monotonic relationship. For Spearman and
            Pearson correlation, we use the rcorr function from the Hmisc
            package.
          </li>
          <li>
            <strong>Prevalence Prefilter.</strong> Remove variables that do not
            have a set percentage of non-zero abundance across samples. Removing
            rarely occurring features before calculating correlation can prevent
            some spurious results.
          </li>
        </ul>
      </p>
      <br></br>
      <H6>Outputs:</H6>
      <p>
        For each pair of variables, the correlation computation returns
        <ul>
          <li>
            Correlation coefficient. A value between [-1, 1] that describes the
            similarity of the input variables. Positive values indicate that
            both variables rise and fall together, whereas negative values
            indicate that as one rises, the other falls.
          </li>
          <li>
            P Value. A measure of the probability of observing the result by
            chance.
          </li>
        </ul>
      </p>
      <br></br>
      <H6>More Questions?</H6>
      <p>
        Check out the{' '}
        <a href="https://github.com/VEuPathDB/microbiomeComputations/blob/master/R/method-correlation.R">
          correlation function
        </a>{' '}
        in our{' '}
        <a href="https://github.com/VEuPathDB/microbiomeComputations/tree/master">
          microbiomeComputations
        </a>{' '}
        R package.
      </p>
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
              {/* <span>Taxonomic level</span> */}
              <span>Data 1</span>
              <VariableCollectionSelectList
                value={configuration.collectionVariable1}
                onSelect={partial(changeConfigHandler, 'collectionVariable1')}
                // collectionPredicate={isTaxonomicVariableCollection}
                collectionPredicate={isNotAbsoluteAbundanceVariableCollection}
              />
              {/* <span>Functional data</span>
               */}
              <span>Data 2</span>
              <VariableCollectionSelectList
                value={configuration.collectionVariable2}
                onSelect={partial(changeConfigHandler, 'collectionVariable2')}
                // collectionPredicate={isFunctionalCollection}
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
          <PluginError
            error={
              !variableCollectionsAreUnique([
                configuration.collectionVariable1,
                configuration.collectionVariable2,
              ])
                ? 'Input data must be unique. Please select different data.'
                : undefined
            }
          />
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

// The correlation assay x assay app should only be available
// for studies with metagenomic data.
function isEnabledInPicker({
  studyMetadata,
}: IsEnabledInPickerParams): boolean {
  if (!studyMetadata) return false;

  /** Temporary removal of collection type restriction!
   * This temporary change allows all collections to play in the assay v assay app.
   * The hack will be removed as part of #906 part 2.
   */
  // const entities = entityTreeToArray(studyMetadata.rootEntity);

  // // Check that the metagenomic entity exists _and_ that it has
  // // at least one collection.
  // const hasMetagenomicData = entities.some(
  //   (entity) => entity.id === 'OBI_0002623' && !!entity.collections?.length
  // ); // OBI_0002623 = Metagenomic sequencing assay

  // return hasMetagenomicData;

  /** end of temporary change */

  return true;
}
