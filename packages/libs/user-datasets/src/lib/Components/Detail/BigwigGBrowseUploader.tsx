import React from 'react';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';

import './BigwigGBrowseUploader.scss';
import { DatasetId } from '../../Service';

export interface BigwigGBrowseUploaderProps {
  readonly datasetId: DatasetId;
  readonly projectId: string;
  readonly sequenceId: string;
  readonly genome: string;
  readonly datasetName: string;
  readonly dataFileName: string;
}

export class BigwigGBrowseUploader extends React.Component<BigwigGBrowseUploaderProps> {
  constructor(props: BigwigGBrowseUploaderProps) {
    super(props);
    this.getGBrowseUrl = this.getGBrowseUrl.bind(this);
  }

  getButtons() {
    const GBrowseUrl = this.getGBrowseUrl();
    return (
      <React.Fragment>
        <a href={GBrowseUrl} target="_blank" rel="noreferrer">
          <button className="btn btn-slim">
            View in Genome Browser <Icon fa="chevron-circle-right right-side" />
          </button>
        </a>
      </React.Fragment>
    );
  }

  getGBrowseUrl() {
    const { sequenceId, genome, datasetName, dataFileName } = this.props;
    const jbrowseTrackName = datasetName + ' ' + dataFileName;
    return `/a/jbrowse/index.html?data=/a/service/jbrowse/tracks/${genome}&tracks=gene,${
      jbrowseTrackName || ''
    }&highlight=&loc=${sequenceId || ''}`;
  }

  render() {
    const buttons = this.getButtons();
    return (
      <div className="BigwigGBrowseUploader">
        <div className="BigwigGBrowseUploader-Buttons">{buttons}</div>
      </div>
    );
  }
}
