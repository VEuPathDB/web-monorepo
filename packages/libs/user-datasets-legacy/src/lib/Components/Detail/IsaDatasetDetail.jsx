import { Link } from 'react-router-dom';

import UserDatasetDetail from './UserDatasetDetail';

class IsaDatasetDetail extends UserDatasetDetail {
  constructor(props) {
    super(props);
    this.renderEdaLinkout = this.renderEdaLinkout.bind(this);
  }

  renderEdaLinkout() {
    const {
      config: { displayName },
      userDataset: { isInstalled },
      edaWorkspaceUrl,
      edaMapUrl,
    } = this.props;

    if (!isInstalled) return null;

    return (
      <>
        {!edaWorkspaceUrl ? null : (
          <section id="eda-linkout">
            <h2>
              <Link to={edaWorkspaceUrl}>
                <i className="ebrc-icon-edaIcon"></i> Explore in {displayName}
              </Link>
            </h2>
          </section>
        )}
        {!edaMapUrl ? null : (
          <section id="eda-linkout">
            <h2>
              <Link to={edaMapUrl}>
                <i className="ebrc-icon-edaIcon"></i> Explore in MapVEu
              </Link>
            </h2>
          </section>
        )}
      </>
    );
  }

  getPageSections() {
    const [headerSection, , fileSection] = super.getPageSections();

    return [headerSection, this.renderEdaLinkout, fileSection];
  }
}

export default IsaDatasetDetail;
