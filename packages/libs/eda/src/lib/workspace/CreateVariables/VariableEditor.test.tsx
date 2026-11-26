import { ComponentProps, ReactNode } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import {
  WorkspaceContext,
  WorkspaceContextValue,
} from '../../core/context/WorkspaceContext';
import { AnalysisState } from '../../core/hooks/analysis';
import { DerivedVariableSpec } from '../../core/types/analysis';
import { Filter } from '../../core/types/filter';
import { StudyEntity } from '../../core/types/study';
import {
  FilterDefinedGroup,
  FilterDefinedGroupsSpec,
} from '../../core/derivedVariables/types';
import {
  GroupCounts,
  useGroupCounts,
} from '../../core/derivedVariables/useGroupCounts';
import {
  fromRecoderSpec,
  toStoredSpec,
} from '../../core/derivedVariables/recoding';
import { GroupFilterEditor } from './GroupFilterEditor';
import { VariableEditor } from './VariableEditor';
import { SubsetUISettings } from './groupUISettings';

jest.mock('../../core/derivedVariables/useGroupCounts', () => ({
  useGroupCounts: jest.fn(),
}));
// The group editor (Browse and Subset widgets) has its own tests; here a stub
// shows the group's UI settings and can change them.
jest.mock('./GroupFilterEditor', () => ({ GroupFilterEditor: jest.fn() }));

const mockGroupFilterEditor = GroupFilterEditor as jest.MockedFunction<
  typeof GroupFilterEditor
>;

function GroupFilterEditorStub(
  props: ComponentProps<typeof GroupFilterEditor>
) {
  return (
    <div>
      <span data-testid="group-ui-settings">
        {JSON.stringify(props.group.uiSettings)}
      </span>
      <button
        type="button"
        onClick={() =>
          props.onChange({
            filters: props.group.filters,
            uiSettings: { 'col/species': { edited: props.group.label } },
          })
        }
      >
        Edit stub UI settings
      </button>
      <button
        type="button"
        onClick={() =>
          props.onChange({
            filters: [otherFilter],
            uiSettings: props.group.uiSettings,
          })
        }
      >
        Edit stub filters
      </button>
      <span data-testid="stub-group-label">{props.group.label}</span>
      <button type="button" onClick={() => props.onLabelChange('Renamed')}>
        Rename stub group
      </button>
      <button type="button" onClick={props.onClose}>
        Done
      </button>
      <button type="button" onClick={props.onCancel}>
        Cancel
      </button>
    </div>
  );
}

const filter = {
  type: 'stringSet',
  entityId: 'col',
  variableId: 'species',
  stringSet: ['a'],
} as Filter;
const otherFilter = { ...filter, stringSet: ['b'] } as Filter;

const mockUseGroupCounts = useGroupCounts as jest.MockedFunction<
  typeof useGroupCounts
>;

const collections = {
  id: 'col',
  idColumnName: 'col_id',
  displayName: 'Collection',
  displayNamePlural: 'Collections',
  description: '',
  isManyToOneWithParent: false,
  variables: [
    {
      id: 'species',
      providerLabel: 'species',
      displayName: 'Species',
      type: 'string',
      dataShape: 'categorical',
      vocabulary: ['a', 'b'],
    },
  ],
} as unknown as StudyEntity;

const rootEntity = {
  id: 'root',
  idColumnName: 'root_id',
  displayName: 'Study',
  description: '',
  isManyToOneWithParent: false,
  variables: [],
  children: [collections],
} as unknown as StudyEntity;

const workspace = {
  studyMetadata: { id: 'study', rootEntity },
} as unknown as WorkspaceContextValue;

function group(label: string): FilterDefinedGroup {
  return { label, filters: [filter] };
}

function makeSpec(
  groups: FilterDefinedGroup[],
  overrides: Partial<FilterDefinedGroupsSpec> = {}
): FilterDefinedGroupsSpec {
  return {
    entityId: 'col',
    variableId: 'dv1',
    functionName: 'filterDefinedGroups',
    displayName: 'Region',
    config: { groups, unmappedValue: 'Other' },
    ...overrides,
  };
}

function makeAnalysisState(
  derivedVariables: DerivedVariableSpec[] = [],
  computations: unknown[] = [],
  uiSettings: SubsetUISettings = {},
  subsetFilters: Filter[] = []
) {
  const setDerivedVariables = jest.fn();
  const setVariableUISettings = jest.fn();
  const analysisState = {
    analysis: {
      descriptor: {
        derivedVariables,
        computations,
        subset: { descriptor: subsetFilters, uiSettings },
      },
    },
    setDerivedVariables,
    setVariableUISettings,
  } as unknown as AnalysisState;
  return { analysisState, setDerivedVariables, setVariableUISettings };
}

function renderEditor(
  spec: FilterDefinedGroupsSpec,
  analysisState: AnalysisState
) {
  const callbacks = {
    onSave: jest.fn(),
    onCancel: jest.fn(),
    onDelete: jest.fn(),
  };
  const wrapper = ({ children }: { children?: ReactNode }) => (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  );
  const { unmount } = render(
    <VariableEditor spec={spec} analysisState={analysisState} {...callbacks} />,
    { wrapper }
  );
  return { ...callbacks, unmount };
}

function saveButton() {
  return screen.getByRole('button', { name: 'Save variable' });
}

/** Applies the functional update passed to setDerivedVariables. */
function applyUpdate(
  setDerivedVariables: jest.Mock,
  previous: DerivedVariableSpec[]
): DerivedVariableSpec[] {
  const update = setDerivedVariables.mock.calls[0][0];
  return typeof update === 'function' ? update(previous) : update;
}

/** Applies the functional update passed to setVariableUISettings. */
function applyUISettingsUpdate(
  setVariableUISettings: jest.Mock,
  previous: SubsetUISettings
): SubsetUISettings {
  const update = setVariableUISettings.mock.calls[0][0];
  return typeof update === 'function' ? update(previous) : update;
}

const settledCounts: GroupCounts = { pending: false };

beforeEach(() => {
  mockUseGroupCounts.mockReset();
  mockUseGroupCounts.mockReturnValue(settledCounts);
  mockGroupFilterEditor.mockReset();
  mockGroupFilterEditor.mockImplementation(GroupFilterEditorStub);
});

describe('VariableEditor', () => {
  test('shows the subset banner only when the analysis subset has filters', () => {
    const noteText =
      'Counts here are for the whole dataset. Your analysis subset is not applied.';
    const spec = makeSpec([group('East')]);
    const withSubset = makeAnalysisState([], [], {}, [filter]);
    const { unmount } = renderEditor(spec, withSubset.analysisState);
    expect(screen.getByText(noteText)).toBeInTheDocument();
    unmount();
    renderEditor(spec, makeAnalysisState().analysisState);
    expect(screen.queryByText(noteText)).toBeNull();
  });

  test('save is disabled and messages shown for a duplicate group label', () => {
    const { analysisState } = makeAnalysisState();
    renderEditor(makeSpec([group('East'), group('East')]), analysisState);
    expect(saveButton()).toBeDisabled();
    expect(screen.getByText('Group labels must be unique')).toBeInTheDocument();
  });

  test('saving a new variable calls setDerivedVariables with createIfUnsaved true', () => {
    const existing = makeSpec([group('A')], {
      variableId: 'other',
      displayName: 'Other variable',
    });
    const { analysisState, setDerivedVariables } = makeAnalysisState([
      existing,
    ]);
    const spec = makeSpec([group('East')]);
    const { onSave } = renderEditor(spec, analysisState);
    expect(saveButton()).toBeEnabled();
    fireEvent.click(saveButton());
    expect(setDerivedVariables).toHaveBeenCalledTimes(1);
    expect(setDerivedVariables.mock.calls[0][1]).toBe(true);
    expect(applyUpdate(setDerivedVariables, [existing])).toEqual([
      existing,
      toStoredSpec(spec, [rootEntity, collections]),
    ]);
    expect(onSave).toHaveBeenCalledWith(spec);
  });

  test('saving an existing variable replaces it in place', () => {
    const before = makeSpec([group('East')]);
    const after = makeSpec([group('East')], { displayName: 'Renamed' });
    const other = makeSpec([group('A')], { variableId: 'other' });
    const { analysisState, setDerivedVariables } = makeAnalysisState([
      before,
      other,
    ]);
    renderEditor(before, analysisState);
    fireEvent.change(screen.getByLabelText('Variable name'), {
      target: { value: 'Renamed' },
    });
    fireEvent.click(saveButton());
    expect(applyUpdate(setDerivedVariables, [before, other])).toEqual([
      toStoredSpec(after, [rootEntity, collections]),
      other,
    ]);
  });

  test('overlap warning names the single earlier group', () => {
    mockUseGroupCounts.mockReturnValue({
      pending: false,
      raw: [10, 8],
      final: { East: 10, West: 5, Other: 3 },
    });
    const { analysisState } = makeAnalysisState();
    renderEditor(makeSpec([group('East'), group('West')]), analysisState);
    expect(
      screen.getByText(
        '3 Collections in West also match East; they count as that group. Adjust filters before saving.'
      )
    ).toBeInTheDocument();
    // overlaps warn but do not block saving
    expect(saveButton()).toBeEnabled();
  });

  test('shows "Counts could not be loaded." when counts fail', () => {
    mockUseGroupCounts.mockReturnValue({
      pending: false,
      error: new Error('boom'),
    });
    const { analysisState } = makeAnalysisState();
    renderEditor(makeSpec([group('East'), group('West')]), analysisState);
    expect(screen.getByText('Counts could not be loaded.')).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Counts could not be loaded').length
    ).toBeGreaterThan(0);
  });

  test('overlap warning for a later group says "an earlier group"', () => {
    mockUseGroupCounts.mockReturnValue({
      pending: false,
      raw: [10, 8, 6],
      final: { East: 10, West: 8, North: 4 },
    });
    const { analysisState } = makeAnalysisState();
    renderEditor(
      makeSpec([group('East'), group('West'), group('North')]),
      analysisState
    );
    expect(
      screen.getByText(
        '2 Collections in North also match an earlier group; they count as that group. Adjust filters before saving.'
      )
    ).toBeInTheDocument();
  });

  test('delete confirmation lists the plots that use the variable', () => {
    const spec = makeSpec([group('East')]);
    const other = makeSpec([group('A')], { variableId: 'other' });
    const computations = [
      {
        computationId: 'c1',
        descriptor: { type: 'pass', configuration: {} },
        visualizations: [
          {
            visualizationId: 'v1',
            displayName: 'Mortality over time',
            descriptor: {
              type: 'lineplot',
              configuration: {
                overlayVariable: { entityId: 'col', variableId: 'dv1' },
              },
            },
          },
          {
            visualizationId: 'v2',
            displayName: 'Unrelated plot',
            descriptor: { type: 'barplot', configuration: {} },
          },
        ],
      },
    ];
    const { analysisState, setDerivedVariables } = makeAnalysisState(
      [spec, other],
      computations
    );
    const { onDelete } = renderEditor(spec, analysisState);

    fireEvent.click(screen.getByRole('button', { name: 'Delete variable' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Mortality over time')).toBeInTheDocument();
    expect(within(dialog).queryByText('Unrelated plot')).toBeNull();
    expect(setDerivedVariables).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
    expect(setDerivedVariables.mock.calls[0][1]).toBe(true);
    expect(applyUpdate(setDerivedVariables, [spec, other])).toEqual([other]);
    expect(onDelete).toHaveBeenCalled();
  });

  test('disables Add group at 7 groups with the note "At most 7 groups, so each group and Everything else gets its own colour"', () => {
    const { analysisState } = makeAnalysisState();
    const labels = Array.from({ length: 6 }, (_, i) => `G${i + 1}`);
    renderEditor(makeSpec(labels.map(group)), analysisState);
    expect(screen.getByRole('button', { name: 'Add group' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Add group' }));
    // Add group opens the new group's filter editor; Done returns to the list
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.getAllByLabelText(/^Group \d+ label$/)).toHaveLength(7);
    expect(screen.getByRole('button', { name: 'Add group' })).toBeDisabled();
    expect(
      screen.getByText(
        'At most 7 groups, so each group and Everything else gets its own colour'
      )
    ).toBeInTheDocument();
  });

  test('the entity picker is disabled for a saved variable with no groups in the draft', () => {
    const saved = makeSpec([group('East')]);
    const { analysisState } = makeAnalysisState([saved]);
    renderEditor(saved, analysisState);
    fireEvent.click(screen.getByRole('button', { name: 'Remove group 1' }));
    expect(screen.queryAllByLabelText(/^Group \d+ label$/)).toHaveLength(0);
    expect(screen.getByRole('button', { name: /Collections/ })).toBeDisabled();
  });

  test('the entity picker is enabled for a new variable with no groups', () => {
    const { analysisState } = makeAnalysisState();
    renderEditor(makeSpec([]), analysisState);
    expect(screen.getByRole('button', { name: /Collections/ })).toBeEnabled();
  });

  test('unchecking "Everything else" saves an empty unmappedValue', () => {
    const { analysisState, setDerivedVariables } = makeAnalysisState();
    renderEditor(makeSpec([group('East')]), analysisState);
    fireEvent.click(screen.getByLabelText('Everything else'));
    fireEvent.click(saveButton());
    const [saved] = applyUpdate(setDerivedVariables, []);
    expect(saved.config).toEqual({
      inputVariable: { entityId: 'col', variableId: 'species' },
      rules: [{ inputValues: ['a'], outputValue: 'East' }],
    });
  });
});

describe('VariableEditor saving as a recoder', () => {
  const entities = [rootEntity, collections];
  const eligible = (): FilterDefinedGroup[] => [
    group('East'),
    { label: 'West', filters: [otherFilter] },
  ];

  test('saves eligible groups as a recoder spec with the same variableId', () => {
    const { analysisState, setDerivedVariables } = makeAnalysisState();
    renderEditor(makeSpec(eligible()), analysisState);
    fireEvent.click(saveButton());
    const [saved] = applyUpdate(setDerivedVariables, []);
    expect(saved.functionName).toBe('categoricalRecoding');
    expect(saved.variableId).toBe('dv1');
    expect(saved.entityId).toBe('col');
  });

  test('saves ineligible groups as filterDefinedGroups', () => {
    const { analysisState, setDerivedVariables } = makeAnalysisState();
    const two = { ...filter, variableId: 'other' } as Filter;
    renderEditor(
      makeSpec([group('East'), { label: 'West', filters: [filter, two] }]),
      analysisState
    );
    fireEvent.click(saveButton());
    const [saved] = applyUpdate(setDerivedVariables, []);
    expect(saved.functionName).toBe('filterDefinedGroups');
    expect(saved.variableId).toBe('dv1');
  });

  test('re-saving after an edit that changes form keeps the variableId', () => {
    const two = { ...filter, variableId: 'other' } as Filter;
    const before = makeSpec([
      { label: 'East', filters: [filter, two] },
      { label: 'West', filters: [otherFilter] },
    ]);
    expect(toStoredSpec(before, entities)).toBe(before);
    const { analysisState, setDerivedVariables } = makeAnalysisState([before]);
    renderEditor(before, analysisState);
    // Removing the two-filter group leaves a single-variable grouping
    fireEvent.click(screen.getByRole('button', { name: 'Remove group 1' }));
    fireEvent.click(saveButton());
    const [saved] = applyUpdate(setDerivedVariables, [before]);
    expect(saved.functionName).toBe('categoricalRecoding');
    expect(saved.variableId).toBe('dv1');
  });

  function everythingElse() {
    return screen.getByLabelText('Everything else') as HTMLInputElement;
  }

  test('new variable: Everything else turns off when groups cover the vocabulary, back on when they stop', () => {
    const { analysisState } = makeAnalysisState();
    renderEditor(makeSpec(eligible()), analysisState);
    expect(everythingElse().checked).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Remove group 2' }));
    expect(everythingElse().checked).toBe(true);
  });

  test('once the user toggles Everything else, coverage changes no longer move it', () => {
    const { analysisState } = makeAnalysisState();
    renderEditor(makeSpec(eligible()), analysisState);
    expect(everythingElse().checked).toBe(false);
    fireEvent.click(everythingElse());
    expect(everythingElse().checked).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Remove group 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove group 1' }));
    expect(everythingElse().checked).toBe(true);
    fireEvent.click(everythingElse());
    fireEvent.click(screen.getByRole('button', { name: 'Add group' }));
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(everythingElse().checked).toBe(false);
  });

  test('opening a saved variable keeps its stored Everything else setting', () => {
    const spec = makeSpec(eligible(), {
      config: { groups: eligible(), unmappedValue: 'Rest' },
    });
    const { analysisState } = makeAnalysisState([toStoredSpec(spec, entities)]);
    renderEditor(spec, analysisState);
    // groups cover the vocabulary, but the saved setting stands
    expect(everythingElse().checked).toBe(true);
    expect(screen.getByLabelText("'Everything else' label")).toHaveValue(
      'Rest'
    );
  });
});

describe('VariableEditor group UI settings', () => {
  const eastSettings = { 'col/lat/lon': { selectedShapes: ['east'] } };
  const westSettings = { 'col/lat/lon': { selectedShapes: ['west'] } };
  const stored: SubsetUISettings = {
    'derivedVariable/dv1/group1': eastSettings,
    'derivedVariable/dv1/group2': westSettings,
    'derivedVariable/dv1/group3': { stale: {} },
    'derivedVariable/other/group1': { kept: {} },
    'col/species': { unrelated: true },
  };
  const unrelated = {
    'derivedVariable/other/group1': { kept: {} },
    'col/species': { unrelated: true },
  };

  function openGroupEditor(position: number) {
    fireEvent.click(
      screen.getByRole('button', {
        name: `Edit the filters of group ${position}`,
      })
    );
  }

  function shownUISettings() {
    return JSON.parse(
      screen.getByTestId('group-ui-settings').textContent ?? 'null'
    );
  }

  test("a reorder moves a group's UI settings with it", () => {
    const spec = makeSpec([group('East'), group('West')]);
    const { analysisState } = makeAnalysisState([spec], [], stored);
    renderEditor(spec, analysisState);
    openGroupEditor(1);
    expect(shownUISettings()).toEqual(eastSettings);
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    fireEvent.click(screen.getByRole('button', { name: 'Move group 2 up' }));
    expect(screen.getByLabelText('Group 1 label')).toHaveValue('West');
    openGroupEditor(1);
    expect(shownUISettings()).toEqual(westSettings);
  });

  test('Save writes the UI settings keys by final position and drops stale ones', () => {
    const spec = makeSpec([group('East'), group('West')]);
    const { analysisState, setDerivedVariables, setVariableUISettings } =
      makeAnalysisState([spec], [], stored);
    renderEditor(spec, analysisState);
    fireEvent.click(screen.getByRole('button', { name: 'Move group 2 up' }));
    fireEvent.click(saveButton());

    expect(applyUISettingsUpdate(setVariableUISettings, stored)).toEqual({
      ...unrelated,
      'derivedVariable/dv1/group1': westSettings,
      'derivedVariable/dv1/group2': eastSettings,
    });
    // UI settings first: their setter does not create an unsaved analysis
    // and would otherwise cancel the create scheduled by setDerivedVariables.
    expect(setVariableUISettings.mock.invocationCallOrder[0]).toBeLessThan(
      setDerivedVariables.mock.invocationCallOrder[0]
    );
  });

  test("removing a group drops its UI settings and renumbers the rest's", () => {
    const spec = makeSpec([group('East'), group('West')]);
    const { analysisState, setVariableUISettings } = makeAnalysisState(
      [spec],
      [],
      stored
    );
    renderEditor(spec, analysisState);
    fireEvent.click(screen.getByRole('button', { name: 'Remove group 1' }));
    fireEvent.click(saveButton());
    expect(applyUISettingsUpdate(setVariableUISettings, stored)).toEqual({
      ...unrelated,
      'derivedVariable/dv1/group1': westSettings,
    });
  });

  test('UI settings edited in the group editor are saved with the group', () => {
    const spec = makeSpec([group('East'), group('West')]);
    const { analysisState, setVariableUISettings } = makeAnalysisState(
      [spec],
      [],
      stored
    );
    renderEditor(spec, analysisState);
    openGroupEditor(2);
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit stub UI settings' })
    );
    expect(setVariableUISettings).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    fireEvent.click(saveButton());
    expect(applyUISettingsUpdate(setVariableUISettings, stored)).toEqual({
      ...unrelated,
      'derivedVariable/dv1/group1': eastSettings,
      'derivedVariable/dv1/group2': { 'col/species': { edited: 'West' } },
    });
  });

  test('Cancel discards UI settings edits', () => {
    const spec = makeSpec([group('East')]);
    const { analysisState, setVariableUISettings } = makeAnalysisState(
      [spec],
      [],
      stored
    );
    const { onCancel } = renderEditor(spec, analysisState);
    openGroupEditor(1);
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit stub UI settings' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
    expect(setVariableUISettings).not.toHaveBeenCalled();
  });

  describe('Cancel and Done in the group filter editor', () => {
    function savedGroupFilters(setDerivedVariables: jest.Mock) {
      const [saved] = applyUpdate(setDerivedVariables, []);
      // eligible groupings are stored as a recoder: read them back
      const decoded =
        saved.functionName === 'filterDefinedGroups'
          ? (saved as FilterDefinedGroupsSpec)
          : fromRecoderSpec(saved);
      return decoded?.config.groups.map((g) => g.filters);
    }

    test('Cancel in the group filter editor removes a group just added', () => {
      const spec = makeSpec([group('East')]);
      const { analysisState } = makeAnalysisState([spec], [], stored);
      renderEditor(spec, analysisState);
      fireEvent.click(screen.getByRole('button', { name: 'Add group' }));
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.getByLabelText('Group 1 label')).toHaveValue('East');
      expect(screen.queryByLabelText('Group 2 label')).toBeNull();
    });

    test("Cancel in the group filter editor restores the group's filters", () => {
      const spec = makeSpec([group('East')]);
      const { analysisState, setDerivedVariables, setVariableUISettings } =
        makeAnalysisState([spec], [], stored);
      renderEditor(spec, analysisState);
      openGroupEditor(1);
      fireEvent.click(
        screen.getByRole('button', { name: 'Edit stub filters' })
      );
      fireEvent.click(
        screen.getByRole('button', { name: 'Edit stub UI settings' })
      );
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      fireEvent.click(saveButton());
      expect(savedGroupFilters(setDerivedVariables)).toEqual([[filter]]);
      expect(applyUISettingsUpdate(setVariableUISettings, stored)).toEqual({
        ...unrelated,
        'derivedVariable/dv1/group1': eastSettings,
      });
    });

    test('Cancel also restores a group name changed in its filter editor', () => {
      const spec = makeSpec([group('East')]);
      const { analysisState } = makeAnalysisState([spec], [], stored);
      renderEditor(spec, analysisState);
      openGroupEditor(1);
      fireEvent.click(
        screen.getByRole('button', { name: 'Rename stub group' })
      );
      expect(screen.getByTestId('stub-group-label')).toHaveTextContent(
        'Renamed'
      );
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.getByLabelText('Group 1 label')).toHaveValue('East');
    });

    test('Done in the group filter editor keeps the changes', () => {
      const spec = makeSpec([group('East')]);
      const { analysisState, setDerivedVariables } = makeAnalysisState(
        [spec],
        [],
        stored
      );
      renderEditor(spec, analysisState);
      openGroupEditor(1);
      fireEvent.click(
        screen.getByRole('button', { name: 'Edit stub filters' })
      );
      fireEvent.click(screen.getByRole('button', { name: 'Done' }));
      fireEvent.click(saveButton());
      expect(savedGroupFilters(setDerivedVariables)).toEqual([[otherFilter]]);
    });
  });

  test("clicking a group's filter summary opens its filter editor", () => {
    const spec = makeSpec([group('East')]);
    const { analysisState } = makeAnalysisState([spec], [], stored);
    renderEditor(spec, analysisState);
    fireEvent.click(screen.getByText(/Species:/));
    expect(screen.getByTestId('group-ui-settings')).toBeInTheDocument();
  });

  test("the rename pencil focuses the group's label input", () => {
    const spec = makeSpec([group('East'), group('West')]);
    const { analysisState } = makeAnalysisState([spec], [], stored);
    renderEditor(spec, analysisState);
    fireEvent.click(screen.getByRole('button', { name: 'Rename group 2' }));
    expect(screen.getByLabelText('Group 2 label')).toHaveFocus();
  });

  test('renaming a group in its filter editor updates the group list', () => {
    const spec = makeSpec([group('East')]);
    const { analysisState } = makeAnalysisState([spec], [], stored);
    renderEditor(spec, analysisState);
    openGroupEditor(1);
    fireEvent.click(screen.getByRole('button', { name: 'Rename stub group' }));
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.getByLabelText('Group 1 label')).toHaveValue('Renamed');
  });

  test("deleting a variable removes its groups' UI settings", () => {
    const spec = makeSpec([group('East'), group('West')]);
    const { analysisState, setVariableUISettings } = makeAnalysisState(
      [spec],
      [],
      stored
    );
    renderEditor(spec, analysisState);
    fireEvent.click(screen.getByRole('button', { name: 'Delete variable' }));
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' })
    );
    expect(applyUISettingsUpdate(setVariableUISettings, stored)).toEqual(
      unrelated
    );
  });
});

describe('VariableEditor inline names', () => {
  test('the variable name has a rename pencil that focuses it', () => {
    const spec = makeSpec([group('East')]);
    const { analysisState } = makeAnalysisState([spec]);
    renderEditor(spec, analysisState);
    fireEvent.click(
      screen.getByRole('button', { name: 'Rename this variable' })
    );
    expect(screen.getByLabelText('Variable name')).toHaveFocus();
  });

  test("a new variable's name field is focused on open", () => {
    const { analysisState } = makeAnalysisState();
    renderEditor(makeSpec([group('East')], { displayName: '' }), analysisState);
    expect(screen.getByLabelText('Variable name')).toHaveFocus();
  });

  test("the 'Everything else' pencil is disabled while 'Everything else' is off", () => {
    const spec = makeSpec([group('East')], {
      config: { groups: [group('East')], unmappedValue: '' },
    });
    const { analysisState } = makeAnalysisState([
      toStoredSpec(spec, [rootEntity, collections]),
    ]);
    renderEditor(spec, analysisState);
    const pencil = screen.getByRole('button', {
      name: "Rename 'Everything else'",
    });
    expect(pencil).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Everything else'));
    expect(pencil).toBeEnabled();
  });

  test("a saved variable's entity picker says to create a new variable to group a different entity", () => {
    const spec = makeSpec([group('East')]);
    const { analysisState } = makeAnalysisState([spec]);
    renderEditor(spec, analysisState);
    expect(
      screen.getByTitle('To group a different entity, create a new variable')
    ).toBeInTheDocument();
  });

  test("returning from a group's filter editor does not move focus to the name", () => {
    const { analysisState } = makeAnalysisState();
    renderEditor(makeSpec([], { displayName: '' }), analysisState);
    expect(screen.getByLabelText('Variable name')).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Add group' }));
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.getByLabelText('Variable name')).not.toHaveFocus();
  });
});
