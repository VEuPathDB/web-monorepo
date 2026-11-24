import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';

import { DatasetGetResponseBody } from '../../../../../Service/Model';
import { useUserDatasetRouterContext } from '../../../../../Controllers/UserDatasetRouterContext';

import { Attribute } from './Attribute';
import { diyUserDatasetIdToWdkRecordId } from '../../../../../Utils/diyDatasets';

/**
 * Names of the dataset types that this component should render for.
 */
const RELEVANT_TYPES: ReadonlyArray<string> = ['isasimple', 'stf'];

export type EdaLinkoutProps = {
  readonly dataset: DatasetGetResponseBody;
};

export const EdaLinkout = ({ dataset }: EdaLinkoutProps): ReactElement => {
  const { workspaceConfig: { fetchEdaStudyMetadata } } = useUserDatasetRouterContext();

  if (!RELEVANT_TYPES.includes(dataset.type.name)) {
    return <></>;
  }

  const wdkDatasetId = diyUserDatasetIdToWdkRecordId(dataset.datasetId);
  const { workspaceUrl, mapUrl } = fetchEdaStudyMetadata(wdkDatasetId);

  return (
    <Attribute label="Explore">
      <ul className="eda-linkout">
        {!workspaceUrl ? null : (
          <li>
            <Link to={workspaceUrl}>Browse and visualize</Link>
            <br />
          </li>
        )}
        {!workspaceUrl ? null : (
          <li>
            <Link to={`${workspaceUrl}/details`}>User dataset details</Link>
          </li>
        )}
        {!mapUrl ? null : (
          <li>
            <Link to={mapUrl}>
              <i className="ebrc-icon-edaIcon"></i> Explore in MapVEu
            </Link>
          </li>
        )}
      </ul>
    </Attribute>
  )
};