import React from 'react';
import Icon from '../../../Components/Icon/IconAlt';
// TODO Lazy load moment
import moment from '../../../Utils/MomentUtils';
import { getBigwigStatusUrl, getBigwigUploadUrl } from '../UserDatasetUtils';
import './BigwigGBrowseUploader.scss';


class BigwigGBrowseUploader extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      inProgress: props.status === 'IN_PROGRESS',
      isInstalled: props.status === 'COMPLETED',
      uploadedAt: props.uploadedAt,
      errorMessage: props.errorMessage
    };
    this.getStatusIcon = this.getStatusIcon.bind(this);
    this.getStatusMessage = this.getStatusMessage.bind(this);
    this.getGBrowseUrl = this.getGBrowseUrl.bind(this);
    this.startUpload = this.startUpload.bind(this);
    this.startListeningForStatusChange = this.startListeningForStatusChange.bind(this);
    this.pollForTrackStatus = this.pollForTrackStatus.bind(this);
  }

  startUpload () {
    const { appUrl, rootUrl, datasetId, datafileName: filename } = this.props;
    const uploadUrl = rootUrl + getBigwigUploadUrl(datasetId, filename);
    fetch(uploadUrl, { credentials: 'include' })
      .then(res => {
        this.setState({ inProgress: true }, this.startListeningForStatusChange);
      }).catch(err => {
        console.error(err);
        if (err.message) this.setState({ errorMessage: err.message });
      });
  }

  pollForTrackStatus () {
    const { datasetId, rootUrl, datafileName: filename } = this.props;
    const statusUrl = rootUrl + getBigwigStatusUrl(datasetId);
    fetch(statusUrl, { credentials: 'include' })
      .then(res => res.json())
      .then(({ results }) => {
        const track = results.find(({ dataFileName }) => filename === dataFileName);
        if (!track) return;
        if (track.status === 'COMPLETED') {
          this.setState({ isInstalled: true, lastUploaded: null }, this.stopListeningForStatusChange);
        } else {
          console.info('Polling track status...', track);
        }
      })
      .catch(err => {
        console.error(err);
        if (err.message) this.setState({ errorMessage });
      })
  }

  startListeningForStatusChange () {
    const { inProgress } = this.state;
    if (this.statusListener || !inProgress) return;
    this.statusListener = setInterval(this.pollForTrackStatus, 1000);
  }

  stopListeningForStatusChange () {
    const { inProgress } = this.state;
    if (!this.statusListener) return;
    clearInterval(this.statusListener);
    this.statusListener = null;
    this.setState({ inProgress: false });
  }

  getStatusIcon () {
    const { inProgress, isInstalled } = this.state;
    const { status, errorMessage, uploadedAt } = this.props;
    if (inProgress) return 'circle-o-notch fa-spin';
    if (isInstalled) return 'check-circle-o';

    switch (status) {
      case 'NOT_UPLOADED':
        return 'circle-thin';
      case 'UPLOADED':
        return 'check-circle';
      default:
        return 'question-circle';
    }
  }

  getStatusMessage () {
    const { inProgress, isInstalled, errorMessage, uploadedAt } = this.state;
    const { status } = this.props;
    const GBrowseUrl = this.getGBrowseUrl();
    if (inProgress) return <b>Sending to GBrowse...</b>;
    if (isInstalled) return (
      <span>
        Sent to GBrowse{uploadedAt ? ` ${moment(uploadedAt).fromNow()}.` : '.'}
      </span>
    );
    switch (status) {
      case 'NOT_UPLOADED':
        return <span>This file has not been added to <b>GBrowse</b>.</span>;
      default:
        return errorMessage && errorMessage.length
          ? `Error sending to GBrowse: ${errorMessage}`
          : '...';
    }
  }

  getButtons () {
    const { inProgress, isInstalled } = this.state;
    const GBrowseUrl = this.getGBrowseUrl();
    return (
      <React.Fragment>
        {isInstalled
          ? (
            <a href={GBrowseUrl} target="_blank">
              <button className="btn btn-slim">
                View In <b>GBrowse</b> <Icon fa="chevron-circle-right right-side" />
              </button>
            </a>
          ) : (
            <button onClick={this.startUpload} className="btn btn-slim" disabled={inProgress || isInstalled}>
              Send To <b>GBrowse</b> <Icon fa="upload right-side"/>
            </button>
          )
        }
      </React.Fragment>
    )
  }

  getGBrowseUrl () {
    const { rootUrl, projectId, sequenceId, trackName } = this.props;
    return `/cgi-bin/gbrowse/${projectId}/?ref=${sequenceId || ''};hmap=gene_model;enable=track_${trackName || ''}_1`
  }

  render () {
    const icon = this.getStatusIcon();
    const buttons = this.getButtons();
    const message = this.getStatusMessage();

    return (
      <div className="BigwigGBrowseUploader">
        <div className="BigwigGBrowseUploader-Icon"><Icon fa={icon}/></div>
        <div className="BigwigGBrowseUploader-Message">{message}</div>
        <div className="BigwigGBrowseUploader-Buttons">{buttons}</div>
      </div>
    )
  }
};

export default BigwigGBrowseUploader;
