import { ReactNode, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import Modal from '@veupathdb/coreui/lib/components/containers/Modal';
import {
  FilledButton,
  OutlinedButton,
} from '@veupathdb/coreui/lib/components/buttons';
import SingleSelect from '@veupathdb/coreui/lib/components/inputs/SingleSelect';
import { AnalysisState } from '../../core/hooks/analysis';
import { useStudyEntities } from '../../core/hooks/workspace';
import { DerivedVariableSpec } from '../../core/types/analysis';
import { VariableDescriptor } from '../../core/types/variable';
import {
  FilterDefinedGroup,
  FilterDefinedGroupsSpec,
} from '../../core/derivedVariables/types';
import {
  DEFAULT_UNMAPPED_VALUE,
  MAX_GROUPS,
  nextGroupStartVariable,
  overlapForGroup,
  validateFilterDefinedGroups,
} from '../../core/derivedVariables/groups';
import { findVisualizationsUsing } from '../../core/derivedVariables/references';
import { useGroupCounts } from '../../core/derivedVariables/useGroupCounts';
import { GroupFilterState } from '../../core/derivedVariables/useGroupFilterAnalysisState';
import { GroupRow } from './GroupRow';
import { GroupFilterEditor } from './GroupFilterEditor';
import {
  GroupUISettings,
  readGroupUISettings,
  writeGroupUISettings,
} from './groupUISettings';

const cx = makeClassNameHelper('CreateVariables');

/** A group in the draft, with its filter widgets' UI settings. */
interface DraftGroup {
  /** Client-side only: keeps a row and its UI settings together on reorder. */
  id: string;
  group: FilterDefinedGroup;
  uiSettings: GroupUISettings;
}

interface Props {
  spec: FilterDefinedGroupsSpec;
  analysisState: AnalysisState;
  onSave: (spec: FilterDefinedGroupsSpec) => void;
  onCancel: () => void;
  onDelete: () => void;
}

/**
 * Edits one grouping variable as a local draft. Save writes the draft into
 * the analysis (saving an unsaved analysis first); Cancel discards it.
 */
export function VariableEditor({
  spec,
  analysisState,
  onSave,
  onCancel,
  onDelete,
}: Props) {
  const entities = useStudyEntities();
  const analysis = analysisState.analysis;

  const [displayName, setDisplayName] = useState(spec.displayName);
  const [entityId, setEntityId] = useState(spec.entityId);
  const [drafts, setDrafts] = useState((): DraftGroup[] => {
    const uiSettings = readGroupUISettings(
      analysis?.descriptor.subset.uiSettings ?? {},
      spec.variableId,
      spec.config.groups.length
    );
    return spec.config.groups.map((group, index) => ({
      id: uuid(),
      group,
      uiSettings: uiSettings[index],
    }));
  });
  const groups = useMemo(() => drafts.map((d) => d.group), [drafts]);
  // The group whose filters are being edited, if any.
  const [editing, setEditing] = useState<{
    id: string;
    startVariable?: VariableDescriptor;
  }>();
  const [everythingElseOn, setEverythingElseOn] = useState(
    Boolean(spec.config.unmappedValue)
  );
  const [everythingElseLabel, setEverythingElseLabel] = useState(
    spec.config.unmappedValue || DEFAULT_UNMAPPED_VALUE
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const draft = useMemo(
    (): FilterDefinedGroupsSpec => ({
      ...spec,
      entityId,
      displayName,
      config: {
        ...spec.config,
        groups,
        unmappedValue: everythingElseOn ? everythingElseLabel : '',
      },
    }),
    [spec, entityId, displayName, groups, everythingElseOn, everythingElseLabel]
  );

  const counts = useGroupCounts(draft);
  const entity = entities.find((e) => e.id === entityId);
  const entityPlural = entity?.displayNamePlural ?? entity?.displayName ?? '';

  const isSaved = (analysis?.descriptor.derivedVariables ?? []).some(
    (s) => s.variableId === spec.variableId
  );
  // Plots reference the variable by entityId + variableId, so a saved
  // variable must keep its entity or those plots would be orphaned.
  const entityLocked = isSaved || groups.length > 0;
  const usedBy = useMemo(
    () =>
      findVisualizationsUsing(analysis?.descriptor.computations ?? [], spec),
    [analysis?.descriptor.computations, spec]
  );

  const messages = [
    ...(displayName.trim() === '' ? ['Give the variable a name'] : []),
    ...(everythingElseOn && everythingElseLabel.trim() === ''
      ? ["The 'Everything else' label must be non-empty"]
      : []),
    ...validateFilterDefinedGroups(draft.config),
  ];

  const countsReady =
    !counts.pending &&
    counts.raw != null &&
    counts.final != null &&
    counts.raw.length === groups.length;
  const final = countsReady ? counts.final : undefined;

  const overlapWarnings = useMemo(() => {
    if (!countsReady || counts.raw == null || counts.final == null) return [];
    const finalCounts = groups.map((g) => counts.final?.[g.label] ?? 0);
    const raw = counts.raw;
    return groups.flatMap((g, index) => {
      const overlap = overlapForGroup(index, raw, finalCounts);
      if (overlap <= 0) return [];
      // Per-pair counts are not built (§5.3): name the earlier group only
      // when there is exactly one.
      const earlier = index === 1 ? groups[0].label : 'an earlier group';
      return [
        `${overlap.toLocaleString()} ${entityPlural} in ${
          g.label
        } also match ${earlier}; they count as that group. Adjust filters before saving.`,
      ];
    });
  }, [countsReady, counts.raw, counts.final, groups, entityPlural]);

  function renderCount(level: string): ReactNode {
    if (final != null) return (final[level] ?? 0).toLocaleString();
    return counts.pending ? (
      '…'
    ) : (
      <span title="Counts appear once the groups are valid">—</span>
    );
  }

  function updateGroup(index: number, update: Partial<FilterDefinedGroup>) {
    setDrafts((ds) =>
      ds.map((d, i) =>
        i === index ? { ...d, group: { ...d.group, ...update } } : d
      )
    );
  }

  // Called by the group editor's adapter: must commit synchronously.
  function updateGroupFilters(id: string, next: GroupFilterState) {
    setDrafts((ds) =>
      ds.map((d) =>
        d.id === id
          ? {
              ...d,
              group: { ...d.group, filters: next.filters },
              uiSettings: next.uiSettings,
            }
          : d
      )
    );
  }

  function moveGroup(from: number, to: number) {
    setDrafts((ds) => {
      const next = [...ds];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function addGroup() {
    if (drafts.length >= MAX_GROUPS) return;
    const labels = new Set(groups.map((g) => g.label));
    let n = groups.length + 1;
    while (labels.has(`Group ${n}`)) n++;
    const id = uuid();
    setDrafts((ds) => [
      ...ds,
      { id, group: { label: `Group ${n}`, filters: [] }, uiSettings: {} },
    ]);
    // Open on the variable the previous group used, with nothing selected.
    setEditing({ id, startVariable: nextGroupStartVariable(groups) });
  }

  function editGroup(index: number) {
    setEditing({
      id: drafts[index].id,
      startVariable:
        nextGroupStartVariable([groups[index]]) ??
        nextGroupStartVariable(groups.slice(0, index)),
    });
  }

  function save() {
    // UI settings go first. Their setter is built with skipServerCreate =
    // true, so if it ran second it would cancel the create of an unsaved
    // analysis that setDerivedVariables schedules.
    analysisState.setVariableUISettings((current) =>
      writeGroupUISettings(
        current,
        spec.variableId,
        drafts.map((d) => d.uiSettings)
      )
    );
    // This also creates an unsaved analysis first: the setter is built with
    // skipServerCreate = false (hooks/analysis.ts). The `true` argument is
    // ignored by useSetter; it is passed to state the intent.
    analysisState.setDerivedVariables(
      (previous) => upsertSpec(previous, draft),
      true
    );
    onSave(draft);
  }

  function confirmDelete() {
    setConfirmingDelete(false);
    // UI settings first, as in save().
    analysisState.setVariableUISettings((current) =>
      writeGroupUISettings(current, spec.variableId, [])
    );
    analysisState.setDerivedVariables(
      (previous) => previous.filter((s) => s.variableId !== spec.variableId),
      true
    );
    onDelete();
  }

  const editingIndex =
    editing == null ? -1 : drafts.findIndex((d) => d.id === editing.id);
  if (editing != null && editingIndex >= 0) {
    const { id, group, uiSettings } = drafts[editingIndex];
    return (
      <div className={cx('-Editor')}>
        <GroupFilterEditor
          key={id}
          analysisState={analysisState}
          group={{ label: group.label, filters: group.filters, uiSettings }}
          groupIndex={editingIndex}
          startVariable={editing.startVariable}
          onChange={(next) => updateGroupFilters(id, next)}
          onClose={() => setEditing(undefined)}
        />
      </div>
    );
  }

  return (
    <div className={cx('-Editor')}>
      <div className={cx('-EditorHeader')}>
        <label>
          Name{' '}
          <input
            type="text"
            value={displayName}
            placeholder="e.g. Region (East/West)"
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>
        <span
          className={cx('-EntityPicker')}
          title={
            isSaved
              ? 'A saved variable keeps its entity, so the plots that use it keep working'
              : groups.length > 0
              ? 'Remove all groups to change what is being grouped'
              : undefined
          }
        >
          Group{' '}
          <SingleSelect
            items={entities.map((e) => ({
              display: e.displayNamePlural ?? e.displayName,
              value: e.id,
            }))}
            value={entityId}
            onSelect={setEntityId}
            buttonDisplayContent={entityPlural || 'Select an entity'}
            isDisabled={entityLocked}
          />{' '}
          into:
        </span>
      </div>

      <ol className={cx('-Groups')}>
        {drafts.map(({ id, group: g }, index) => (
          <GroupRow
            key={id}
            group={g}
            index={index}
            groupCount={groups.length}
            entities={entities}
            count={renderCount(g.label)}
            onLabelChange={(label) => updateGroup(index, { label })}
            onMoveUp={() => moveGroup(index, index - 1)}
            onMoveDown={() => moveGroup(index, index + 1)}
            onRemove={() => setDrafts((ds) => ds.filter((_, i) => i !== index))}
            onEdit={() => editGroup(index)}
          />
        ))}
      </ol>
      <div className={cx('-AddGroup')}>
        <OutlinedButton
          text="Add group"
          size="small"
          themeRole="primary"
          disabled={groups.length >= MAX_GROUPS}
          tooltip={
            groups.length >= MAX_GROUPS
              ? `A variable can have at most ${MAX_GROUPS} groups`
              : undefined
          }
          onPress={addGroup}
        />
      </div>

      <div className={cx('-EverythingElse')}>
        <label>
          <input
            type="checkbox"
            checked={everythingElseOn}
            onChange={(e) => setEverythingElseOn(e.target.checked)}
          />{' '}
          Everything else
        </label>
        <input
          type="text"
          aria-label="'Everything else' label"
          value={everythingElseLabel}
          disabled={!everythingElseOn}
          onChange={(e) => setEverythingElseLabel(e.target.value)}
        />
        <span
          className={cx('-Count')}
          title={
            everythingElseOn ? undefined : 'Records in no group have no value'
          }
        >
          {renderCount(everythingElseOn ? everythingElseLabel : '')}
        </span>
      </div>

      {overlapWarnings.length > 0 && (
        <ul className={cx('-Warnings')}>
          {overlapWarnings.map((warning) => (
            <li key={warning}>
              <span aria-hidden="true">⚠</span> <span>{warning}</span>
            </li>
          ))}
        </ul>
      )}

      {usedBy.length > 0 && (
        <div className={cx('-UsedBy')}>
          Used by:{' '}
          {usedBy
            .map((viz) => viz.displayName ?? 'Unnamed visualization')
            .join(', ')}
        </div>
      )}

      {messages.length > 0 && (
        <ul className={cx('-Messages')}>
          {messages.map((message, index) => (
            <li key={`${index}/${message}`}>{message}</li>
          ))}
        </ul>
      )}

      <div className={cx('-Actions')}>
        {isSaved && (
          <OutlinedButton
            text="Delete variable"
            themeRole="error"
            onPress={() => setConfirmingDelete(true)}
          />
        )}
        <span className={cx('-ActionsSpacer')} />
        <OutlinedButton text="Cancel" themeRole="primary" onPress={onCancel} />
        <FilledButton
          text="Save variable"
          themeRole="primary"
          disabled={messages.length > 0}
          onPress={save}
        />
      </div>

      <Modal
        title="Delete variable?"
        visible={confirmingDelete}
        toggleVisible={setConfirmingDelete}
        includeCloseButton
        themeRole="primary"
        styleOverrides={{
          content: { padding: { top: 0, right: 25, bottom: 25, left: 25 } },
        }}
      >
        <div className={cx('-DeleteConfirm')}>
          <p>
            Delete <strong>{spec.displayName}</strong>? This cannot be undone.
          </p>
          {usedBy.length > 0 && (
            <>
              <p>
                These plots use it. They will lose this variable and need
                another one picked:
              </p>
              <ul>
                {usedBy.map((viz) => (
                  <li key={viz.visualizationId}>
                    {viz.displayName ?? 'Unnamed visualization'}
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className={cx('-Actions')}>
            <span className={cx('-ActionsSpacer')} />
            <OutlinedButton
              text="Cancel"
              themeRole="primary"
              onPress={() => setConfirmingDelete(false)}
            />
            <FilledButton
              text="Delete"
              themeRole="error"
              onPress={confirmDelete}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function upsertSpec(
  previous: DerivedVariableSpec[],
  spec: FilterDefinedGroupsSpec
): DerivedVariableSpec[] {
  return previous.some((s) => s.variableId === spec.variableId)
    ? previous.map((s) => (s.variableId === spec.variableId ? spec : s))
    : [...previous, spec];
}
