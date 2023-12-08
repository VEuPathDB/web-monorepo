import {
  useVariableCollections,
  useStudyMetadata,
  useFindEntityAndVariableCollection,
} from '../../..';
import { VariableCollectionDescriptor } from '../../../types/variable';
import { boxplotVisualization } from '../../visualizations/implementations/BoxplotVisualization';
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
import { ComputationStepContainer } from '../ComputationStepContainer';
import './Plugins.scss';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { VariableCollectionSelectList } from '../../variableSelectors/VariableCollectionSelectList';

const cx = makeClassNameHelper('AppStepConfigurationContainer');

export type AlphaDivConfig = t.TypeOf<typeof AlphaDivConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const AlphaDivConfig = t.partial({
  collectionVariable: VariableCollectionDescriptor,
  alphaDivMethod: t.string,
});

const CompleteAlphaDivConfig = partialToCompleteCodec(AlphaDivConfig);

export const plugin: ComputationPlugin = {
  configurationComponent: AlphaDivConfiguration,
  configurationDescriptionComponent: AlphaDivConfigDescriptionComponent,
  createDefaultConfiguration: (): AlphaDivConfig => ({}),
  isConfigurationComplete: CompleteAlphaDivConfig.is,
  visualizationPlugins: {
    boxplot: boxplotVisualization.withOptions({
      getComputedYAxisDetails(config) {
        if (AlphaDivConfig.is(config) && config.collectionVariable) {
          return {
            entityId: config.collectionVariable.entityId,
            placeholderDisplayName: 'Alpha Diversity',
            variableId: 'alphaDiversity',
          };
        }
      },
      hideShowMissingnessToggle: true,
    }),
    scatterplot: scatterplotVisualization.withOptions({
      getComputedYAxisDetails(config) {
        if (AlphaDivConfig.is(config) && config.collectionVariable) {
          return {
            entityId: config.collectionVariable.entityId,
            placeholderDisplayName: 'Alpha Diversity',
            variableId: 'alphaDiversity',
          };
        }
      },
      hideShowMissingnessToggle: true,
    }),
  },
};

function AlphaDivConfigDescriptionComponent({
  computation,
}: {
  computation: Computation;
}) {
  const findEntityAndVariableCollection = useFindEntityAndVariableCollection();
  assertComputationWithConfig(computation, AlphaDivConfig);
  const { configuration } = computation.descriptor;
  const collectionVariable =
    'collectionVariable' in configuration
      ? configuration.collectionVariable
      : undefined;
  const alphaDivMethod =
    'alphaDivMethod' in configuration
      ? configuration.alphaDivMethod
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
        Method:{' '}
        <span>
          {alphaDivMethod ? (
            alphaDivMethod[0].toUpperCase() + alphaDivMethod.slice(1)
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
    </div>
  );
}

// Include available methods in this array.
const ALPHA_DIV_METHODS = ['shannon', 'simpson'];

export function AlphaDivConfiguration(props: ComputationConfigProps) {
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

  assertComputationWithConfig(computation, AlphaDivConfig);
  const configuration = computation.descriptor.configuration;

  const changeConfigHandler = useConfigChangeHandler<AlphaDivConfig>(
    analysisState,
    computation,
    visualizationId
  );

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
          <span>Method</span>
          <SingleSelect
            value={configuration.alphaDivMethod ?? 'Select a method'}
            buttonDisplayContent={
              configuration.alphaDivMethod ?? 'Select a method'
            }
            items={ALPHA_DIV_METHODS.map((method) => ({
              value: method,
              display: method,
            }))}
            onSelect={partial(changeConfigHandler, 'alphaDivMethod')}
          />
        </div>
      </div>
    </ComputationStepContainer>
  );
}
