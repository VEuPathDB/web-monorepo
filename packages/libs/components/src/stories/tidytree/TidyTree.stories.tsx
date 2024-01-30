import React, { useEffect, useRef } from 'react';
import { Meta, Story } from '@storybook/react';
import { TidyTree } from 'tidytree';

function TidyTreeComponent() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current == null) return;
    import('./newick-example').then((module) => {
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

export default {
  title: 'TidyTree',
  component: TidyTreeComponent,
  parameters: {},
} as Meta;

export const Basic = () => <TidyTreeComponent />;
