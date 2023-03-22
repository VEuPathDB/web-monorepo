import CircularProgress from '@material-ui/core/CircularProgress';

export default function Spinner() {
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
      <CircularProgress color={'secondary'} size={50} thickness={5} />
    </div>
  );
}
