import React from 'react';

import './DataRestrictionModal.scss';
import Modal from 'Client/App/Modal';
import { ApprovalRequired } from './RestrictionTypes';

class DataRestrictionModal extends React.Component {
  constructor (props) {
    super(props);
  }

  getAccessVerb (action) {
    if (typeof action !== 'string') return null;
    switch (action) {
      case 'paginate':
        return 'see more results';
      case 'download':
        return 'download data';
      default:
        return action;
    }
  }

  render () {
    const { when, study, onClose, action } = this.props;
    const verb = this.getAccessVerb(action);
    // const hurdle = this.getAccessHurdle(studyId, action);

    return !study ? null : (
      <Modal className="DataRestrictionModal" when={when}>
        <h2>The {study.name} study has data access restrictions.</h2>
        <hr />
        {verb
          ? (<p>Please login in order to {verb}</p>)
          : null
        }
        <ApprovalRequired onClose={onClose} studyName={study.name} />
      </Modal>
    );
  }
};

export default DataRestrictionModal;
