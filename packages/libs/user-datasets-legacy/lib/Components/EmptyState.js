import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import React from 'react';
import { IconAlt as Icon } from '@veupathdb/wdk-client/lib/Components';
class UserDatasetEmptyState extends React.Component {
  render() {
    const { message } = this.props;
    return _jsxs(
      'div',
      Object.assign(
        { className: 'UserDatasetList-EmptyState' },
        {
          children: [
            _jsx(Icon, { fa: 'table', className: 'EmptyState-Icon' }),
            typeof message === 'string'
              ? _jsx('p', { children: message })
              : message,
          ],
        }
      )
    );
  }
}
export default UserDatasetEmptyState;
//# sourceMappingURL=EmptyState.js.map
