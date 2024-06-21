import { useMemo } from 'react';
import { useFindEntityAndVariableCollection } from '../../..';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { partial } from 'lodash';
import {
  useConfigChangeHandler,
  assertComputationWithConfig,
  isTaxonomicVariableCollection,
} from '../Utils';
import { Computation } from '../../../types/visualization';
import { ComputationStepContainer } from '../ComputationStepContainer';
import './Plugins.scss';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { H6 } from '@veupathdb/coreui';
import { networkVisualization } from '../../visualizations/implementations/NetworkVisualization';
import { VariableCollectionSelectList } from '../../variableSelectors/VariableCollectionSingleSelect';
import SingleSelect from '@veupathdb/coreui/lib/components/inputs/SingleSelect';
import { entityTreeToArray } from '../../../utils/study-metadata';
import { IsEnabledInPickerParams } from '../../visualizations/VisualizationTypes';
import { NumberInput } from '@veupathdb/components/lib/components/widgets/NumberAndDateInputs';
import ExpandablePanel from '@veupathdb/coreui/lib/components/containers/ExpandablePanel';
import {
  CompleteSelfCorrelationConfig,
  SelfCorrelationConfig,
} from '../../../types/apps';

const cx = makeClassNameHelper('AppStepConfigurationContainer');

/**
 * Self-Correlation
 *
 * The Correlation app takes a collection and visualizes the correlation between the collection and itself.
 * For example, if the collection is a set of genes, the app will show the correlation between every pair of genes in the collection.
 *
 * As of 05/14/24, this app will only be available for mbio taxonomic data.
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
    return CompleteSelfCorrelationConfig.is(configuration);
  },
  visualizationPlugins: {
    unipartitenetwork: networkVisualization.withOptions({
      getLegendTitle(config) {
        if (SelfCorrelationConfig.is(config)) {
          return ['absolute correlation coefficient', 'correlation direction'];
        } else {
          return [];
        }
      },
    }), // Must match name in data service and in visualization.tsx
  },
  isEnabledInPicker: isEnabledInPicker,
  studyRequirements:
    'These visualizations are only available for studies with compatible collections.',
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
  { value: 'sparcc', displayName: 'SparCC' },
  { value: 'spearman', displayName: 'Spearman' },
  { value: 'pearson', displayName: 'Pearson' },
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
      <p>
        Here we look for correlation between the abundance of different taxa at
        a given taxonomic level
      </p>
      <br></br>
      <H6>Inputs:</H6>
      <p>
        <ul>
          <li>
            <strong>Taxonomic Level.</strong> The taxonomic abundance data to be
            used in the calculation.
          </li>
          <li>
            <strong>Method.</strong> The type of correlation to compute. The
            Pearson method looks for linear trends in the data, while the
            Spearman method looks for a monotonic relationship. For Spearman and
            Pearson correlation, we use the rcorr function from the Hmisc
            package. The SparCC method is a compositional correlation method
            appropriate for taxonomic abundance data and any other compositional
            data.
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
        <a href="https://github.com/microbiomeDB/MicrobiomeDB">
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
              <span>Data 1</span>
              <VariableCollectionSelectList
                value={configuration.data1}
                onSelect={partial(changeConfigHandler, 'data1')}
                collectionPredicate={isTaxonomicVariableCollection}
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
