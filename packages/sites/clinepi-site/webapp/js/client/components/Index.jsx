import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import Home from 'Client/App/Home';
import DisclaimerModal from 'Client/App/DisclaimerModal';
import { Link, IconAlt as Icon } from 'wdk-client/Components';

/* * Home page for clinepidb sites */
export default function Index (props) {
  return (
    <Fragment>
      <Home {...props} />
      <DisclaimerModal />
    </Fragment>
  );
};

Index.propTypes = {
  displayName: PropTypes.string.isRequired,
  webAppUrl: PropTypes.string.isRequired
};
