import { useCollectionVariables, useStudyMetadata } from '../../..';
import { VariableDescriptor } from '../../../types/variable';
import { volcanoplotVisualization } from '../../visualizations/implementations/VolcanoplotVisualization';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { isEqual, partial } from 'lodash';
import { useConfigChangeHandler, assertComputationWithConfig } from '../Utils';
import * as t from 'io-ts';
import { Computation } from '../../../types/visualization';
import SingleSelect from '@veupathdb/coreui/dist/components/inputs/SingleSelect';
import { useMemo } from 'react';
import { ComputationStepContainer } from '../ComputationStepContainer';
import { sharedConfigCssStyles } from './abundance';

/**
 * Differential abundance
 *
 * The differential abundance app is used to find taxa, genes, pathways, etc. that
 * are more abundant in one group of samples than another. This app takes in a continuous variable
 * collection (for example, abundance of 100 Species for all samples) as well as a way to split the samples
 * into two groups (for example, red hair and green hair). The computation then returns information on how
 * differentially abundance each item (taxon, gene, etc.) is between the two groups. See VolcanoPlotDataPoint
 * for more details. Importantly, the returned data lives outside the variable tree because each returned
 * data point corresponds to an item (taxon, gene, etc.).
 *
 * Currently the differential abundance app will be implemented with only a volcano visualization. Plans for
 * the future of this app include a lefse diagram, tables of results, adding new computation methods, and
 * strategies to create user-defined collections from the output of the computation.
 */

export type DifferentialAbundanceConfig = t.TypeOf<
  typeof DifferentialAbundanceConfig
>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DifferentialAbundanceConfig = t.type({
  collectionVariable: VariableDescriptor,
  comparatorVariable: t.string,
});

export const plugin: ComputationPlugin = {
  configurationComponent: DifferentialAbundanceConfiguration,
  configurationDescriptionComponent:
    DifferentialAbundanceConfigDescriptionComponent,
  createDefaultConfiguration: () => undefined,
  isConfigurationValid: DifferentialAbundanceConfig.is,
  visualizationPlugins: {
    volcanoplot: volcanoplotVisualization // Must match name in data service
      .withOptions({
        getComputedXAxisDetails(config) {
          if (DifferentialAbundanceConfig.is(config)) {
            return {
              entityId: config.collectionVariable.entityId, // This is not exactly the entityId of the variable, because the computed variable here exists outside the entity tree!
              placeholderDisplayName: 'log2(Fold Change)',
              variableId: 'log2FoldChange',
            };
          }
        },
        getComputedYAxisDetails(config) {
          if (DifferentialAbundanceConfig.is(config)) {
            return {
              entityId: config.collectionVariable.entityId, // Also not truly the correct entityId, but none exists for the returned variable.
              placeholderDisplayName: '-log10(P Value)',
              variableId: '-log10(P Value)',
            };
          }
        },
        hideShowMissingnessToggle: true, // none of the following will be relevant for volcano. Likely going to remove.
        hideTrendlines: true,
        hideFacetInputs: true,
        hideLogScale: true,
      }),
  },
};

function DifferentialAbundanceConfigDescriptionComponent({
  computation,
}: {
  computation: Computation;
}) {
  const studyMetadata = useStudyMetadata();
  const collections = useCollectionVariables(studyMetadata.rootEntity);
  assertComputationWithConfig<DifferentialAbundanceConfig>(
    computation,
    Computation
  );
  const { configuration } = computation.descriptor;
  const collectionVariable =
    'collectionVariable' in configuration
      ? configuration.collectionVariable
      : undefined;
  const comparatorVariable =
    'comparatorVariable' in configuration
      ? configuration.comparatorVariable
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
        Dissimilarity method:{' '}
        <span style={{ fontWeight: 300 }}>
          {comparatorVariable ? comparatorVariable : <i>Not selected</i>}
        </span>
      </h4>
    </>
  );
}

// Include available methods in this array.
const BETA_DIV_DISSIMILARITY_METHODS = ['bray', 'jaccard', 'jsd'];

export function DifferentialAbundanceConfiguration(
  props: ComputationConfigProps
) {
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

  assertComputationWithConfig<DifferentialAbundanceConfig>(
    computation,
    Computation
  );
  const configuration = computation.descriptor.configuration;

  const changeConfigHandler =
    useConfigChangeHandler<DifferentialAbundanceConfig>(
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

  const betaDivDissimilarityMethod = useMemo(() => {
    if (configuration && 'betaDivDissimilarityMethod' in configuration) {
      return configuration.betaDivDissimilarityMethod;
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
            Dissimilarity method
          </div>
          {/* <SingleSelect
            value={betaDivDissimilarityMethod ?? 'Select a method'}
            buttonDisplayContent={
              betaDivDissimilarityMethod ?? 'Select a method'
            }
            items={BETA_DIV_DISSIMILARITY_METHODS.map((method) => ({
              value: method,
              display: method,
            }))}
            onSelect={partial(
              changeConfigHandler,
              'betaDivDissimilarityMethod'
            )}
          /> */}
        </div>
      </div>
    </ComputationStepContainer>
  );
}
