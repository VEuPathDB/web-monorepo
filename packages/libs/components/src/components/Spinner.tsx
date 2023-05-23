import CircularProgress from '@material-ui/core/CircularProgress';

interface Props {
  size?: string | number;
}

export default function Spinner({ size }: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 450,
      }}
    >
      <CircularProgress color={'secondary'} size={size} thickness={5} />
    </div>
  );
}
