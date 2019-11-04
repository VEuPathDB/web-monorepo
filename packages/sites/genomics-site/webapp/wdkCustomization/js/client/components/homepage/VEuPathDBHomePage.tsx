import React, { FunctionComponent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { ErrorBoundary } from 'wdk-client/Controllers';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import { Footer } from 'ebrc-client/components/homepage/Footer';
import { Header, HeaderMenuItem } from 'ebrc-client/components/homepage/Header';
import { Main } from 'ebrc-client/components/homepage/Main';
import { NewsPane } from 'ebrc-client/components/homepage/NewsPane';
import { SearchPane } from 'ebrc-client/components/homepage/SearchPane';
import { combineClassNames } from 'ebrc-client/components/homepage/Utils';

import { projectId } from '../../config';

import './VEuPathDBHomePage.scss';

const vpdbCx = makeClassNameHelper('vpdb-');

const useProjectId = (): string => {
  return projectId;
};

const headerMenuItems: HeaderMenuItem[] = [
  {
    key: 'searches',
    display: 'Searches',
    type: 'externalLink',
    href: '#'
  },
  {
    key: 'tools',
    display: 'Tools',
    type: 'externalLink',
    href: '#'
  },
  {
    key: 'workspace',
    display: 'Workspace',
    type: 'externalLink',
    href: '#'
  },
  {
    key: 'data',
    display: 'Data',
    type: 'externalLink',
    href: '#'
  },
  {
    key: 'community',
    display: 'Community',
    type: 'subMenu',
    items: [
      {
        key: 'about',
        display: 'About',
        type: 'externalLink',
        href: '#'
      },
      {
        key: 'help',
        display: 'Help',
        type: 'externalLink',
        href: '#'
      },
      {
        key: 'community',
        display: 'Community',
        type: 'externalLink',
        href: '#'
      }
    ]
  },
  {
    key: 'contact',
    display: 'Contact',
    type: 'route',
    route: '/contact-us',
    target: '_blank'
  }
];

export const VEuPathDBHomePage: FunctionComponent = props => {
  const [ siteSearchSuggestions, setSiteSearchSuggestions ] = useState<string[] | undefined>(undefined);
  const [ additionalSuggestions, setAdditionalSuggestions ] = useState<{ key: string, display: ReactNode }[]>([]);
  const [ headerExpanded, setHeaderExpanded ] = useState(true);
  const projectId = useProjectId();

  const rootContainerClassName = combineClassNames(
    vpdbCx('RootContainer', headerExpanded ? 'header-expanded' : 'header-collapsed'), 
    projectId
  );
  const headerClassName = combineClassNames(
    vpdbCx('Header', headerExpanded ? 'expanded' : 'collapsed'), 
    vpdbCx('BgDark')
  );
  const searchPaneClassName = combineClassNames(vpdbCx('SearchPane'), vpdbCx('BgWash'));
  const mainClassName = vpdbCx('Main');
  const newsPaneClassName = vpdbCx('NewsPane');
  const footerClassName = vpdbCx('Footer');

  const updateHeaderExpanded = useCallback(() => {
    // FIXME - find a better way to update the header height - this resizing is "jerky" when 
    // the scroll bar is left near the scroll threshold
    setHeaderExpanded(document.body.scrollTop <= 80 && document.documentElement.scrollTop <= 80);
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

  const preloadedSuggestions = useMemo(
    () => [
      'protein',
      'protein motifs',
      'proteomics',
      'protozoa',
    ],
    []
  );

  const loadSuggestions = useCallback((searchTerm: string) => {
    if (searchTerm) {
      setSiteSearchSuggestions(
        [
          searchTerm,
          ...preloadedSuggestions
        ].sort()
      );
    } else {
      setSiteSearchSuggestions(undefined);
    }
  }, []);

  return (
    <div className={rootContainerClassName}>
      <ErrorBoundary>
        <Header 
          // FIXME: use project logos for component site branding 
          branding={projectId}
          menuItems={headerMenuItems} 
          containerClassName={headerClassName} 
          loadSuggestions={loadSuggestions}
          siteSearchSuggestions={siteSearchSuggestions}
          additionalSuggestions={additionalSuggestions}
        />
      </ErrorBoundary>
      <ErrorBoundary>
        <SearchPane containerClassName={searchPaneClassName} />
      </ErrorBoundary>
      <Main containerClassName={mainClassName}>
        {props.children}
      </Main>
      <ErrorBoundary>
        <NewsPane containerClassName={newsPaneClassName} />
      </ErrorBoundary>
      <ErrorBoundary>
        <Footer containerClassName={footerClassName} />
      </ErrorBoundary>
    </div>
  );
}
