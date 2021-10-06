import React, { useState } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';

interface AnalysisNameDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialAnalysisName: string;
  setAnalysisName: (name: string) => void;
  redirectToNewAnalysis: () => void;
}

export function AnalysisNameDialog({
  isOpen,
  setIsOpen,
  initialAnalysisName,
  setAnalysisName,
  redirectToNewAnalysis,
}: AnalysisNameDialogProps) {
  const [text, setText] = useState(initialAnalysisName);
  const [isValid, setIsValid] = useState(true);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newText = event.target.value;
    setText(newText);
    newText.length > 0 ? setIsValid(true) : setIsValid(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setText(initialAnalysisName);
  };

  const handleContinue = async () => {
    await setAnalysisName(text);
    redirectToNewAnalysis();
  };

  return (
    <Dialog
      open={isOpen}
      onBackdropClick={handleCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle>Rename Analysis?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Your current analysis hasn't been renamed. Rename the analysis here or
          click 'Continue' to save the analysis with the default name.
        </DialogContentText>
        <br />
        <TextField
          label="Analysis name"
          variant="outlined"
          size="small"
          style={{ margin: 'auto' }}
          value={text}
          onChange={handleTextChange}
          error={!isValid}
          helperText={isValid ? ' ' : 'Name must not be blank'}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleContinue} color="primary" disabled={!isValid}>
          {text === initialAnalysisName ? 'Continue' : 'Rename and continue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
