import React, { ReactElement } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';

import './UploadFormMenu.scss';
import { DatasetTypeConfig } from '../Configuration';
import { stringifyDataType } from '../Configuration/data-types';

export interface UploadTypeMenuProps {
  readonly availableDataTypes: readonly DatasetTypeConfig[];
}

export function UploadTypeMenu({ availableDataTypes }: UploadTypeMenuProps) {
  const { url } = useRouteMatch();

  return (
    <div id="dataset-type-selection">
      <h2>Choose an upload type</h2>
      <menu>
        {availableDataTypes.map((type) => (
          <UploadTypeMenuItem
            key={`${stringifyDataType(type)}`}
            url={url}
            dataType={type}
          />
        ))}
      </menu>
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
