import { useEffect, useState } from 'react';
import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import Path from 'path';
import { cx } from './Utils';
import { useStudyRecord, AnalysisState, DEFAULT_ANALYSIS_NAME } from '../core';
import { getAnalysisId, isSavedAnalysis } from '../core/utils/analysis';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Button, Tooltip, Icon, makeStyles } from '@material-ui/core';
import { LinkAttributeValue } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { useAttemptActionCallback } from '@veupathdb/web-common/lib/hooks/dataRestriction';
import { Action } from '@veupathdb/web-common/lib/App/DataRestriction/DataRestrictionUtils';
import { AnalysisNameDialog } from './AnalysisNameDialog';

// Add custom styling for ebrc icons for better alignment in buttons
const useStyles = makeStyles((theme) => ({
  ebrcStartIcon: {
    marginTop: -3,
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

  const analysisId = getAnalysisId(analysis);

  useEffect(() => {
    setDialogIsOpen(false);
  }, [analysisId]);

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
                  className="Linkouts-buttons"
                  classes={{ startIcon: iconClasses.ebrcStartIcon }}
                  startIcon={<Icon className="ebrc-icon-download" />}
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
                className="Linkouts-buttons"
                startIcon={<Icon className="fa fa-plus fa-fw" />}
                onClick={
                  /** If we're in an unnamed saved analysis, show the renaming dialog.
                   *  Otherwise, just go straight to the new analysis.
                   */
                  isSavedAnalysis(analysis) &&
                  analysis.displayName === DEFAULT_ANALYSIS_NAME
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
                className="Linkouts-buttons"
                classes={{ startIcon: iconClasses.ebrcStartIcon }}
                startIcon={<Icon className="ebrc-icon-table" />}
                component={Link}
                to={'/eda?s=' + encodeURIComponent(studyRecord.displayName)}
              >
                My analyses
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
      {analysisState && isSavedAnalysis(analysis) && (
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
