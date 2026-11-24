import { useMemo, useState } from 'react';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { FilledButton } from '@veupathdb/coreui/lib/components/buttons';
import { AnalysisState } from '../../core/hooks/analysis';
import { useEntityCounts } from '../../core/hooks/entityCounts';
import {
  useGetDefaultVariableDescriptor,
  useStudyEntities,
} from '../../core/hooks/workspace';
import { StudyEntity } from '../../core/types/study';
import { VariableDescriptor } from '../../core/types/variable';
import { VariableLinkConfig } from '../../core/components/VariableLink';
import FilterChipList from '../../core/components/FilterChipList';
import { isLatitudeVariable } from '../../core/components/filter/guards';
import { useDeepValue } from '../../core/hooks/immutability';
import { FilterDefinedGroup } from '../../core/derivedVariables/types';
import {
  GroupEditingContext,
  earlierGroupsContext,
} from '../../core/derivedVariables/GroupEditingContext';
import {
  GroupFilterState,
  useGroupFilterAnalysisState,
} from '../../core/derivedVariables/useGroupFilterAnalysisState';
import Subsetting from '../Subsetting';

const cx = makeClassNameHelper('CreateVariables');

interface Props {
  analysisState: AnalysisState;
  group: GroupFilterState & { label: string };
  groupIndex: number;
  /** The groups before this one: the filter widgets show their selections. */
  earlierGroups: FilterDefinedGroup[];
  /** The variable to open on; the study's default variable without one. */
  startVariable?: VariableDescriptor;
  /** Must commit synchronously (plain setState): see useGroupFilterAnalysisState. */
  onChange: (next: GroupFilterState) => void;
  onClose: () => void;
}

/**
 * The Browse and Subset layout (variable tree and filter widgets) working on
 * one group's filters and UI settings instead of the analysis subset. Counts
 * are for the whole dataset: the analysis subset never applies (§3.2).
 */
export function GroupFilterEditor({
  analysisState,
  group,
  groupIndex,
  earlierGroups,
  startVariable,
  onChange,
  onClose,
}: Props) {
  const entities = useStudyEntities();
  const getDefaultVariableDescriptor = useGetDefaultVariableDescriptor();

  const [selected, setSelected] = useState<VariableDescriptor>(
    () =>
      (startVariable && toBrowsableVariable(entities, startVariable)) ??
      getDefaultVariableDescriptor()
  );

  const variableLinkConfig = useMemo(
    (): VariableLinkConfig => ({
      type: 'button',
      onClick(value) {
        if (value?.entityId != null && value.variableId != null)
          setSelected({
            entityId: value.entityId,
            variableId: value.variableId,
          });
      },
    }),
    []
  );

  const groupState = useMemo(
    () => ({ filters: group.filters, uiSettings: group.uiSettings }),
    [group.filters, group.uiSettings]
  );
  const groupAnalysisState = useGroupFilterAnalysisState(
    analysisState,
    groupState,
    onChange
  );

  // Deep-compared so the widgets' overlays only change when an earlier
  // group does, not on every edit of this group.
  const stableEarlierGroups = useDeepValue(earlierGroups);
  const groupEditing = useMemo(
    () => earlierGroupsContext(stableEarlierGroups, groupIndex),
    [stableEarlierGroups, groupIndex]
  );

  const totalCounts = useEntityCounts();
  const filteredCounts = useEntityCounts(group.filters);

  return (
    <div className={cx('-GroupFilterEditor')}>
      <div className={cx('-GroupFilterEditorHeader')}>
        <h3>
          Group {groupIndex + 1}: {group.label || 'Unnamed group'}
        </h3>
        <span className={cx('-ActionsSpacer')} />
        <FilledButton text="Done" themeRole="primary" onPress={onClose} />
      </div>
      <p className={cx('-Muted')}>
        Counts here are for the whole dataset, not the analysis subset.
      </p>
      {group.filters.length > 0 ? (
        <FilterChipList
          filters={group.filters}
          entities={entities}
          selectedEntityId={selected.entityId}
          selectedVariableId={selected.variableId}
          removeFilter={(filter) =>
            groupAnalysisState.setFilters((filters) =>
              filters.filter(
                (f) =>
                  f.entityId !== filter.entityId ||
                  f.variableId !== filter.variableId
              )
            )
          }
          variableLinkConfig={variableLinkConfig}
        />
      ) : (
        <span className={cx('-Muted')}>No filters yet</span>
      )}
      <GroupEditingContext.Provider value={groupEditing}>
        <Subsetting
          analysisState={groupAnalysisState}
          entityId={selected.entityId}
          variableId={selected.variableId}
          totalCounts={totalCounts.value}
          filteredCounts={filteredCounts.value}
          variableLinkConfig={variableLinkConfig}
        />
      </GroupEditingContext.Provider>
    </div>
  );
}

/**
 * A geographic area filter is on a hidden geoaggregator variable; its widget
 * (the map) lives on the entity's latitude variable, as in FilterChipList.
 */
function toBrowsableVariable(
  entities: StudyEntity[],
  descriptor: VariableDescriptor
): VariableDescriptor {
  const entity = entities.find((e) => e.id === descriptor.entityId);
  const variable = entity?.variables.find(
    (v) => v.id === descriptor.variableId
  );
  if (entity == null || variable?.displayType !== 'geoaggregator')
    return descriptor;
  const latitude = entity.variables.find(isLatitudeVariable);
  return latitude
    ? { entityId: entity.id, variableId: latitude.id }
    : descriptor;
}
