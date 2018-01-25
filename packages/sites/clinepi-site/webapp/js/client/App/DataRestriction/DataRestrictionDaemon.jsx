import React from 'react';

import { getRestrictionMessage, isAllowedAccess, getDirective } from './DataRestrictionUtils';
import DataRestrictionModal from './DataRestrictionModal';

class DataRestrictionDaemon extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      isVisible: false,
      studyId: null,
      message: null,
      action: null,
      directive: null
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
    const permitted = isAllowedAccess({ user, action, study });
    if (!study || permitted) return;

    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };
    const directive = getDirective({ study, action })
    const message = getRestrictionMessage({ action, study });
    this.showModal({ studyId, message, directive });
  }

  showModal ({ studyId = null, message = null, directive = null }) {
    const isVisible = true;
    this.setState({ isVisible, studyId, message, directive });
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
    const { isVisible, message, directive } = this.state;
    return (
      <DataRestrictionModal
        when={isVisible}
        onClose={this.closeModal}
        study={study}
        message={message}
        directive={directive}
      />
    );
  }
};

export default DataRestrictionDaemon;
