import React from 'react';

import { Link } from 'wdk-client/Components';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import { twitterUrl, facebookUrl, youtubeUrl, buildNumber, releaseDate, displayName } from 'ebrc-client/config';
import { formatReleaseDate } from 'ebrc-client/util/formatters';

import { Twitter, Facebook, YouTube } from './SocialMediaIcons';
import { combineClassNames } from './Utils';

import './Footer.scss';

const cx = makeClassNameHelper('ebrc-Footer');

const projects = [
  'AmoebaDB',
  'CryptoDB',
  'FungiDB',
  'GiardiaDB',
  'MicrosporidiaDB',
  'PiroplasmaDB',
  'PlasmoDB',
  'ToxoDB',
  'TrichDB',
  'TriTrypDB',
  'OrthoMCL',
  'VectorBase'
];

type Props = {
  containerClassName?: string
};

export const Footer = ({containerClassName}: Props) => (
  <footer className={combineClassNames(cx(), containerClassName)}>
    <div className={cx('Copyright')}>
      <div className={cx('Brand')}>
        <Link to="/new-home-page">{displayName}</Link>
      </div>
      <div>
        Release {buildNumber} | {formatReleaseDate(releaseDate)}
      </div>
      <div>
        ©{new Date().getFullYear()} The VEuPathDB Project Team
      </div>
    </div>

    <div className={cx('ProjectLinks')}>
      {projects.map(project =>
        <div title={`${project}.org`} key={project}>
          <a href={`https://${project.toLowerCase()}.org`} className={project}>
            https://{project.toLowerCase()}.org
          </a>
        </div>
      )}
    </div>

    <div className={cx('SocialMediaLinks')}>
      <a href={twitterUrl} target="_blank">
        <Twitter />
      </a>

      <a href={facebookUrl} target="_blank">
        <Facebook />
      </a>
      
      <a href={youtubeUrl} target="_blank">
        <YouTube />
      </a>
    </div>
  </footer>
);
