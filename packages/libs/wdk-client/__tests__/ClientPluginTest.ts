import { Action } from "Utils/ActionCreatorUtils";
import {
  createPlugin,
  mergePluginsByType,
  ClientPluginRegistryEntry,
  PluginContext
} from 'Utils/ClientPlugin';
import { Subject } from "rxjs";
import { mapTo } from 'rxjs/operators';

describe('createPlugin', () => {
  it('should provide default implementations', () => {
    const plugin = createPlugin({});
    expect(typeof plugin.observe).toBe('function');
    expect(typeof plugin.reduce).toBe('function');
    expect(typeof plugin.render).toBe('function');
  });

});

describe('mergePluginsByType', () => {
  const plugins: ClientPluginRegistryEntry[] = [
    {
      type: 'a',
      name: 'a1',
      plugin: createPlugin<{ count: number }>({
        render: () => 'a1',
        reduce: (state = { count: 0 }) => ({ count: state.count + 1 }),
        observe: (action$) => action$.pipe(mapTo({ type: 'a1' }))
      })
    },
    {
      type: 'a',
      name: 'a2',
      plugin: createPlugin<{ count: number }>({
        render: () => 'a2',
        reduce: (state = { count: 0 }) => ({ count: state.count + 2 }),
        observe: (action$) => action$.pipe(mapTo({ type: 'a2' }))
      })
    }
  ];

  const compositePlugin = mergePluginsByType(plugins, 'a');
  const context1 = { type: 'a', name: 'a1' };
  const context2 = { type: 'a', name: 'a2' };
  const contextUnknown = { type: 'a', name: 'a3' };
  const state: any = {};
  const dispatch: any = (n: any) => n;
  const anyAction = { type: 'any' };

  it('should return a new plugin', () => {
    expect(typeof compositePlugin.observe).toBe('function');
    expect(typeof compositePlugin.reduce).toBe('function');
    expect(typeof compositePlugin.render).toBe('function');
  });

  it('should call the correct plugin render function based on context', () => {
    expect(compositePlugin.render(context1, state, dispatch)).toBe('a1');
    expect(compositePlugin.render(context2, state, dispatch)).toBe('a2');
  });

  it('should call the correct plugin reduce function based on context', () => {
    expect(compositePlugin.reduce(context1, undefined, anyAction)).toEqual({ count: 1 });
    expect(compositePlugin.reduce(context2, undefined, anyAction)).toEqual({ count: 2 });
  });

  it('should properly merge the plugin observe functions', (done) => {
    const action$ = new Subject<[PluginContext, Action]>();
    const out$ = compositePlugin.observe(action$, {} as any);
    const expected = [
      { type: 'a1' },
      { type: 'a2' },
      { type: 'a1' },
      { type: 'a2' },
    ];
    const output: Action[] = [];
    out$.subscribe(out => output.push(out), undefined, done);
    action$.next([context1, anyAction]);
    action$.next([contextUnknown, anyAction]);
    action$.next([context2, anyAction]);
    action$.next([contextUnknown, anyAction]);
    action$.next([context1, anyAction]);
    action$.next([contextUnknown, anyAction]);
    action$.next([context2, anyAction]);
    action$.next([contextUnknown, anyAction]);
    action$.complete();
    expect(output).toEqual(expected);
  });

});
