import { useCollectionVariables, useStudyMetadata } from '../../..';
import { VariableCollectionDescriptor } from '../../../types/variable';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { isEqual, partial } from 'lodash';
import { useConfigChangeHandler, assertComputationWithConfig } from '../Utils';
import * as t from 'io-ts';
import { Computation } from '../../../types/visualization';
import SingleSelect from '@veupathdb/coreui/lib/components/inputs/SingleSelect';
import { useMemo } from 'react';
import { ComputationStepContainer } from '../ComputationStepContainer';
import './Plugins.scss';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { H6 } from '@veupathdb/coreui';
import { bipartiteNetworkVisualization } from '../../visualizations/implementations/BipartiteNetworkVisualization';

const cx = makeClassNameHelper('AppStepConfigurationContainer');

/**
 * Correlation
 *
 * The Correlation Assay vs Metadata app takes in a user-selected collection (ex. Species) and
 * runs a correlation of that data against all appropriate metadata in the study (found by the backend). The result is
 * a correlation coefficient and (soon) a significance value for each (assay member, metadata variable) pair.
 *
 * Importantly, this is the first of a few correlation-type apps that are coming along in the near future.
 * There will also be an Assay vs Assay app and a Metadata vs Metadata correlation app. It's possible that
 * when those roll out we'll be able to do a little refactoring to make the code a bit nicer.
 */

export type CorrelationAssayMetadataConfig = t.TypeOf<
  typeof CorrelationAssayMetadataConfig
>;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CorrelationAssayMetadataConfig = t.type({
  collectionVariable: VariableCollectionDescriptor,
  correlationMethod: t.string,
});

export const plugin: ComputationPlugin = {
  configurationComponent: CorrelationAssayMetadataConfiguration,
  configurationDescriptionComponent:
    CorrelationAssayMetadataConfigDescriptionComponent,
  createDefaultConfiguration: () => undefined,
  isConfigurationValid: CorrelationAssayMetadataConfig.is,
  visualizationPlugins: {
    bipartitenetwork: bipartiteNetworkVisualization.withOptions({
      getPlotSubtitle(config) {
        if (CorrelationAssayMetadataConfig.is(config)) {
          // why do this here and not in the viz?
          return 'Showing links with an absolute correlation coefficient above '; // visualization will add in the actual value
        }
      },
    }), // Must match name in data service and in visualization.tsx
  },
};

// Renders on the thumbnail page to give a summary of the app instance
function CorrelationAssayMetadataConfigDescriptionComponent({
  computation,
}: {
  computation: Computation;
}) {
  const studyMetadata = useStudyMetadata();
  const collections = useCollectionVariables(studyMetadata.rootEntity);
  assertComputationWithConfig<CorrelationAssayMetadataConfig>(
    computation,
    Computation
  );

  const { configuration } = computation.descriptor;
  const collectionVariable =
    'collectionVariable' in configuration
      ? configuration.collectionVariable
      : undefined;
  const correlationMethod =
    'correlationMethod' in configuration
      ? configuration.correlationMethod
      : undefined;

  const updatedCollectionVariable = collections.find((collectionVar) =>
    isEqual(
      {
        collectionId: collectionVar.id,
        entityId: collectionVar.entityId,
      },
      collectionVariable
    )
  );

  return (
    <div className="ConfigDescriptionContainer">
      <h4>
        Data:{' '}
        <span>
          {updatedCollectionVariable ? (
            `${updatedCollectionVariable?.entityDisplayName} > ${updatedCollectionVariable?.displayName}`
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
      <h4>
        Method:{' '}
        <span>
          {correlationMethod ? (
            correlationMethod[0].toUpperCase() + correlationMethod.slice(1)
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
    </div>
  );
}

// Shows as Step 1 in the full screen visualization page
export function CorrelationAssayMetadataConfiguration(
  props: ComputationConfigProps
) {
  const {
    computationAppOverview,
    computation,
    analysisState,
    visualizationId,
  } = props;

  const configuration = computation.descriptor
    .configuration as CorrelationAssayMetadataConfig;
  const studyMetadata = useStudyMetadata();

  // For now, set the method to 'spearman'. When we add the next method, we can just add it here (no api change!)
  if (configuration) configuration.correlationMethod = 'spearman';

  // Include known collection variables in this array.
  const collections = useCollectionVariables(studyMetadata.rootEntity);
  if (collections.length === 0)
    throw new Error('Could not find any collections for this app.');

  assertComputationWithConfig<CorrelationAssayMetadataConfig>(
    computation,
    Computation
  );

  const changeConfigHandler =
    useConfigChangeHandler<CorrelationAssayMetadataConfig>(
      analysisState,
      computation,
      visualizationId
    );

  const collectionVarItems = useMemo(() => {
    // Show all collections except for absolute abundance.
    return collections
      .filter((collectionVar) => {
        return collectionVar.normalizationMethod
          ? collectionVar.normalizationMethod !== 'NULL' ||
              collectionVar.displayName?.includes('pathway')
          : true; // DIY may not have the normalizationMethod annotations, but we still want those datasets to pass.
      })
      .map((collectionVar) => ({
        value: {
          collectionId: collectionVar.id,
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
          collectionId: configuration.collectionVariable.collectionId,
          entityId: configuration.collectionVariable.entityId,
        })
      );
      return selectedItem;
    }
  }, [collectionVarItems, configuration]);

  return (
    <ComputationStepContainer
      computationStepInfo={{
        stepNumber: 1,
        stepTitle: `Configure ${computationAppOverview.displayName}`,
      }}
    >
      <div className={cx()}>
        <div className={cx('-CorrelationAssayMetadataOuterConfigContainer')}>
          <H6>Input Data</H6>
          <div className={cx('-InputContainer')}>
            <span>Data</span>
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
          </div>
        </div>
      </div>
    </ComputationStepContainer>
  );
}
