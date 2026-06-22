import { isEmpty } from 'lodash';
import React, { ReactElement } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';
import { DatasetUploadController } from './DatasetUploadController';
import { DatasetFormRouteProps } from '../../Common/Forms/DatasetFormRouteProps';
import { UserDatasetRoutes } from '../../Controllers/UserDatasetRouter';

export function DatasetUploadRoute(props: DatasetFormRouteProps): ReactElement {
  const disclaimerContent = isEmpty(props.urlParams) ? undefined : (
    <div style={{ width: '100%', paddingBottom: 20 }}>
      <div style={{ paddingBottom: 5, textAlign: 'center' }}>
        Afterwards, you will be taken back to an upload page with these details:
      </div>

      <ul style={{ listStyle: 'none' }}>
        {Object.entries(props.urlParams).map(newDisclaimerListItem)}
      </ul>
    </div>
  );

  return (
    <WdkRoute
      requiresLogin
      exact
      path={`${props.baseUrl}${UserDatasetRoutes.NewDatasetSuffix}`}
      component={(childProps: RouteComponentProps<{ type?: string }>) => (
        <DatasetUploadController
          {...props}
          type={childProps.match.params.type}
          datasetTypes={props.datasetTypes}
        />
      )}
      disclaimerProps={{
        toDoWhatMessage: `To upload your dataset`,
        extraParagraphContent: disclaimerContent,
      }}
    />
  );
}

function newDisclaimerListItem([key, value]: [string, string]): ReactElement {
  return (
    <li
      key={`${key} ${value}`}
      style={{
        paddingBottom: 5,
        maxWidth: '100%',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontWeight: 'bold' }}>
        {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ') + ': '}
      </span>
      <code style={{ verticalAlign: 'bottom' }}>{value.trim()}</code>
    </li>
  );
}
