import { compose } from 'lodash/fp';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router';

import { UserSessionActions } from '@veupathdb/wdk-client/lib/Actions';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { usePermissions } from '../../hooks/permissions';

import { clearRestrictions } from './DataRestrictionActionCreators';
import DataRestrictionModal from './DataRestrictionModal';

const { showLoginForm } = UserSessionActions;

function DataRestrictionDaemon(props) {
  const {
    dataRestriction,
    user,
    webAppUrl,
    clearRestrictions,
    showLoginForm,
  } = props;

  const location = useLocation();

  useEffect(() => {
    clearRestrictions();
  }, [location.pathname]);

  const permissionsValue = usePermissions();

  if (
    dataRestriction == null ||
    user == null ||
    permissionsValue.loading
  ) return null;

  return !dataRestriction ? null : (
    <DataRestrictionModal
      user={user}
      permissions={permissionsValue.permissions}
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
