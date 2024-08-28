import { Link } from 'react-router-dom';

import UserDatasetDetail from './UserDatasetDetail';

import './EdaDatasetDetail.scss';

class BiomDatasetDetail extends UserDatasetDetail {
  constructor(props) {
    super(props);
    this.renderEdaLinkout = this.renderEdaLinkout.bind(this);
  }

  renderEdaLinkout() {
    const {
      config: { displayName, projectId },
      userDataset: { status },
      edaWorkspaceUrl,
    } = this.props;

    const isInstalled =
      status?.import === 'complete' &&
      status?.install?.find((d) => d.projectId === projectId)?.dataStatus ===
        'complete';

    return !isInstalled || !edaWorkspaceUrl ? null : (
      <ul className="eda-linkout">
        <li>
          <Link to={edaWorkspaceUrl}>
            <i className="ebrc-icon-edaIcon"></i> Explore in {displayName}
          </Link>
        </li>
      </ul>
    );
  }
}

export default BiomDatasetDetail;
