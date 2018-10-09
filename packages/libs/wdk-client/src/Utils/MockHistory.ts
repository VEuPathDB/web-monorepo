import { History, Location } from 'history';
import { isString } from 'lodash';

export function createMockHistory(options: { basename: string }): History {
  const createHref = getCreateHref(options.basename);
  return {
    length: 0,
    action: 'REPLACE',
    location: { pathname: '' } as Location,
    push: getPushOrReplace(createHref, true),
    replace: getPushOrReplace(createHref, false),
    go: (n: number) => { /* noop */ },
    goBack: () => { },
    goForward: () => { },
    block: (prompt?: boolean) => () => {},
    listen: () => () => {},
    createHref
  };
}

function getPushOrReplace(createHref: (location: Location) => string, push: boolean) {
  function pushOrReplace(path: string): void;
  function pushOrReplace(path: Location): void;
  function pushOrReplace(path: string | Location) {
    const fn = push ? 'assign' : 'replace';
    const location: Location = isString(path)
      ? {
        pathname: path,
        search: '',
        state: null,
        hash: '',
        key: ''
      }
      : path;
    window.location[fn](createHref(location));
  }
  return pushOrReplace;
}

function getCreateHref(basename: string) {
  function createHref(location: Location) {
    return basename + location.pathname + (location.search || '') + (location.hash || '');
  }
  return createHref;
}