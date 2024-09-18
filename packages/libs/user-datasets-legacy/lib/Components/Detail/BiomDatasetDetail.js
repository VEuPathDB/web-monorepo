import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Link } from 'react-router-dom';
import UserDatasetDetail from './UserDatasetDetail';
class BiomDatasetDetail extends UserDatasetDetail {
  constructor(props) {
    super(props);
    this.renderEdaLinkout = this.renderEdaLinkout.bind(this);
  }
  renderEdaLinkout() {
    const {
      config: { displayName },
      userDataset: { isInstalled },
      edaWorkspaceUrl,
    } = this.props;
    return !isInstalled || !edaWorkspaceUrl
      ? null
      : _jsx(
          'section',
          Object.assign(
            { id: 'eda-linkout' },
            {
              children: _jsx('h2', {
                children: _jsxs(
                  Link,
                  Object.assign(
                    { to: edaWorkspaceUrl },
                    {
                      children: [
                        _jsx('i', { className: 'ebrc-icon-edaIcon' }),
                        ' Explore in ',
                        displayName,
                      ],
                    }
                  )
                ),
              }),
            }
          )
        );
  }
  getPageSections() {
    const [headerSection, , fileSection] = super.getPageSections();
    return [headerSection, this.renderEdaLinkout, fileSection];
  }
}
export default BiomDatasetDetail;
//# sourceMappingURL=BiomDatasetDetail.js.map
