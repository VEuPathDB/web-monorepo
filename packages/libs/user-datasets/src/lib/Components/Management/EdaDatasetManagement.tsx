import { Link } from 'react-router-dom';
import React from 'react';

import { diyUserDatasetIdToWdkRecordId } from '../../Utils/diyDatasets';
import DatasetManagement, { DatasetManagementProps } from './DatasetManagement';

class EdaDatasetManagement extends DatasetManagement {
  constructor(props: DatasetManagementProps) {
    super(props);
    this.renderEdaLinkout = this.renderEdaLinkout.bind(this);
  }

  renderEdaLinkout() {
    const { userDataset, config, fetchEdaStudyLinks } = this.props;

    const wdkDatasetId = diyUserDatasetIdToWdkRecordId(userDataset.datasetId);
    const { workspaceUrl, mapUrl } = fetchEdaStudyLinks(wdkDatasetId);

    return (
      <ul className="eda-linkout">
        {!workspaceUrl ? null : (
          <li>
            <Link to={workspaceUrl}>
              <i className="ebrc-icon-edaIcon"></i> Explore in {config.displayName}
            </Link>
          </li>
        )}
        {!mapUrl ? null : (
          <li>
            <Link to={mapUrl}>
              <i className="ebrc-icon-edaIcon"></i> Explore in MapVEu
            </Link>
          </li>
        )}
      </ul>
    );
  }

  getAttributes() {
    const attributes = super.getAttributes();

    if (!this.isInstalled()) return attributes;

    const edaLinks = {
      attribute: 'Explore',
      value: this.renderEdaLinkout(),
    };
    const spliceIndex = this.props.includeNameHeader ? 2 : 1;
    return [
      ...attributes.slice(0, spliceIndex),
      edaLinks,
      ...attributes.slice(spliceIndex),
    ];
  }
}

export default EdaDatasetManagement;
