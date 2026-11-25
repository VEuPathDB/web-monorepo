import { Link } from 'react-router-dom';
import { ReactNode } from 'react';
import { Public } from '@material-ui/icons';

import { diyUserDatasetIdToWdkRecordId } from '../../Utils/diyDatasets';
import DatasetManagement, { DatasetManagementProps } from './DatasetManagement';

class EdaDatasetManagement extends DatasetManagement {
  constructor(props: DatasetManagementProps) {
    super(props);
    this.getEdaLinks = this.getEdaLinks.bind(this);
  }

  getEdaLinks(): { attribute: string; value: ReactNode }[] {
    const { userDataset, fetchEdaStudyLinks } = this.props;

    const wdkDatasetId = diyUserDatasetIdToWdkRecordId(userDataset.datasetId);
    const { workspaceUrl, mapUrl } = fetchEdaStudyLinks(wdkDatasetId);

    const links: { attribute: string; value: ReactNode }[] = [];

    if (workspaceUrl || mapUrl) {
      links.push({
        attribute: 'Explore',
        value: (
          <ul className="eda-linkout">
            {!workspaceUrl ? null : (
              <li>
                <Link to={workspaceUrl}>
                  <i className="ebrc-icon-edaIcon"></i> Dataset Explorer
                </Link>
                <br />
              </li>
            )}
            {!mapUrl ? null : (
              <li>
                <Link to={mapUrl}>
                  <Public
                    fontSize="inherit"
                    style={{ opacity: 0.75, verticalAlign: '-2px' }}
                  />{' '}
                  Map Explorer
                </Link>
              </li>
            )}
          </ul>
        ),
      });
    }

    if (workspaceUrl) {
      links.push({
        attribute: 'View',
        value: <Link to={`${workspaceUrl}/details`}>Dataset details</Link>,
      });
    }

    return links;
  }

  getAttributes() {
    const attributes = super.getAttributes();

    if (!this.isInstalled()) return attributes;

    const edaLinks = this.getEdaLinks();
    const spliceIndex = this.props.includeNameHeader ? 2 : 1;
    return [
      ...attributes.slice(0, spliceIndex),
      ...edaLinks,
      ...attributes.slice(spliceIndex),
    ];
  }
}

export default EdaDatasetManagement;
