import { Checkbox, HelpIcon } from '@veupathdb/wdk-client/lib/Components';
import React, { SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  jbrowseUrl: string;
  height: string;
}

interface JbrowseView {
  behaviorManager: {
    removeAll: () => void;
    initialize: () => void;
  }
}

declare global {
  interface Window {
    JBrowse: {
      view: JbrowseView;
      afterMilestone: (
        milestoneName: string,
        callback: (() => void)
      ) => void;
    }
  }
}

export function JbrowseIframe(props: Props) {
  const { jbrowseUrl, height } = props;
  const [ isLocked, setIsLocked ] = useState(true);
  const onCheckboxToggle = useCallback(
    newIsUnlockedValue => {
      setIsLocked(!newIsUnlockedValue);
    },
    []
  );

  const jbrowseViewContainer = useRef<JbrowseView>();
  const lockText = (
    <small className="jbrowse-scroll-zoom-toggle-caption">
      Scroll and zoom
      {' '}
      <HelpIcon>
        <>
          Select to enable using mouse / track pad for scrolling &amp; zoom
          <br />
          (double click to zoom in; shift-double click to zoom out)
        </>
      </HelpIcon>
    </small>
  );

  useEffect(() => {
    updateBehaviors();
  }, [ isLocked ]);

  function onLoad(event: SyntheticEvent<HTMLIFrameElement>) {
    const JBrowse = event.currentTarget.contentWindow?.JBrowse
    if (JBrowse == null) throw new Error("Could not load embedded JBrowse instance.");
    JBrowse.afterMilestone('completely initialized', function() {
      jbrowseViewContainer.current = JBrowse.view;
      updateBehaviors();
    });
  }

  function updateBehaviors() {
    const view = jbrowseViewContainer.current;
    if (view == null) return;
    if (isLocked) view.behaviorManager.removeAll();
    else view.behaviorManager.initialize();
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: '0.5em'
        }}
      >
        <label className="jbrowse-scroll-zoom-toggle">
          <Checkbox
            style={{ marginRight: '0.25em' }}
            value={!isLocked}
            onChange={onCheckboxToggle}
          />
          {lockText}
        </label>
      </div>
      <iframe onLoad={onLoad} src={jbrowseUrl + "&tracklist=0&nav=1&overview=0&fullviewlink=0&menu=0"} width="100%" height={height} scrolling="no" allowFullScreen={false} />
    </div>
  );
}
