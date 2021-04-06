import { Chip } from '@material-ui/core';

interface Props {
  text: string;
  tooltipText: string;
  isActive: boolean;
  onClick?: () => void;
  onDelete: () => void;
}

/**
 * A chip (small informational element) representing a filter applied to a
 * variable
 */
export default function FilterChip(props: Props) {
  return (
    <Chip
      size="small"
      color={props.isActive ? 'primary' : 'default'}
      label={props.text}
      title={props.tooltipText}
      clickable={true}
      onClick={props.onClick}
      onDelete={props.onDelete}
    />
  );
}
