import React, { ReactElement } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';

import './UploadFormMenu.scss';
import { DatasetTypeConfig } from '../../Common/Configuration';
import { stringifyDataType } from '../../Common/Configuration/data-types';
import { projectId } from '../../config';
import { isGenomicsProjectId } from '@veupathdb/wdk-client/lib/Utils/ProjectConstants';

export interface UploadTypeMenuProps {
  readonly availableDataTypes: readonly DatasetTypeConfig[];
}

export function UploadTypeMenu(props: UploadTypeMenuProps): ReactElement {
  const { url } = useRouteMatch();

  // TODO - FIXME : This value should be pulled from config or the backend but
  //  there does not presently seem to be a reliable way to fetch the URL of
  //  another project.  The function `useProjectUrl` exists, but it relies on
  //  the WDK's `/service` endpoint which does not report all project URLs, and
  //  would need backend changes to do so.
  const dataExplorerUrl = 'https://dataexplorer.org';

  return (
    <div id="dataset-type-selection">
      {isGenomicsProjectId(projectId) && (
        <p>
          <i>
            Select the data type that corresponds to the data you are uploading.
          </i>
        </p>
      )}
      <menu>
        {props.availableDataTypes.map((type) => (
          <UploadTypeMenuItem
            key={`${stringifyDataType(type)}`}
            url={url}
            dataType={type}
          />
        ))}
      </menu>
      {isGenomicsProjectId(projectId) && (
        <p>
          <i>
            For exploration and sharing of general tab-delimited datasets,
            please use <a href={dataExplorerUrl}>dataExplorer.org</a>. If your
            data do not fit one of the supported upload types, please{' '}
            <Link to="/contact-us">Contact Us</Link> for assistance.
          </i>
        </p>
      )}
    </div>
  );
}

interface MenuItemProps {
  readonly url: string;
  readonly dataType: DatasetTypeConfig;
}

function UploadTypeMenuItem({ url, dataType }: MenuItemProps): ReactElement {
  const displayName = dataType.displayName ?? dataType.vdiConfig.category;

  return (
    <li>
      <Link to={url + '/' + stringifyDataType(dataType)} className="btn">
        <div className="title">
          <i className="fa fa-file-text" /> {displayName}
        </div>
        <div className="description">{dataType.description}</div>
      </Link>
    </li>
  );
}
