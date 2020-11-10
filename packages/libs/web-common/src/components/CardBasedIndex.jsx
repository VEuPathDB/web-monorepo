import React from 'react';
import PropTypes from 'prop-types';

import Home from 'ebrc-client/App/Home';

/* * Home page for clinepidb sites */
export default function Index (props) {
  return (
    <Home {...props} />
  );
}

Index.propTypes = {
  displayName: PropTypes.string.isRequired,
  webAppUrl: PropTypes.string.isRequired
};
