import { compose } from 'lodash/fp';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router';

import { UserSessionActions } from 'wdk-client/Actions';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';

import { clearRestrictions } from './DataRestrictionActionCreators';
import DataRestrictionModal from './DataRestrictionModal';

const { showLoginForm } = UserSessionActions;

function DataRestrictionDaemon(props) {
  const {
    dataRestriction,
    user,
    permissions,
    webAppUrl,
    clearRestrictions,
    showLoginForm,
  } = props;

  const location = useLocation();

  useEffect(() => {
    clearRestrictions();
  }, [location.pathname]);

  if (dataRestriction == null || user == null) return null;

  return !dataRestriction ? null : (
    <DataRestrictionModal
      user={user}
      permissions={permissions}
      study={dataRestriction.study}
      action={dataRestriction.action}
      webAppUrl={webAppUrl}
      onClose={clearRestrictions}
      showLoginForm={showLoginForm}
    />
  );
}

DataRestrictionDaemon.propTypes = {
  dataRestriction: PropTypes.object,
  user: PropTypes.object,
  permissions: PropTypes.object.isRequired,
  webAppUrl: PropTypes.string.isRequired,
  clearRestrictions: PropTypes.func.isRequired,
  showLoginForm: PropTypes.func.isRequired,
};

const enhance = connect(
  state => ({
    dataRestriction: state.dataRestriction,
    user: state.globalData.user,
    webAppUrl: state.globalData.siteConfig.webAppUrl
  }),
  {
    clearRestrictions,
    showLoginForm
  }
)

export default compose(wrappable, enhance)(DataRestrictionDaemon);
