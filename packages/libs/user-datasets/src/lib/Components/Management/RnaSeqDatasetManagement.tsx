import BigwigDatasetManagement from './BigwigDatasetManagement';
import { DetailViewProps } from "./DatasetManagement";

class RnaSeqDatasetManagement extends BigwigDatasetManagement {
  constructor(props: DetailViewProps) {
    super(props);
    this.renderTracksSection = this.renderTracksSection.bind(this);
    this.getTracksTableColumns = this.getTracksTableColumns.bind(this);
  }
}

export default RnaSeqDatasetManagement;
