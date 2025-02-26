import { Link } from 'react-router-dom';

import UserDatasetDetail from './UserDatasetDetail';

class EdaDatasetDetail extends UserDatasetDetail {
  constructor(props) {
    super(props);
    this.renderEdaLinkout = this.renderEdaLinkout.bind(this);
  }

  renderEdaLinkout() {
    const {
      config: { displayName, projectId },
      userDataset: { status },
      edaWorkspaceUrl,
      edaMapUrl,
    } = this.props;

    const isInstalled =
      status?.import === 'complete' &&
      status?.install?.find((d) => d.projectId === projectId)?.dataStatus ===
        'complete';

    if (!isInstalled) return null;

    if (edaWorkspaceUrl == null && edaMapUrl == null) return null;

    return (
      <ul className="eda-linkout">
        {!edaWorkspaceUrl ? null : (
          <li>
            <Link to={edaWorkspaceUrl}>
              <i className="ebrc-icon-edaIcon"></i> Explore in {displayName}
            </Link>
          </li>
        )}
        {!edaMapUrl ? null : (
          <li>
            <Link to={edaMapUrl}>
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

export default EdaDatasetDetail;
