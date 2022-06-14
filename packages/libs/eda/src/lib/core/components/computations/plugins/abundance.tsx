/** @jsxImportSource @emotion/react */
import { useStudyMetadata } from '../../..';
import { useCollectionVariables } from '../../../hooks/study';
import { VariableDescriptor } from '../../../types/variable';
import { StudyEntity } from '../../../types/study';
import { boxplotVisualization } from '../../visualizations/implementations/BoxplotVisualization';
import { scatterplotVisualization } from '../../visualizations/implementations/ScatterplotVisualization';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { ComputationConfiguration } from '../../../types/visualization';
import { H6 } from '@veupathdb/coreui';
import { isEqual } from 'lodash';
import { assertConfigType, useConfigChangeHandler } from '../Utils';
import { findCollections } from '../../../utils/study-metadata';
import * as t from 'io-ts';

export const plugin: ComputationPlugin = {
  configurationComponent: AbundanceConfiguration,
  configurationDescriptionComponent: AbundanceConfigDescriptionComponent,
  visualizationTypes: {
    boxplot: boxplotVisualization,
    scatterplot: scatterplotVisualization,
  },
  createDefaultComputationSpec: createDefaultComputationSpec,
};

function AbundanceConfigDescriptionComponent({
  config,
}: {
  config: ComputationConfiguration;
}) {
  const studyMetadata = useStudyMetadata();
  const collections = useCollectionVariables(studyMetadata.rootEntity);
  assertConfigType(config, AbundanceConfig);
  const { rankingMethod } = config;
  const updatedCollectionVariable = collections.find((collectionVar) =>
    isEqual(
      {
        variableId: collectionVar.id,
        entityId: collectionVar.entityId,
      },
      config.collectionVariable
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
          {rankingMethod[0].toUpperCase() + rankingMethod.slice(1)}
        </span>
      </h4>
    </>
  );
}

function createDefaultComputationSpec(rootEntity: StudyEntity) {
  const collections = findCollections(rootEntity);
  const configuration: AbundanceConfig = {
    name: 'RankedAbundanceComputation',
    collectionVariable: {
      variableId: collections[0].id,
      entityId: collections[0].entityId ?? '',
    },
    rankingMethod: 'median',
  };
  return { configuration };
}

export type AbundanceConfig = t.TypeOf<typeof AbundanceConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const AbundanceConfig = t.type({
  name: t.string,
  collectionVariable: VariableDescriptor,
  rankingMethod: t.string,
});

// Include available methods in this array.
const ABUNDANCE_METHODS = ['median', 'q3', 'variance', 'max'];

function variableDescriptorToString(
  variableDescriptor: VariableDescriptor
): string {
  return JSON.stringify(variableDescriptor);
}

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

  const configuration = computation.descriptor.configuration;
  assertConfigType(configuration, AbundanceConfig);
  const { rankingMethod, collectionVariable } = configuration;

  const changeConfigHandler = useConfigChangeHandler<AbundanceConfig>(
    analysisState,
    computation,
    visualizationId,
    AbundanceConfig
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
        <span style={{ justifySelf: 'end', fontWeight: 500 }}>Data</span>
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
        <span style={{ justifySelf: 'end', fontWeight: 500 }}>Method</span>
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
          value={rankingMethod}
          onChange={(e) => changeConfigHandler('rankingMethod', e.target.value)}
        >
          {ABUNDANCE_METHODS.map((method) => (
            <option value={method}>{method}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
