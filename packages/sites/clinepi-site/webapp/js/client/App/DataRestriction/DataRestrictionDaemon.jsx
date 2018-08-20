import { flow, pick } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import { withActions, withStore } from 'ebrc-client/util/component';

import { clearRestrictions } from './DataRestrictionActionCreators';
import DataRestrictionModal from './DataRestrictionModal';

function DataRestrictionDaemon(props) {
  const { siteConfig, actions, user, dataRestriction, clearRestrictions } = props;

  if (dataRestriction == null || user == null) return null;

  const { webAppUrl } = siteConfig;

  return !dataRestriction ? null : (
    <DataRestrictionModal
      when={true}
      user={user}
      study={dataRestriction.study}
      action={dataRestriction.action}
      webAppUrl={webAppUrl}
      onClose={clearRestrictions}
      showLoginForm={actions.showLoginForm}
    />
  );
}

DataRestrictionDaemon.propTypes = {
  user: PropTypes.object.isRequired,
  siteConfig: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  clearRestrictions: PropTypes.func.isRequired,
  dataRestriction: PropTypes.object,
};

const enhance = flow(
  withStore(state => pick(state.globalData, 'dateRestriction')),
  withActions({ clearRestrictions })
)

export default enhance(DataRestrictionDaemon);
