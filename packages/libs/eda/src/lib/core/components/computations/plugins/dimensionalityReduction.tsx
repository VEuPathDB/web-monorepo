import { useStudyMetadata, useFindEntityAndVariable, Filter } from '../../..';
import { VariableDescriptor } from '../../../types/variable';
import { scatterplotVisualization } from '../../visualizations/implementations/ScatterplotVisualization';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import {
  useConfigChangeHandler,
  assertComputationWithConfig,
  partialToCompleteCodec,
  GENE_EXPRESSION_STABLE_IDS,
  GENE_EXPRESSION_VALUE_IDS,
} from '../Utils';
import * as t from 'io-ts';
import { Computation } from '../../../types/visualization';
import ScatterBetadivSVG from '../../visualizations/implementations/selectorIcons/ScatterBetadivSVG';
import { ComputationStepContainer } from '../ComputationStepContainer';
import './Plugins.scss';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { IsEnabledInPickerParams } from '../../visualizations/VisualizationTypes';
import { entityTreeToArray } from '../../../utils/study-metadata';
import { useCallback, useMemo } from 'react';
import { InputVariables } from '../../visualizations/InputVariables';
import { useToggleStarredVariable } from '../../../hooks/starredVariables';
import { DataElementConstraintRecord } from '../../../utils/data-element-constraints';
import { H6 } from '@veupathdb/coreui';

const cx = makeClassNameHelper('AppStepConfigurationContainer');

export type DimensionalityReductionConfig = t.TypeOf<
  typeof DimensionalityReductionConfig
>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DimensionalityReductionConfig = t.partial({
  identifierVariable: VariableDescriptor,
  valueVariable: VariableDescriptor,
});

const CompleteDimensionalityReductionConfig = partialToCompleteCodec(
  DimensionalityReductionConfig
);

/**
 * Constraints for gene expression variable selection.
 * Ensures only valid identifier and value variables can be selected,
 * and enforces entity compatibility between them.
 */
const geneExpressionConstraints: DataElementConstraintRecord[] = [
  {
    identifierVariable: {
      isRequired: true,
      minNumVars: 1,
      maxNumVars: 1,
      allowedVariableIds: [GENE_EXPRESSION_STABLE_IDS.IDENTIFIER],
      description: 'Select a gene identifier variable (VEUPATHDB_GENE_ID).',
    },
    valueVariable: {
      isRequired: true,
      minNumVars: 1,
      maxNumVars: 1,
      allowedVariableIds: [...GENE_EXPRESSION_VALUE_IDS],
      description:
        'Select expression data: raw counts, sense/antisense counts, or normalized expression.',
    },
  },
];

/**
 * Dependency order ensures entity compatibility.
 * identifierVariable and valueVariable must be from the same entity.
 */
const geneExpressionDependencyOrder = [['identifierVariable', 'valueVariable']];

export const plugin: ComputationPlugin = {
  configurationComponent: DimensionalityReductionConfiguration,
  configurationDescriptionComponent:
    DimensionalityReductionConfigDescriptionComponent,
  createDefaultConfiguration: () => ({}),
  isConfigurationComplete: CompleteDimensionalityReductionConfig.is,
  visualizationPlugins: {
    scatterplot: scatterplotVisualization
      .withOptions({
        hideShowMissingnessToggle: true,
        hideTrendlines: true,
        hideFacetInputs: true,
        hideLogScale: true,
        returnPointIds: false,
        sendComputedVariablesInRequest: true,
      })
      .withSelectorIcon(ScatterBetadivSVG),
  },
  isEnabledInPicker: isEnabledInPicker,
  studyRequirements:
    'These visualizations are only available for studies with compatible assay data.',
};

function DimensionalityReductionConfigDescriptionComponent({
  computation,
  filters,
}: {
  computation: Computation;
  filters: Filter[];
}) {
  const findEntityAndVariable = useFindEntityAndVariable(filters);
  assertComputationWithConfig(computation, DimensionalityReductionConfig);
  const { configuration } = computation.descriptor;

  const identifierVariable = configuration.identifierVariable
    ? findEntityAndVariable(configuration.identifierVariable)
    : undefined;

  const valueVariable = configuration.valueVariable
    ? findEntityAndVariable(configuration.valueVariable)
    : undefined;

  return (
    <div className="ConfigDescriptionContainer">
      <h4>
        Gene Identifier:{' '}
        <span>
          {identifierVariable ? (
            `${identifierVariable.entity.displayName} > ${identifierVariable.variable.displayName}`
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
      <h4>
        Expression Data:{' '}
        <span>
          {valueVariable ? (
            `${valueVariable.entity.displayName} > ${valueVariable.variable.displayName}`
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
    </div>
  );
}

export function DimensionalityReductionConfiguration(
  props: ComputationConfigProps
) {
  const {
    computationAppOverview,
    computation,
    analysisState,
    visualizationId,
    changeConfigHandlerOverride,
    showStepNumber = true,
    readonlyInputNames,
  } = props;

  assertComputationWithConfig(computation, DimensionalityReductionConfig);
  const configuration = computation.descriptor
    .configuration as DimensionalityReductionConfig;

  const studyMetadata = useStudyMetadata();
  const toggleStarredVariable = useToggleStarredVariable(analysisState);

  const workspaceChangeConfigHandler = useConfigChangeHandler(
    analysisState,
    computation,
    visualizationId
  );

  const changeConfigHandler =
    changeConfigHandlerOverride ?? workspaceChangeConfigHandler;

  const filters = analysisState.analysis?.descriptor.subset.descriptor;
  const findEntityAndVariable = useFindEntityAndVariable(filters);

  // Helper to get display name for a variable descriptor (used for read-only labels)
  const getVariableDisplayName = useCallback(
    (varDescriptor: any) => {
      if (!varDescriptor) return undefined;
      const result = findEntityAndVariable(varDescriptor);
      if (!result) return undefined;
      return `${result.entity.displayName} > ${result.variable.displayName}`;
    },
    [findEntityAndVariable]
  );

  const entities = useMemo(
    () =>
      studyMetadata?.rootEntity
        ? entityTreeToArray(studyMetadata.rootEntity)
        : [],
    [studyMetadata]
  );

  return (
    <ComputationStepContainer
      computationStepInfo={{
        stepNumber: 1,
        stepTitle: `Configure ${computationAppOverview.displayName}`,
      }}
      showStepNumber={showStepNumber}
    >
      <div className={cx()}>
        <div className={cx('-DiffExpressionOuterConfigContainer')}>
          <H6>Expression Data</H6>
          <InputVariables
            inputs={[
              {
                name: 'identifierVariable',
                label: 'Gene Identifier',
                role: 'axis',
                titleOverride: 'Expression Data',
                ...(readonlyInputNames?.includes('identifierVariable')
                  ? {
                      readonlyValue:
                        getVariableDisplayName(
                          configuration.identifierVariable
                        ) ?? 'Not selected',
                    }
                  : {}),
              },
              {
                name: 'valueVariable',
                label: 'Count type',
                role: 'axis',
                ...(readonlyInputNames?.includes('valueVariable')
                  ? {
                      readonlyValue:
                        getVariableDisplayName(configuration.valueVariable) ??
                        'Not selected',
                    }
                  : {}),
              },
            ]}
            entities={entities}
            selectedVariables={{
              identifierVariable: configuration.identifierVariable,
              valueVariable: configuration.valueVariable,
            }}
            onChange={(vars) => {
              if (
                !readonlyInputNames?.includes('identifierVariable') &&
                vars.identifierVariable !== configuration.identifierVariable
              ) {
                changeConfigHandler(
                  'identifierVariable',
                  vars.identifierVariable
                );
              }
              if (
                !readonlyInputNames?.includes('valueVariable') &&
                vars.valueVariable !== configuration.valueVariable
              ) {
                changeConfigHandler('valueVariable', vars.valueVariable);
              }
            }}
            constraints={geneExpressionConstraints}
            dataElementDependencyOrder={geneExpressionDependencyOrder}
            starredVariables={
              analysisState.analysis?.descriptor.starredVariables ?? []
            }
            toggleStarredVariable={toggleStarredVariable}
          />
        </div>
      </div>
    </ComputationStepContainer>
  );
}

// Dimensionality reduction requires that the study has gene expression variables.
function isEnabledInPicker({
  studyMetadata,
}: IsEnabledInPickerParams): boolean {
  if (!studyMetadata) return false;

  const entities = entityTreeToArray(studyMetadata.rootEntity);

  const hasIdentifierVariable = entities.some((entity) =>
    entity.variables.some(
      (variable) => variable.id === GENE_EXPRESSION_STABLE_IDS.IDENTIFIER
    )
  );

  const hasValueVariable = entities.some((entity) =>
    entity.variables.some((variable) =>
      GENE_EXPRESSION_VALUE_IDS.includes(variable.id as any)
    )
  );

  return hasIdentifierVariable && hasValueVariable;
}
