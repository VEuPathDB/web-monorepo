import { ComponentProps, ReactNode, useContext } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  WorkspaceContext,
  WorkspaceContextValue,
} from '../../core/context/WorkspaceContext';
import { AnalysisState } from '../../core/hooks/analysis';
import { useEntityCounts } from '../../core/hooks/entityCounts';
import { Filter } from '../../core/types/filter';
import { StudyEntity } from '../../core/types/study';
import {
  FilterDefinedGroup,
  FilterDefinedGroupsSpec,
} from '../../core/derivedVariables/types';
import { useGroupCounts } from '../../core/derivedVariables/useGroupCounts';
import {
  GroupEditingContext,
  GroupEditingContextValue,
  groupColor,
} from '../../core/derivedVariables/GroupEditingContext';
import Subsetting from '../Subsetting';
import { GroupFilterEditor } from './GroupFilterEditor';
import { VariableEditor } from './VariableEditor';

// The Browse and Subset widgets are replaced by a stub that reports what it
// was given and applies a filter through the analysis state it was handed.
jest.mock('../Subsetting', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../../core/hooks/entityCounts', () => ({
  useEntityCounts: jest.fn(),
}));
jest.mock('../../core/derivedVariables/useGroupCounts', () => ({
  useGroupCounts: jest.fn(),
}));
jest.mock('../../core/hooks/workspace', () => ({
  ...jest.requireActual('../../core/hooks/workspace'),
  useGetDefaultVariableDescriptor: () => () => ({
    entityId: 'col',
    variableId: 'country',
  }),
}));

const mockSubsetting = Subsetting as jest.MockedFunction<typeof Subsetting>;
const mockUseEntityCounts = useEntityCounts as jest.MockedFunction<
  typeof useEntityCounts
>;
const mockUseGroupCounts = useGroupCounts as jest.MockedFunction<
  typeof useGroupCounts
>;

const speciesFilter = {
  type: 'stringSet',
  entityId: 'col',
  variableId: 'species',
  stringSet: ['a'],
} as Filter;

const countryFilter = {
  type: 'stringSet',
  entityId: 'col',
  variableId: 'country',
  stringSet: ['x'],
} as Filter;

const subsetFilter = {
  type: 'stringSet',
  entityId: 'col',
  variableId: 'species',
  stringSet: ['b'],
} as Filter;

const geoFilter = {
  type: 'stringPrefixSet',
  entityId: 'col',
  variableId: 'geohash6',
  prefixSet: ['abc'],
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
    {
      id: 'country',
      providerLabel: 'country',
      displayName: 'Country',
      type: 'string',
      dataShape: 'categorical',
      vocabulary: ['x', 'y'],
    },
    {
      id: 'lat',
      providerLabel: 'lat',
      displayName: 'Latitude',
      type: 'number',
      dataShape: 'continuous',
      displayType: 'latitude',
    },
    {
      id: 'geohash6',
      providerLabel: 'geohash6',
      displayName: 'Geohash 6',
      type: 'string',
      dataShape: 'categorical',
      displayType: 'geoaggregator',
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

function wrapper({ children }: { children?: ReactNode }) {
  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  );
}

function makeAnalysisState(subsetFilters: Filter[] = [subsetFilter]) {
  const setFilters = jest.fn();
  const setVariableUISettings = jest.fn();
  const setDerivedVariables = jest.fn();
  const analysisState = {
    analysis: {
      descriptor: {
        subset: { descriptor: subsetFilters, uiSettings: {} },
        derivedVariables: [],
        computations: [],
        starredVariables: [],
      },
    },
    setFilters,
    setVariableUISettings,
    setDerivedVariables,
  } as unknown as AnalysisState;
  return { analysisState, setFilters, setVariableUISettings };
}

let seenGroupEditing: GroupEditingContextValue;

function SubsettingStub(props: ComponentProps<typeof Subsetting>) {
  seenGroupEditing = useContext(GroupEditingContext);
  return (
    <div>
      <span data-testid="selected-variable">
        {props.entityId}/{props.variableId}
      </span>
      <button
        type="button"
        onClick={() =>
          props.analysisState.setFilters((filters) => [
            ...filters,
            countryFilter,
          ])
        }
      >
        Apply stub filter
      </button>
    </div>
  );
}

function selectedVariable() {
  return screen.getByTestId('selected-variable').textContent;
}

beforeEach(() => {
  seenGroupEditing = undefined;
  mockSubsetting.mockReset();
  mockSubsetting.mockImplementation(SubsettingStub);
  mockUseEntityCounts.mockReset();
  mockUseEntityCounts.mockReturnValue({ pending: false, value: { col: 5 } });
  mockUseGroupCounts.mockReset();
  mockUseGroupCounts.mockReturnValue({ pending: false });
});

describe('GroupFilterEditor', () => {
  test('applying a filter in the editor updates only the group, not the analysis subset', () => {
    const { analysisState, setFilters, setVariableUISettings } =
      makeAnalysisState();
    const onChange = jest.fn();
    render(
      <GroupFilterEditor
        analysisState={analysisState}
        group={{ label: 'East', filters: [speciesFilter], uiSettings: {} }}
        groupIndex={0}
        earlierGroups={[]}
        onChange={onChange}
        onLabelChange={jest.fn()}
        onCancel={jest.fn()}
        onClose={jest.fn()}
      />,
      { wrapper }
    );

    // the widgets see the group's filters as the subset
    const passed = mockSubsetting.mock.calls[0][0].analysisState;
    expect(passed.analysis?.descriptor.subset.descriptor).toEqual([
      speciesFilter,
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Apply stub filter' }));
    expect(onChange).toHaveBeenCalledWith({
      filters: [speciesFilter, countryFilter],
      uiSettings: {},
    });
    expect(setFilters).not.toHaveBeenCalled();
    expect(setVariableUISettings).not.toHaveBeenCalled();
  });

  test('counts are for the whole dataset, filtered by the group only', () => {
    const { analysisState } = makeAnalysisState();
    render(
      <GroupFilterEditor
        analysisState={analysisState}
        group={{ label: 'East', filters: [speciesFilter], uiSettings: {} }}
        groupIndex={0}
        earlierGroups={[]}
        onChange={jest.fn()}
        onLabelChange={jest.fn()}
        onCancel={jest.fn()}
        onClose={jest.fn()}
      />,
      { wrapper }
    );
    const filterArgs = mockUseEntityCounts.mock.calls.map((call) => call[0]);
    expect(filterArgs).toContainEqual(undefined);
    expect(filterArgs).toContainEqual([speciesFilter]);
    expect(filterArgs).not.toContainEqual(
      expect.arrayContaining([subsetFilter])
    );
  });

  test('opens on the given start variable, or the study default without one', () => {
    const { analysisState } = makeAnalysisState();
    const props = {
      analysisState,
      group: { label: 'East', filters: [], uiSettings: {} },
      groupIndex: 0,
      earlierGroups: [],
      onChange: jest.fn(),
      onLabelChange: jest.fn(),
      onCancel: jest.fn(),
      onClose: jest.fn(),
    };
    const { unmount } = render(
      <GroupFilterEditor
        {...props}
        startVariable={{ entityId: 'col', variableId: 'species' }}
      />,
      { wrapper }
    );
    expect(selectedVariable()).toBe('col/species');
    unmount();

    render(<GroupFilterEditor {...props} />, { wrapper });
    expect(selectedVariable()).toBe('col/country');
  });

  test("a geographic area filter's variable opens on the map (latitude) variable", () => {
    const { analysisState } = makeAnalysisState();
    render(
      <GroupFilterEditor
        analysisState={analysisState}
        group={{ label: 'East', filters: [], uiSettings: {} }}
        groupIndex={0}
        earlierGroups={[]}
        startVariable={{ entityId: 'col', variableId: geoFilter.variableId }}
        onChange={jest.fn()}
        onLabelChange={jest.fn()}
        onCancel={jest.fn()}
        onClose={jest.fn()}
      />,
      { wrapper }
    );
    expect(selectedVariable()).toBe('col/lat');
  });

  test('Done closes the editor', () => {
    const { analysisState } = makeAnalysisState();
    const onClose = jest.fn();
    render(
      <GroupFilterEditor
        analysisState={analysisState}
        group={{ label: 'East', filters: [], uiSettings: {} }}
        groupIndex={0}
        earlierGroups={[]}
        onChange={jest.fn()}
        onLabelChange={jest.fn()}
        onCancel={jest.fn()}
        onClose={onClose}
      />,
      { wrapper }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onClose).toHaveBeenCalled();
  });

  test('shows the subset banner only when the analysis subset has filters', () => {
    const noteText =
      'Counts here are for the whole dataset. Your analysis subset is not applied.';
    const renderEditorWith = (subsetFilters: Filter[]) =>
      render(
        <GroupFilterEditor
          analysisState={makeAnalysisState(subsetFilters).analysisState}
          group={{ label: 'East', filters: [], uiSettings: {} }}
          groupIndex={0}
          earlierGroups={[]}
          onChange={jest.fn()}
          onLabelChange={jest.fn()}
          onCancel={jest.fn()}
          onClose={jest.fn()}
        />,
        { wrapper }
      );
    const { unmount } = renderEditorWith([subsetFilter]);
    expect(screen.getByText(noteText)).toBeInTheDocument();
    unmount();
    renderEditorWith([]);
    expect(screen.queryByText(noteText)).toBeNull();
  });

  describe('renaming in the header', () => {
    function renderNamed(onLabelChange: jest.Mock) {
      render(
        <GroupFilterEditor
          analysisState={makeAnalysisState().analysisState}
          group={{ label: 'East', filters: [], uiSettings: {} }}
          groupIndex={0}
          earlierGroups={[]}
          onChange={jest.fn()}
          onLabelChange={onLabelChange}
          onCancel={jest.fn()}
          onClose={jest.fn()}
        />,
        { wrapper }
      );
      fireEvent.click(screen.getByTitle('Edit This Value'));
    }

    test('renaming the group in the header calls onLabelChange', () => {
      const onLabelChange = jest.fn();
      renderNamed(onLabelChange);
      fireEvent.change(screen.getByDisplayValue('East'), {
        target: { value: '  West  ' },
      });
      fireEvent.click(screen.getByTitle('Save Changes'));
      expect(onLabelChange).toHaveBeenCalledWith('West');
    });

    test('an empty name in the header is ignored', () => {
      const onLabelChange = jest.fn();
      renderNamed(onLabelChange);
      fireEvent.change(screen.getByDisplayValue('East'), {
        target: { value: '   ' },
      });
      fireEvent.click(screen.getByTitle('Save Changes'));
      expect(onLabelChange).not.toHaveBeenCalled();
    });
  });

  test('Cancel calls onCancel', () => {
    const { analysisState } = makeAnalysisState();
    const onCancel = jest.fn();
    const onClose = jest.fn();
    render(
      <GroupFilterEditor
        analysisState={analysisState}
        group={{ label: 'East', filters: [], uiSettings: {} }}
        groupIndex={0}
        earlierGroups={[]}
        onChange={jest.fn()}
        onLabelChange={jest.fn()}
        onCancel={onCancel}
        onClose={onClose}
      />,
      { wrapper }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('VariableEditor with the group editor', () => {
  function makeSpec(groups: FilterDefinedGroup[]): FilterDefinedGroupsSpec {
    return {
      entityId: 'col',
      variableId: 'dv1',
      functionName: 'filterDefinedGroups',
      displayName: 'Region',
      config: { groups, unmappedValue: 'Other' },
    };
  }

  function renderVariableEditor(spec: FilterDefinedGroupsSpec) {
    const state = makeAnalysisState();
    render(
      <VariableEditor
        spec={spec}
        analysisState={state.analysisState}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        onDelete={jest.fn()}
      />,
      { wrapper }
    );
    return state;
  }

  test("a new group opens on the previous group's variable", () => {
    renderVariableEditor(
      makeSpec([
        { label: 'East', filters: [countryFilter] },
        { label: 'West', filters: [countryFilter, speciesFilter] },
      ])
    );
    fireEvent.click(screen.getByRole('button', { name: 'Add group' }));
    expect(selectedVariable()).toBe('col/species');
    // nothing is selected yet in the new group
    const passed = mockSubsetting.mock.calls[0][0].analysisState;
    expect(passed.analysis?.descriptor.subset.descriptor).toEqual([]);
  });

  test('the widgets are shown the groups before the one being edited', () => {
    renderVariableEditor(
      makeSpec([
        { label: 'East', filters: [countryFilter] },
        { label: 'West', filters: [speciesFilter] },
        { label: 'North', filters: [subsetFilter] },
      ])
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit the filters of group 2' })
    );
    expect(seenGroupEditing).toEqual({
      earlierGroups: [
        { label: 'East', color: groupColor(0), filters: [countryFilter] },
      ],
    });
  });

  test("the first group opens on the study's default variable", () => {
    renderVariableEditor(makeSpec([]));
    fireEvent.click(screen.getByRole('button', { name: 'Add group' }));
    expect(selectedVariable()).toBe('col/country');
  });

  test('edits made in the group editor show in the group list after Done', () => {
    const { setFilters } = renderVariableEditor(
      makeSpec([{ label: 'East', filters: [speciesFilter] }])
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit the filters of group 1' })
    );
    // ✎ opens on the group's own last filtered variable
    expect(selectedVariable()).toBe('col/species');
    fireEvent.click(screen.getByRole('button', { name: 'Apply stub filter' }));
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.getByText(/Country:/)).toBeInTheDocument();
    expect(setFilters).not.toHaveBeenCalled();
  });
});
