import React, { useEffect, useRef } from 'react';
import { usePromise } from '@veupathdb/wdk-client/lib/Hooks/PromiseHook';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Loading } from '@veupathdb/wdk-client/lib/Components';

interface Props {
  url: string;
}

const EXTERNAL_CONTENT_CONTROLLER_CLASSNAME = 'ExternalContentController';

export default function ExternalContentController(props: Props) {
  const { url } = props;
  const ref = useRef<HTMLDivElement>(null);

  const { value: content } = usePromise(async () => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (response.ok) return response.text();
      return `<h1>${response.statusText}</h1>`;
    }
    catch (error) {
      console.error(error);
      return `<h1>Oops... something went wrong.</h1>`;
    }
  }, [ url ]);

  useEffect(() => {
    if (content == null || ref.current == null) return;

    try {
      if (location.hash) {
        // open detail with id matching location.hash
        const target = ref.current.querySelector(location.hash);
        if (target instanceof HTMLDetailsElement) {
          target.open = true;
        }
        // scroll to element identified by hash
        location.assign(location.hash);
      }
    }
    catch(error) {
      console.error(error);
    }
  }, [ location.hash, content ]);

  if (content == null) return <Loading/>;

  return safeHtml(
    content,
    {
      className: EXTERNAL_CONTENT_CONTROLLER_CLASSNAME,
      ref
    },
    'div'
  );
}
