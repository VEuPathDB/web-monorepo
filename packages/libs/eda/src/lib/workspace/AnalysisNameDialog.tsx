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

  const handleClose = () => {
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
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle>Rename Analysis?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Your current analysis hasn't been renamed. Rename the analysis here or
          click 'Continue' to save the analysis with the default name.
        </DialogContentText>
        <TextField
          label="Analysis name"
          variant="filled"
          value={text}
          onChange={handleTextChange}
          error={!isValid}
          helperText={isValid ? ' ' : 'Name must not be blank'}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleContinue} color="primary" disabled={!isValid}>
          {text === initialAnalysisName ? 'Continue' : 'Rename and continue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
