import { Chip } from '@material-ui/core';

interface Props {
  text: string;
  tooltipText: string;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export default function FilterChip(props: Props) {
  return (
    <Chip
      size="small"
      color={props.active ? 'primary' : 'default'}
      label={props.text}
      title={props.tooltipText}
      clickable={true}
      onClick={props.onClick}
      onDelete={props.onDelete}
    />
  );
}
