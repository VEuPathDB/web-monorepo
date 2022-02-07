import { css } from '@emotion/react';
import { gray } from '../definitions/colors';

export const primaryFont = "'Inter', sans-serif";
export const secondaryFont = '"Roboto", sans-serif';

export const h1 = css([
  { fontFamily: primaryFont },
  {
    fontSize: 72,
    fontWeight: 700,
    MozOsxFontSmoothing: 'auto',
    WebkitFontSmoothing: 'auto',
  },
]);
export const h2 = css([
  { fontFamily: primaryFont },
  {
    fontSize: 56,
    fontWeight: 700,
    MozOsxFontSmoothing: 'auto',
    WebkitFontSmoothing: 'auto',
  },
]);
export const h3 = css([
  { fontFamily: primaryFont },
  {
    fontSize: 42,
    fontWeight: 600,
    MozOsxFontSmoothing: 'auto',
    WebkitFontSmoothing: 'auto',
  },
]);
export const h4 = css([
  { fontFamily: primaryFont },
  {
    fontSize: 32,
    fontWeight: 600,
    MozOsxFontSmoothing: 'auto',
    WebkitFontSmoothing: 'auto',
  },
]);
export const h5 = css([
  { fontFamily: primaryFont },
  {
    fontSize: 21,
    fontWeight: 500,
    MozOsxFontSmoothing: 'auto',
    WebkitFontSmoothing: 'auto',
  },
]);
export const h6 = css([
  { fontFamily: primaryFont },
  {
    fontSize: 16,
    fontWeight: 500,
    MozOsxFontSmoothing: 'auto',
    WebkitFontSmoothing: 'auto',
  },
]);

export const p = css([
  { fontFamily: secondaryFont },
  {
    fontSize: '0.8rem',
    fontWeight: 400,
    MozOsxFontSmoothing: 'auto',
    WebkitFontSmoothing: 'auto',
  },
]);
export const pre = css([
  { fontFamily: secondaryFont },
  {
    fontSize: '.80rem',
    fontWeight: 400,
    MozOsxFontSmoothing: 'auto',
    WebkitFontSmoothing: 'auto',
  },
]);
export const label = css([
  { fontFamily: secondaryFont },
  {
    fontSize: '.75rem',
    fontWeight: 400,
    MozOsxFontSmoothing: 'auto',
    WebkitFontSmoothing: 'auto',
    color: gray[400],
  },
]);

export const metaData = css([
  { fontFamily: secondaryFont },
  {
    fontSize: '.70rem',
    fontWeight: 400,
    textTransform: 'uppercase',
    color: gray[300],
    MozOsxFontSmoothing: 'auto',
    WebkitFontSmoothing: 'auto',
  },
]);

export const th = css([
  { fontFamily: secondaryFont },
  {
    fontSize: '.90rem',
    fontWeight: 500,
    MozOsxFontSmoothing: 'auto',
    WebkitFontSmoothing: 'auto',
  },
]);
export const td = css([
  { fontFamily: secondaryFont },
  {
    fontSize: '.90rem',
    fontWeight: 400,
    MozOsxFontSmoothing: 'auto',
    WebkitFontSmoothing: 'auto',
  },
]);

export default {
  primaryFont,
  secondaryFont,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  label,
  metaData,
  p,
  pre,
  th,
  td,
};
