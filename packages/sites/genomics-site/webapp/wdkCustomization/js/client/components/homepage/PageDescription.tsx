import React from 'react';

import { projectId } from '../../config';

import { makeVpdbClassNameHelper } from './Utils';

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
      null
    }
  </div>;
