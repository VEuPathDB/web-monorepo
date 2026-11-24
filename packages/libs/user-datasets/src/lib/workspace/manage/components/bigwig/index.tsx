import React, { JSXElementConstructor } from 'react';

import { Compatibility, CompatibilityProps } from './Compatibility';
import { Tracks, TracksProps } from './Tracks';

export type BigwigPostfixSectionsProps = CompatibilityProps & TracksProps;

export const BigwigPostfixSections: JSXElementConstructor<BigwigPostfixSectionsProps> =
  (props: BigwigPostfixSectionsProps) => (
    <>
      <Compatibility {...props} />
      <Tracks {...props} />
    </>
  );