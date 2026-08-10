import React, { CSSProperties, ReactElement } from 'react';
import { CitationLookupStatus } from './utils';
import { useUITheme } from '@veupathdb/coreui/src/components/theming';

interface CitationResultProps {
  readonly result: CitationLookupStatus;
}

export function CitationResult({ result }: CitationResultProps): ReactElement {
  const theme = useUITheme()?.palette?.error;

  let content: string;
  let prefix: ReactElement | undefined;
  let style: CSSProperties | undefined;

  switch (result?.status) {
    case 'loading':
      prefix = <i className="fa fa-spinner fa-pulse"></i>;
      content = 'loading...';
      break;
    case 'not-found':
      content = 'publication not found';
      style = { color: theme?.hue?.['600'], fontWeight: 'bold' };
      break;
    case 'error':
      prefix = <i className="fa fa-exclamation-circle"></i>;
      content = 'publication lookup failed';
      style = { color: theme?.hue?.['600'], fontWeight: 'bold' };
      break;
    case 'success':
      content = result.citation;
      break;
    default:
      content = '';
      break;
  }

  return (
    <span style={style}>
      {prefix} {content}
    </span>
  );
}
