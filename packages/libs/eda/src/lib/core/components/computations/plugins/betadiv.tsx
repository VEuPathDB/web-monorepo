/** @jsxImportSource @emotion/react */
import { useCollectionVariables, useStudyMetadata } from '../../..';
import { StudyEntity } from '../../../types/study';
import { VariableDescriptor } from '../../../types/variable';
import { scatterplotVisualization } from '../../visualizations/implementations/ScatterplotVisualization';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { H6 } from '@veupathdb/coreui';
import { isEqual, partial } from 'lodash';
import { useConfigChangeHandler, assertComputationWithConfig } from '../Utils';
import { findCollections } from '../../../utils/study-metadata';
import * as t from 'io-ts';
import { Computation } from '../../../types/visualization';
import SingleSelect from '@veupathdb/coreui/dist/components/inputs/SingleSelect';
import { useMemo } from 'react';

export type BetaDivConfig = t.TypeOf<typeof BetaDivConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const BetaDivConfig = t.type({
  collectionVariable: VariableDescriptor,
  betaDivDistanceMethod: t.string,
});

export const plugin: ComputationPlugin = {
  configurationComponent: BetaDivConfiguration,
  configurationDescriptionComponent: BetaDivConfigDescriptionComponent,
  createDefaultConfiguration,
  isConfigurationValid: BetaDivConfig.is,
  visualizationPlugins: {
    scatterplot: scatterplotVisualization.withOptions({
      getComputedXAxisDetails(config) {
        if (BetaDivConfig.is(config)) {
          return {
            entityId: config.collectionVariable.entityId,
            placeholderDisplayName: config.collectionVariable.variableId,
            variableId: config.collectionVariable.variableId,
          };
        }
      },
      getComputedYAxisDetails(config) {
        if (BetaDivConfig.is(config)) {
          return {
            entityId: config.collectionVariable.entityId,
            placeholderDisplayName: 'Beta Diversity',
            variableId: 'betaDiversity',
          };
        }
      },
      hideShowMissingnessToggle: true,
      hideTrendlines: true,
      hideFacetInputs: true,
    }),
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
  const updatedCollectionVariable = collections.find((collectionVar) =>
    isEqual(
      {
        variableId: collectionVar.id,
        entityId: collectionVar.entityId,
      },
      configuration.collectionVariable
    )
  );
  return (
    <>
      <h4 style={{ padding: '15px 0 0 0', marginLeft: 20 }}>
        Data:{' '}
        <span style={{ fontWeight: 300 }}>
          {`${updatedCollectionVariable?.entityDisplayName} > ${updatedCollectionVariable?.displayName}`}
        </span>
      </h4>
      <h4 style={{ padding: 0, marginLeft: 20 }}>
        Distance method:{' '}
        <span style={{ fontWeight: 300 }}>
          {configuration.betaDivDistanceMethod[0].toUpperCase() +
            configuration.betaDivDistanceMethod.slice(1)}
        </span>
      </h4>
    </>
  );
}

// Include available methods in this array.
const BETA_DIV_DISTANCE_METHODS = ['bray', 'jaccard', 'jsd'];

function createDefaultConfiguration(rootEntity: StudyEntity): BetaDivConfig {
  const collections = findCollections(rootEntity);
  if (collections.length === 0)
    throw new Error('Could not find any collections for this app.');
  return {
    collectionVariable: {
      variableId: collections[0].id,
      entityId: collections[0].entityId,
    },
    betaDivDistanceMethod: BETA_DIV_DISTANCE_METHODS[0],
  };
}

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
  const { betaDivDistanceMethod, collectionVariable } = configuration;

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
    const selectedItem = collectionVarItems.find((item) =>
      isEqual(item.value, {
        variableId: collectionVariable.variableId,
        entityId: collectionVariable.entityId,
      })
    );
    return selectedItem ?? collectionVarItems[0];
  }, [collectionVarItems, collectionVariable]);

  return (
    <div
      style={{
        display: 'flex',
        gap: '0 2em',
        padding: '1em 0',
        alignItems: 'center',
      }}
    >
      <H6 additionalStyles={{ margin: 0 }}>
        {computationAppOverview.displayName[0].toUpperCase() +
          computationAppOverview.displayName.substring(1).toLowerCase() +
          ' parameters:'}
      </H6>
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
          value={selectedCollectionVar.value}
          buttonDisplayContent={selectedCollectionVar.display}
          items={collectionVarItems}
          onSelect={partial(changeConfigHandler, 'collectionVariable')}
        />
        <div style={{ justifySelf: 'end', fontWeight: 500 }}>
          Distance method
        </div>
        <SingleSelect
          value={betaDivDistanceMethod}
          buttonDisplayContent={betaDivDistanceMethod}
          items={BETA_DIV_DISTANCE_METHODS.map((method) => ({
            value: method,
            display: method,
          }))}
          onSelect={partial(changeConfigHandler, 'betaDivDistanceMethod')}
        />
      </div>
    </div>
  );
}
