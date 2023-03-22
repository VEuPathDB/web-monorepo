import React, { useCallback } from 'react';

import { noop } from 'lodash';

import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { twitterUrl, twitterUrl2, facebookUrl, youtubeUrl, redditUrl } from 'ebrc-client/config';
import { AnnouncementsToggle, Twitter, Facebook, YouTube, Reddit } from './SocialMediaIcons';

import './SocialMediaLinks.scss';

const cx = makeClassNameHelper('ebrc-SocialMediaLinks');

const finalTwitterUrl = twitterUrl2 ? twitterUrl2 : twitterUrl;

interface Props {
  showAnnouncementsToggle?: boolean;
  onShowAnnouncements?: () => void;
}

export const SocialMediaLinks = ({
  showAnnouncementsToggle = false,
  onShowAnnouncements = noop
}: Props) => {
  const onClickAnnouncementsToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onShowAnnouncements();
  }, [ showAnnouncementsToggle ]);

  return (
    <div className={cx()}>
      {
        <a
          title="Reopen announcements you have closed"
          className={cx('--AnnouncementsToggle', showAnnouncementsToggle ? 'shown' : 'hidden')}
          href="#" onClick={onClickAnnouncementsToggle}
        >
          <AnnouncementsToggle />
        </a>
      }

      <a href={finalTwitterUrl} target="_blank">
        <Twitter />
      </a>

      <a href={facebookUrl} target="_blank">
        <Facebook />
      </a>

      <a href={redditUrl} target="_blank">
        <Reddit />
      </a>

      <a href={youtubeUrl} target="_blank">
        <YouTube />
      </a>
    </div>
  );
};
