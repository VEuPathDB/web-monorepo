import { Action } from 'history';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';

export interface LocationState {
  scrollToTop?: boolean;
}

export function useScrollUpOnRouteChange() {
  const location = useLocation<LocationState | undefined>();
  const history = useHistory<LocationState | undefined>();

  const [ prevPathname, setPrevPathname ] = useState(location.pathname);
  const [ prevQueryString, setPrevQueryString ] = useState(location.search);

  useEffect(() => {
    const removeHistoryListener = history.listen((newLocation, action) => {
      setPrevPathname(newLocation.pathname);
      setPrevQueryString(newLocation.search);

      if (
        newLocation.state?.scrollToTop === false ||
        action === 'REPLACE' ||
        navigatingWithinStrategyWorkspace(prevPathname, newLocation.pathname) ||
        newLocation.hash || (
          prevPathname === newLocation.pathname &&
          prevQueryString === newLocation.search
        )
      ) return;

      window.scrollTo(0, 0);
    });

    return removeHistoryListener;
  } , []);
}

function navigatingWithinStrategyWorkspace(prevPathname: string, newPathname: string) {
  return (
    prevPathname.startsWith('/workspace/strategies') &&
    newPathname.startsWith('/workspace/strategies')
  );
}
