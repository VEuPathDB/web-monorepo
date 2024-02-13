import { Theme, Tooltip, withStyles } from '@material-ui/core';

// This is just for convenience.
export { HtmlTooltip as Tooltip };

export const HtmlTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: '#fffde7',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 320,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
    boxShadow: theme.shadows[1],
  },
}))(Tooltip);
