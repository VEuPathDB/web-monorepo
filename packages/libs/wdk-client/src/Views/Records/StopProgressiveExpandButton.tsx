import React from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@material-ui/core';
import { stopProgressiveExpand } from '../../Actions/RecordActions';

export function StopProgressiveExpandButton({
  snackbarKey,
}: {
  snackbarKey: string | number;
}) {
  const dispatch = useDispatch();

  const handleStop = () => {
    dispatch(stopProgressiveExpand());
  };

  return (
    <Button size="small" color="inherit" onClick={handleStop}>
      Stop
    </Button>
  );
}
