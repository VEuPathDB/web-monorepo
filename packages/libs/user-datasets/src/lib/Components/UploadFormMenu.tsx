import React from 'react';
import { DatasetUploadTypeConfigEntry } from '../Utils/types';
import { Link, useRouteMatch } from 'react-router-dom';

import './UploadFormMenu.scss';

interface Props {
  availableTypes: string[];
  datasetUploadTypes: Record<string, DatasetUploadTypeConfigEntry<string>>;
}

export function UploadFormMenu(props: Props) {
  const { availableTypes, datasetUploadTypes } = props;
  const { url } = useRouteMatch();
  return (
    <div className="UserDatasetUploadFormMenu">
      <h2>Choose an upload type</h2>
      <menu>
        {availableTypes.map((type) => {
          const datasetUploadType = datasetUploadTypes[type];
          return (
            datasetUploadType && (
              <li>
                <Link to={url + '/' + type} className="btn">
                  <div className="title">
                    <i className="fa fa-file-text" />{' '}
                    {datasetUploadType.displayName}
                  </div>
                  <div className="description">
                    {datasetUploadType.description}
                  </div>
                </Link>
              </li>
            )
          );
        })}
      </menu>
    </div>
  );
}
