import React from 'react';

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
      null
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
