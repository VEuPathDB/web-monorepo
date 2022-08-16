import React from 'react';

import {
  IconAlt as Icon,
  Loading,
  Modal,
  TextBox,
} from '@veupathdb/wdk-client/lib/Components';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

import { isUserDatasetsCompatibleWdkService } from '../../Service/UserDatasetWrappers';

import { timeFromNow } from '../UserDatasetUtils';

import './UserDatasetSharingModal.scss';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

class UserDatasetSharingModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recipients: [],
      recipientInput: null,
      processing: false,
      succeeded: null,
    };
    this.renderShareItem = this.renderShareItem.bind(this);
    this.renderShareList = this.renderShareList.bind(this);
    this.renderDatasetList = this.renderDatasetList.bind(this);
    this.renderDatasetItem = this.renderDatasetItem.bind(this);
    this.renderRecipientItem = this.renderRecipientItem.bind(this);
    this.renderRecipientList = this.renderRecipientList.bind(this);
    this.renderRecipientForm = this.renderRecipientForm.bind(this);

    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleRecipientAdd = this.handleRecipientAdd.bind(this);
    this.isMyDataset = this.isMyDataset.bind(this);
    this.verifyRecipient = this.verifyRecipient.bind(this);
    this.removeRecipient = this.removeRecipient.bind(this);
    this.getDatasetNoun = this.getDatasetNoun.bind(this);
    this.disqualifyRecipient = this.disqualifyRecipient.bind(this);

    this.submitShare = this.submitShare.bind(this);
    this.unshareWithUser = this.unshareWithUser.bind(this);
    this.isRecipientValid = this.isRecipientValid.bind(this);
    this.renderViewContent = this.renderViewContent.bind(this);
    this.isDatasetShareable = this.isDatasetShareable.bind(this);
    this.getValidRecipients = this.getValidRecipients.bind(this);
    this.getShareableDatasets = this.getShareableDatasets.bind(this);
    this.renderSharingButtons = this.renderSharingButtons.bind(this);
  }

  isMyDataset(dataset) {
    const { user } = this.props;
    return dataset && dataset.ownerUserId && dataset.ownerUserId === user.id;
  }

  handleTextChange(recipientInput = null) {
    this.setState({ recipientInput });
  }

  getDatasetNoun() {
    return this.props.datasets.length === 1 ? 'this dataset' : 'these datasets';
  }

  verifyRecipient(recipientEmail) {
    if (typeof recipientEmail !== 'string' || !recipientEmail.length)
      throw new TypeError(
        `verifyRecipient: bad email received (${recipientEmail})`
      );

    const { wdkService } = this.context;

    if (!isUserDatasetsCompatibleWdkService(wdkService)) {
      throw new Error(
        `verifyRecipient: must have a properly configured UserDatasetsCompatibleWdkService`
      );
    }

    return wdkService
      .getUserIdsByEmail([recipientEmail])
      .then(({ results }) => {
        const foundUsers = results.find((result) =>
          Object.keys(result).includes(recipientEmail)
        );

        if (!results.length || !foundUsers) {
          return this.disqualifyRecipient(
            recipientEmail,
            <span>
              This email is not associated with a VEuPathDB account. <br />{' '}
              <b>{recipientEmail}</b> will not receive {this.getDatasetNoun()}.
            </span>
          );
        }

        const uid = foundUsers[recipientEmail];

        if (uid === this.props.user.id) {
          return this.disqualifyRecipient(
            recipientEmail,
            <span>Sorry, you cannot share a dataset with yourself.</span>
          );
        } else {
          return this.acceptRecipient(recipientEmail, uid);
        }
      })
      .catch((err) => {
        console.error(
          `verifyRecipient:  error checking if '${recipientEmail}' exists.`,
          err
        );
        return this.disqualifyRecipient(
          recipientEmail,
          <span>An unknown error occurred.</span>
        );
      });
  }

  removeRecipient(recipient) {
    const { email } = recipient;
    const { onClose } = this.props;
    const recipients = [
      ...this.state.recipients.filter((user) => user.email !== email),
    ];
    return recipients.length ? this.setState({ recipients }) : onClose();
  }

  acceptRecipient(recipientEmail, id) {
    const { recipients } = this.state;
    const acceptedRecipient = {
      id,
      verified: true,
      email: recipientEmail,
      error: null,
    };
    this.setState({
      recipients: recipients.map((recipient) => {
        return recipient.email === recipientEmail
          ? acceptedRecipient
          : recipient;
      }),
    });
  }

  disqualifyRecipient(recipientEmail, reason) {
    const { recipients } = this.state;
    const disqualifiedRecipient = {
      email: recipientEmail,
      verified: false,
      error: reason,
    };
    this.setState({
      recipients: recipients.map((recipient) => {
        return recipient.email === recipientEmail
          ? disqualifiedRecipient
          : recipient;
      }),
    });
  }

  handleRecipientAdd() {
    const { recipientInput, recipients } = this.state;
    if (!isValidEmail(recipientInput))
      return alert('Please enter a valid email to share with.');
    if (
      recipients.find(
        (recipient) =>
          recipient.email.toLowerCase() === recipientInput.toLowerCase()
      )
    )
      return alert('This email has already been entered.');
    this.setState(
      {
        recipientInput: null,
        recipients: [
          ...recipients,
          {
            email: recipientInput,
            verified: null,
            id: null,
          },
        ],
      },
      () => this.verifyRecipient(recipientInput)
    );
  }

  renderEmptyState() {
    return <i className="faded">This dataset hasn't been shared yet.</i>;
  }

  unshareWithUser(datasetId, userId) {
    if (
      !window.confirm(
        'Are you sure you want to stop sharing this dataset with this user?'
      )
    )
      return;
    const { unshareUserDatasets } = this.props;
    if (typeof unshareUserDatasets !== 'function')
      throw new TypeError(
        'UserDatasetSharingModal:unshareWithUser: expected unshareUserDatasets to be function. Got: ' +
          typeof unshareUserDatasets
      );
    unshareUserDatasets([datasetId], [userId]);
  }

  renderShareItem(share, index, userDataset) {
    const { user, time, userDisplayName } = share;
    return (
      <div key={index}>
        <span className="faded">Shared with</span> <b>{userDisplayName}</b>{' '}
        {timeFromNow(time)}
        <button
          type="button"
          onClick={() => this.unshareWithUser(userDataset.id, user)}
          className="link"
        >
          <Icon fa="times-circle unshareRecipient" />
        </button>
      </div>
    );
  }

  unselectDataset(dataset) {
    const { deselectDataset } = this.props;
    if (typeof deselectDataset !== 'function') return;
    deselectDataset(dataset);
  }

  renderDatasetItem(userDataset) {
    const { sharedWith, id, meta } = userDataset;
    const { name } = meta;
    const isOwner = this.isMyDataset(userDataset);
    const { deselectDataset } = this.props;

    const EmptyState = this.renderEmptyState;
    const ShareList = this.renderShareList;

    return (
      <div
        key={id}
        className={'UserDatasetSharing-Dataset' + (isOwner ? '' : ' invalid')}
      >
        <div className="UserDatasetSharing-Dataset-Icon">
          <Icon fa={isOwner ? 'table' : 'exclamation-circle danger'} />
        </div>

        <div className="UserDatasetSharing-Dataset-Details">
          <h3>{name}</h3>
          {!isOwner ? (
            <i className="faded danger">
              This dataset has been shared with you. Only the owner can share
              it.
            </i>
          ) : Array.isArray(sharedWith) && sharedWith.length ? (
            <ShareList userDataset={userDataset} />
          ) : (
            <EmptyState />
          )}
        </div>

        <div className="UserDatasetSharing-Dataset-Actions">
          {typeof deselectDataset !== 'function' ? null : (
            <button
              type="button"
              title="Unselect this dataset for sharing"
              onClick={() => this.unselectDataset(userDataset)}
              className="link removalLink"
            >
              <Icon fa="close" />
            </button>
          )}
        </div>
      </div>
    );
  }

  renderRecipientItem(recipient, index) {
    const { email, verified, error } = recipient;
    const invalid = verified === false;
    const userIcon =
      verified === null
        ? 'circle-o-notch fa-spin'
        : verified
        ? 'user-circle'
        : 'user-times danger';

    return (
      <div
        key={index}
        className={'UserDatasetSharing-Recipient' + (invalid ? ' invalid' : '')}
      >
        <div className="UserDatasetSharing-Recipient-Icon">
          <Icon fa={userIcon} />
        </div>
        <div className="UserDatasetSharing-Recipient-Details">
          <h3>{email}</h3>
          {invalid ? (
            <span className="danger">{error}</span>
          ) : (
            `will receive ${this.getDatasetNoun()}`
          )}
        </div>
        <div className="UserDatasetSharing-Recipient-Actions">
          <button
            type="button"
            onClick={() => this.removeRecipient(recipient)}
            title="Remove this recipient."
            className="link removalLink"
          >
            <Icon fa="close" />
          </button>
        </div>
      </div>
    );
  }

  renderRecipientList({ recipients }) {
    return !Array.isArray(recipients) || !recipients.length ? (
      <p className="NoRecipients">
        <Icon fa="user-o" /> &nbsp; No recipients.
      </p>
    ) : (
      recipients.map(this.renderRecipientItem)
    );
  }

  renderShareList({ userDataset }) {
    const { sharedWith } = userDataset;
    return !Array.isArray(sharedWith) || !sharedWith.length
      ? null
      : sharedWith.map((share, index) =>
          this.renderShareItem(share, index, userDataset)
        );
  }

  renderDatasetList({ datasets }) {
    return !Array.isArray(datasets) || !datasets.length
      ? null
      : datasets.map(this.renderDatasetItem);
  }

  isRecipientValid(recipient = {}) {
    return recipient.verified && recipient.id !== this.props.user.id;
  }

  isDatasetShareable(dataset = {}) {
    return dataset.ownerUserId === this.props.user.id;
  }

  submitShare() {
    const recipients = this.getValidRecipients();
    const datasets = this.getShareableDatasets();
    if (!datasets.length) return;
    const { shareUserDatasets } = this.props;

    this.setState({ processing: true }, () => {
      shareUserDatasets(
        datasets.map(({ id }) => id),
        recipients.map(({ id }) => id)
      )
        .then((response) => {
          if (response.type !== 'user-datasets/sharing-success') throw response;
          this.setState({ processing: false, succeeded: true });
        })
        .catch((err) => {
          console.error('submitShare: rejected', err);
          this.setState({ processing: false, succeeded: false });
        });
    });
  }

  renderRecipientForm() {
    const { recipientInput } = this.state;
    const { handleTextChange, handleRecipientAdd } = this;

    return (
      <form
        className="UserDatasetSharing-RecipientForm"
        onSubmit={(e) => e.preventDefault()}
      >
        <TextBox
          placeholder="name@example.com"
          onChange={handleTextChange}
          value={recipientInput ? recipientInput : ''}
        />
        <button
          className="btn slim btn-slim"
          title="Share with this email address"
          onClick={handleRecipientAdd}
          type="submit"
        >
          <Icon fa="user-plus" />
        </button>
      </form>
    );
  }

  getValidRecipients() {
    const { recipients } = this.state;
    return recipients.filter(this.isRecipientValid);
  }

  getShareableDatasets() {
    const { datasets } = this.props;
    return datasets.filter(this.isDatasetShareable);
  }

  renderSharingButtons() {
    const datasets = this.getShareableDatasets();
    const recipients = this.getValidRecipients();

    return (
      <div className="UserDatasetSharing-Buttons">
        <button
          className="btn btn-info"
          disabled={!recipients.length || !datasets.length}
          onClick={this.submitShare}
        >
          Share Datasets with {recipients.length} user
          {recipients.length === 1 ? '' : 's'} <Icon fa="share right-side" />
        </button>
      </div>
    );
  }

  renderViewContent() {
    const { recipients, succeeded } = this.state;
    const { datasets, onClose } = this.props;
    const datasetNoun = this.getDatasetNoun();

    const DatasetList = this.renderDatasetList;
    const RecipientList = this.renderRecipientList;
    const RecipientForm = this.renderRecipientForm;
    const SharingButtons = this.renderSharingButtons;
    const CloseButton = () => (
      <button className="btn" onClick={() => onClose()}>
        Close this window.
      </button>
    );

    switch (succeeded) {
      case true:
        return (
          <div className="UserDataset-SharingModal-StatusView">
            <Icon fa="check-circle success" />
            <h2>Shared successfully.</h2>
            <CloseButton />
          </div>
        );
      case false:
        return (
          <div className="UserDataset-SharingModal-StatusView">
            <Icon fa="times-circle danger" />
            <h2>Error Sharing Datasets.</h2>
            <p>
              An error occurred while sharing your datasets. Please try again.
            </p>
            <CloseButton />
          </div>
        );
      default:
        return (
          <div className="UserDataset-SharingModal-FormView">
            <div className="UserDataset-SharingModal-DatasetSection">
              <h2 className="UserDatasetSharing-SectionName">
                Share {datasetNoun}:
              </h2>
              <DatasetList datasets={datasets} />
            </div>
            <div className="UserDataset-SharingModal-RecipientSection">
              <h2 className="UserDatasetSharing-SectionName">
                With The Following Collaborators:
              </h2>
              <RecipientForm />
              <RecipientList recipients={recipients} />
              <SharingButtons />
            </div>
          </div>
        );
    }
  }

  render() {
    const { onClose } = this.props;
    const { processing } = this.state;
    const ViewContent = this.renderViewContent;

    return (
      <Modal className="UserDataset-SharingModal">
        <div
          className="UserDataset-SharingModal-CloseBar"
          title="CLose this window"
        >
          <Icon
            fa="window-close"
            className="SharingModal-Close"
            onClick={() => (typeof onClose === 'function' ? onClose() : null)}
          />
        </div>
        {processing ? <Loading /> : <ViewContent />}
      </Modal>
    );
  }
}

UserDatasetSharingModal.contextType = WdkDependenciesContext;

export default UserDatasetSharingModal;
