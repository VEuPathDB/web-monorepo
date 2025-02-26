import { useMemo } from 'react';
import { useFindEntityAndVariableCollection } from '../../..';
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
import { VariableCollectionSelectList } from '../../variableSelectors/VariableCollectionSingleSelect';
import { IsEnabledInPickerParams } from '../../visualizations/VisualizationTypes';
import { entityTreeToArray } from '../../../utils/study-metadata';

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
  isEnabledInPicker: isEnabledInPicker,
  studyRequirements:
    'These visualizations are only available for studies with compatible assay data.',
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
  const alphaDivMethodDisplayName = alphaDivMethod
    ? ALPHA_DIV_METHODS.find((method) => method.value === alphaDivMethod)
        ?.displayName
    : undefined;
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
          {alphaDivMethod ? alphaDivMethodDisplayName : <i>Not selected</i>}
        </span>
      </h4>
    </div>
  );
}

// Include available methods in this array.
const ALPHA_DIV_METHODS = [
  { value: 'shannon', displayName: 'Shannon' },
  { value: 'simpson', displayName: 'Simpson' },
];

export function AlphaDivConfiguration(props: ComputationConfigProps) {
  const {
    computationAppOverview,
    computation,
    analysisState,
    visualizationId,
  } = props;
  assertComputationWithConfig(computation, AlphaDivConfig);
  const configuration = computation.descriptor.configuration;

  const changeConfigHandler = useConfigChangeHandler(
    analysisState,
    computation,
    visualizationId
  );

  const alphaDivMethodSelectorText = useMemo(() => {
    if (configuration.alphaDivMethod) {
      return (
        ALPHA_DIV_METHODS.find(
          (method) => method.value === configuration.alphaDivMethod
        )?.displayName ?? 'Select a method'
      );
    } else {
      return 'Select a method';
    }
  }, [configuration.alphaDivMethod]);

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
            buttonDisplayContent={alphaDivMethodSelectorText}
            items={ALPHA_DIV_METHODS.map((method) => ({
              value: method.value,
              display: method.displayName,
            }))}
            onSelect={partial(changeConfigHandler, 'alphaDivMethod')}
          />
        </div>
      </div>
    </ComputationStepContainer>
  );
}

// Alpha div's only requirement of the study is that
// the study contains at least one collection.
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
