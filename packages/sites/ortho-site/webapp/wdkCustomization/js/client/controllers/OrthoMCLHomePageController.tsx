import React, { useCallback } from 'react';

import { useSessionBackedState } from '@veupathdb/wdk-client/lib/Hooks/SessionBackedState';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { FeaturedTools } from '@veupathdb/web-common/lib/components/homepage/FeaturedTools';
import { SearchPane } from '@veupathdb/web-common/lib/components/homepage/SearchPane';
import { WorkshopExercises } from '@veupathdb/web-common/lib/components/homepage/WorkshopExercises';
import { NewsPane } from '@veupathdb/web-common/lib/components/homepage/NewsPane';

import { useSearchTree } from 'ortho-client/hooks/searchCheckboxTree';

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
