import { compose } from 'lodash/fp';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router';

import { UserSessionActions } from '@veupathdb/wdk-client/lib/Actions';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { usePermissions } from './permissionsHooks';

import { clearRestrictions } from './DataRestrictionActionCreators';
import DataRestrictionModal from './DataRestrictionModal';

const { showLoginForm } = UserSessionActions;

function DataRestrictionDaemon(props) {
  const {
    dataRestriction,
    user,
    makeStudyPageRoute,
    clearRestrictions,
    showLoginForm,
  } = props;

  const location = useLocation();

  useEffect(() => {
    clearRestrictions();
  }, [location.pathname]);

  const permissionsValue = usePermissions();

  if (dataRestriction == null || user == null || permissionsValue.loading)
    return null;

  return !dataRestriction ? null : (
    <DataRestrictionModal
      user={user}
      permissions={permissionsValue.permissions}
      study={dataRestriction.study}
      action={dataRestriction.action}
      makeStudyPageRoute={makeStudyPageRoute}
      onClose={clearRestrictions}
      showLoginForm={showLoginForm}
    />
  );
}

DataRestrictionDaemon.propTypes = {
  dataRestriction: PropTypes.object,
  user: PropTypes.object,
  makeStudyPageRoute: PropTypes.func.isRequired,
  clearRestrictions: PropTypes.func.isRequired,
  showLoginForm: PropTypes.func.isRequired,
};

const enhance = connect(
  (state) => ({
    dataRestriction: state.dataRestriction,
    user: state.globalData.user,
  }),
  {
    clearRestrictions,
    showLoginForm,
  }
);

export default compose(wrappable, enhance)(DataRestrictionDaemon);
