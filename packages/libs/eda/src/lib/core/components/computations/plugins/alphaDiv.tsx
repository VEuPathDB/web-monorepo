/** @jsxImportSource @emotion/react */
import { useCollectionVariables, useStudyMetadata } from '../../..';
import { StudyEntity } from '../../../types/study';
import { VariableDescriptor } from '../../../types/variable';
import { boxplotVisualization } from '../../visualizations/implementations/BoxplotVisualization';
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

export type AlphaDivConfig = t.TypeOf<typeof AlphaDivConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const AlphaDivConfig = t.type({
  name: t.string,
  collectionVariable: VariableDescriptor,
  alphaDivMethod: t.string,
});

export const plugin: ComputationPlugin = {
  configurationComponent: AlphaDivConfiguration,
  configurationDescriptionComponent: AlphaDivConfigDescriptionComponent,
  createDefaultConfiguration,
  isConfigurationValid: AlphaDivConfig.is,
  visualizationPlugins: {
    boxplot: boxplotVisualization.withOptions({
      getComputedYAxisDetails(config) {
        if (AlphaDivConfig.is(config)) {
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
        if (AlphaDivConfig.is(config)) {
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
  const studyMetadata = useStudyMetadata();
  const collections = useCollectionVariables(studyMetadata.rootEntity);
  assertComputationWithConfig<AlphaDivConfig>(computation, Computation);
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
        Method:{' '}
        <span style={{ fontWeight: 300 }}>
          {configuration.alphaDivMethod[0].toUpperCase() +
            configuration.alphaDivMethod.slice(1)}
        </span>
      </h4>
    </>
  );
}

function createDefaultConfiguration(rootEntity: StudyEntity): AlphaDivConfig {
  const collections = findCollections(rootEntity);
  return {
    name: 'AlphaDivComputation',
    collectionVariable: {
      variableId: collections[0].id,
      entityId: collections[0].entityId,
    },
    alphaDivMethod: 'shannon',
  };
}

// Include available methods in this array.
const ALPHA_DIV_METHODS = ['shannon', 'simpson', 'evenness'];

export function AlphaDivConfiguration(props: ComputationConfigProps) {
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

  assertComputationWithConfig<AlphaDivConfig>(computation, Computation);
  const configuration = computation.descriptor.configuration;
  const { alphaDivMethod, collectionVariable } = configuration;

  const changeConfigHandler = useConfigChangeHandler<AlphaDivConfig>(
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
    <div style={{ display: 'flex', gap: '0 2em', padding: '1em 0' }}>
      <H6 additionalStyles={{ margin: 0 }}>
        {computationAppOverview.displayName[0].toUpperCase() +
          computationAppOverview.displayName.substring(1).toLowerCase() +
          ' parameters:'}
      </H6>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '.5em 1em',
          width: '800px',
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
        <div style={{ justifySelf: 'end', fontWeight: 500 }}>Method</div>
        <SingleSelect
          value={alphaDivMethod}
          buttonDisplayContent={alphaDivMethod}
          items={ALPHA_DIV_METHODS.map((method) => ({
            value: method,
            display: method,
          }))}
          onSelect={partial(changeConfigHandler, 'alphaDivMethod')}
        />
      </div>
    </div>
  );
}
