import React from 'react';

import { IconAlt } from '@veupathdb/wdk-client/lib/Components';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import './SocialMediaIcons.scss';

const cx = makeClassNameHelper('ebrc-SocialMediaIcon');

export const AnnouncementsToggle = () => (
  <div className={cx()}>
    <IconAlt fa="bullhorn" />
  </div>
);

export const ContactUs = () => (
  <div className={cx()}>
    <IconAlt fa="envelope-o" />
  </div>
);

export const Bluesky = () => (
  <div className={cx()}>
    <img
      className="bluesky-logo"
      src="/assets/images/Bluesky-Logo--Streamline-Core.png"
    />
  </div>
);

export const Twitter = () => (
  <div className={cx()}>
    <i className="ebrc-icon-x-logo"></i>
  </div>
);

export const Linkedin = () => (
  <div className={cx()}>
    <IconAlt fa="linkedin" />
  </div>
);

export const Reddit = () => (
  <div className={cx()}>
    <IconAlt fa="reddit" />
  </div>
);

export const Facebook = () => (
  <div className={cx()}>
    <IconAlt fa="facebook-square" />
  </div>
);

export const YouTube = () => (
  <div className={cx()}>
    <IconAlt fa="youtube-play" />
  </div>
);
