import React, { useEffect, useRef } from 'react';

import './Strategist.scss';

interface Props {
  src: string;
  appBase: string;
}

export default function Strategist(props: Props) {
  const { appBase } = props;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function updateUrl(event: MessageEvent) {
      const { type, path } = event.data ?? {};
      if (
        event.origin !== window.location.origin ||
        event.source !== iframeRef.current?.contentWindow ||
        type !== 'pathfinder:location' ||
        typeof path !== 'string' ||
        !path.startsWith('/')
      )
        return;
      window.history.replaceState(
        window.history.state,
        '',
        appBase + '/strategist' + path
      );
    }
    window.addEventListener('message', updateUrl);
    return () => window.removeEventListener('message', updateUrl);
  }, [appBase]);

  return (
    <iframe
      ref={iframeRef}
      title="VEuPathDB Strategist"
      id="strategist_iframe"
      src={props.src}
      width="100%"
      height="100%"
    ></iframe>
  );
}
