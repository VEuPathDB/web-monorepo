/** @jsxImportSource @emotion/react */
import { useCollectionVariables, useStudyMetadata } from '../../..';
import { VariableDescriptor } from '../../../types/variable';
import { scatterplotVisualization } from '../../visualizations/implementations/ScatterplotVisualization';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { isEqual, partial } from 'lodash';
import { useConfigChangeHandler, assertComputationWithConfig } from '../Utils';
import * as t from 'io-ts';
import { Computation } from '../../../types/visualization';
import SingleSelect from '@veupathdb/coreui/dist/components/inputs/SingleSelect';
import { useMemo } from 'react';
import ScatterBetadivSVG from '../../visualizations/implementations/selectorIcons/ScatterBetadivSVG';
import { ComputationStepContainer } from '../ComputationStepContainer';
import { sharedConfigCssStyles } from './abundance';

export type BetaDivConfig = t.TypeOf<typeof BetaDivConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const BetaDivConfig = t.type({
  collectionVariable: VariableDescriptor,
  betaDivDistanceMethod: t.string,
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
  const studyMetadata = useStudyMetadata();
  const collections = useCollectionVariables(studyMetadata.rootEntity);
  assertComputationWithConfig<BetaDivConfig>(computation, Computation);
  const { configuration } = computation.descriptor;
  const collectionVariable =
    'collectionVariable' in configuration
      ? configuration.collectionVariable
      : undefined;
  const betaDivDistanceMethod =
    'betaDivDistanceMethod' in configuration
      ? configuration.betaDivDistanceMethod
      : undefined;
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
        Distance method:{' '}
        <span style={{ fontWeight: 300 }}>
          {betaDivDistanceMethod ? (
            betaDivDistanceMethod[0].toUpperCase() +
            betaDivDistanceMethod.slice(1)
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
    </>
  );
}

// Include available methods in this array.
const BETA_DIV_DISTANCE_METHODS = ['bray', 'jaccard', 'jsd'];

export function BetaDivConfiguration(props: ComputationConfigProps) {
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

  assertComputationWithConfig<BetaDivConfig>(computation, Computation);
  const configuration = computation.descriptor.configuration;

  const changeConfigHandler = useConfigChangeHandler<BetaDivConfig>(
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

  const betaDivDistanceMethod = useMemo(() => {
    if (configuration && 'betaDivDistanceMethod' in configuration) {
      return configuration.betaDivDistanceMethod;
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
          <div style={{ justifySelf: 'end', fontWeight: 500 }}>Data</div>
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
          <div style={{ justifySelf: 'end', fontWeight: 500 }}>
            Distance method
          </div>
          <SingleSelect
            value={betaDivDistanceMethod ?? 'Select a method'}
            buttonDisplayContent={betaDivDistanceMethod ?? 'Select a method'}
            items={BETA_DIV_DISTANCE_METHODS.map((method) => ({
              value: method,
              display: method,
            }))}
            onSelect={partial(changeConfigHandler, 'betaDivDistanceMethod')}
          />
        </div>
      </div>
    </ComputationStepContainer>
  );
}
