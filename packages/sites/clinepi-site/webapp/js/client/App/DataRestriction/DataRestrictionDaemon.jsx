import React from 'react';

import { isAllowedAccess, getStudyAccessLevel } from './DataRestrictionUtils';
import DataRestrictionModal from './DataRestrictionModal';

class DataRestrictionDaemon extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      isVisible: false,
      studyId: null,
      action: null
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.getStudyById = this.getStudyById.bind(this);
    this.getStudy = this.getStudy.bind(this);
    this.handleRestriction = this.handleRestriction.bind(this);
  }

  componentDidMount () {
    document.addEventListener('DataRestricted', this.handleRestriction);
  }

  handleRestriction ({ detail }) {
    const { user } = this.props;
    const { studyId, action, event } = detail;
    const study = this.getStudyById(studyId);
    if (!study || isAllowedAccess({ user, action, study })) return;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    };
    this.showModal({ studyId, action });
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
    const { siteConfig } = this.props;
    const { studies } = siteConfig;
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
    return (
      <DataRestrictionModal
        study={study}
        action={action}
        when={isVisible}
        onClose={this.closeModal}
      />
    );
  }
};

export default DataRestrictionDaemon;
