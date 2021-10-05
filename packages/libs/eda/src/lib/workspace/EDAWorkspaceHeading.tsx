import React, { useState } from 'react';
import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import Path from 'path';
import { cx } from './Utils';
import { useAnalysis, useStudyRecord, AnalysisState } from '../core';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Button, Tooltip, Icon } from '@material-ui/core';
import { LinkAttributeValue } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { useAttemptActionCallback } from '@veupathdb/web-common/lib/hooks/dataRestriction';
import { Action } from '@veupathdb/web-common/lib/App/DataRestriction/DataRestrictionUtils';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { TextField } from '@material-ui/core';

interface ChangeAnalysisNameDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialAnalysisName: string;
  setAnalysisName: (name: string) => void;
  redirectToNewAnalysis: () => void;
}

interface AnalysisHeadingProps {
  analysisId: string;
}

interface BaseHeadingProps {
  analysisState?: AnalysisState;
}

export function ChangeAnalysisNameDialog({
  isOpen,
  setIsOpen,
  initialAnalysisName,
  setAnalysisName,
  redirectToNewAnalysis,
}: ChangeAnalysisNameDialogProps) {
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

export function AnalysisEDAWorkspaceHeading({
  analysisId,
}: AnalysisHeadingProps) {
  const analysisState = useAnalysis(analysisId);
  return <EDAWorkspaceHeading analysisState={analysisState} />;
}

export function EDAWorkspaceHeading({ analysisState }: BaseHeadingProps) {
  const studyRecord = useStudyRecord();
  const attemptAction = useAttemptActionCallback();
  const analysis = analysisState?.analysis;
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const { url } = useRouteMatch();
  const redirectURL = url.endsWith(studyRecord.id[0].value)
    ? `${url}/new`
    : Path.resolve(url, '../new');
  const history = useHistory();
  const redirectToNewAnalysis = () => history.push(redirectURL);

  return (
    <>
      <div className={cx('-Heading')}>
        <h1>{safeHtml(studyRecord.displayName)}</h1>
        <div className={cx('-Linkouts')}>
          {studyRecord.attributes.bulk_download_url && (
            <div>
              <Tooltip title="Download study files">
                <Button
                  variant="text"
                  color="primary"
                  startIcon={<Icon className="fa fa-download fa-fw" />}
                  type="button"
                  onClick={() => {
                    attemptAction(Action.download, {
                      studyId: studyRecord.id[0].value,
                      onAllow: () => {
                        window.location.href = (studyRecord.attributes
                          .bulk_download_url as LinkAttributeValue).url;
                      },
                    });
                  }}
                >
                  &nbsp;Download
                </Button>
              </Tooltip>
            </div>
          )}
          <div>
            <Tooltip title="Create a new analysis">
              <Button
                variant="text"
                color="primary"
                startIcon={<Icon className="fa fa-plus fa-fw" />}
                onClick={
                  analysis && analysis.displayName === 'Unnamed Analysis'
                    ? () => setDialogIsOpen(true)
                    : redirectToNewAnalysis
                }
              >
                New analysis
              </Button>
            </Tooltip>
          </div>
          <div>
            <Tooltip title="View all your analyses of this study">
              <Button
                variant="text"
                color="primary"
                startIcon={<Icon className="fa fa-table fa-fw" />}
                component={Link}
                to={'/eda?s=' + encodeURIComponent(studyRecord.displayName)}
              >
                My analyses
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
      {analysisState && analysis && (
        <ChangeAnalysisNameDialog
          isOpen={dialogIsOpen}
          setIsOpen={setDialogIsOpen}
          initialAnalysisName={analysis.displayName}
          setAnalysisName={analysisState.setName}
          redirectToNewAnalysis={redirectToNewAnalysis}
        />
      )}
    </>
  );
}
