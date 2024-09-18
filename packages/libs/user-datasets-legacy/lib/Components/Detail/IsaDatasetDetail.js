import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from 'react/jsx-runtime';
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
    return _jsxs(_Fragment, {
      children: [
        !edaWorkspaceUrl
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
            ),
        !edaMapUrl
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
                        { to: edaMapUrl },
                        {
                          children: [
                            _jsx('i', { className: 'ebrc-icon-edaIcon' }),
                            ' Explore in MapVEu',
                          ],
                        }
                      )
                    ),
                  }),
                }
              )
            ),
      ],
    });
  }
  getPageSections() {
    const [headerSection, , fileSection] = super.getPageSections();
    return [headerSection, this.renderEdaLinkout, fileSection];
  }
}
export default IsaDatasetDetail;
//# sourceMappingURL=IsaDatasetDetail.js.map
