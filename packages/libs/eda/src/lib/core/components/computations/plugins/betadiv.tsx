import {
  useFindEntityAndVariableCollection,
  useStudyMetadata,
  useVariableCollections,
} from '../../..';
import { VariableCollectionDescriptor } from '../../../types/variable';
import { scatterplotVisualization } from '../../visualizations/implementations/ScatterplotVisualization';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { isEqual, partial } from 'lodash';
import {
  useConfigChangeHandler,
  assertComputationWithConfig,
  makeVariableCollectionItems,
  isNotAbsoluteAbundanceVariableCollection,
} from '../Utils';
import * as t from 'io-ts';
import { Computation } from '../../../types/visualization';
import SingleSelect from '@veupathdb/coreui/lib/components/inputs/SingleSelect';
import { useMemo } from 'react';
import ScatterBetadivSVG from '../../visualizations/implementations/selectorIcons/ScatterBetadivSVG';
import { ComputationStepContainer } from '../ComputationStepContainer';
import './Plugins.scss';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

const cx = makeClassNameHelper('AppStepConfigurationContainer');

export type BetaDivConfig = t.TypeOf<typeof BetaDivConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const BetaDivConfig = t.type({
  collectionVariable: VariableCollectionDescriptor,
  betaDivDissimilarityMethod: t.string,
});

export const plugin: ComputationPlugin = {
  configurationComponent: BetaDivConfiguration,
  configurationDescriptionComponent: BetaDivConfigDescriptionComponent,
  createDefaultConfiguration: () => undefined,
  isConfigurationValid: BetaDivConfig.is,
  visualizationPlugins: {
    scatterplot: scatterplotVisualization
      .withOptions({
        getComputedXAxisDetails(config) {
          if (BetaDivConfig.is(config)) {
            return {
              entityId: config.collectionVariable.entityId,
              placeholderDisplayName: 'Beta Diversity Axis 1',
              variableId: 'Axis1',
            };
          }
        },
        getComputedYAxisDetails(config) {
          if (BetaDivConfig.is(config)) {
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
};

function BetaDivConfigDescriptionComponent({
  computation,
}: {
  computation: Computation;
}) {
  const findEntityAndVariableCollection = useFindEntityAndVariableCollection();
  assertComputationWithConfig<BetaDivConfig>(computation, Computation);
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
  const studyMetadata = useStudyMetadata();
  // Include known collection variables in this array.
  const collections = useVariableCollections(
    studyMetadata.rootEntity,
    isNotAbsoluteAbundanceVariableCollection
  );
  if (collections.length === 0)
    throw new Error('Could not find any collections for this app.');

  assertComputationWithConfig<BetaDivConfig>(computation, Computation);
  const configuration = computation.descriptor.configuration;

  const changeConfigHandler = useConfigChangeHandler<BetaDivConfig>(
    analysisState,
    computation,
    visualizationId
  );

  const collectionVarItems = makeVariableCollectionItems(
    collections,
    undefined
  );

  const selectedCollectionVar = useMemo(() => {
    if (configuration && 'collectionVariable' in configuration) {
      const selectedItem = collectionVarItems.find((item) =>
        isEqual(item.value, {
          collectionId: configuration.collectionVariable.collectionId,
          entityId: configuration.collectionVariable.entityId,
        })
      );
      return selectedItem;
    }
  }, [collectionVarItems, configuration]);

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
          <SingleSelect
            value={
              selectedCollectionVar
                ? selectedCollectionVar.value
                : 'Select the data'
            }
            buttonDisplayContent={
              selectedCollectionVar
                ? selectedCollectionVar.display
                : 'Select the data'
            }
            items={collectionVarItems}
            onSelect={partial(changeConfigHandler, 'collectionVariable')}
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
