import { useFindEntityAndVariableCollection } from '../../../hooks/workspace';
import { VariableCollectionDescriptor } from '../../../types/variable';
import { boxplotVisualization } from '../../visualizations/implementations/BoxplotVisualization';
import { scatterplotVisualization } from '../../visualizations/implementations/ScatterplotVisualization';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { partial } from 'lodash';
import {
  assertComputationWithConfig,
  isNotAbsoluteAbundanceVariableCollection,
  partialToCompleteCodec,
  useConfigChangeHandler,
} from '../Utils';
import * as t from 'io-ts';
import { Computation } from '../../../types/visualization';
import SingleSelect from '@veupathdb/coreui/lib/components/inputs/SingleSelect';
import { useMemo } from 'react';
import { ComputationStepContainer } from '../ComputationStepContainer';
import './Plugins.scss';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { VariableCollectionSelectList } from '../../variableSelectors/VariableCollectionSingleSelect';
import { IsEnabledInPickerParams } from '../../visualizations/VisualizationTypes';
import { entityTreeToArray } from '../../../utils/study-metadata';
import { StudyEntity } from '../../../types/study';

const cx = makeClassNameHelper('AppStepConfigurationContainer');

export type AbundanceConfig = t.TypeOf<typeof AbundanceConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const AbundanceConfig = t.partial({
  collectionVariable: VariableCollectionDescriptor,
  rankingMethod: t.string,
});

const CompleteAbundanceConfig = partialToCompleteCodec(AbundanceConfig);

export const plugin: ComputationPlugin = {
  configurationComponent: AbundanceConfiguration,
  configurationDescriptionComponent: AbundanceConfigDescriptionComponent,
  createDefaultConfiguration: () => ({}),
  isConfigurationComplete: CompleteAbundanceConfig.is,
  visualizationPlugins: {
    boxplot: boxplotVisualization.withOptions({
      getXAxisVariable(config) {
        if (AbundanceConfig.is(config)) {
          return config.collectionVariable;
        }
      },
      getComputedYAxisDetails(config) {
        if (AbundanceConfig.is(config) && config.collectionVariable) {
          return {
            entityId: config.collectionVariable.entityId,
            placeholderDisplayName: 'Abundance',
          };
        }
      },
      getPlotSubtitle(config) {
        if (AbundanceConfig.is(config) && config.rankingMethod) {
          return (
            <>
              <br />
              <span>
                Ranked abundance: Variables with {config.rankingMethod} = 0
                removed. Showing up to the top ten variables.
              </span>
            </>
          );
        }
      },
      hideShowMissingnessToggle: true,
    }),
    scatterplot: scatterplotVisualization.withOptions({
      getComputedYAxisDetails(config) {
        if (AbundanceConfig.is(config) && config.collectionVariable) {
          return {
            entityId: config.collectionVariable.entityId,
            placeholderDisplayName: 'Abundance',
          };
        }
      },
      getComputedOverlayVariable(config) {
        if (AbundanceConfig.is(config)) {
          return config.collectionVariable;
        }
      },
      getPlotSubtitle(config) {
        if (AbundanceConfig.is(config)) {
          return (
            <>
              <br />
              <span>
                Ranked abundance: Variables with {config.rankingMethod} = 0
                removed. Showing up to the top eight variables.
              </span>
            </>
          );
        }
      },
      hideShowMissingnessToggle: true,
    }),
  },
  isEnabledInPicker: isEnabledInPicker,
  studyRequirements:
    'These visualizations are only available for studies with compatible assay data.',
};

function AbundanceConfigDescriptionComponent({
  computation,
}: {
  computation: Computation;
}) {
  const findEntityAndVariableCollection = useFindEntityAndVariableCollection();
  assertComputationWithConfig(computation, AbundanceConfig);
  const { configuration } = computation.descriptor;
  const collectionVariable =
    'collectionVariable' in configuration
      ? configuration.collectionVariable
      : undefined;
  const rankingMethod =
    'rankingMethod' in configuration ? configuration.rankingMethod : undefined;
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
          {rankingMethod ? (
            rankingMethod[0].toUpperCase() + rankingMethod.slice(1)
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
    </div>
  );
}

// Include available methods in this array.
const ABUNDANCE_METHODS = ['median', 'q3', 'variance', 'max'];

export function AbundanceConfiguration(props: ComputationConfigProps) {
  const {
    computationAppOverview,
    computation,
    analysisState,
    visualizationId,
  } = props;
  assertComputationWithConfig(computation, AbundanceConfig);
  const configuration = computation.descriptor.configuration;

  const changeConfigHandler = useConfigChangeHandler(
    analysisState,
    computation,
    visualizationId
  );

  const rankingMethod = useMemo(() => {
    if (configuration && 'rankingMethod' in configuration) {
      return configuration.rankingMethod;
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
          <span>Method</span>
          <SingleSelect
            value={rankingMethod ?? 'Select a method'}
            buttonDisplayContent={rankingMethod ?? 'Select a method'}
            onSelect={partial(changeConfigHandler, 'rankingMethod')}
            items={ABUNDANCE_METHODS.map((method) => ({
              value: method,
              display: method,
            }))}
          />
        </div>
      </div>
    </ComputationStepContainer>
  );
}

// The abundance app's only requirement for the study is that the study
// contains at least one collection.
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
