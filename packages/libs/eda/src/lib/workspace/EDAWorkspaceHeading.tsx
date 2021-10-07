import React, { useState } from 'react';
import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import Path from 'path';
import { cx } from './Utils';
import { useStudyRecord, AnalysisState, DEFAULT_ANALYSIS_NAME } from '../core';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Button, Tooltip, Icon, makeStyles } from '@material-ui/core';
import { LinkAttributeValue } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { useAttemptActionCallback } from '@veupathdb/web-common/lib/hooks/dataRestriction';
import { Action } from '@veupathdb/web-common/lib/App/DataRestriction/DataRestrictionUtils';
import { AnalysisNameDialog } from './AnalysisNameDialog';

// Add custom styling for ebrc icons for better alignment in buttons
const useStyles = makeStyles((theme) => ({
  ebrcStartIcon: {
    marginTop: -5,
  },
}));

interface EDAWorkspaceHeadingProps {
  /** Optional AnalysisState for "New analysis" button functionality */
  analysisState?: AnalysisState;
}

export function EDAWorkspaceHeading({
  analysisState,
}: EDAWorkspaceHeadingProps) {
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
  const iconClasses = useStyles();

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
                  /** If (1) there is no analysis, (2) we're in an unsaved new
                   * analysis (here `analysis` is still undefined in this case),
                   * or (3) we're in a renamed analysis, just go straight to the
                   * new analysis. Otherwise, show the renaming dialog. */
                  analysis && analysis.displayName === DEFAULT_ANALYSIS_NAME
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
                classes={{ startIcon: iconClasses.ebrcStartIcon }}
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
        <AnalysisNameDialog
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
