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

export default function AnalysisNameDialog({
  isOpen,
  setIsOpen,
  initialAnalysisName,
  setAnalysisName,
  redirectToNewAnalysis,
}: AnalysisNameDialogProps) {
  const [inputText, setInputText] = useState(initialAnalysisName);
  const [continueText, setContinueText] =
    useState<'Continue' | 'Rename and continue'>('Continue');
  const [nameIsValid, setNameIsValid] = useState(true);
  const [disableButtons, setDisableButtons] = useState(false);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newText = event.target.value;
    setInputText(newText);
    setContinueText(
      newText === initialAnalysisName ? 'Continue' : 'Rename and continue'
    );
    // Currently the only requirement is no empty name
    newText.length > 0 ? setNameIsValid(true) : setNameIsValid(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setInputText(initialAnalysisName);
  };

  const handleContinue = () => {
    setDisableButtons(true);
    setAnalysisName(inputText);
    // The timeout for saving an analysis is 1 second,
    // so wait a bit longer than that
    setTimeout(redirectToNewAnalysis, 1200);
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
          disabled={disableButtons}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCancel}
          color="secondary"
          disabled={disableButtons}
        >
          Cancel
        </Button>
        <Button
          onClick={handleContinue}
          color="primary"
          disabled={!nameIsValid || disableButtons}
        >
          {continueText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
