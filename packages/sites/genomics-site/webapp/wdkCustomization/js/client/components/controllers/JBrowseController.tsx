import React from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router';

import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { webAppUrl } from '@veupathdb/web-common/lib/config';

import Jbrowse from '../Jbrowse';

type JBrowseControllerProps = RouteComponentProps<{}>;

export const JBrowseController = (props: JBrowseControllerProps) => {
  useJBrowseDocumentTitle();
  const src = webAppUrl + '/jbrowse/index.html' + props.location.search;
  return <Jbrowse src={src}/>
};

const useJBrowseDocumentTitle = () => {
  const projectDisplayName = useSelector(
    (state: RootState) => (
      state.globalData.config && 
      state.globalData.config.displayName  
    )
  );
  
  const title = projectDisplayName
    ? `${projectDisplayName} :: JBrowse`
    : 'JBrowse';

  useSetDocumentTitle(title);
};
