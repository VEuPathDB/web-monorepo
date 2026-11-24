import { ReactNode } from 'react';
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
import { VariableEditor } from './VariableEditor';

jest.mock('../../core/derivedVariables/useGroupCounts', () => ({
  useGroupCounts: jest.fn(),
}));

const mockUseGroupCounts = useGroupCounts as jest.MockedFunction<
  typeof useGroupCounts
>;

const filter = {
  type: 'stringSet',
  entityId: 'col',
  variableId: 'species',
  stringSet: ['a'],
} as Filter;

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
  computations: unknown[] = []
) {
  const setDerivedVariables = jest.fn();
  const analysisState = {
    analysis: {
      descriptor: { derivedVariables, computations },
    },
    setDerivedVariables,
  } as unknown as AnalysisState;
  return { analysisState, setDerivedVariables };
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
  render(
    <VariableEditor spec={spec} analysisState={analysisState} {...callbacks} />,
    { wrapper }
  );
  return callbacks;
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

const settledCounts: GroupCounts = { pending: false };

beforeEach(() => {
  mockUseGroupCounts.mockReset();
  mockUseGroupCounts.mockReturnValue(settledCounts);
});

describe('VariableEditor', () => {
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
      spec,
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
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Renamed' },
    });
    fireEvent.click(saveButton());
    expect(applyUpdate(setDerivedVariables, [before, other])).toEqual([
      after,
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

  test('Add group is disabled at 10 groups', () => {
    const { analysisState } = makeAnalysisState();
    const labels = Array.from({ length: 9 }, (_, i) => `G${i + 1}`);
    renderEditor(makeSpec(labels.map(group)), analysisState);
    const addGroup = screen.getByRole('button', { name: 'Add group' });
    expect(addGroup).toBeEnabled();
    fireEvent.click(addGroup);
    expect(screen.getAllByLabelText(/^Group \d+ label$/)).toHaveLength(10);
    expect(addGroup).toBeDisabled();
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
      groups: [group('East')],
      unmappedValue: '',
    });
  });
});
