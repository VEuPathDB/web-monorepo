import React from 'react';

import { makeVpdbClassNameHelper } from './Utils';

const cx = makeVpdbClassNameHelper('Header');
const cxTheme = makeVpdbClassNameHelper('BgDark');

// NOTE: The component for the sticky version of this header should live in Ebrc
export const Header = () => <header className={`${cx()} ${cxTheme()}`}></header>;
