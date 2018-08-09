import React from 'react';
import PropTypes from 'prop-types';

import DataRestrictionModal from './DataRestrictionModal';
import { isAllowedAccess } from './DataRestrictionUtils';

class DataRestrictionDaemon extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      isVisible: false,
      studyId: null,
      action: null
    };
    this.getStudy = this.getStudy.bind(this);
    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.getStudyById = this.getStudyById.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleRestriction = this.handleRestriction.bind(this);
    this.isEmpty = this.isEmpty.bind(this);
  }

  componentDidMount () {
    document.addEventListener('DataRestricted', ({ detail }) => this.handleRestriction(detail));
  }

  isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
   }

  handleRestriction ({ studyId, action, event }) {
    console.info('DRD: Restriction Encountered:', { studyId, action, event });
    const { user } = this.props;
    const study = this.getStudyById(studyId);
    if (this.isEmpty(study) || typeof study === 'undefined')  console.log("RACE CONDITION: study empty or undefined");
    else if (this.isEmpty(user)) console.log("RACE CONDITION: user object empty");
    else {
      if (isAllowedAccess({ user, action, study })) return;

      // SHOW POPUP
      if (event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      };
      this.showModal({ studyId, action });
    }
  }

  showModal ({ studyId = null, action = null }) {
    const isVisible = true;
    this.setState({ isVisible, studyId, action });
  }

  closeModal () {
    const isVisible = false;
    this.setState({ isVisible });
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

  getStudy () {
    const { studyId } = this.state;
    return typeof studyId === 'string'
      ? this.getStudyById(studyId)
      : null;
  }

  render () {
    const study = this.getStudy();
    const { isVisible, action } = this.state;
    const { siteConfig, actions, user } = this.props;
    const { showLoginForm } = actions;
    const { webAppUrl } = siteConfig;

    return !study ? null : (
      <DataRestrictionModal
        user={user}
        study={study}
        action={action}
        when={isVisible}
        webAppUrl={webAppUrl}
        onClose={this.closeModal}
        showLoginForm={showLoginForm}
      />
    );
  }
};

DataRestrictionDaemon.propTypes = {
  user: PropTypes.object.isRequired,
  siteConfig: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

export default DataRestrictionDaemon;
