import { useRouteMatch } from 'react-router-dom';
import { useHistory } from 'react-router';
import { useStudyMetadata } from '../../..';
import { useCollectionVariables } from '../../../hooks/study';
import { VariableDescriptor } from '../../../types/variable';
import { boxplotVisualization } from '../../visualizations/implementations/BoxplotVisualization';
import { scatterplotVisualization } from '../../visualizations/implementations/ScatterplotVisualization';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { H6 } from '@veupathdb/coreui';
import { isEqual } from 'lodash';
import { createComputation } from '../Utils';

export const plugin: ComputationPlugin = {
  configurationComponent: AbundanceConfiguration,
  visualizationTypes: {
    boxplot: boxplotVisualization,
    scatterplot: scatterplotVisualization,
  },
};

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
  const { url } = useRouteMatch();
  const history = useHistory();
  // Include known collection variables in this array.
  const collections = useCollectionVariables(studyMetadata.rootEntity);
  if (collections.length === 0)
    throw new Error('Could not find any collections for this app.');

  const rankingMethod =
    // @ts-ignore
    computation.descriptor.configuration.rankingMethod ?? ABUNDANCE_METHODS[0];
  // @ts-ignore
  const collectionVariable = computation.descriptor.configuration
    .collectionVariable ?? {
    variableId: collections[0].id,
    entityId: collections[0].entityId,
  };

  const changeConfigHandler = async (
    changedConfigPropertyName: string,
    newConfigValue: string
  ) => {
    // when a config value changes:
    // 1. remove viz from current computation
    // 2. check if the newConfig exists
    // Y? move viz to the found computation, "existingComputation"
    // N? create new computation
    const computations = analysisState.analysis
      ? analysisState.analysis.descriptor.computations
      : [];
    const newConfigObject = typeof computation.descriptor.configuration ===
      'object' && {
      ...computation.descriptor.configuration,
      [changedConfigPropertyName]: newConfigValue,
    };
    const existingComputation = computations.find(
      (c) =>
        isEqual(c.descriptor.configuration, newConfigObject) &&
        c.descriptor.type === computation.descriptor.type
    );
    const existingVisualization = computation.visualizations.filter(
      (viz) => viz.visualizationId === visualizationId
    );
    const computationAfterVizRemoval = {
      ...computation,
      visualizations: computation.visualizations.filter(
        (viz) => viz.visualizationId !== visualizationId
      ),
    };
    if (existingComputation) {
      // 2Y:  move viz to existingComputation
      const existingComputationWithVizAdded = {
        ...existingComputation,
        visualizations: existingComputation.visualizations.concat(
          existingVisualization
        ),
      };
      computationAfterVizRemoval.visualizations.length
        ? await analysisState.setComputations([
            computationAfterVizRemoval,
            existingComputationWithVizAdded,
            ...computations
              .filter(
                (c) => c.computationId !== existingComputation.computationId
              )
              .filter((c) => c.computationId !== computation.computationId),
          ])
        : await analysisState.setComputations([
            existingComputationWithVizAdded,
            ...computations
              .filter(
                (c) => c.computationId !== existingComputation.computationId
              )
              .filter((c) => c.computationId !== computation.computationId),
          ]);
      history.push(
        url.replace(
          computation.computationId,
          existingComputation.computationId
        )
      );
    } else {
      // 2N:  existingComputation was not found
      //      get config displayName for new computation
      //      create a new computation with the existing viz
      // @ts-ignore
      const variableObject = collections.find((collectionVar) =>
        isEqual(
          {
            variableId: collectionVar.id,
            entityId: collectionVar.entityId,
          },
          // @ts-ignore
          newConfigObject.collectionVariable
        )
      );
      const newComputation = createComputation(
        computation.descriptor.type,
        // @ts-ignore
        `Data: ${variableObject?.entityDisplayName}: ${variableObject?.displayName}; Method: ${newConfigObject.rankingMethod}`,
        // @ts-ignore
        newConfigObject,
        computations,
        existingVisualization
      );
      computationAfterVizRemoval.visualizations.length
        ? await analysisState.setComputations([
            computationAfterVizRemoval,
            newComputation,
            ...computations.filter(
              (c) => c.computationId !== computation.computationId
            ),
          ])
        : await analysisState.setComputations([
            newComputation,
            ...computations.filter(
              (c) => c.computationId !== computation.computationId
            ),
          ]);
      history.push(
        url.replace(computation.computationId, newComputation.computationId)
      );
    }
  };

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
        <div style={{ justifySelf: 'end' }}>Data: </div>
        <select
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
                {collectionVar.entityDisplayName}: {collectionVar.displayName}
              </option>
            );
          })}
        </select>
        <div style={{ justifySelf: 'end' }}>Method: </div>
        <select
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
