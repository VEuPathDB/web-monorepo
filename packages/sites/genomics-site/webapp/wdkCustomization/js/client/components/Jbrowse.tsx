import React, { useCallback } from 'react';

import './Jbrowse.scss';

interface Props {
  src: string;
}

type WindowWithJBrowse = Window & { JBrowse: any };

export default function Jbrowse(props: Props) {
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
      src={props.src}
      width="100%" 
      height="100%" 
      scrolling="no" 
      allowFullScreen
    >
    </iframe>
  );
}
