import { Link } from 'react-router-dom';
import UserDatasetDetail from './UserDatasetDetail';
import { makeClassifier } from '../UserDatasetUtils';

const classify = makeClassifier('UserDatasetDetail');

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
      // <ul className="eda-linkout">
      <div className="eda-linkout">
        {!edaWorkspaceUrl ? null : (
          // <li>
          <Link to={edaWorkspaceUrl}>
            <i className="ebrc-icon-edaIcon"></i> Explore in {displayName}
          </Link>
          // </li>
        )}
        {!edaMapUrl ? null : (
          // <li>
          <Link to={edaMapUrl}>
            <i className="ebrc-icon-edaIcon"></i> Explore in MapVEu
          </Link>
          // </li>
        )}
      </div>
    );
  }

  //   getAttributes() {
  //     const attributes = super.getAttributes();

  //     if (!this.isInstalled()) return attributes;

  //     const edaLinks = {
  //       attribute: 'Explore',
  //       value: this.renderEdaLinkout(),
  //     };

  //     return [
  //       edaLinks,
  //       ...attributes,
  //     ];
  //   }
  // }

  renderHeaderSection() {
    const AllLink = this.renderAllDatasetsLink;
    const Subtitle = this.renderSubtitle;
    const AttributeList = this.renderAttributeList;
    const DatasetActions = this.renderDatasetActions;
    const DatasetName = this.renderDatasetName;
    const EdaLinkout = this.renderEdaLinkout;

    return (
      <section id="dataset-header">
        <AllLink />
        <div className={classify('Header')}>
          <div className={classify('Header-Attributes')}>
            <DatasetName />
            <Subtitle />
            <EdaLinkout />
            <AttributeList />
          </div>
          <div className={classify('Header-Actions')}>
            <DatasetActions />
          </div>
        </div>
      </section>
    );
  }
}

export default EdaDatasetDetail;
