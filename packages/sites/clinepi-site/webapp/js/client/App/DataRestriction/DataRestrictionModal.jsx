import React from 'react';

import './DataRestrictionModal.scss';
import Modal from 'Client/App/Modal';
import { ApprovalRequired } from './RestrictionTypes';

class DataRestrictionModal extends React.Component {
  render () {
    const { when, study, onClose, message, directive } = this.props;

    return !study ? null : (
      <Modal className="DataRestrictionModal" when={when}>
        <h2>The {study.name} study has data access restrictions.</h2>
        <hr />
        <p>{message}</p>
        {!study.policyUrl ? null : (
          <p>
            The data from this study requires approval to download and use in research projects.
            Please read the <a href={study.policyUrl} target="_blank">{study.name} Data Use and Approval Policy.</a>
          </p>
        )}
        <button className="btn" onClick={onClose}>I understand the restrictions.</button>
        {directive && directive === 'login'
          ? <button className="btn" onClick={onClose}>Log In</button>
          : null
        }
        {directive && directive === 'approval'
          ? <button className="btn">Contact Us</button>
          : null
        }
      </Modal>
    );
  }
};

export default DataRestrictionModal;
