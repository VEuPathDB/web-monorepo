import { Chip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

interface Props {
  children: React.ReactNode;
  tooltipText: string;
  isActive: boolean;
  onDelete: () => void;
}

// Material UI CSS declarations
const useStyles = makeStyles({
  root: (props: Props) => ({
    cursor: 'default',
    backgroundColor: props.isActive ? '#3c78d8' : '#e0e0e0',
    '& a': {
      color: props.isActive ? 'white' : 'black',
      textDecoration: 'none',
      outline: '0',
    },
  }),
});

/**
 * A chip (small informational element) representing a filter applied to a
 * variable
 */
export default function FilterChip(props: Props) {
  const classes = useStyles(props);

  return (
    <Chip
      className={classes.root}
      size="small"
      color={props.isActive ? 'primary' : 'default'}
      label={props.children}
      title={props.tooltipText}
      clickable={true}
      onDelete={props.onDelete}
    />
  );
}
