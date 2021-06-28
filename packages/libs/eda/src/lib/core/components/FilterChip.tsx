import { Chip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

interface Props {
  children: React.ReactNode;
  tooltipText: string;
  isActive: boolean;
  onDelete: () => void;
}

// Material UI CSS declarations
const useStyles = makeStyles((theme) => ({
  root: (props: Props) => ({
    cursor: 'default',
    border: props.isActive ? '2px solid' : '1px solid',
    borderColor: props.isActive ? '#aaa' : '#ccc',
    marginBottom: '5px',
    '& a': {
      color: theme.palette.primary.main,
      textDecoration: 'none',
      outline: '0',
    },
  }),
}));

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
      label={props.children}
      title={props.tooltipText}
      clickable={true}
      onDelete={props.onDelete}
    />
  );
}
