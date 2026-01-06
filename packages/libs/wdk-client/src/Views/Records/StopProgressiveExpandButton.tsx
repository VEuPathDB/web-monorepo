import React from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@material-ui/core';
import { stopProgressiveExpand } from '../../Actions/RecordActions';
import OutlinedButton from '@veupathdb/coreui/lib/components/buttons/OutlinedButton';

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
    <OutlinedButton
      text="Stop"
      size="small"
      themeRole="error"
      onPress={handleStop}
    />
  );
}
