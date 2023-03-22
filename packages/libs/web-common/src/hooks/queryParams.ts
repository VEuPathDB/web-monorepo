import { isEmpty } from 'lodash';
import QueryString from 'querystring';
import { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router';

type Params<T extends string> = {
  [Key in T]?: string | string[];
}

export function useQueryParams<T extends string>(...paramNames: T[]) {
  const history = useHistory();
  const location = useLocation();
  const queryParams = useMemo(() => QueryString.parse(location.search.slice(1)), [ location.search ]);
  const params = useMemo(() => Object.fromEntries(paramNames.map(paramName => [ paramName, queryParams[paramName]])) as Params<T>, [ queryParams ]);
  const updateParams = useCallback((newParams: Params<T>) => {
    // remove empty items
    newParams = Object.fromEntries(Object.entries(newParams).filter(([key, value]) => !isEmpty(value))) as Params<T>;
    history.push(`${location.pathname}?${QueryString.stringify(newParams)}`);
  }, [ history, location.pathname ]);
  return [ params, updateParams ] as const;
}
