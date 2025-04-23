import { css } from '@emotion/react';
import React from 'react';

export interface DimmableProps {
  /** When true, show the semi-transparent overlay */
  dimmed: boolean;
  /** if true, overlay covers the entire screen (for portal/modal content) */
  fullscreen?: boolean;
  /** If true, overlay will block clicks; otherwise clicks pass through */
  blocking?: boolean;
  /** z-index of the overlay (useful if you nest multiple layers) */
  overlayZIndex?: number;
  children: React.ReactNode;
}

export default function Dimmable({
  dimmed,
  blocking = false,
  overlayZIndex = 1,
  children,
  fullscreen = false,
}: DimmableProps) {
  return (
    <div
      css={css`
        position: ${fullscreen ? `static` : `relative`};
      `}
    >
      {dimmed && (
        <div
          css={css`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.1);
            z-index: ${overlayZIndex};
            pointer-events: ${blocking ? 'all' : 'none'};
          `}
        />
      )}
      {children}
    </div>
  );
}
