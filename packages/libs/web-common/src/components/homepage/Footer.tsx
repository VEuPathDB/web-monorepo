import React, { FunctionComponent } from 'react';

import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { ALL_VEUPATHDB_PROJECTS } from '@veupathdb/wdk-client/lib/Utils/ProjectConstants';

import { ProjectLink } from '../../components/homepage/ProjectLink';
import { SocialMediaLinks } from '../../components/homepage/SocialMediaLinks';
import { combineClassNames } from '../../components/homepage/Utils';

import './Footer.scss';

const cx = makeClassNameHelper('ebrc-Footer');

export const projects = [...ALL_VEUPATHDB_PROJECTS];

type Props = {
  containerClassName?: string;
  children?: React.ReactNode;
};

export const Footer: FunctionComponent<Props> = ({
  children,
  containerClassName,
}) => (
  <footer className={combineClassNames(cx(), containerClassName)}>
    <div className={cx('PageDescriptionRow')}>{children}</div>

    <div className={cx('SiteFamilyRow')}>
      <div className={cx('Copyright')}>
        <div>
          <a
            target="_blank"
            href="https://globalbiodata.org/scientific-activities/global-core-biodata-resources"
          >
            <img src="/assets/images/GCBR-Logo-CMYK.png"></img>
          </a>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <a target="_blank" href="https://elixir-europe.org/">
            <img
              style={{ height: '3rem' }}
              src="/assets/images/elixir-core-data-resources-logo.png"
            ></img>
          </a>
        </div>
      </div>
      <div className="footer-center">
        <div className={cx('ProjectLinks')}>
          {projects.map((projectId) => (
            <React.Fragment key={projectId}>
              <ProjectLink projectId={projectId} />
              {projectId === 'VectorBase' && (
                <div className={cx('Divider')}></div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="footer-center-copyright">
          ©{new Date().getFullYear()} The VEuPathDB Project Team
        </div>
      </div>

      <SocialMediaLinks />
    </div>
  </footer>
);
