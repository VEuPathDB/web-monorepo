import React from 'react';

import { makeClassifier } from 'wdk-client/Views/UserDatasets/UserDatasetUtils';
import UserDatasetDetail from 'wdk-client/Views/UserDatasets/Detail/UserDatasetDetail';

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
