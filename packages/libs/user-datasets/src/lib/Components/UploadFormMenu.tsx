import React from "react";
import { Link, useRouteMatch } from "react-router-dom";
import { UploadFormConfig } from "./FormTypes";

import "./UploadFormMenu.scss";

interface Props {
  readonly availableTypes: readonly UploadFormConfig[];
}

export function UploadFormMenu(props: Props) {
  // Static UI Text
  const headerText = "Choose an upload type";

  const { url } = useRouteMatch();

  const typeConfigs = props.availableTypes.map(({ menuConfig, installer }) => <li>
    <Link to={url + "/" + installer.type.name} className="btn">
      <span className="fa fa-file-text title">{
        menuConfig.displayNameOverride?.(installer.type)
        ?? installer.type.displayName
      }</span>
      <span className="description">{menuConfig.description}</span>
    </Link>
  </li>);

  return (
    <div id="UserDatasetUploadFormMenu">
      <h2>{headerText}</h2>
      <menu>{typeConfigs}</menu>
    </div>
  );
}
