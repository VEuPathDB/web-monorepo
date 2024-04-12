import { useEffect, useMemo } from 'react';
import { VariableTreeNode, useFindEntityAndVariableCollection } from '../../..';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { partial } from 'lodash';
import {
  useConfigChangeHandler,
  assertComputationWithConfig,
  isNotAbsoluteAbundanceVariableCollection,
} from '../Utils';
import * as t from 'io-ts';
import { Computation } from '../../../types/visualization';
import { ComputationStepContainer } from '../ComputationStepContainer';
import './Plugins.scss';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { H6 } from '@veupathdb/coreui';
import { bipartiteNetworkVisualization } from '../../visualizations/implementations/BipartiteNetworkVisualization';
import { VariableCollectionSelectList } from '../../variableSelectors/VariableCollectionSingleSelect';
import SingleSelect from '@veupathdb/coreui/lib/components/inputs/SingleSelect';
import {
  entityTreeToArray,
  isVariableCollectionDescriptor,
  findEntityAndVariableCollection,
} from '../../../utils/study-metadata';
import { IsEnabledInPickerParams } from '../../visualizations/VisualizationTypes';
import { ancestorEntitiesForEntityId } from '../../../utils/data-element-constraints';
import { NumberInput } from '@veupathdb/components/lib/components/widgets/NumberAndDateInputs';
import ExpandablePanel from '@veupathdb/coreui/lib/components/containers/ExpandablePanel';
import {
  CompleteCorrelationConfig,
  CorrelationConfig,
} from '../../../types/apps';

const cx = makeClassNameHelper('AppStepConfigurationContainer');

/**
 * Correlation
 *
 * The Correlation Assay vs Metadata app takes in a user-selected collection (ex. Species) and
 * runs a correlation of that data against all appropriate metadata in the study (found by the backend). The result is
 * a correlation coefficient and (soon) a significance value for each (assay member, metadata variable) pair.
 *
 * Importantly, this is the first of a few correlation-type apps that are coming along in the near future.
 * There will also be an Assay vs Assay app and a Metadata vs Metadata correlation app. It's possible that
 * when those roll out we'll be able to do a little refactoring to make the code a bit nicer.
 */

export const plugin: ComputationPlugin = {
  configurationComponent: CorrelationAssayMetadataConfiguration,
  configurationDescriptionComponent:
    CorrelationAssayMetadataConfigDescriptionComponent,
  createDefaultConfiguration: () => ({}),
  isConfigurationComplete: CompleteCorrelationConfig.is,
  visualizationPlugins: {
    bipartitenetwork: bipartiteNetworkVisualization.withOptions({
      getLegendTitle(config) {
        if (CorrelationConfig.is(config)) {
          return ['absolute correlation coefficient', 'correlation direction'];
        } else {
          return [];
        }
      },
      getParitionNames(studyMetadata, config) {
        if (CorrelationConfig.is(config)) {
          const entities = entityTreeToArray(studyMetadata.rootEntity);
          const partition1Name = findEntityAndVariableCollection(
            entities,
            config.data1?.collectionSpec
          )?.variableCollection.displayName;
          const partition2Name = 'Continuous metadata variables';
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
    'These visualizations are only available for studies with compatible metadata.',
};

// Renders on the thumbnail page to give a summary of the app instance
function CorrelationAssayMetadataConfigDescriptionComponent({
  computation,
}: {
  computation: Computation;
}) {
  const findEntityAndVariableCollection = useFindEntityAndVariableCollection();
  assertComputationWithConfig(computation, CorrelationConfig);

  const { data1, correlationMethod } = computation.descriptor.configuration;

  const entityAndCollectionVariableTreeNode = findEntityAndVariableCollection(
    data1?.collectionSpec
  );

  const correlationMethodDisplayName = correlationMethod
    ? CORRELATION_METHODS.find((method) => method.value === correlationMethod)
        ?.displayName
    : undefined;

  return (
    <div className="ConfigDescriptionContainer">
      <h4>
        Data:{' '}
        <span>
          {entityAndCollectionVariableTreeNode ? (
            `${entityAndCollectionVariableTreeNode.entity.displayName} > ${entityAndCollectionVariableTreeNode.variableCollection.displayName}`
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
export function CorrelationAssayMetadataConfiguration(
  props: ComputationConfigProps
) {
  const {
    computationAppOverview,
    computation,
    analysisState,
    visualizationId,
  } = props;

  const configuration = computation.descriptor
    .configuration as CorrelationConfig;

  assertComputationWithConfig(computation, CorrelationConfig);

  const changeConfigHandler = useConfigChangeHandler(
    analysisState,
    computation,
    visualizationId
  );

  // Set data2 to metadata. Using a second useEffect ends up clobbering the prefilters one.
  configuration.data2 = {
    dataType: 'metadata',
  };

  // set initial prefilterThresholds
  useEffect(() => {
    console.log('update prefilterThresholds');
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
        <li>
          Abundance of taxa at a given taxonomic level or functional data such
          as pathway abundance
        </li>
        <li>
          Continuous metadata variables that are compatable, i.e. on an entity
          that is 1-1 with the assay entity.
        </li>
      </ol>
      <br></br>
      <H6>Inputs:</H6>
      <p>
        <ul>
          <li>
            <strong>Data.</strong> The abundance data to be correlated against
            the study's metadata variables.
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
            <strong>Correlation coefficient.</strong> A value between [-1, 1]
            that describes the similarity of the input variables. Positive
            values indicate that both the abundance and metadata variable rise
            and fall together, whereas negative values indicate that as one
            rises, the other falls.
          </li>
          <li>
            <strong>P Value.</strong> A measure of the probability of observing
            the result by chance.
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

  console.log(configuration);

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
                value={configuration.data1?.collectionSpec}
                onSelect={(value) => {
                  if (isVariableCollectionDescriptor(value))
                    changeConfigHandler('data1', {
                      dataType: 'collection',
                      collectionSpec: value,
                    });
                }}
                collectionPredicate={isNotAbsoluteAbundanceVariableCollection}
              />
              <span className="FixedInput">Data 2 (fixed)</span>
              <span className="FixedInput FixedInputValue">
                Continuous metadata variables
              </span>
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

// The correlation assay x metadata app is only available for studies
// with appropriate metadata. Specifically, the study
// must have at least one continuous metadata variable that is on a one-to-one path
// from the assay entity.
// We made some assumptions to simplify logic.
// 1. Curated studies have one parent for all assay entities.
// 2. All assay entities are one-to-one with their parent
// 3. Studies with at least 2 entities are curated, so we can check for assay entities using our assay ids.
// 4. Assay entities have no relevant metadata within their own entity.
// See PR #74 in service-eda-compute for the matching logic on the backend.
function isEnabledInPicker({
  studyMetadata,
}: IsEnabledInPickerParams): boolean {
  if (!studyMetadata) return false;

  const entities = entityTreeToArray(studyMetadata.rootEntity);

  // Ensure there are collections in this study. Otherwise, disable app
  const studyHasCollections = entities.some(
    (entity) => !!entity.collections?.length
  );
  if (!studyHasCollections) return false;

  // Find metadata variables.
  let metadataVariables: VariableTreeNode[];
  if (entities.length > 1) {
    // Then we're in a curated study. So we can expect to find an entity with an id in ASSAY_ENTITIES,
    // which we can use to limit our metadata search to only appropriate entities.

    // Step 1. Find the first assay node. Right now Assays are the only entities with collections,
    // so we can just grab the first entity we see that has a collection.
    const firstAssayEntityIndex = entities.findIndex(
      (entity) => !!entity.collections?.length
    );
    if (firstAssayEntityIndex === -1) return false;

    // Step 2. Find all ancestor entites of the assayEntity that are on a one-to-one path with assayEntity.
    // Step 2a. Grab ancestor entities.
    const ancestorEntities = ancestorEntitiesForEntityId(
      entities[firstAssayEntityIndex].id,
      entities
    ).reverse(); // Reverse so that the ancestorEntities[0] is the assay and higher indices are further up the tree.

    // Step 2b. Trim the ancestorEntities so that we only keep those that are on
    // a 1:1 path. Once we find an ancestor that is many to one with its parent, we
    // know we've hit the end of the 1:1 path.
    const lastOneToOneAncestorIndex = ancestorEntities.findIndex(
      (entity) => entity.isManyToOneWithParent
    );
    const oneToOneAncestors = ancestorEntities.slice(
      1, // removing the assay itself since we assume assay entities have no metadata
      lastOneToOneAncestorIndex + 1
    );

    // Step 3. Grab variables from the ancestors.
    metadataVariables = oneToOneAncestors.flatMap((entity) => entity.variables);
  } else {
    // Then there is only one entity in the study. User datasets only have one entity.
    // Regardless, in the one entity case we want to consider all variables that are not
    // part of a collection as candidate metadata variables for this app.

    // Find all variables in any collection, then remove them from the
    // list of all variables to get a list of metadata variables.
    const variablesInACollection = entities[0].collections?.flatMap(
      (collection) => {
        return collection.memberVariableIds;
      }
    );
    metadataVariables = entities[0].variables.filter((variable) => {
      return !variablesInACollection?.includes(variable.id);
    });
  }

  // Final filter - keep only the variables that are numeric and continuous. Support for dates coming soon!
  const hasContinuousVariable = metadataVariables.some(
    (variable) =>
      'dataShape' in variable &&
      variable.dataShape === 'continuous' &&
      (variable.type === 'number' || variable.type === 'integer') // Can remove this line once the backend supports dates.
  );

  return hasContinuousVariable;
}
