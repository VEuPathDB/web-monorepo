import React from 'react';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import './SocialMediaIcons.scss';

const cx = makeClassNameHelper('ebrc-SocialMediaIcon');

export const Twitter = () => (
  <svg 
    className={`svg-inline--fa fa-twitter fa-w-16 ${cx()}`}
    aria-hidden="true" 
    focusable="false" 
    data-prefix="fab" 
    data-icon="twitter" 
    role="img" 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 512 512" 
    data-fa-i2svg=""
  >
    <path fill="currentColor" d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z">
    </path>
  </svg>
);

export const Facebook = () => (
  <svg 
    className={`svg-inline--fa fa-facebook fa-w-16 ${cx()}`}
    aria-hidden="true" 
    focusable="false" 
    data-prefix="fab" 
    data-icon="facebook" 
    role="img" 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 512 512" 
    data-fa-i2svg=""
  >
    <path fill="currentColor" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z">
    </path>
  </svg>
);

export const YouTube = () => (
  <svg 
    className={`svg-inline--fa fa-youtube fa-w-18 ${cx('', 'wide')}`}
    aria-hidden="true" 
    focusable="false" 
    data-prefix="fab" 
    data-icon="youtube" 
    role="img" 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 576 512" 
    data-fa-i2svg=""
  >
    <path fill="currentColor" d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z">
    </path>
  </svg>
);
