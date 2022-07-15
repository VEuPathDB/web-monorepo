/** @jsxImportSource @emotion/react */
import { useCollectionVariables, useStudyMetadata } from '../../..';
import { StudyEntity } from '../../../types/study';
import { VariableDescriptor } from '../../../types/variable';
import { boxplotVisualization } from '../../visualizations/implementations/BoxplotVisualization';
import { scatterplotVisualization } from '../../visualizations/implementations/ScatterplotVisualization';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { H6 } from '@veupathdb/coreui';
import { isEqual } from 'lodash';
import { useConfigChangeHandler, assertComputationWithConfig } from '../Utils';
import { findCollections } from '../../../utils/study-metadata';
import * as t from 'io-ts';
import { Computation } from '../../../types/visualization';

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
  createDefaultComputationSpec: createDefaultComputationSpec,
  visualizationTypes: {
    boxplot: boxplotVisualization.withOptions({
      getComputedYAxisDetails(config) {
        if (AlphaDivConfig.is(config)) {
          return {
            entityId: config.collectionVariable.entityId,
            placeholderDisplayName: 'Alphadiv',
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
            placeholderDisplayName: 'Alphadiv',
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

function createDefaultComputationSpec(rootEntity: StudyEntity) {
  const collections = findCollections(rootEntity);
  const configuration: AlphaDivConfig = {
    name: 'AlphaDivComputation',
    collectionVariable: {
      variableId: collections[0].id,
      entityId: collections[0].entityId,
    },
    alphaDivMethod: 'shannon',
  };
  return { configuration };
}

// Include available methods in this array.
const ALPHA_DIV_METHODS = ['shannon', 'simpson', 'evenness'];

function variableDescriptorToString(
  variableDescriptor: VariableDescriptor
): string {
  return JSON.stringify(variableDescriptor);
}

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
        <select
          css={{
            backgroundColor: '#e0e0e0',
            cursor: 'pointer',
            border: 0,
            padding: '6px 16px',
            fontSize: '0.8125rem',
            minWidth: '64px',
            boxSizing: 'border-box',
            transition:
              'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
            fontFamily:
              'Roboto, "Helvetica Neue", Helvetica, "Segoe UI", Arial, freesans, sans-serif',
            fontWeight: 500,
            lineHeight: 1.25,
            borderRadius: '4px',
            textTransform: 'none',
            boxShadow:
              '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
            '&:hover': {
              boxShadow: `0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)`,
              backgroundColor: `#d5d5d5`,
            },
          }}
          value={variableDescriptorToString({
            variableId: collectionVariable.variableId,
            entityId: collectionVariable.entityId,
          })}
          onChange={(e) =>
            changeConfigHandler(
              'collectionVariable',
              JSON.parse(e.target.value)
            )
          }
        >
          {collections.map((collectionVar) => {
            return (
              <option
                key={collectionVar.id}
                value={variableDescriptorToString({
                  variableId: collectionVar.id,
                  entityId: collectionVar.entityId,
                })}
              >
                {collectionVar.entityDisplayName} {' > '}{' '}
                {collectionVar.displayName}
              </option>
            );
          })}
        </select>
        <div style={{ justifySelf: 'end', fontWeight: 500 }}>Method</div>
        <select
          css={{
            backgroundColor: '#e0e0e0',
            cursor: 'pointer',
            border: 0,
            padding: '6px 16px',
            fontSize: '0.8125rem',
            minWidth: '64px',
            boxSizing: 'border-box',
            transition:
              'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
            fontFamily:
              'Roboto, "Helvetica Neue", Helvetica, "Segoe UI", Arial, freesans, sans-serif',
            fontWeight: 500,
            lineHeight: 1.25,
            borderRadius: '4px',
            textTransform: 'none',
            boxShadow:
              '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
            '&:hover': {
              boxShadow: `0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)`,
              backgroundColor: `#d5d5d5`,
            },
          }}
          value={alphaDivMethod}
          onChange={(e) =>
            changeConfigHandler('alphaDivMethod', e.target.value)
          }
        >
          {ALPHA_DIV_METHODS.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
