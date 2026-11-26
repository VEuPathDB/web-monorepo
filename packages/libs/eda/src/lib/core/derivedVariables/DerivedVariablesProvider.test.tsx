import { useContext } from 'react';
import { render, act, screen, waitFor } from '@testing-library/react';
import DataClient from '../api/DataClient';
import {
  WorkspaceContext,
  WorkspaceContextValue,
} from '../context/WorkspaceContext';
import { useStudyEntities } from '../hooks/workspace';
import { Analysis } from '../types/analysis';
import { StudyEntity } from '../types/study';
import { DerivedVariablesProvider } from './DerivedVariablesProvider';

jest.mock('@veupathdb/wdk-client/lib/Components/Loading/Loading', () => ({
  __esModule: true,
  default: () => <div>loading</div>,
}));

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
    // children are held until the first fetch settles
    expect(screen.queryByText('missing')).toBeNull();
    expect(screen.queryByText('found')).toBeNull();
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

  test('when the batch fails, keeps the specs that succeed on their own', async () => {
    const err = jest.spyOn(console, 'error').mockImplementation(() => {});
    const spec2 = { ...spec, variableId: 'dv2' };
    const two = {
      descriptor: { derivedVariables: [spec, spec2] },
    } as unknown as Analysis;
    const getMeta = jest.fn(
      (_studyId: string, specs: Array<{ variableId: string }>) =>
        specs.length === 1 && specs[0].variableId === 'dv2'
          ? Promise.resolve([
              {
                entityId: 'root',
                variableId: 'dv2',
                derivationType: 'transform',
                variableType: 'string',
                dataShape: 'categorical',
                vocabulary: ['x'],
              },
            ])
          : Promise.reject(new Error('bad spec'))
    );
    const value = {
      studyMetadata: { id: 'study', rootEntity: root },
      dataClient: { getDerivedVariableMetadata: getMeta },
    } as unknown as WorkspaceContextValue;
    function Ids() {
      const entities = useStudyEntities();
      const ids = entities.flatMap((e) => e.variables.map((v) => v.id));
      return <div>ids:{ids.filter((id) => id.startsWith('dv')).join(',')}</div>;
    }
    render(
      <WorkspaceContext.Provider value={value}>
        <DerivedVariablesProvider analysis={two}>
          <Ids />
        </DerivedVariablesProvider>
      </WorkspaceContext.Provider>
    );
    await waitFor(() => expect(screen.getByText('ids:dv2')).toBeTruthy());
    // the batch, then one request per spec
    expect(getMeta).toHaveBeenCalledTimes(3);
    expect(err).toHaveBeenCalledWith(
      expect.stringContaining('root/dv1'),
      expect.any(Error)
    );
    err.mockRestore();
  });

  test('keeps the previous tree (minus removed specs) and wraps the client with new specs after a spec change', async () => {
    const spec2 = { ...spec, variableId: 'dv2' };
    const metaFor = (id: string) => ({
      entityId: 'root',
      variableId: id,
      derivationType: 'transform',
      variableType: 'string',
      dataShape: 'categorical',
      vocabulary: ['x'],
    });
    let resolveSecond: (v: unknown) => void = () => {};
    const getMeta = jest
      .fn()
      .mockResolvedValueOnce([metaFor('dv1'), metaFor('dv2')])
      .mockImplementationOnce(
        () => new Promise((resolve) => (resolveSecond = resolve))
      );
    const value = ctx(getMeta);
    const seen: { ids: string[]; clientSpecs: unknown } = {
      ids: [],
      clientSpecs: undefined,
    };
    function Probe() {
      const entities = useStudyEntities();
      const ids = entities.flatMap((e) => e.variables.map((v) => v.id));
      seen.ids = ids;
      const { dataClient } = useContext(WorkspaceContext)!;
      seen.clientSpecs = dataClient;
      return <div>{ids.join(',')}</div>;
    }
    const two = {
      descriptor: { derivedVariables: [spec, spec2] },
    } as unknown as Analysis;
    const one = {
      descriptor: { derivedVariables: [spec2] },
    } as unknown as Analysis;
    const tree = (a: Analysis) => (
      <WorkspaceContext.Provider value={value}>
        <DerivedVariablesProvider analysis={a}>
          <Probe />
        </DerivedVariablesProvider>
      </WorkspaceContext.Provider>
    );
    const { rerender } = render(tree(two));
    await waitFor(() => expect(seen.ids).toContain('dv1'));
    const clientBefore = seen.clientSpecs;
    rerender(tree(one));
    // second fetch still pending: children still rendered, dv1 gone, dv2 kept
    await waitFor(() => expect(seen.clientSpecs).not.toBe(clientBefore));
    expect(seen.ids).toContain('dv2');
    expect(seen.ids).not.toContain('dv1');
    await act(async () => {
      resolveSecond([metaFor('dv2')]);
    });
    expect(seen.ids).toContain('dv2');
  });
});
