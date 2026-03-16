import React, { useEffect, useState } from 'react';
import Loading from '../Loading/Loading';

type Props = {
  delayMs: number;
  children: React.ReactNode;
};

export function DelayedDisplay({ delayMs, children }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), delayMs);
    return () => clearTimeout(id);
  }, [delayMs]);

  return ready ? <>{children}</> : <Loading />;
}
