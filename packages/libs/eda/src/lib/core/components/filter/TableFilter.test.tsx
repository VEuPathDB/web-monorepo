import { ComponentProps, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import MembershipField from '@veupathdb/wdk-client/lib/Components/AttributeFilter/MembershipField';
import { AnalysisState } from '../../hooks/analysis';
import { StudyEntity, StudyMetadata } from '../../types/study';
import {
  GroupEditingContext,
  earlierGroupsContext,
} from '../../derivedVariables/GroupEditingContext';
import { TableFilter } from './TableFilter';
import { TableVariable } from './types';

jest.mock(
  '@veupathdb/wdk-client/lib/Components/AttributeFilter/MembershipField',
  () => ({ __esModule: true, default: jest.fn(() => null) })
);
// the Components barrel pulls in jquery, which jest can't load here
jest.mock('@veupathdb/wdk-client/lib/Components', () => ({
  Loading: () => null,
}));
jest.mock('../../hooks/workspace', () => ({
  useSubsettingClient: () => ({}),
}));
jest.mock('../../hooks/cachedPromise', () => ({
  useCachedPromise: () => ({
    pending: false,
    value: {
      entityId: 'col',
      variableId: 'country',
      distribution: [
        { value: 'x', count: 1, filteredCount: 1 },
        { value: 'y', count: 1, filteredCount: 1 },
      ],
      entitiesCount: 2,
      filteredEntitiesCount: 2,
    },
  }),
}));

type MembershipFieldProps = ComponentProps<typeof MembershipField> & {
  renderValueAnnotation?: (value: string | number) => ReactNode;
};
const mockMembershipField = MembershipField as unknown as jest.MockedFunction<
  (props: MembershipFieldProps) => null
>;

const variable = {
  id: 'country',
  providerLabel: 'country',
  displayName: 'Country',
  type: 'string',
  dataShape: 'categorical',
  vocabulary: ['x', 'y'],
} as unknown as TableVariable;

const entity = {
  id: 'col',
  displayName: 'Collection',
  displayNamePlural: 'Collections',
  variables: [variable],
} as unknown as StudyEntity;

const analysisState = {
  analysis: { descriptor: { subset: { descriptor: [], uiSettings: {} } } },
} as unknown as AnalysisState;

function renderTableFilter() {
  return (
    <TableFilter
      studyMetadata={{ id: 'study' } as StudyMetadata}
      variable={variable}
      entity={entity}
      analysisState={analysisState}
      totalEntityCount={2}
      filteredEntityCount={2}
    />
  );
}

function lastAnnotation() {
  const calls = mockMembershipField.mock.calls;
  return calls[calls.length - 1][0].renderValueAnnotation;
}

beforeEach(() => mockMembershipField.mockClear());

test('outside a group editor the table gets no value annotations', () => {
  render(renderTableFilter());
  expect(lastAnnotation()).toBeUndefined();
});

test('in a group editor with nothing to mark the table gets no value annotations', () => {
  render(
    <GroupEditingContext.Provider
      value={earlierGroupsContext([{ label: 'East', filters: [] }], 1)}
    >
      {renderTableFilter()}
    </GroupEditingContext.Provider>
  );
  expect(lastAnnotation()).toBeUndefined();
});

test("in a group editor, values an earlier group selects are marked with that group's label", () => {
  render(
    <GroupEditingContext.Provider
      value={earlierGroupsContext(
        [
          {
            label: 'East',
            filters: [
              {
                type: 'stringSet',
                entityId: 'col',
                variableId: 'country',
                stringSet: ['x'],
              },
            ],
          },
        ],
        1
      )}
    >
      {renderTableFilter()}
    </GroupEditingContext.Provider>
  );
  const annotate = lastAnnotation();
  expect(annotate).toBeDefined();
  render(<div data-testid="x">{annotate?.('x')}</div>);
  expect(screen.getByTestId('x')).toHaveTextContent('in East');
  render(<div data-testid="y">{annotate?.('y')}</div>);
  expect(screen.getByTestId('y')).toBeEmptyDOMElement();
});
