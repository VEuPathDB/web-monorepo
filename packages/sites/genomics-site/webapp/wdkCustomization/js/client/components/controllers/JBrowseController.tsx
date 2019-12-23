import React, { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router';

import { RootState } from 'wdk-client/Core/State/Types';
import { useSetDocumentTitle } from 'wdk-client/Utils/ComponentUtils';

type JBrowseControllerProps = RouteComponentProps<{}>;

type WindowWithJBrowse = Window & { JBrowse: any };

export const JBrowseController = (props: JBrowseControllerProps) => {
  useJBrowseDocumentTitle();

  const onLoad = useCallback((e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    const JBrowse = (e.currentTarget.contentWindow as WindowWithJBrowse).JBrowse;
    JBrowse.subscribe('/jbrowse/v1/n/navigate', function() {
      const shareURL = JBrowse.makeCurrentViewURL();
      const parser = new URL(shareURL);
      window.history.replaceState( {}, "", parser.search );
    });
  }, []);

  return (
    <iframe
      onLoad={onLoad}
      id="jbrowse_iframe" 
      src={`/a/jbrowse/index.html${props.location.search}`}
      width='100%' 
      height='100%' 
      scrolling='no' 
      allowFullScreen
    >
    </iframe>
  );
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
