import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import Path from 'path';
import { cx } from './Utils';
import { useStudyRecord } from '../core';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Button, Tooltip, Icon } from '@material-ui/core';
import { LinkAttributeValue } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { useAttemptActionCallback } from '@veupathdb/web-common/lib/hooks/dataRestriction';
import { Action } from '@veupathdb/web-common/lib/App/DataRestriction/DataRestrictionUtils';

export function EDAWorkspaceHeading() {
  const studyRecord = useStudyRecord();
  const { url } = useRouteMatch();
  const attemptAction = useAttemptActionCallback();
  return (
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
              component={Link}
              to={
                url.endsWith(studyRecord.id[0].value)
                  ? `${url}/new`
                  : Path.resolve(url, '../new')
              }
            >
              New analysis
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
