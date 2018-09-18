import React from 'react';

import Icon from '../../../Components/Icon/IconAlt';
import { Mesa, MesaState } from '../../../Components/Mesa';
import { makeClassifier } from '../UserDatasetUtils';
import BigwigDatasetDetail from './BigwigDatasetDetail';
import BigwigGBrowseUploader from './BigwigGBrowseUploader';

const classify = makeClassifier('BigwigDatasetDetail', 'RnaSeqDatasetDetail');

class RnaSeqDatasetDetail extends BigwigDatasetDetail {
  constructor (props) {
    super(props);
    this.renderTracksSection = this.renderTracksSection.bind(this);
    this.getTracksTableColumns = this.getTracksTableColumns.bind(this);
  }

};

export default RnaSeqDatasetDetail;



