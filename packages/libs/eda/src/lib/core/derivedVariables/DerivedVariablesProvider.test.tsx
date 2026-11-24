import { render, screen, waitFor } from '@testing-library/react';
import DataClient from '../api/DataClient';
import {
  WorkspaceContext,
  WorkspaceContextValue,
} from '../context/WorkspaceContext';
import { useStudyEntities } from '../hooks/workspace';
import { Analysis } from '../types/analysis';
import { StudyEntity } from '../types/study';
import { DerivedVariablesProvider } from './DerivedVariablesProvider';

const spec = {
  entityId: 'root',
  variableId: 'dv1',
  functionName: 'filterDefinedGroups',
  displayName: 'My groups',
  config: { groups: [{ label: 'x', filters: [] }] },
};

const root: StudyEntity = {
  id: 'root',
  idColumnName: 'root_id',
  displayName: 'root',
  description: '',
  variables: [],
  isManyToOneWithParent: false,
};

const analysis = {
  descriptor: { derivedVariables: [spec] },
} as unknown as Analysis;

function Child() {
  const entities = useStudyEntities();
  const found = entities.some((e) => e.variables.some((v) => v.id === 'dv1'));
  return <div>{found ? 'found' : 'missing'}</div>;
}

function ctx(getMeta: () => Promise<unknown>): WorkspaceContextValue {
  return {
    studyMetadata: { id: 'study', rootEntity: root },
    dataClient: { getDerivedVariableMetadata: getMeta },
  } as unknown as WorkspaceContextValue;
}

describe('DerivedVariablesProvider', () => {
  test('exposes derived variables through useStudyEntities', async () => {
    const value = ctx(() =>
      Promise.resolve([
        {
          entityId: 'root',
          variableId: 'dv1',
          derivationType: 'transform',
          variableType: 'string',
          dataShape: 'categorical',
          vocabulary: ['x'],
        },
      ])
    );
    render(
      <WorkspaceContext.Provider value={value}>
        <DerivedVariablesProvider analysis={analysis}>
          <Child />
        </DerivedVariablesProvider>
      </WorkspaceContext.Provider>
    );
    expect(screen.getByText('missing')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('found')).toBeTruthy());
  });

  test('keeps rendering children when the metadata request fails', async () => {
    const err = jest.spyOn(console, 'error').mockImplementation(() => {});
    const value = ctx(() => Promise.reject(new Error('boom')));
    render(
      <WorkspaceContext.Provider value={value}>
        <DerivedVariablesProvider analysis={analysis}>
          <Child />
        </DerivedVariablesProvider>
      </WorkspaceContext.Provider>
    );
    await waitFor(() =>
      expect(err).toHaveBeenCalledWith(
        expect.stringContaining('derived variable metadata'),
        expect.any(Error)
      )
    );
    expect(screen.getByText('missing')).toBeTruthy();
    err.mockRestore();
  });
});
