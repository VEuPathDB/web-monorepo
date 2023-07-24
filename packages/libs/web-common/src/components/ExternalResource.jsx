import React, { useEffect, useState } from 'react';
import { Loading } from '@veupathdb/wdk-client/lib/Components';

const containerStyle = {
  position: 'relative',
  display: 'inline-block',
  minHeight: '4em',
};

const loadingStyle = {
  backgroundColor: '#0000001c',
  boxShadow: '0 0 4px #0000003d',
  position: 'absolute',
  height: 'auto',
  width: 'auto',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

// Wraps child component with loading status
// Child should be one of the following types of copmonents: `iframe`, `object`, `img`
export default function ExternalResource(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const key = getKey(props.children);

  useEffect(() => {
    setIsLoading(true);
  }, [key]);

  const child = React.cloneElement(props.children, {
    key,
    onLoad: () => {
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
      setIsError(true);
    },
  });

  return (
    <ExternalResourceContainer isLoading={isLoading} isError={isError}>
      {child}
    </ExternalResourceContainer>
  );
}

export function ExternalResourceContainer(props) {
  return (
    <div style={containerStyle}>
      {props.children}
      {props.isLoading ? <Loading style={loadingStyle} /> : null}
      {props.isError ? <em>Could not load resource.</em> : null}
    </div>
  );
}

function getKey(element) {
  if (element && element.props.key) return element.props.key;

  switch (element && element.type) {
    case 'object':
      return element.props.data;
    case 'iframe':
    case 'img':
      return element.props.src;
    default:
      return 'uknown';
  }
}
