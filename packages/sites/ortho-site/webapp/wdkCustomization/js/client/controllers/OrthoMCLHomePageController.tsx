import React, { useCallback, useLayoutEffect } from 'react';

import { useSessionBackedState } from 'wdk-client/Hooks/SessionBackedState';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import { FeaturedTools } from 'ebrc-client/components/homepage/FeaturedTools';
import { SearchPane } from 'ebrc-client/components/homepage/SearchPane';
import { WorkshopExercises } from 'ebrc-client/components/homepage/WorkshopExercises';
import { NewsPane } from 'ebrc-client/components/homepage/NewsPane';

import { useSearchTree } from '../hooks/searchCheckboxTree';

const IS_NEWS_EXPANDED_SESSION_KEY = 'homepage-is-news-expanded';

const cx = makeClassNameHelper('vpdb-');

import './OrthoMCLHomePageController.scss';

export function OrthoMCLHomePageController() {
  const searchTree = useSearchTree();

  const [ isNewsExpanded, setIsNewsExpanded ] = useSessionBackedState(
    false,
    IS_NEWS_EXPANDED_SESSION_KEY,
    encodeIsNewsExpanded,
    parseIsNewsExpanded
  );
  const toggleNews = useCallback(
    () => {
      setIsNewsExpanded(!isNewsExpanded);
    },
    [ isNewsExpanded, setIsNewsExpanded ]
  );

  return (
    <div className={cx('LandingContent', isNewsExpanded ? 'news-expanded' : 'news-collapsed')}>
      <SearchPane
        containerClassName={`${cx('SearchPane')} ${cx('BgWash')}`}
        searchTree={searchTree}
      />
      <div className={cx('MainContent')}>
        <FeaturedTools />
        <hr />
        <WorkshopExercises />
      </div>
      <NewsPane
        containerClassName={cx('NewsPane', isNewsExpanded ? 'news-expanded' : 'news-collapsed')}
        isNewsExpanded={isNewsExpanded}
        toggleNews={toggleNews}
      />
    </div>
  );
}

const encodeIsNewsExpanded = (b: boolean) => b ? 'y' : '';
const parseIsNewsExpanded = (s: string) => !!s;
