import { StudyEntity, useFindEntityAndVariableCollection } from '../../..';
import { VariableCollectionDescriptor } from '../../../types/variable';
import { scatterplotVisualization } from '../../visualizations/implementations/ScatterplotVisualization';
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
import SingleSelect from '@veupathdb/coreui/lib/components/inputs/SingleSelect';
import { useMemo } from 'react';
import ScatterBetadivSVG from '../../visualizations/implementations/selectorIcons/ScatterBetadivSVG';
import { ComputationStepContainer } from '../ComputationStepContainer';
import './Plugins.scss';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { VariableCollectionSelectList } from '../../variableSelectors/VariableCollectionSingleSelect';
import { IsEnabledInPickerParams } from '../../visualizations/VisualizationTypes';
import { entityTreeToArray } from '../../../utils/study-metadata';

const cx = makeClassNameHelper('AppStepConfigurationContainer');

export type BetaDivConfig = t.TypeOf<typeof BetaDivConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const BetaDivConfig = t.partial({
  collectionVariable: VariableCollectionDescriptor,
  betaDivDissimilarityMethod: t.string,
});

const CompleteBetaDivConfig = partialToCompleteCodec(BetaDivConfig);

export const plugin: ComputationPlugin = {
  configurationComponent: BetaDivConfiguration,
  configurationDescriptionComponent: BetaDivConfigDescriptionComponent,
  createDefaultConfiguration: () => ({}),
  isConfigurationComplete: CompleteBetaDivConfig.is,
  visualizationPlugins: {
    scatterplot: scatterplotVisualization
      .withOptions({
        getComputedXAxisDetails(config) {
          if (BetaDivConfig.is(config) && config.collectionVariable) {
            return {
              entityId: config.collectionVariable.entityId,
              placeholderDisplayName: 'Beta Diversity Axis 1',
              variableId: 'Axis1',
            };
          }
        },
        getComputedYAxisDetails(config) {
          if (BetaDivConfig.is(config) && config.collectionVariable) {
            return {
              entityId: config.collectionVariable.entityId,
              placeholderDisplayName: 'Beta Diversity Axis 2',
              variableId: 'Axis2',
            };
          }
        },
        hideShowMissingnessToggle: true,
        hideTrendlines: true,
        hideFacetInputs: true,
        hideLogScale: true,
      })
      .withSelectorIcon(ScatterBetadivSVG),
  },
  isEnabledInPicker: isEnabledInPicker,
  studyRequirements:
    'These visualizations are only available for studies with compatible assay data.',
};

function BetaDivConfigDescriptionComponent({
  computation,
}: {
  computation: Computation;
}) {
  const findEntityAndVariableCollection = useFindEntityAndVariableCollection();
  assertComputationWithConfig(computation, BetaDivConfig);
  const { configuration } = computation.descriptor;
  const collectionVariable =
    'collectionVariable' in configuration
      ? configuration.collectionVariable
      : undefined;
  const betaDivDissimilarityMethod =
    'betaDivDissimilarityMethod' in configuration
      ? configuration.betaDivDissimilarityMethod
      : undefined;
  const updatedCollectionVariable =
    findEntityAndVariableCollection(collectionVariable);
  return (
    <div className="ConfigDescriptionContainer">
      <h4>
        Data:{' '}
        <span>
          {updatedCollectionVariable ? (
            `${updatedCollectionVariable.entity.displayName} > ${updatedCollectionVariable.variableCollection.displayName}`
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
      <h4>
        Dissimilarity method:{' '}
        <span>
          {betaDivDissimilarityMethod ? (
            betaDivDissimilarityMethod[0].toUpperCase() +
            betaDivDissimilarityMethod.slice(1)
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
    </div>
  );
}

// Include available methods in this array.
const BETA_DIV_DISSIMILARITY_METHODS = ['bray', 'jaccard', 'jsd'];

export function BetaDivConfiguration(props: ComputationConfigProps) {
  const {
    computationAppOverview,
    computation,
    analysisState,
    visualizationId,
  } = props;
  assertComputationWithConfig(computation, BetaDivConfig);
  const configuration = computation.descriptor.configuration;

  const changeConfigHandler = useConfigChangeHandler(
    analysisState,
    computation,
    visualizationId
  );

  const betaDivDissimilarityMethod = useMemo(() => {
    if (configuration && 'betaDivDissimilarityMethod' in configuration) {
      return configuration.betaDivDissimilarityMethod;
    }
  }, [configuration]);

  return (
    <ComputationStepContainer
      computationStepInfo={{
        stepNumber: 1,
        stepTitle: `Configure ${computationAppOverview.displayName}`,
      }}
    >
      <div className={cx()}>
        <div className={cx('-InputContainer')}>
          <span>Data</span>
          <VariableCollectionSelectList
            value={configuration.collectionVariable}
            onSelect={partial(changeConfigHandler, 'collectionVariable')}
            collectionPredicate={isNotAbsoluteAbundanceVariableCollection}
          />
        </div>
        <div className={cx('-InputContainer')}>
          <span>Dissimilarity method</span>
          <SingleSelect
            value={betaDivDissimilarityMethod ?? 'Select a method'}
            buttonDisplayContent={
              betaDivDissimilarityMethod ?? 'Select a method'
            }
            items={BETA_DIV_DISSIMILARITY_METHODS.map((method) => ({
              value: method,
              display: method,
            }))}
            onSelect={partial(
              changeConfigHandler,
              'betaDivDissimilarityMethod'
            )}
          />
        </div>
      </div>
    </ComputationStepContainer>
  );
}

// Beta div's only requirement of the study is that it contains
// at least one collection
function isEnabledInPicker({
  studyMetadata,
}: IsEnabledInPickerParams): boolean {
  if (!studyMetadata) return false;
  const entities = entityTreeToArray(studyMetadata.rootEntity);

  // Ensure there are collections in this study. Otherwise, disable app
  const studyHasCollections = entities.some(
    (e): e is StudyEntity & Required<Pick<StudyEntity, 'collections'>> =>
      !!e.collections?.length
  );

  return studyHasCollections;
}
