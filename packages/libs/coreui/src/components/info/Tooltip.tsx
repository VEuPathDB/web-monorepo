import { ComponentProps } from 'react';
import { Theme, Tooltip as MUITooltip, withStyles } from '@material-ui/core';
import _ from 'lodash';

/**
 * Tooltip will not render if the title is an empty value or a boolean.
 */
const UnstyledTooltip = (props: ComponentProps<typeof MUITooltip>) => {
  const { title, ...otherProps } = props;

  const finalTitle = !(
    _.isEqual(title, {}) ||
    _.isEqual(title, []) ||
    typeof title === 'boolean'
  )
    ? title
    : '';

  return <MUITooltip title={finalTitle} {...otherProps} />;
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
