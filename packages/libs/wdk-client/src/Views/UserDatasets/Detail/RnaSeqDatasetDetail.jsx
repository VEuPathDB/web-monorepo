import React from 'react';

import Icon from 'wdk-client/Components/Icon/IconAlt';
import { Mesa, MesaState } from 'wdk-client/Components/Mesa';
import { makeClassifier } from 'wdk-client/Views/UserDatasets/UserDatasetUtils';
import BigwigDatasetDetail from 'wdk-client/Views/UserDatasets/Detail/BigwigDatasetDetail';
import BigwigGBrowseUploader from 'wdk-client/Views/UserDatasets/Detail/BigwigGBrowseUploader';

const classify = makeClassifier('BigwigDatasetDetail', 'RnaSeqDatasetDetail');

class RnaSeqDatasetDetail extends BigwigDatasetDetail {
  constructor (props) {
    super(props);
    this.renderTracksSection = this.renderTracksSection.bind(this);
    this.getTracksTableColumns = this.getTracksTableColumns.bind(this);
  }

};

export default RnaSeqDatasetDetail;



