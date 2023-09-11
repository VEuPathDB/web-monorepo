import React, { useCallback } from 'react';

import './Jbrowse.scss';

interface Props {
  src: string;
}

type WindowWithJBrowse = Window & { JBrowse: any };

export default function Jbrowse(props: Props) {
  const onLoad = useCallback(
    (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
      const JBrowse = (e.currentTarget.contentWindow as WindowWithJBrowse)
        .JBrowse;
      if (JBrowse == null)
        throw new Error('Could not load embedded JBrowse instance.');
      JBrowse.subscribe('/jbrowse/v1/n/navigate', updateUrl);
      JBrowse.subscribe('/jbrowse/v1/n/tracks/new', updateUrl);
      JBrowse.subscribe('/jbrowse/v1/n/tracks/replace', updateUrl);
      JBrowse.subscribe('/jbrowse/v1/n/tracks/delete', updateUrl);
      JBrowse.subscribe('/jbrowse/v1/n/tracks/pin', updateUrl);
      JBrowse.subscribe('/jbrowse/v1/n/tracks/unpin', updateUrl);
      JBrowse.subscribe('/jbrowse/v1/n/tracks/visibleChanged', updateUrl);
      JBrowse.subscribe(
        '/jbrowse/v1/n/tracks/globalHighlightChanged',
        updateUrl
      );
      JBrowse.subscribe('/jbrowse/v1/n/tracks/redraw', updateUrl);
      JBrowse.subscribe('/jbrowse/v1/n/tracks/redrawFinished', updateUrl);
      JBrowse.subscribe('/jbrowse/v1/n/tracks/focus', updateUrl);
      JBrowse.subscribe('/jbrowse/v1/n/tracks/unfocus', updateUrl);

      function updateUrl() {
        const shareURL = JBrowse.makeCurrentViewURL();
        const parser = new URL(shareURL);
        window.history.replaceState({}, '', parser.search);
      }
    },
    []
  );

  return (
    <iframe
      onLoad={onLoad}
      id="jbrowse_iframe"
      src={props.src}
      width="100%"
      height="100%"
      scrolling="no"
      allowFullScreen
    ></iframe>
  );
}
