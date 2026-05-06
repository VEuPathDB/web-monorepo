import { BigwigDatasetDetail } from './BigwigDatasetDetail';
import { DetailViewProps } from "./UserDatasetDetail";

export class RnaSeqDatasetDetail extends BigwigDatasetDetail {
  constructor(props: DetailViewProps) {
    super(props);
    this.renderTracksSection = this.renderTracksSection.bind(this);
    this.getTracksTableColumns = this.getTracksTableColumns.bind(this);
  }
}
