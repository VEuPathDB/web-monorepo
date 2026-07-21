import BigwigDatasetManagement from './BigwigDatasetManagement';
import { DatasetManagementProps } from './DatasetManagement';

class RnaSeqDatasetManagement extends BigwigDatasetManagement {
  constructor(props: DatasetManagementProps) {
    super(props);
    this.renderTracksSection = this.renderTracksSection.bind(this);
    this.getTracksTableColumns = this.getTracksTableColumns.bind(this);
  }
}

export default RnaSeqDatasetManagement;
