import { useEffect, useMemo } from 'react';
import {
  FeaturePrefilterThresholds,
  VariableTreeNode,
  useFindEntityAndVariableCollection,
} from '../../..';
import { CorrelationInputData } from '../../../types/variable';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { partial } from 'lodash';
import {
  useConfigChangeHandler,
  assertComputationWithConfig,
  isNotAbsoluteAbundanceVariableCollection,
  partialToCompleteCodec,
} from '../Utils';
import * as t from 'io-ts';
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
  isVariableCollectionDescriptor,
} from '../../../utils/study-metadata';
import { IsEnabledInPickerParams } from '../../visualizations/VisualizationTypes';
import { ancestorEntitiesForEntityId } from '../../../utils/data-element-constraints';
import { NumberInput } from '@veupathdb/components/lib/components/widgets/NumberAndDateInputs';
import ExpandablePanel from '@veupathdb/coreui/lib/components/containers/ExpandablePanel';
import { MixedVariableSelectList } from '../../variableSelectors/MixedVariableSingleSelect';
import {
  nonUniqueWarning,
  variableCollectionsAreUnique,
} from '../../../utils/visualization';
import PluginError from '../../visualizations/PluginError';

const cx = makeClassNameHelper('AppStepConfigurationContainer');

/**
 * Correlation
 *
 * The Correlation app takes all collections and offers correlation between any pair of unique collections
 * or between a collection and continuous metadata variables. This is the most general of the correlation
 * plugins to date.
 *
 * As of 03/2024, this correlation plugin is used for genomics (except vectorbase) sites
 * to help them understand WGCNA outputs and their relationship to metadata.
 */

export type CorrelationConfig = t.TypeOf<typeof CorrelationConfig>;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CorrelationConfig = t.partial({
  data1: CorrelationInputData,
  data2: CorrelationInputData,
  correlationMethod: t.string,
  prefilterThresholds: FeaturePrefilterThresholds,
});

const CompleteCorrelationConfig = partialToCompleteCodec(CorrelationConfig);

export const plugin: ComputationPlugin = {
  configurationComponent: CorrelationConfiguration,
  configurationDescriptionComponent: CorrelationConfigDescriptionComponent,
  createDefaultConfiguration: () => ({}),
  isConfigurationComplete: (configuration) => {
    // Configuration must be complete and have unique values for data1 and data2.
    return (
      CompleteCorrelationConfig.is(configuration) &&
      isVariableCollectionDescriptor(configuration.data1?.collectionSpec) &&
      isVariableCollectionDescriptor(configuration.data2?.collectionSpec) &&
      variableCollectionsAreUnique([
        configuration.data1?.collectionSpec,
        configuration.data2?.collectionSpec,
      ])
    );
  },
  visualizationPlugins: {
    bipartitenetwork: bipartiteNetworkVisualization.withOptions({
      getLegendTitle(config) {
        if (CorrelationConfig.is(config)) {
          return ['absolute correlation coefficient', 'correlation direction'];
        } else {
          return [];
        }
      },
    }), // Must match name in data service and in visualization.tsx
  },
  isEnabledInPicker: isEnabledInPicker,
  studyRequirements:
    'These visualizations are only available for studies with compatible metadata.',
};

// Renders on the thumbnail page to give a summary of the app instance
function CorrelationConfigDescriptionComponent({
  computation,
}: {
  computation: Computation;
}) {
  const findEntityAndVariableCollection = useFindEntityAndVariableCollection();
  assertComputationWithConfig(computation, CorrelationConfig);

  const { data1, data2, correlationMethod } =
    computation.descriptor.configuration;

  const entityAndCollectionVariableTreeNode = findEntityAndVariableCollection(
    data1?.collectionSpec
  );

  const entityAndCollectionVariable2TreeNode = findEntityAndVariableCollection(
    data2?.collectionSpec
  );

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
      <h4>
        Data 2:{' '}
        <span>
          {data2?.dataType === 'metadata' ? (
            'Continuous metadata variables'
          ) : entityAndCollectionVariable2TreeNode ? (
            `${entityAndCollectionVariable2TreeNode.entity.displayName} > ${entityAndCollectionVariable2TreeNode.variableCollection.displayName}`
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
export function CorrelationConfiguration(props: ComputationConfigProps) {
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
      <p>Here we look for correlation between:</p>
      <ol>
        <li>Eigengene profiles derived from modules in a WGCNA analysis</li>
        <li>
          Continuous metadata variables that are compatable, i.e. on an entity
          that is 1-1 with the assay entity, or other eigengene profiles.
        </li>
      </ol>
      <br></br>
      <H6>Inputs:</H6>
      <p>
        <ul>
          <li>
            <strong>Data 1.</strong> A set of eigengene profiles, either from
            the host or pathogen.
          </li>
          <li>
            <strong>Data 2.</strong> All compatable metdata, or a second set of
            eigengene profiles, either from the host or pathogen.
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
            have a set percentage of non-zero values across samples. Removing
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
            values indicate that both variables rise and fall together, whereas
            negative values indicate that as one rises, the other falls.
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

  const metadataItemGroup: ItemGroup<string> = {
    label: 'Metadata',
    items: [
      {
        value: 'metadata',
        display: 'Continuous metadata variables',
      },
    ],
  };

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
                onSelect={(value) =>
                  changeConfigHandler('data1', {
                    dataType: 'collection',
                    collectionSpec: value,
                  })
                }
                collectionPredicate={isNotAbsoluteAbundanceVariableCollection}
              />
              <span>Data 2</span>
              <MixedVariableSelectList
                value={
                  configuration.data2?.dataType === 'metadata'
                    ? 'metadata'
                    : configuration.data2?.collectionSpec
                }
                onSelect={(value) => {
                  if (isVariableCollectionDescriptor(value)) {
                    changeConfigHandler('data2', {
                      dataType: 'collection',
                      collectionSpec: value,
                    });
                  } else {
                    changeConfigHandler('data2', {
                      dataType: 'metadata',
                    });
                  }
                }}
                collectionPredicate={isNotAbsoluteAbundanceVariableCollection}
                additionalItemGroups={[metadataItemGroup]}
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
              isVariableCollectionDescriptor(
                configuration.data1?.collectionSpec
              ) &&
              isVariableCollectionDescriptor(
                configuration.data2?.collectionSpec
              ) &&
              !variableCollectionsAreUnique([
                configuration.data1?.collectionSpec,
                configuration.data2?.collectionSpec,
              ])
                ? 'Input data must be unique. Please select different data.'
                : undefined
            }
            bannerType="error"
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
