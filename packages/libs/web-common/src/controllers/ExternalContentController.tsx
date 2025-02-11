import React, { useEffect, useRef } from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { usePromise } from '@veupathdb/wdk-client/lib/Hooks/PromiseHook';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

interface Props {
  url: string;
}

const EXTERNAL_CONTENT_CONTROLLER_CLASSNAME = 'ExternalContentController';

export default function ExternalContentController(props: Props) {
  const { url } = props;
  const ref = useRef<HTMLDivElement>(null);

  const { value: content } = usePromise(async () => {
    try {
      const response = await fetch(`https://${url}`, { mode: 'cors' });
      if (response.ok) return response.text();
      return `<h1>${response.statusText}</h1>`;
    } catch (error) {
      console.error(error);
      return `<h1>Oops... something went wrong.</h1>`;
    }
  }, [url]);

  useEffect(() => {
    if (content == null || ref.current == null) return;

    try {
      if (window.location.hash) {
        const fragementId = window.location.hash.slice(1);
        const querySelector = `[id=${fragementId}], [name=${fragementId}]`;
        // open detail with id or name attribute matching location.hash
        const target = ref.current.querySelector(querySelector);
        if (target instanceof HTMLDetailsElement) {
          target.open = true;
        }
        // scroll to element identified by hash
        if (target instanceof HTMLElement) {
          target.scrollIntoView();
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [content]);

  if (content == null) return <Loading />;

  return safeHtml(
    content,
    {
      className: EXTERNAL_CONTENT_CONTROLLER_CLASSNAME,
      ref,
    },
    'div'
  );
}
