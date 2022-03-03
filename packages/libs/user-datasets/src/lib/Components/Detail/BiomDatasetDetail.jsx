import React from 'react';

import { makeClassifier } from '../UserDatasetUtils';
import UserDatasetDetail from './UserDatasetDetail';

const classify = makeClassifier('UserDatasetDetail', 'BiomDatasetDetail');

class BiomDatasetDetail extends UserDatasetDetail {
  constructor (props) {
    super(props);
  }

  getPageSections () {
    const [ headerSection, compatSection, fileSection ] = super.getPageSections();
    return [ headerSection, fileSection ];
  }
};

export default BiomDatasetDetail;
