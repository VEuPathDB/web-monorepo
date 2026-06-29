import { useStudyMetadata } from '@veupathdb/eda/lib/core/hooks/study';
import { Link } from 'react-router-dom';

import DatasetManagement from './DatasetManagement';

class EdaDatasetManagement extends DatasetManagement {
  constructor(props) {
    super(props);
    this.renderEdaLinkout = this.renderEdaLinkout.bind(this);
  }

  renderEdaLinkout() {
    const {
      userDataset: { status },
    } = this.props;
  const { config } = this.props;

  const wdkDatasetId = diyUserDatasetIdToWdkRecordId(
    this.props.userDataset.datasetId
  );
  const edaStudyMetadata = useEdaStudyMetadata(wdkDatasetId);
  const edaWorkspaceUrl = `${makeEdaRoute(wdkDatasetId)}/new`;
  const edaMapUrl = (edaStudyMetadata?.hasMap
                      ? `${makeMapRoute(wdkDatasetId)}/new`
                      : undefined
		    );

    if (edaWorkspaceUrl == null && edaMapUrl == null) return null;

    return (
      <ul className="eda-linkout">
        {!edaWorkspaceUrl ? null : (
          <li>
            <Link to={edaWorkspaceUrl}>
              <i className="ebrc-icon-edaIcon"></i> Explore in {config.displayName}
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

function useEdaStudyMetadata(wdkDatasetId) {
  try {
    const subsettingClient = useConfiguredSubsettingClient(edaServiceUrl);
    return useStudyMetadata(wdkDatasetId, subsettingClient).value;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export default EdaDatasetManagement;
