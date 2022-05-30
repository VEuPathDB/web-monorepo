import { useState, useMemo } from 'react';
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
  // @ts-ignore
  const [rankingMethod, setRankingMethod] = useState(
    props.computation.descriptor.configuration.rankingMethod ??
      ABUNDANCE_METHODS[0]
  );
  const { computationAppOverview, addNewComputation } = props;
  const studyMetadata = useStudyMetadata();
  const { url } = useRouteMatch();
  const history = useHistory();
  // Include known collection variables in this array.
  const collections = useCollectionVariables(studyMetadata.rootEntity);
  if (collections.length === 0)
    throw new Error('Could not find any collections for this app.');

  const [collectionVariable, setCollectionVariable] = useState(
    variableDescriptorToString({
      variableId: collections[0].id,
      entityId: collections[0].entityId,
    })
  );

  const configDescription = useMemo(() => {
    if (!collections.length || !collectionVariable) return '';
    const variableObject = collections.find(
      (collectionVar) =>
        variableDescriptorToString({
          variableId: collectionVar.id,
          entityId: collectionVar.entityId,
        }) === collectionVariable
    );
    return `Data: ${variableObject?.entityDisplayName}: ${variableObject?.displayName}; Method: ${rankingMethod}`;
  }, [collections, collectionVariable, rankingMethod]);

  const changeConfigHandler = async (
    valueChanged: string,
    newConfigValue: string,
    setConfigValue: any
  ) => {
    // when a config value changes:
    // 1. remove viz from current computation
    // 2. check if the newConfig exists
    // Y? move viz to the found computation, existingComputation
    // N? create new computation
    setConfigValue(newConfigValue);
    const newConfigObject = typeof props.computation.descriptor
      .configuration === 'object' && {
      ...props.computation.descriptor.configuration,
      [valueChanged]: newConfigValue,
    };
    const existingComputation = props.analysisState.analysis?.descriptor.computations.find(
      (c) =>
        isEqual(c.descriptor.configuration, newConfigObject) &&
        c.descriptor.type === props.computation.descriptor.type
    );
    const existingVisualization = props.computation.visualizations.filter(
      (viz) => viz.visualizationId === props.visualizationId
    );
    const computationAfterVizRemoval = {
      ...props.computation,
      visualizations: props.computation.visualizations.filter(
        (viz) => viz.visualizationId !== props.visualizationId
      ),
    };
    if (props.analysisState.analysis) {
      await props.analysisState.setComputations([
        computationAfterVizRemoval,
        ...props.analysisState.analysis?.descriptor.computations.filter(
          (c) => c.computationId !== computationAfterVizRemoval.computationId
        ),
      ]);
    }
    if (existingComputation) {
      // 2Y:  move viz to existingComputation
    } else {
      // 2N:  existingComputation was not found
      //      create a new computation with the existing viz
      const computations = props.analysisState.analysis
        ? props.analysisState.analysis.descriptor.computations
        : [];
      const newComputation = createComputation(
        props.computation.descriptor.type,
        '',
        // @ts-ignore
        newConfigObject,
        computations,
        existingVisualization
      );
      await props.analysisState.setComputations([
        newComputation,
        ...computations,
      ]);
      history.push(
        url.replace(
          props.computation.computationId,
          newComputation.computationId
        )
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
          value={collectionVariable}
          onChange={(e) =>
            changeConfigHandler(
              'collectionVariable',
              e.target.value,
              setCollectionVariable
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
          onChange={(e) =>
            changeConfigHandler(
              'rankingMethod',
              e.target.value,
              setRankingMethod
            )
          }
        >
          {ABUNDANCE_METHODS.map((method) => (
            <option value={method}>{method}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
