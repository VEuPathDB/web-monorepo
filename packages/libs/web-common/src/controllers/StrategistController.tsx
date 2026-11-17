import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, RouteComponentProps } from 'react-router';

import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { pathfinderUrl, rootUrl } from '../config';

import Strategist from '../components/Strategist';

type StrategistControllerProps = RouteComponentProps<{}>;

export const StrategistController = (props: StrategistControllerProps) => {
  useStrategistDocumentTitle();
  const { location, match } = props;
  const subPath = location.pathname
    .slice(match.url.length)
    .replace(/^\/+/, '/');
  const src = pathfinderUrl.replace(/\/+$/, '') + subPath + location.search;
  return <Strategist src={src} appBase={rootUrl} />;
};

export const StrategistRedirect = ({ location }: StrategistControllerProps) => (
  <Redirect
    to={{
      pathname: location.pathname.replace(/^\/pathfinder/i, '/strategist'),
      search: location.search,
      hash: location.hash,
    }}
  />
);

const useStrategistDocumentTitle = () => {
  const projectDisplayName = useSelector(
    (state: RootState) =>
      state.globalData.config && state.globalData.config.displayName
  );

  const title = projectDisplayName
    ? `${projectDisplayName} :: VEuPathDB Strategist`
    : 'VEuPathDB Strategist';

  useSetDocumentTitle(title);
};
