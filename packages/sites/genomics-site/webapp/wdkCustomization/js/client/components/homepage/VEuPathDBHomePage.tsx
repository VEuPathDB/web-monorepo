import React, { FunctionComponent, useCallback, useEffect } from 'react';

import { ErrorBoundary } from 'wdk-client/Controllers';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import { Footer } from 'ebrc-client/components/homepage/Footer';
import { Header } from 'ebrc-client/components/homepage/Header';
import { Main } from 'ebrc-client/components/homepage/Main';
import { NewsPane } from 'ebrc-client/components/homepage/NewsPane';
import { SearchPane } from 'ebrc-client/components/homepage/SearchPane';
import { combineClassNames } from 'ebrc-client/components/homepage/Utils';

import './VEuPathDBHomePage.scss';

const vpdbCx = makeClassNameHelper('vpdb-');

export const VEuPathDBHomePage: FunctionComponent = props => {
  const rootContainerClassName = vpdbCx('RootContainer');
  const headerClassName = combineClassNames(vpdbCx('Header'), vpdbCx('BgDark'));
  const searchPaneClassName = combineClassNames(vpdbCx('SearchPane'), vpdbCx('BgWash'));
  const mainClassName = vpdbCx('Main');
  const newsPaneClassName = vpdbCx('NewsPane');
  const footerClassName = vpdbCx('Footer');

  const updateHeaderExpanded = useCallback(() => {
    // FIXME - find a better way to update the header height - this resizing is a little "jerky" when 
    // the scroll bar is left near the 80px point
    const expanded = document.body.scrollTop <= 80 && document.documentElement.scrollTop <= 80;

    const headerNode = document.getElementsByClassName(headerClassName)[0] as HTMLDivElement;
    const containerNode = document.getElementsByClassName(rootContainerClassName)[0] as HTMLDivElement;

    if (headerNode && containerNode) {
      headerNode.style.padding = expanded ? '90px 20px 10px': '10px 20px';
      headerNode.style.height = expanded ? '9.0625rem' : '4.0625rem';
      containerNode.style.gridTemplateRows = expanded ? '9.0625rem 1fr auto' : '4.0625rem 1fr auto';
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', updateHeaderExpanded, { passive: true });
    window.addEventListener('touch', updateHeaderExpanded, { passive: true });
    window.addEventListener('wheel', updateHeaderExpanded, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateHeaderExpanded);
      window.removeEventListener('touch', updateHeaderExpanded);
      window.removeEventListener('wheel', updateHeaderExpanded);
    };
  }, [ updateHeaderExpanded ]);

  return (
    <div className={rootContainerClassName}>
      <ErrorBoundary><Header containerClassName={headerClassName} /></ErrorBoundary>
      <ErrorBoundary><SearchPane containerClassName={searchPaneClassName} /></ErrorBoundary>
      <Main containerClassName={mainClassName}>
        {props.children}
      </Main>
      <ErrorBoundary><NewsPane containerClassName={newsPaneClassName} /> </ErrorBoundary>
      <ErrorBoundary><Footer containerClassName={footerClassName} /></ErrorBoundary>
    </div>
  );
}
