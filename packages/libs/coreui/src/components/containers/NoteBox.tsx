import { css } from '@emotion/react';
import React, { ReactNode } from 'react';
import { error, warning, mutedBlue } from '../../definitions/colors';

export interface Props {
  type: 'info' | 'warning' | 'error';
  children: ReactNode;
}

const baseCss = css`
  border-left: 0.25em solid var(--note-box-border-color);
  border-radius: 0.25em;
  padding: 0.5em 1em;
  background: var(--note-box-bg-color);
  gap: 1em;
  margin-bottom: 1em;
`;

const infoCss = css`
  --note-box-bg-color: ${mutedBlue[100]};
  --note-box-border-color: ${mutedBlue[600]};
  ${baseCss};
`;

const warningCss = css`
  --note-box-bg-color: ${warning[100]};
  --note-box-border-color: ${warning[600]};
  font-weight: 500;
  ${baseCss};
`;

const errorCss = css`
  --note-box-bg-color: ${error[100]};
  --note-box-border-color: ${error[600]};
  font-weight: 500;
  ${baseCss};
`;

export function NoteBox(props: Props) {
  const finalCss =
    props.type === 'warning'
      ? warningCss
      : props.type === 'error'
      ? errorCss
      : infoCss;
  return <div css={finalCss}>{props.children}</div>;
}
