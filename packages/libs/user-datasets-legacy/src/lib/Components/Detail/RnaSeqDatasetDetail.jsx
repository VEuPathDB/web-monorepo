import BigwigDatasetDetail from './BigwigDatasetDetail';

class RnaSeqDatasetDetail extends BigwigDatasetDetail {
  constructor(props) {
    super(props);
    this.renderTracksSection = this.renderTracksSection.bind(this);
    this.getTracksTableColumns = this.getTracksTableColumns.bind(this);
  }
}

export default RnaSeqDatasetDetail;
