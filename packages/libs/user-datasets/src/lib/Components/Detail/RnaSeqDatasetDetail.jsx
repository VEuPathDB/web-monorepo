import { makeClassifier } from '../UserDatasetUtils';
import BigwigDatasetDetail from './BigwigDatasetDetail';

const classify = makeClassifier('BigwigDatasetDetail', 'RnaSeqDatasetDetail');

class RnaSeqDatasetDetail extends BigwigDatasetDetail {
  constructor (props) {
    super(props);
    this.renderTracksSection = this.renderTracksSection.bind(this);
    this.getTracksTableColumns = this.getTracksTableColumns.bind(this);
  }

};

export default RnaSeqDatasetDetail;



