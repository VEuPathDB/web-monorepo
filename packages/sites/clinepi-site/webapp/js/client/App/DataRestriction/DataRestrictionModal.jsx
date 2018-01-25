import React from 'react';

import './DataRestrictionModal.scss';
import Modal from 'Client/App/Modal';
import { ApprovalRequired } from './RestrictionTypes';

class DataRestrictionModal extends React.Component {
  render () {
    const { when, study, onClose, children } = this.props;

    return !study ? null : (
      <Modal className="DataRestrictionModal" when={when}>
        <h2>The {study.name} study has data access restrictions.</h2>
        <hr />
        {children}
        <ApprovalRequired onClose={onClose} studyName={study.name} />
      </Modal>
    );
  }
};

export default DataRestrictionModal;
