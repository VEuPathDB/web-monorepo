import React, { useCallback } from 'react';

import { noop } from 'lodash';

import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import {
  blueskyUrl,
  twitterUrl,
  twitterUrl2,
  facebookUrl,
  youtubeUrl,
  linkedinUrl,
} from '../../config';
import {
  AnnouncementsToggle,
  Bluesky,
  Twitter,
  Facebook,
  YouTube,
  Linkedin,
} from './SocialMediaIcons';

import './SocialMediaLinks.scss';

const cx = makeClassNameHelper('ebrc-SocialMediaLinks');

const finalTwitterUrl = twitterUrl2 ? twitterUrl2 : twitterUrl;

interface Props {
  showAnnouncementsToggle?: boolean;
  onShowAnnouncements?: () => void;
}

export const SocialMediaLinks = ({
  showAnnouncementsToggle = false,
  onShowAnnouncements = noop,
}: Props) => {
  const onClickAnnouncementsToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onShowAnnouncements();
    },
    [showAnnouncementsToggle]
  );

  return (
    <div className={cx()}>
      {
        <a
          title="Reopen announcements you have closed"
          className={cx(
            '--AnnouncementsToggle',
            showAnnouncementsToggle ? 'shown' : 'hidden'
          )}
          href="#"
          onClick={onClickAnnouncementsToggle}
        >
          <AnnouncementsToggle />
        </a>
      }

      <a href={blueskyUrl} target="_blank">
        <Bluesky />
      </a>

      <a href={finalTwitterUrl} target="_blank">
        <Twitter />
      </a>

      <a href={facebookUrl} target="_blank">
        <Facebook />
      </a>

      <a href={linkedinUrl} target="_blank">
        <Linkedin />
      </a>

      <a href={youtubeUrl} target="_blank">
        <YouTube />
      </a>
    </div>
  );
};
