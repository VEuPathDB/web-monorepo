import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { cx } from './Utils';
import { useStudyRecord } from '../core';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Button, Tooltip, Icon } from '@material-ui/core';
import { LinkAttributeValue } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

export function EDAWorkspaceHeading() {
  const studyRecord = useStudyRecord();
  const { url } = useRouteMatch();
  return (
    <div className={cx('-Heading')}>
      <h1>{safeHtml(studyRecord.displayName)}</h1>
      <div className={cx('-Linkouts')}>
        <div>
          <Tooltip title="Create a new analysis">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Icon className="fa fa-plus" />}
              component={Link}
              to={
                url.endsWith(studyRecord.id[0].value)
                  ? `${url}/new`
                  : `${url}/../new`
              }
            >
              New
            </Button>
          </Tooltip>
        </div>
        {studyRecord.attributes.bulk_download_url && (
          <div>
            <Tooltip title="Download study files">
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Icon className="fa fa-download" />}
                component={Link}
                to={
                  (studyRecord.attributes
                    .bulk_download_url as LinkAttributeValue).url
                }
              >
                Download
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}
