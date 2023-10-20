import React, { useEffect, useRef } from 'react';
import { TidyTree } from 'tidytree';

export default function TidyTreeController() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current == null) return;
    import('../newick-example').then((module) => {
      if (ref.current == null) return; // In case this component was unmounted before the Promise resolves
      new TidyTree(module.newick, { parent: ref.current });
    });
  }, []);
  return (
    <div
      style={{
        height: '70vh',
        width: '80vh',
        margin: 'auto',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          width: '1800px',
          height: '8000px',
          overflow: 'hidden',
        }}
        ref={ref}
      />
    </div>
  );
}
