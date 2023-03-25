import React, { useEffect, useState } from 'react';

import { IconAlt } from '@veupathdb/wdk-client/lib/Components';

import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { News } from '../../App/NewsSidebar';

import { twitterUrl, twitterUrl2 } from '../../config';
import { useCommunitySiteProjectUrl } from '../../hooks/staticData';

import { SocialMediaControls } from './SocialMediaControls';
import { combineClassNames } from './Utils';

import '../../App/Showcase/Showcase.scss';

import './NewsPane.scss';

const NEWS_URL_SEGMENT = '/news.json';

const cx = makeClassNameHelper('ebrc-NewsPane');

const twitterUrls = twitterUrl2 ? [twitterUrl2, twitterUrl] : [twitterUrl];

type NewsState =
  | {
      status: 'idle';
      news: any;
      error: any;
    }
  | {
      status: 'loading';
      news: any;
      error: any;
    };

type Props = {
  containerClassName?: string;
  isNewsExpanded: boolean;
  toggleNews: () => void;
};

export const NewsPane = ({
  containerClassName,
  isNewsExpanded,
  toggleNews,
}: Props) => {
  const communitySiteUrl = useCommunitySiteProjectUrl();
  const [newsSidebarState, setNewsSidebarState] = useState<NewsState>({
    status: 'idle',
    news: null,
    error: null,
  });

  useEffect(() => {
    let cancelLoading = false;

    if (communitySiteUrl != null) {
      setNewsSidebarState({ ...newsSidebarState, status: 'loading' });

      fetch(`https://${communitySiteUrl}${NEWS_URL_SEGMENT}`, { mode: 'cors' })
        .then((res) => res.json())
        .then(
          (news) => {
            if (!cancelLoading) {
              setNewsSidebarState({ status: 'idle', news, error: null });
            }
          },
          (error) => {
            if (!cancelLoading) {
              setNewsSidebarState({ status: 'idle', news: null, error });
            }
          }
        );
    }

    return () => {
      cancelLoading = true;
    };
  }, [communitySiteUrl]);

  return (
    <aside
      className={combineClassNames(
        cx('', isNewsExpanded ? 'news-expanded' : 'news-collapsed'),
        containerClassName
      )}
    >
      <SocialMediaControls
        isNewsExpanded={isNewsExpanded}
        toggleNews={toggleNews}
      />
      <hr />
      <div className="News-Section">
        <News twitterUrls={twitterUrls} {...newsSidebarState} />
      </div>
      <div className={cx('Drawer')}>
        <div className={cx('DrawerContent')}>
          <button className="link" onClick={toggleNews}>
            <IconAlt fa="angle-double-left" />
            <div className={cx('DrawerLabel')}>News and Tweets</div>
            <IconAlt fa="angle-double-left" />
          </button>
        </div>
      </div>
    </aside>
  );
};
