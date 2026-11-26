import { ComponentProps, ReactNode, useState } from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {
  WorkspaceContext,
  WorkspaceContextValue,
} from '../../core/context/WorkspaceContext';
import { AnalysisState } from '../../core/hooks/analysis';
import { Filter } from '../../core/types/filter';
import { StudyEntity } from '../../core/types/study';
import { FilterDefinedGroupsSpec } from '../../core/derivedVariables/types';
import CreateVariables from './index';
import { VariableEditor } from './VariableEditor';

// The editor has its own tests; here a stub holds a draft (a text field) and
// reports it dirty once the field has text, as the real editor would.
jest.mock('./VariableEditor', () => ({ VariableEditor: jest.fn() }));

const mockVariableEditor = VariableEditor as jest.MockedFunction<
  typeof VariableEditor
>;

function VariableEditorStub({
  spec,
  onDirtyChange,
}: ComponentProps<typeof VariableEditor>) {
  const [text, setText] = useState('');
  return (
    <div>
      <span data-testid="editing">{spec.displayName || 'new variable'}</span>
      <input
        aria-label="Draft"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onDirtyChange(e.target.value !== '');
        }}
      />
    </div>
  );
}

const filter = {
  type: 'stringSet',
  entityId: 'col',
  variableId: 'species',
  stringSet: ['a'],
} as Filter;

const rootEntity = {
  id: 'root',
  idColumnName: 'root_id',
  displayName: 'Study',
  description: '',
  isManyToOneWithParent: false,
  variables: [],
  children: [],
} as unknown as StudyEntity;

const workspace = {
  studyMetadata: { id: 'study', rootEntity },
} as unknown as WorkspaceContextValue;

function makeSpec(
  variableId: string,
  displayName: string
): FilterDefinedGroupsSpec {
  return {
    entityId: 'col',
    variableId,
    functionName: 'filterDefinedGroups',
    displayName,
    config: {
      groups: [{ label: 'East', filters: [filter] }],
      unmappedValue: '',
    },
  };
}

function renderTab() {
  const analysisState = {
    analysis: {
      descriptor: {
        derivedVariables: [makeSpec('v1', 'First'), makeSpec('v2', 'Second')],
      },
    },
  } as unknown as AnalysisState;
  const wrapper = ({ children }: { children?: ReactNode }) => (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  );
  render(<CreateVariables analysisState={analysisState} />, { wrapper });
}

function pick(name: string) {
  fireEvent.click(screen.getByRole('button', { name }));
}

function makeDirty() {
  fireEvent.change(screen.getByLabelText('Draft'), { target: { value: 'x' } });
}

// The modal animates out and is removed on animationend, which jsdom never
// fires: fire it, as a browser would.
async function dialogClosed() {
  fireEvent.animationEnd(screen.getByRole('dialog'));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
}

const dialogTitle = 'Discard changes?';

beforeEach(() => {
  mockVariableEditor.mockReset();
  mockVariableEditor.mockImplementation(VariableEditorStub);
});

describe('CreateVariables unsaved changes', () => {
  test('switching variables while dirty asks first; Keep editing keeps the draft', async () => {
    renderTab();
    makeDirty();
    pick('Second');
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(dialogTitle)).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        'You have unsaved changes to this variable. Discard them?'
      )
    ).toBeInTheDocument();
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Keep editing' })
    );
    await dialogClosed();
    expect(screen.getByTestId('editing')).toHaveTextContent('First');
    expect(screen.getByLabelText('Draft')).toHaveValue('x');
  });

  test('Discard changes switches to the requested variable', async () => {
    renderTab();
    makeDirty();
    pick('Second');
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    await dialogClosed();
    expect(screen.getByTestId('editing')).toHaveTextContent('Second');
    expect(screen.getByLabelText('Draft')).toHaveValue('');
  });

  test('+ New variable while dirty asks first, then opens a new variable', () => {
    renderTab();
    makeDirty();
    pick('+ New variable');
    expect(screen.getByText(dialogTitle)).toBeInTheDocument();
    expect(screen.getByTestId('editing')).toHaveTextContent('First');
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(screen.getByTestId('editing')).toHaveTextContent('new variable');
  });

  test('a clean switch does not ask', () => {
    renderTab();
    pick('Second');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByTestId('editing')).toHaveTextContent('Second');
    pick('+ New variable');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByTestId('editing')).toHaveTextContent('new variable');
  });

  test('clicking the variable already selected does nothing', () => {
    renderTab();
    makeDirty();
    pick('First');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByLabelText('Draft')).toHaveValue('x');
  });

  test('a discarded draft does not make the next switch ask', async () => {
    renderTab();
    makeDirty();
    pick('Second');
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    await dialogClosed();
    pick('First');
    expect(screen.getByTestId('editing')).toHaveTextContent('First');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
