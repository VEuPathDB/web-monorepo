import React, { useCallback, useState } from 'react';

import { IconAlt } from 'wdk-client/Components';

import { projects } from 'ebrc-client/components/homepage/Footer';
import { ProjectLink } from 'ebrc-client/components/homepage/ProjectLink';

import { projectId } from '../../config';

import { makeVpdbClassNameHelper } from './Utils';

import './PageDescription.scss';

const cx = makeVpdbClassNameHelper('PageDescription');

const PlasmoDB = 'PlasmoDB';
const VEuPathDB = 'VEuPathDB';

export const PageDescription = () => 
  <div className={cx()}>
    {
      projectId === VEuPathDB &&
      <VEuPathDBDescription />
    }
    {
      projectId === PlasmoDB &&
      <p>
        As part of the VEuPathDB 
        {' '}
        <a href="https://www.niaid.nih.gov/research/bioinformatics-resource-centers" target="_blank">Bioinformatics Resource Center</a>,
        {' '}
        <span className={cx('ProjectId')}>PlasmoDB</span>
        {' '} 
        provides genomic, phenotypic, and population-centric data to the scientific community for plasmodium.
      </p>
    }
  </div>;

const VEuPathDBDescription = () => {
  const [ isExpanded, setIsExpanded ] = useState(false);

  const onClickLearnMore = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsExpanded(!isExpanded);
  }, [ isExpanded ]);

  return (
    <div className={VEuPathDB}>
      <div className={cx('Header')}>
        <div className={cx('HeaderPrimary')}>
          <h4>VEuPathDB</h4>
          <div className={cx('HeaderProjectLinks')}>
            {
              projects.map(projectId => 
                <ProjectLink key={projectId} projectId={projectId} />
              )
            }
          </div>
        </div>
        <div className={cx('HeaderSecondary')}>
          <a href="#" onClick={onClickLearnMore}>
            Learn more <IconAlt fa="angle-double-right" />
          </a>
        </div>
      </div>
      <div className={cx('ShortSummary')}>
        <p>
          The VEuPathDB 
          {' '}
          <a href="https://www.niaid.nih.gov/research/bioinformatics-resource-centers" target="_blank">
            Bioinformatics Resource Center
          </a>
          {' '}
          provides a portal for accessing genomic-scale datasets associated with diverse eukaryotic microbes and invertebrate vectors of human pathogens.
        </p>
      </div>
      {
        isExpanded &&
        <div className={cx('ExpandedSummary')}>
          <p>Search for data here, or use one of the VEuPathDB component websites:</p>

          <div className={cx('ExpandedSummaryProjectLinks')}>
          {
            projects.map(
              projectId => (
                <div className={cx('ExpandedSummaryProjectLinksItem')}>
                  <ProjectLink projectId={projectId} />
                  <div className={cx('ExpandedSummaryProjectLinksItemDescription')}>
                    {projectId}
                  </div>
                </div>
              )
            )
          }
          </div>
        </div>
      }
    </div>
  );
};
