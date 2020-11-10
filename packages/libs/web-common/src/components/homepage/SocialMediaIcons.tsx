import React from 'react';

import { IconAlt } from 'wdk-client/Components';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import './SocialMediaIcons.scss';

const cx = makeClassNameHelper('ebrc-SocialMediaIcon');

export const AnnouncementsToggle = () =>
  <div className={cx()}>
    <IconAlt fa="bullhorn" />
  </div>;

export const ContactUs = () => 
  <div className={cx()}>
    <IconAlt fa="envelope-o" />
  </div>;

export const Twitter = () =>
  <div className={cx()}>
    <IconAlt fa="twitter" />
  </div>;

export const Facebook = () =>
  <div className={cx()}>
    <IconAlt fa="facebook-square" />
  </div>;

export const YouTube = () =>
  <div className={cx()}>
    <IconAlt fa="youtube-play" />
  </div>;
