import { keyframes } from '@emotion/react';
import { Keyframes } from '@emotion/serialize';

export const spin: Keyframes = keyframes({
  from: {
    transform: 'rotate(0deg)',
  },
  to: {
    transform: 'rotate(359deg)',
  },
});

export const fadeIn: Keyframes = keyframes({
  from: {
    opacity: 0,
  },
  to: {
    opacity: 1,
  },
});

export const fadeOut: Keyframes = keyframes({
  from: {
    opacity: 1,
  },
  to: {
    opacity: 0,
  },
});
