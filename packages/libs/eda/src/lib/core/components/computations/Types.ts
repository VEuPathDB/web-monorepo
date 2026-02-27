import React from 'react';
import { AnalysisState } from '../../hooks/analysis';
import { EntityCounts } from '../../hooks/entityCounts';
import { PromiseHookState } from '../../hooks/promise';
import { GeoConfig } from '../../types/geoConfig';
import { Computation, ComputationAppOverview } from '../../types/visualization';
import { CollectionVariableTreeNode, Filter, StudyEntity } from '../..';
import { VisualizationPlugin } from '../visualizations/VisualizationPlugin';
import { IsEnabledInPickerParams } from '../visualizations/VisualizationTypes';

export interface ComputationProps {
  analysisState: AnalysisState;
  computationAppOverview: ComputationAppOverview;
  totalCounts: PromiseHookState<EntityCounts>;
  filteredCounts: PromiseHookState<EntityCounts>;
  geoConfigs: GeoConfig[];
}

export interface ComputationConfigProps extends ComputationProps {
  computationId: string;
  visualizationId: string;
  addNewComputation: (name: string, configuration: unknown) => void;
  changeConfigHandlerOverride?: (
    propertyName: string,
    value: any | ((current: any) => any)
  ) => void;
  showStepNumber?: boolean; // Whether to show step number (NumberedHeader)
  showExpandableHelp?: boolean; // If computation has expandable help, determines whether or not to show it.
  additionalCollectionPredicate?: (
    variableCollection: CollectionVariableTreeNode
  ) => boolean; // Additional constraints for allowed collection variables
  hideConfigurationComponent?: boolean; // Whether to hide the configuration component entirely
  readonlyInputNames?: string[]; // Input names managed externally (e.g. by SharedComputeInputsNotebookCell). Plugins render these as read-only.
  onCountGatingChange?: (result: CountGatingResult | undefined) => void; // Callback for config-level count gating (e.g. per-group sample counts)
}

export interface ComputationOverviewProps extends ComputationProps {}

export interface ComputationInstanceProps extends ComputationProps {
  computation: Computation;
}

export interface ComputationComponents {
  /** Screen that shows details of app and existing instances */
  overview: React.ComponentType<ComputationOverviewProps>;
  /** Screen that allows user to configure an app instance */
  create: React.ComponentType<ComputationOverviewProps>;
  /** Screen that allow user to update configuration of an app instance */
  edit: React.ComponentType<ComputationInstanceProps>;
  /** Screen that allows user to add visuzliations to an app instance */
  instance: React.ComponentType<ComputationInstanceProps>;
}

export interface ComputationPlugin {
  configurationComponent: React.ComponentType<ComputationConfigProps>;
  configurationDescriptionComponent?: React.ComponentType<{
    computation: Computation;
    filters: Filter[];
  }>;
  visualizationPlugins: Partial<Record<string, VisualizationPlugin<any>>>;
  createDefaultConfiguration: () => Record<string, unknown> | undefined;
  isConfigurationComplete: (configuration: unknown) => boolean;
  /** Function used to determine if visualization is compatible with study */
  isEnabledInPicker?: (props: IsEnabledInPickerParams) => boolean;
  /** Human-readable study requirements for this computation */
  studyRequirements?: string;
  /** Function that sets collection constraints based on context. Applied after the plugin's default predicate, if any */
  additionalCollectionPredicate?: (
    collection: CollectionVariableTreeNode
  ) => boolean;
  /**
   * Optional. Called with a map of named filtered count states.
   * Currently always contains `'root'` (the root/sample entity count).
   * Future use: group-level counts (e.g. `'group_A'`, `'group_B'`) for DESeq.
   * Returns a gating result: ok, pending (counts still loading), or a warning string.
   */
  getCountWarning?: (
    counts: Record<string, FilteredCountState>,
    configuration: unknown
  ) => CountGatingResult;
}

export type FilteredCountState = {
  pending: boolean;
  value: number | undefined;
};

export type CountGatingResult =
  | { type: 'ok' }
  | { type: 'pending' }
  | { type: 'warning'; message: string };
