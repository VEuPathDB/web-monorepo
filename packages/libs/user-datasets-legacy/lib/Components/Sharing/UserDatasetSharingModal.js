import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import React from 'react';
import {
  IconAlt as Icon,
  Loading,
  Modal,
  TextBox,
} from '@veupathdb/wdk-client/lib/Components';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { isUserDatasetsCompatibleWdkService } from '../../Service/UserDatasetWrappers';
import { DateTime } from '../DateTime';
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
    this.renderEmptyState = this.renderEmptyState.bind(this);
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
    return this.props.datasets.length === 1
      ? `this ${this.props.dataNoun.singular.toLowerCase()}`
      : `these ${this.props.dataNoun.plural.toLowerCase()}`;
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
            _jsxs('span', {
              children: [
                'This email is not associated with a VEuPathDB account. ',
                _jsx('br', {}),
                ' ',
                _jsx('b', { children: recipientEmail }),
                ' will not receive ',
                this.getDatasetNoun(),
                '.',
              ],
            })
          );
        }
        const uid = foundUsers[recipientEmail];
        if (uid === this.props.user.id) {
          return this.disqualifyRecipient(
            recipientEmail,
            _jsxs('span', {
              children: [
                'Sorry, you cannot share a',
                ' ',
                this.props.dataNoun.singular.toLowerCase(),
                ' with yourself.',
              ],
            })
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
          _jsx('span', { children: 'An unknown error occurred.' })
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
    return _jsxs(
      'i',
      Object.assign(
        { className: 'faded' },
        {
          children: [
            'This ',
            this.props.dataNoun.singular.toLowerCase(),
            " hasn't been shared yet.",
          ],
        }
      )
    );
  }
  unshareWithUser(datasetId, userId) {
    if (
      !window.confirm(
        `Are you sure you want to stop sharing ${this.getDatasetNoun()} with this user?`
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
    return _jsxs(
      'div',
      {
        children: [
          _jsx(
            'span',
            Object.assign({ className: 'faded' }, { children: 'Shared with' })
          ),
          ' ',
          _jsx('b', { children: userDisplayName }),
          ' ',
          _jsx(DateTime, { datetime: time }),
          _jsx(
            'button',
            Object.assign(
              {
                type: 'button',
                onClick: () => this.unshareWithUser(userDataset.id, user),
                className: 'link',
              },
              { children: _jsx(Icon, { fa: 'times-circle unshareRecipient' }) }
            )
          ),
        ],
      },
      index
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
    const { deselectDataset, dataNoun } = this.props;
    const EmptyState = this.renderEmptyState;
    const ShareList = this.renderShareList;
    return _jsxs(
      'div',
      Object.assign(
        {
          className: 'UserDatasetSharing-Dataset' + (isOwner ? '' : ' invalid'),
        },
        {
          children: [
            _jsx(
              'div',
              Object.assign(
                { className: 'UserDatasetSharing-Dataset-Icon' },
                {
                  children: _jsx(Icon, {
                    fa: isOwner ? 'table' : 'exclamation-circle danger',
                  }),
                }
              )
            ),
            _jsxs(
              'div',
              Object.assign(
                { className: 'UserDatasetSharing-Dataset-Details' },
                {
                  children: [
                    _jsx('h3', { children: name }),
                    !isOwner
                      ? _jsxs(
                          'i',
                          Object.assign(
                            { className: 'faded danger' },
                            {
                              children: [
                                'This ',
                                dataNoun.singular.toLowerCase(),
                                ' has been shared with you. Only the owner can share it.',
                              ],
                            }
                          )
                        )
                      : Array.isArray(sharedWith) && sharedWith.length
                      ? _jsx(ShareList, { userDataset: userDataset })
                      : _jsx(EmptyState, {}),
                  ],
                }
              )
            ),
            _jsx(
              'div',
              Object.assign(
                { className: 'UserDatasetSharing-Dataset-Actions' },
                {
                  children:
                    typeof deselectDataset !== 'function'
                      ? null
                      : _jsx(
                          'button',
                          Object.assign(
                            {
                              type: 'button',
                              title: `Unselect this ${dataNoun.singular.toLowerCase()} for sharing`,
                              onClick: () => this.unselectDataset(userDataset),
                              className: 'link removalLink',
                            },
                            { children: _jsx(Icon, { fa: 'close' }) }
                          )
                        ),
                }
              )
            ),
          ],
        }
      ),
      id
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
    return _jsxs(
      'div',
      Object.assign(
        {
          className:
            'UserDatasetSharing-Recipient' + (invalid ? ' invalid' : ''),
        },
        {
          children: [
            _jsx(
              'div',
              Object.assign(
                { className: 'UserDatasetSharing-Recipient-Icon' },
                { children: _jsx(Icon, { fa: userIcon }) }
              )
            ),
            _jsxs(
              'div',
              Object.assign(
                { className: 'UserDatasetSharing-Recipient-Details' },
                {
                  children: [
                    _jsx('h3', { children: email }),
                    invalid
                      ? _jsx(
                          'span',
                          Object.assign(
                            { className: 'danger' },
                            { children: error }
                          )
                        )
                      : `will receive ${this.getDatasetNoun()}`,
                  ],
                }
              )
            ),
            _jsx(
              'div',
              Object.assign(
                { className: 'UserDatasetSharing-Recipient-Actions' },
                {
                  children: _jsx(
                    'button',
                    Object.assign(
                      {
                        type: 'button',
                        onClick: () => this.removeRecipient(recipient),
                        title: 'Remove this recipient.',
                        className: 'link removalLink',
                      },
                      { children: _jsx(Icon, { fa: 'close' }) }
                    )
                  ),
                }
              )
            ),
          ],
        }
      ),
      index
    );
  }
  renderRecipientList({ recipients }) {
    return !Array.isArray(recipients) || !recipients.length
      ? _jsxs(
          'p',
          Object.assign(
            { className: 'NoRecipients' },
            {
              children: [
                _jsx(Icon, { fa: 'user-o' }),
                ' \u00A0 No recipients.',
              ],
            }
          )
        )
      : recipients.map(this.renderRecipientItem);
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
    return _jsxs(
      'form',
      Object.assign(
        {
          className: 'UserDatasetSharing-RecipientForm',
          onSubmit: (e) => e.preventDefault(),
        },
        {
          children: [
            _jsx(TextBox, {
              placeholder: 'name@example.com',
              onChange: handleTextChange,
              value: recipientInput ? recipientInput : '',
            }),
            _jsx(
              'button',
              Object.assign(
                {
                  className: 'btn slim btn-slim',
                  title: 'Share with this email address',
                  onClick: handleRecipientAdd,
                  type: 'submit',
                },
                { children: _jsx(Icon, { fa: 'user-plus' }) }
              )
            ),
          ],
        }
      )
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
    const { dataNoun } = this.props;
    return _jsx(
      'div',
      Object.assign(
        { className: 'UserDatasetSharing-Buttons' },
        {
          children: _jsxs(
            'button',
            Object.assign(
              {
                className: 'btn btn-info',
                disabled: !recipients.length || !datasets.length,
                onClick: this.submitShare,
              },
              {
                children: [
                  _jsx(Icon, { fa: 'share left-side' }),
                  'Grant ',
                  recipients.length,
                  ' Recipient',
                  recipients.length === 1 ? '' : 's',
                  ' Access to',
                  ' ',
                  datasets.length === 1 ? dataNoun.singular : dataNoun.plural,
                ],
              }
            )
          ),
        }
      )
    );
  }
  renderViewContent() {
    const { recipients, succeeded } = this.state;
    const { datasets, onClose, dataNoun } = this.props;
    const datasetNoun = this.getDatasetNoun();
    const DatasetList = this.renderDatasetList;
    const RecipientList = this.renderRecipientList;
    const RecipientForm = this.renderRecipientForm;
    const SharingButtons = this.renderSharingButtons;
    const CloseButton = () =>
      _jsx(
        'button',
        Object.assign(
          { className: 'btn', onClick: () => onClose() },
          { children: 'Close this window.' }
        )
      );
    switch (succeeded) {
      case true:
        return _jsxs(
          'div',
          Object.assign(
            { className: 'UserDataset-SharingModal-StatusView' },
            {
              children: [
                _jsx(Icon, { fa: 'check-circle success' }),
                _jsx('h2', { children: 'Shared successfully.' }),
                _jsx(CloseButton, {}),
              ],
            }
          )
        );
      case false:
        return _jsxs(
          'div',
          Object.assign(
            { className: 'UserDataset-SharingModal-StatusView' },
            {
              children: [
                _jsx(Icon, { fa: 'times-circle danger' }),
                _jsxs('h2', {
                  children: ['Error Sharing ', dataNoun.plural, '.'],
                }),
                _jsxs('p', {
                  children: [
                    'An error occurred while sharing your',
                    ' ',
                    dataNoun.plural.toLowerCase(),
                    '. Please try again.',
                  ],
                }),
                _jsx(CloseButton, {}),
              ],
            }
          )
        );
      default:
        return _jsxs(
          'div',
          Object.assign(
            { className: 'UserDataset-SharingModal-FormView' },
            {
              children: [
                _jsxs(
                  'div',
                  Object.assign(
                    { className: 'UserDataset-SharingModal-DatasetSection' },
                    {
                      children: [
                        _jsxs(
                          'h2',
                          Object.assign(
                            { className: 'UserDatasetSharing-SectionName' },
                            { children: ['Share ', datasetNoun, ':'] }
                          )
                        ),
                        _jsx(DatasetList, { datasets: datasets }),
                      ],
                    }
                  )
                ),
                _jsxs(
                  'div',
                  Object.assign(
                    { className: 'UserDataset-SharingModal-RecipientSection' },
                    {
                      children: [
                        _jsx(
                          'h2',
                          Object.assign(
                            { className: 'UserDatasetSharing-SectionName' },
                            { children: 'With the following recipients:' }
                          )
                        ),
                        _jsx(RecipientForm, {}),
                        _jsx(RecipientList, { recipients: recipients }),
                        _jsx(SharingButtons, {}),
                      ],
                    }
                  )
                ),
              ],
            }
          )
        );
    }
  }
  render() {
    const { onClose } = this.props;
    const { processing } = this.state;
    const ViewContent = this.renderViewContent;
    return _jsxs(
      Modal,
      Object.assign(
        { className: 'UserDataset-SharingModal' },
        {
          children: [
            _jsx(
              'div',
              Object.assign(
                {
                  className: 'UserDataset-SharingModal-CloseBar',
                  title: 'Close this window',
                },
                {
                  children: _jsx(Icon, {
                    fa: 'window-close',
                    className: 'SharingModal-Close',
                    onClick: () =>
                      typeof onClose === 'function' ? onClose() : null,
                  }),
                }
              )
            ),
            processing ? _jsx(Loading, {}) : _jsx(ViewContent, {}),
          ],
        }
      )
    );
  }
}
UserDatasetSharingModal.contextType = WdkDependenciesContext;
export default UserDatasetSharingModal;
//# sourceMappingURL=UserDatasetSharingModal.js.map
