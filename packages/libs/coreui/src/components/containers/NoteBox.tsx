import { css } from '@emotion/react';
import React, { ReactNode } from 'react';
import { error, warning, mutedBlue } from '../../definitions/colors';
import { Error, Info, Warning } from '@material-ui/icons';

export interface Props {
  type: 'info' | 'warning' | 'error';
  showIcon?: boolean;
  children: ReactNode;
}

const baseCss = css`
  border-left: 0.35em solid var(--note-box-border-color);
  border-radius: 0.25em;
  padding: 1em 3em;
  background: var(--note-box-bg-color);
  gap: 1em;
  margin-bottom: 1em;
  position: relative;
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

const iconCss = css`
  position: absolute;
  left: 0.5em;
  font-size: 1.5em;
`;

export function NoteBox(props: Props) {
  const finalCss =
    props.type === 'warning'
      ? warningCss
      : props.type === 'error'
      ? errorCss
      : infoCss;

  const Icon =
    props.showIcon === true
      ? props.type === 'info'
        ? Info
        : props.type === 'warning'
        ? Warning
        : props.type === 'error'
        ? Error
        : null
      : null;
  return (
    <div css={finalCss}>
      {Icon ? <Icon css={iconCss} /> : null} {props.children}
    </div>
  );
}
