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
  /** Whether the dialog is open */
  isOpen: boolean;
  /** A function that sets whether the dialog is open */
  setIsOpen: (isOpen: boolean) => void;
  /** The initial analysis name */
  initialAnalysisName: string;
  /** A function that renames the analysis */
  setAnalysisName: (name: string) => void;
  /** A function that redirects to the new analysis page */
  redirectToNewAnalysis: () => void;
}

export function AnalysisNameDialog({
  isOpen,
  setIsOpen,
  initialAnalysisName,
  setAnalysisName,
  redirectToNewAnalysis,
}: AnalysisNameDialogProps) {
  const [inputText, setInputText] = useState(initialAnalysisName);
  const [nameIsValid, setNameIsValid] = useState(true);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newText = event.target.value;
    setInputText(newText);
    // Currently the only requirement is no empty name
    newText.length > 0 ? setNameIsValid(true) : setNameIsValid(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setInputText(initialAnalysisName);
  };

  const handleContinue = async () => {
    // TypeScript says this `await` has no effect, but it seems to be required
    // for this function to finish before the page redirect
    await setAnalysisName(inputText);
    redirectToNewAnalysis();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleCancel}
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
          value={inputText}
          onChange={handleTextChange}
          error={!nameIsValid}
          // Currently the only requirement is no empty name
          helperText={nameIsValid ? ' ' : 'Name must not be blank'}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleContinue}
          color="primary"
          disabled={!nameIsValid}
        >
          {inputText === initialAnalysisName
            ? 'Continue'
            : 'Rename and continue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
