import { jsxs as _jsxs, jsx as _jsx } from 'react/jsx-runtime';
import * as React from 'react';
import {
  IconAlt as Icon,
  Link,
  Tooltip,
} from '@veupathdb/wdk-client/lib/Components';
const FOUR_HOURS = 4 * (1000 * 60 * 60);
export default function UserDatasetStatus(props) {
  const { baseUrl, userDataset, projectId, displayName } = props;
  const { isInstalled, isCompatible, projects, age } = userDataset;
  const isInstallable = projects.includes(projectId);
  const isPending = isCompatible && age < FOUR_HOURS;
  const isError = isCompatible && !isPending;
  const link = `${baseUrl}/${userDataset.id}`;
  const content = !isInstallable
    ? _jsxs('span', {
        children: ['This data set is not compatible with ', displayName, '.'],
      })
    : isInstalled
    ? _jsxs('span', {
        children: [
          'This data set is installed and ready for use in ',
          displayName,
          '.',
        ],
      })
    : isPending
    ? _jsxs('span', {
        children: [
          'This data set is currently being installed in ',
          displayName,
          '. Please check again soon.',
        ],
      })
    : isError
    ? _jsxs('span', {
        children: [
          'This data set could not be installed in ',
          displayName,
          ' due to a server error.',
        ],
      })
    : _jsxs('span', {
        children: [
          'This data set was uploaded but could not be installed, as it is not compatible with resources in this release of ',
          displayName,
          '.',
        ],
      });
  const faIcon = !isInstallable
    ? 'minus-circle'
    : isInstalled
    ? 'check-circle'
    : isPending
    ? 'clock-o'
    : isError
    ? 'minus-circle'
    : 'exclamation-circle';
  const children = _jsx(Icon, { className: 'StatusIcon', fa: faIcon });
  const visibleContent = props.useTooltip
    ? _jsx(Tooltip, Object.assign({ content: content }, { children: children }))
    : _jsxs(React.Fragment, { children: [children, ' ', content] });
  return props.linkToDataset
    ? _jsx(Link, Object.assign({ to: link }, { children: visibleContent }))
    : visibleContent;
}
//# sourceMappingURL=UserDatasetStatus.js.map
