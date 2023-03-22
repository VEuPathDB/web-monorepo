import { useStudyMetadata } from '../../..';
import { useCollectionVariables } from '../../../hooks/workspace';
import { VariableDescriptor } from '../../../types/variable';
import { boxplotVisualization } from '../../visualizations/implementations/BoxplotVisualization';
import { scatterplotVisualization } from '../../visualizations/implementations/ScatterplotVisualization';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { isEqual, partial } from 'lodash';
import { assertComputationWithConfig, useConfigChangeHandler } from '../Utils';
import * as t from 'io-ts';
import { Computation } from '../../../types/visualization';
import SingleSelect from '@veupathdb/coreui/dist/components/inputs/SingleSelect';
import { useMemo } from 'react';
import { ComputationStepContainer } from '../ComputationStepContainer';

export const sharedConfigCssStyles = {
  display: 'flex',
  gap: '0 2em',
  padding: '1em 0',
  alignItems: 'center',
  marginLeft: '3em',
};

export type AbundanceConfig = t.TypeOf<typeof AbundanceConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const AbundanceConfig = t.type({
  collectionVariable: VariableDescriptor,
  rankingMethod: t.string,
});

export const plugin: ComputationPlugin = {
  configurationComponent: AbundanceConfiguration,
  configurationDescriptionComponent: AbundanceConfigDescriptionComponent,
  createDefaultConfiguration: () => undefined,
  isConfigurationValid: AbundanceConfig.is,
  visualizationPlugins: {
    boxplot: boxplotVisualization.withOptions({
      getXAxisVariable(config) {
        if (AbundanceConfig.is(config)) {
          return config.collectionVariable;
        }
      },
      getComputedYAxisDetails(config) {
        if (AbundanceConfig.is(config)) {
          return {
            entityId: config.collectionVariable.entityId,
            placeholderDisplayName: 'Abundance',
          };
        }
      },
      getPlotSubtitle(config) {
        if (AbundanceConfig.is(config)) {
          return `Ranked abundance: Variables with ${config.rankingMethod} = 0 removed. Showing up to the top ten variables.`;
        }
      },
      hideShowMissingnessToggle: true,
    }),
    scatterplot: scatterplotVisualization.withOptions({
      getComputedYAxisDetails(config) {
        if (AbundanceConfig.is(config)) {
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
          return `Ranked abundance: Variables with ${config.rankingMethod} = 0 removed. Showing up to the top ten variables.`;
        }
      },
      hideShowMissingnessToggle: true,
    }),
  },
};

function AbundanceConfigDescriptionComponent({
  computation,
}: {
  computation: Computation;
}) {
  const studyMetadata = useStudyMetadata();
  const collections = useCollectionVariables(studyMetadata.rootEntity);
  assertComputationWithConfig<AbundanceConfig>(computation, Computation);
  const { configuration } = computation.descriptor;
  const collectionVariable =
    'collectionVariable' in configuration
      ? configuration.collectionVariable
      : undefined;
  const rankingMethod =
    'rankingMethod' in configuration ? configuration.rankingMethod : undefined;
  const updatedCollectionVariable = collections.find((collectionVar) =>
    isEqual(
      {
        variableId: collectionVar.id,
        entityId: collectionVar.entityId,
      },
      collectionVariable
    )
  );
  return (
    <>
      <h4 style={{ padding: '15px 0 0 0', marginLeft: 20 }}>
        Data:{' '}
        <span style={{ fontWeight: 300 }}>
          {updatedCollectionVariable ? (
            `${updatedCollectionVariable?.entityDisplayName} > ${updatedCollectionVariable?.displayName}`
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
      <h4 style={{ padding: 0, marginLeft: 20 }}>
        Method:{' '}
        <span style={{ fontWeight: 300 }}>
          {rankingMethod ? (
            rankingMethod[0].toUpperCase() + rankingMethod.slice(1)
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
    </>
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
  const studyMetadata = useStudyMetadata();
  // Include known collection variables in this array.
  const collections = useCollectionVariables(studyMetadata.rootEntity);
  if (collections.length === 0)
    throw new Error('Could not find any collections for this app.');

  assertComputationWithConfig<AbundanceConfig>(computation, Computation);
  const configuration = computation.descriptor.configuration;

  const changeConfigHandler = useConfigChangeHandler<AbundanceConfig>(
    analysisState,
    computation,
    visualizationId
  );

  const collectionVarItems = useMemo(() => {
    return collections.map((collectionVar) => ({
      value: {
        variableId: collectionVar.id,
        entityId: collectionVar.entityId,
      },
      display:
        collectionVar.entityDisplayName + ' > ' + collectionVar.displayName,
    }));
  }, [collections]);

  const selectedCollectionVar = useMemo(() => {
    if (configuration && 'collectionVariable' in configuration) {
      const selectedItem = collectionVarItems.find((item) =>
        isEqual(item.value, {
          variableId: configuration.collectionVariable.variableId,
          entityId: configuration.collectionVariable.entityId,
        })
      );
      return selectedItem;
    }
  }, [collectionVarItems, configuration]);

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
      <div style={sharedConfigCssStyles}>
        <div
          style={{
            display: 'flex',
            gap: '1em',
            justifyItems: 'start',
            alignItems: 'center',
          }}
        >
          <span style={{ justifySelf: 'end', fontWeight: 500 }}>Data</span>
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
          <span style={{ justifySelf: 'end', fontWeight: 500 }}>Method</span>
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
