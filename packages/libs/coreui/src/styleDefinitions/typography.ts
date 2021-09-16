import { css } from '@emotion/react';

export const primaryFont = css({ fontFamily: "'Inter', sans-serif" });
export const secondaryFont = css({ fontFamily: '"Roboto", sans-serif' });

export const h1 = css([primaryFont, { fontSize: '4.209rem', fontWeight: 700 }]);
export const h2 = css([primaryFont, { fontSize: '3.157rem', fontWeight: 600 }]);
export const h3 = css([primaryFont, { fontSize: '2.369rem', fontWeight: 600 }]);
export const h4 = css([primaryFont, { fontSize: '1.777rem', fontWeight: 500 }]);
export const h5 = css([primaryFont, { fontSize: '1.333rem', fontWeight: 500 }]);

export const p = css([secondaryFont, { fontSize: '1rem', fontWeight: 400 }]);
export const pre = css([secondaryFont, { fontSize: '.80rem' }]);

export const th = css([secondaryFont, { fontSize: '.90rem', fontWeight: 500 }]);
export const td = css([secondaryFont, { fontSize: '.90rem', fontWeight: 400 }]);

export default {
  primaryFont,
  secondaryFont,
  h1,
  h2,
  h3,
  h4,
  h5,
  p,
  pre,
  th,
  td,
};
