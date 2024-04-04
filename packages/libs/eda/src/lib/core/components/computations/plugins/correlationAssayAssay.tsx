import { useEffect, useMemo } from 'react';
import { useFindEntityAndVariableCollection } from '../../..';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { partial } from 'lodash';
import {
  useConfigChangeHandler,
  assertComputationWithConfig,
  isFunctionalCollection,
  isTaxonomicVariableCollection,
} from '../Utils';
import * as t from 'io-ts';
import { Computation } from '../../../types/visualization';
import { ComputationStepContainer } from '../ComputationStepContainer';
import './Plugins.scss';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { H6 } from '@veupathdb/coreui';
import { bipartiteNetworkVisualization } from '../../visualizations/implementations/BipartiteNetworkVisualization';
import { variableCollectionsAreUnique } from '../../../utils/visualization';
import { VariableCollectionSelectList } from '../../variableSelectors/VariableCollectionSingleSelect';
import SingleSelect from '@veupathdb/coreui/lib/components/inputs/SingleSelect';
import { IsEnabledInPickerParams } from '../../visualizations/VisualizationTypes';
import { NumberInput } from '@veupathdb/components/lib/components/widgets/NumberAndDateInputs';
import { ExpandablePanel } from '@veupathdb/coreui';
import {
  entityTreeToArray,
  isVariableCollectionDescriptor,
} from '../../../utils/study-metadata';
import {
  CompleteCorrelationConfig,
  CorrelationConfig,
} from '../../../types/apps';

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

export const plugin: ComputationPlugin = {
  configurationComponent: CorrelationAssayAssayConfiguration,
  configurationDescriptionComponent:
    CorrelationAssayAssayConfigDescriptionComponent,
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
    'These visualizations are only available for studies with metagenomic data.',
};

// Renders on the thumbnail page to give a summary of the app instance
function CorrelationAssayAssayConfigDescriptionComponent({
  computation,
}: {
  computation: Computation;
}) {
  const findEntityAndVariableCollection = useFindEntityAndVariableCollection();
  assertComputationWithConfig(computation, CorrelationConfig);

  const { data1, data2, correlationMethod } =
    computation.descriptor.configuration;

  const entityAndCollectionVariableTreeNode1 = findEntityAndVariableCollection(
    data1?.collectionSpec
  );
  const entityAndCollectionVariableTreeNode2 = findEntityAndVariableCollection(
    data2?.collectionSpec
  );

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

  assertComputationWithConfig(computation, CorrelationConfig);

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
              <span>Taxonomic level</span>
              <VariableCollectionSelectList
                value={configuration.data1?.collectionSpec}
                onSelect={(value) => {
                  if (isVariableCollectionDescriptor(value))
                    changeConfigHandler('data1', {
                      dataType: 'collection',
                      collectionSpec: value,
                    });
                }}
                collectionPredicate={isTaxonomicVariableCollection}
              />
              <span>Functional data</span>
              <VariableCollectionSelectList
                value={configuration.data2?.collectionSpec}
                onSelect={(value) => {
                  if (isVariableCollectionDescriptor(value))
                    changeConfigHandler('data2', {
                      dataType: 'collection',
                      collectionSpec: value,
                    });
                }}
                collectionPredicate={isFunctionalCollection}
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

  const entities = entityTreeToArray(studyMetadata.rootEntity);

  // Check that the metagenomic entity exists _and_ that it has
  // at least one collection.
  const hasMetagenomicData = entities.some(
    (entity) => entity.id === 'OBI_0002623' && !!entity.collections?.length
  ); // OBI_0002623 = Metagenomic sequencing assay

  return hasMetagenomicData;

  return true;
}
