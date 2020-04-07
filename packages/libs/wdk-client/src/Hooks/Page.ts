import { Action, History, Location } from 'history';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';

export function useScrollUpOnRouteChange() {
  const location: Location = useLocation();
  const history: History = useHistory();

  const [ prevPathname, setPrevPathname ] = useState(location.pathname);
  const [ prevQueryString, setPrevQueryString ] = useState(location.search);

  useEffect(() => {
    const removeHistoryListener = history.listen((newLocation: Location, action: Action) => {
      if (
        action !== 'REPLACE' &&
        !navigatingWithinStrategyWorkspace(prevPathname, newLocation.pathname) &&
        (
          prevPathname !== newLocation.pathname ||
          prevQueryString !== newLocation.search
        )
      ) {
        window.scrollTo(0, 0);
        setPrevPathname(newLocation.pathname);
        setPrevQueryString(newLocation.search);
      }
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
