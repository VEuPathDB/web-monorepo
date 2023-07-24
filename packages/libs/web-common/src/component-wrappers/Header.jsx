import React from 'react';
import SiteHeader from '../components/SiteHeader';
import CookieBanner from '../components/CookieBanner';
import Announcements from '../components/Announcements';

/**
 * Wrap Header component with state from store and configured actionCreators
 */
export const Header = () => () =>
  (
    <React.Fragment>
      <SiteHeader />
      <Announcements />
      <CookieBanner />
    </React.Fragment>
  );
