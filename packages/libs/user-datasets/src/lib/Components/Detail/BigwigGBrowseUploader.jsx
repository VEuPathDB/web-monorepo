import React from 'react';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';

import './BigwigGBrowseUploader.scss';

class BigwigGBrowseUploader extends React.Component {
  constructor (props) {
    super(props);
    this.getGBrowseUrl = this.getGBrowseUrl.bind(this);
  }

  getButtons () {

    const GBrowseUrl = this.getGBrowseUrl();
    return (
      <React.Fragment>
            <a href={GBrowseUrl} target="_blank">
              <button className="btn btn-slim">
                View in Genome Browser <Icon fa="chevron-circle-right right-side" />
              </button>
            </a>
      </React.Fragment>
    )
  }

  getGBrowseUrl () {
    const { rootUrl, projectId, sequenceId, trackName, genome, datasetName, datafileName} = this.props;
    var jbrowseTrackName = datasetName + " " + datafileName;
    return `/a/jbrowse/index.html?data=/a/service/jbrowse/tracks/${genome}&tracks=gene,${jbrowseTrackName || ''}&highlight=&loc=${sequenceId || ''}`
  }

  render () { 
    const buttons = this.getButtons();
    return (
      <div className="BigwigGBrowseUploader">
        <div className="BigwigGBrowseUploader-Buttons">{buttons}</div>
      </div>
    )
  }
};

export default BigwigGBrowseUploader;
