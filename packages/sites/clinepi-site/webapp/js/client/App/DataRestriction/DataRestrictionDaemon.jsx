import { flow, pick } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import { withActions, withStore } from 'ebrc-client/util/component';

import { clearRestrictions } from './DataRestrictionActionCreators';
import DataRestrictionModal from './DataRestrictionModal';

const enhance = flow(
  withStore(state => pick(state.globalData, 'dateRestriction')),
  withActions({ clearRestrictions })
)

class DataRestrictionDaemon extends React.Component {
  constructor (props) {
    super(props);
    this.getStudy = this.getStudy.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.getStudyById = this.getStudyById.bind(this);
  }

  closeModal () {
    this.props.clearRestrictions();
  }

  getStudyById (studyId) {
    if (typeof studyId !== 'string') return;
    const { siteData } = this.props;
    const { studies } = siteData;
    const study = studies.find(({ id }) => studyId === id)
    return study
      ? study
      : console.error(`[getStudyById] Invalid reference: couldn't find study with id "${studyId}"`);
  }

  getStudy(studyId) {
    return typeof studyId === 'string'
      ? this.getStudyById(studyId)
      : null;
  }

  render () {
    const { siteConfig, actions, user, dataRestriction } = this.props;

    if (dataRestriction == null) return null;

    const { studyId, action } = dataRestriction;
    const study = this.getStudy(studyId);
    const { showLoginForm } = actions;
    const { webAppUrl } = siteConfig;

    return !study || !user || !dataRestriction ? null : (
      <DataRestrictionModal
        user={user}
        study={study}
        action={action}
        when={true}
        webAppUrl={webAppUrl}
        onClose={this.closeModal}
        showLoginForm={showLoginForm}
      />
    );
  }
}

DataRestrictionDaemon.propTypes = {
  user: PropTypes.object.isRequired,
  siteConfig: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  dataRestriction: PropTypes.object
};

export default enhance(DataRestrictionDaemon);
