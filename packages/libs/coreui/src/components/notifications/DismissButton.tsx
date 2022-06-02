import Close from '@material-ui/icons/Close';

interface Props {
  className?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function DismissButton(props: Props) {
  return (
    <button
      type="button"
      className={props.className}
      onClick={props.onClick}
      css={{
        border: 'none',
        background: 'transparent',
        padding: 'none',
        margin: 'none',
        cursor: 'pointer'
      }}
    >
      <Close
        height="1.5em"
        width="1.5em"
        css={{
          verticalAlign: 'middle',
        }}
      />
    </button>
  );
}
