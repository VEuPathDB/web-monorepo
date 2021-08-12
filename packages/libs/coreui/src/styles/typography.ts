import { css } from '@emotion/react';

export const primaryFont = css({ fontFamily: "'Poppins', sans-serif" });
export const secondaryFont = css({ fontFamily: 'sans-serif' });

export const h1 = css([primaryFont, { fontSize: '4.209rem', fontWeight: 500 }]);
export const h2 = css([primaryFont, { fontSize: '3.157rem', fontWeight: 400 }]);
export const h3 = css([primaryFont, { fontSize: '2.369rem', fontWeight: 400 }]);
export const h4 = css([primaryFont, { fontSize: '1.777rem', fontWeight: 400 }]);
export const h5 = css([primaryFont, { fontSize: '1.333rem', fontWeight: 400 }]);

export const p = css([secondaryFont]);
export const pre = css([{ fontSize: '.80rem' }]);

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
};
