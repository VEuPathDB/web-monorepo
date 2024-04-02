import { ComponentProps } from 'react';
import { Theme, Tooltip as MUITooltip, withStyles } from '@material-ui/core';
import _ from 'lodash';

/**
 * Tooltip will not render if the title is an empty value or a boolean.
 */
const UnstyledTooltip = (props: ComponentProps<typeof MUITooltip>) => {
  const { title } = props;

  return !(
    title === '' ||
    _.isEqual(title, {}) ||
    _.isEqual(title, []) ||
    typeof title === 'boolean'
  ) ? (
    <MUITooltip {...props} />
  ) : null;
};

export const Tooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: '#fffde7',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 320,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
    boxShadow: theme.shadows[1],
  },
}))(UnstyledTooltip);

export { Tooltip as HtmlTooltip };
