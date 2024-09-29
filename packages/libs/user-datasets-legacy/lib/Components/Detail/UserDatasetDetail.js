import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import React from 'react';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import SaveableTextEditor from '@veupathdb/wdk-client/lib/Components/InputControls/SaveableTextEditor';
import Link from '@veupathdb/wdk-client/lib/Components/Link';
import {
  AnchoredTooltip,
  Mesa,
  MesaState,
} from '@veupathdb/coreui/lib/components/Mesa';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { bytesToHuman } from '@veupathdb/wdk-client/lib/Utils/Converters';
import NotFound from '@veupathdb/wdk-client/lib/Views/NotFound/NotFound';
import { isUserDatasetsCompatibleWdkService } from '../../Service/UserDatasetWrappers';
import SharingModal from '../Sharing/UserDatasetSharingModal';
import UserDatasetStatus from '../UserDatasetStatus';
import { makeClassifier, normalizePercentage } from '../UserDatasetUtils';
import { ThemedGrantAccessButton } from '../ThemedGrantAccessButton';
import { ThemedDeleteButton } from '../ThemedDeleteButton';
import { DateTime } from '../DateTime';
import './UserDatasetDetail.scss';
const classify = makeClassifier('UserDatasetDetail');
class UserDatasetDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = { sharingModalOpen: false };
    this.onMetaSave = this.onMetaSave.bind(this);
    this.isMyDataset = this.isMyDataset.bind(this);
    this.validateKey = this.validateKey.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.getAttributes = this.getAttributes.bind(this);
    this.renderAttributeList = this.renderAttributeList.bind(this);
    this.renderHeaderSection = this.renderHeaderSection.bind(this);
    this.renderDatasetActions = this.renderDatasetActions.bind(this);
    this.renderCompatibilitySection =
      this.renderCompatibilitySection.bind(this);
    this.getCompatibilityTableColumns =
      this.getCompatibilityTableColumns.bind(this);
    this.openSharingModal = this.openSharingModal.bind(this);
    this.renderFileSection = this.renderFileSection.bind(this);
    this.closeSharingModal = this.closeSharingModal.bind(this);
    this.getFileTableColumns = this.getFileTableColumns.bind(this);
    this.renderDetailsSection = this.renderDetailsSection.bind(this);
    this.renderAllDatasetsLink = this.renderAllDatasetsLink.bind(this);
  }
  isMyDataset() {
    const { user, userDataset } = this.props;
    return (
      user && userDataset && user.id && user.id === userDataset.ownerUserId
    );
  }
  openSharingModal() {
    this.setState({ sharingModalOpen: true });
  }
  closeSharingModal() {
    this.setState({ sharingModalOpen: false });
  }
  validateKey(key) {
    const META_KEYS = ['name', 'summary', 'description'];
    if (typeof key !== 'string' || !META_KEYS.includes(key))
      throw new TypeError(
        `Can't edit meta for invalid key: ${JSON.stringify(key)}`
      );
  }
  onMetaSave(key) {
    this.validateKey(key);
    return (value) => {
      if (typeof value !== 'string')
        throw new TypeError(
          `onMetaSave: expected input value to be string; got ${typeof value}`
        );
      const { userDataset, updateUserDatasetDetail } = this.props;
      const meta = Object.assign(Object.assign({}, userDataset.meta), {
        [key]: value,
      });
      return updateUserDatasetDetail(userDataset, meta);
    };
  }
  handleDelete() {
    const { baseUrl, isOwner, userDataset, removeUserDataset, dataNoun } =
      this.props;
    const { sharedWith } = userDataset;
    const shareCount = !Array.isArray(sharedWith) ? null : sharedWith.length;
    const message =
      `Are you sure you want to ${
        isOwner ? 'delete' : 'remove'
      } this ${dataNoun.singular.toLowerCase()}? ` +
      (!isOwner || !shareCount
        ? ''
        : `${shareCount} collaborator${
            shareCount === 1 ? '' : 's'
          } you've shared with will lose access.`);
    if (window.confirm(message)) {
      removeUserDataset(userDataset, baseUrl);
    }
  }
  renderAllDatasetsLink() {
    return _jsxs(
      Link,
      Object.assign(
        { className: 'AllDatasetsLink', to: this.props.baseUrl },
        {
          children: [
            _jsx(Icon, { fa: 'chevron-left' }),
            '\u00A0 All ',
            this.props.workspaceTitle,
          ],
        }
      )
    );
  }
  getAttributes() {
    const { userDataset, quotaSize, questionMap } = this.props;
    const { onMetaSave } = this;
    const {
      id,
      type,
      meta,
      size,
      percentQuotaUsed,
      owner,
      created,
      sharedWith,
      questions,
      isInstalled,
    } = userDataset;
    const { display, name, version } = type;
    const isOwner = this.isMyDataset();
    return [
      {
        className: classify('Name'),
        attribute: this.props.detailsPageTitle,
        value: _jsx(SaveableTextEditor, {
          value: meta.name,
          readOnly: !isOwner,
          onSave: this.onMetaSave('name'),
        }),
      },
      {
        attribute: 'Status',
        value: _jsx(UserDatasetStatus, {
          linkToDataset: false,
          useTooltip: false,
          userDataset: userDataset,
          projectId: this.props.config.projectId,
          displayName: this.props.config.displayName,
        }),
      },
      {
        attribute: 'Owner',
        value: isOwner ? 'Me' : owner,
      },
      {
        attribute: 'Description',
        value: _jsx(SaveableTextEditor, {
          value: meta.description,
          multiLine: true,
          readOnly: !isOwner,
          onSave: this.onMetaSave('description'),
          emptyText: 'No Description',
        }),
      },
      { attribute: 'ID', value: id },
      {
        attribute: 'Data type',
        value: _jsxs('span', {
          children: [display, ' (', name, ' ', version, ')'],
        }),
      },
      {
        attribute: 'Summary',
        value: _jsx(SaveableTextEditor, {
          multiLine: true,
          value: meta.summary,
          readOnly: !isOwner,
          onSave: onMetaSave('summary'),
          emptyText: 'No Summary',
        }),
      },
      {
        attribute: 'Created',
        value: _jsx(DateTime, { datetime: created }),
      },
      { attribute: 'Data set size', value: bytesToHuman(size) },
      !isOwner
        ? null
        : {
            attribute: 'Quota usage',
            value: `${normalizePercentage(percentQuotaUsed)}% of ${bytesToHuman(
              quotaSize
            )}`,
          },
      !isOwner || !sharedWith || !sharedWith.length
        ? null
        : {
            attribute: 'Shared with',
            value: _jsx('ul', {
              children: sharedWith.map((share) =>
                _jsxs(
                  'li',
                  {
                    children: [
                      share.userDisplayName,
                      ' <',
                      share.email,
                      '>',
                      ' ',
                      _jsx(DateTime, { datetime: share.time }),
                    ],
                  },
                  share.email
                )
              ),
            }),
          },
      !questions || !questions.length || !isInstalled
        ? null
        : {
            attribute: 'Available searches',
            value: _jsx('ul', {
              children: questions.map((questionName) => {
                const q = questionMap[questionName];
                // User dataset searches typically offer changing the dataset through a dropdown
                // Ths dropdown is a param, "biom_dataset" on MicrobiomeDB and "rna_seq_dataset" on genomic sites
                // Hence the regex: /dataset/
                const ps = q.paramNames.filter((paramName) =>
                  paramName.match(/dataset/)
                );
                const urlPath = [
                  '',
                  'search',
                  q.outputRecordClassName,
                  q.urlSegment,
                ].join('/');
                const url =
                  urlPath +
                  (ps.length === 1 ? '?param.' + ps[0] + '=' + id : '');
                return _jsx(
                  'li',
                  {
                    children: _jsx(
                      Link,
                      Object.assign({ to: url }, { children: q.displayName })
                    ),
                  },
                  questionName
                );
              }),
            }),
          },
    ].filter((attr) => attr);
  }
  renderHeaderSection() {
    const AllLink = this.renderAllDatasetsLink;
    const AttributeList = this.renderAttributeList;
    const DatasetActions = this.renderDatasetActions;
    return _jsxs(
      'section',
      Object.assign(
        { id: 'dataset-header' },
        {
          children: [
            _jsx(AllLink, {}),
            _jsxs(
              'div',
              Object.assign(
                { className: classify('Header') },
                {
                  children: [
                    _jsx(
                      'div',
                      Object.assign(
                        { className: classify('Header-Attributes') },
                        { children: _jsx(AttributeList, {}) }
                      )
                    ),
                    _jsx(
                      'div',
                      Object.assign(
                        { className: classify('Header-Actions') },
                        { children: _jsx(DatasetActions, {}) }
                      )
                    ),
                  ],
                }
              )
            ),
          ],
        }
      )
    );
  }
  renderAttributeList() {
    const attributes = this.getAttributes();
    return _jsx(
      'div',
      Object.assign(
        { className: classify('AttributeList') },
        {
          children: attributes.map(({ attribute, value, className }, index) =>
            _jsxs(
              'div',
              Object.assign(
                {
                  className:
                    classify('AttributeRow') +
                    (className ? ' ' + className : ''),
                },
                {
                  children: [
                    _jsx(
                      'div',
                      Object.assign(
                        { className: classify('AttributeName') },
                        {
                          children:
                            typeof attribute === 'string'
                              ? _jsxs('strong', { children: [attribute, ':'] })
                              : attribute,
                        }
                      )
                    ),
                    _jsx(
                      'div',
                      Object.assign(
                        { className: classify('AttributeValue') },
                        { children: value }
                      )
                    ),
                  ],
                }
              ),
              index
            )
          ),
        }
      )
    );
  }
  renderDatasetActions() {
    const isOwner = this.isMyDataset();
    return _jsxs(
      'div',
      Object.assign(
        { className: classify('Actions') },
        {
          children: [
            !isOwner
              ? null
              : _jsx(ThemedGrantAccessButton, {
                  buttonText: `Grant Access to ${this.props.dataNoun.singular}`,
                  onPress: this.openSharingModal,
                }),
            _jsx(ThemedDeleteButton, {
              buttonText: 'Delete',
              onPress: this.handleDelete,
            }),
          ],
        }
      )
    );
  }
  renderDetailsSection() {
    const { userDataset } = this.props;
    return _jsx('section', {
      children: _jsx('details', {
        children: _jsx('pre', {
          children: _jsx('code', {
            children: JSON.stringify(userDataset, null, '  '),
          }),
        }),
      }),
    });
  }
  /* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  
                                      Files Table
  
     -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
  renderFileSection() {
    const { userDataset, appUrl, dataNoun } = this.props;
    const fileTableState = MesaState.create({
      columns: this.getFileTableColumns({ userDataset, appUrl }),
      rows: userDataset.datafiles,
    });
    return _jsxs(
      'section',
      Object.assign(
        { id: 'dataset-files' },
        {
          children: [
            _jsx('h2', { children: 'Data Files' }),
            _jsxs(
              'h3',
              Object.assign(
                { className: classify('SectionTitle') },
                {
                  children: [
                    _jsx(Icon, { fa: 'files-o' }),
                    'Files in ',
                    dataNoun.singular,
                  ],
                }
              )
            ),
            _jsx(Mesa, { state: fileTableState }),
          ],
        }
      )
    );
  }
  getFileTableColumns() {
    const { userDataset } = this.props;
    const { id } = userDataset;
    const { wdkService } = this.context;
    return [
      {
        key: 'name',
        name: 'File Name',
        renderCell({ row }) {
          const { name } = row;
          return _jsx('code', { children: name });
        },
      },
      {
        key: 'size',
        name: 'File Size',
        renderCell({ row }) {
          const { size } = row;
          return bytesToHuman(size);
        },
      },
      {
        key: 'download',
        name: 'Download',
        width: '130px',
        headingStyle: { textAlign: 'center' },
        renderCell({ row }) {
          const { name } = row;
          const downloadUrl = !isUserDatasetsCompatibleWdkService(wdkService)
            ? undefined
            : wdkService.getUserDatasetDownloadUrl(id, name);
          const downloadAvailable = downloadUrl != null;
          return _jsx(
            'a',
            Object.assign(
              {
                href: downloadUrl,
                target: '_blank',
                rel: 'noreferrer',
                title: 'Download this file',
              },
              {
                children: _jsxs(
                  'button',
                  Object.assign(
                    {
                      className: 'btn btn-info',
                      disabled: !downloadAvailable,
                      title: downloadAvailable
                        ? undefined
                        : 'This download is unavailable. Please contact us if this problem persists.',
                    },
                    {
                      children: [
                        _jsx(Icon, { fa: 'save', className: 'left-side' }),
                        ' Download',
                      ],
                    }
                  )
                ),
              }
            )
          );
        },
      },
    ].filter((column) => column);
  }
  /* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  
                                  Compatible Table
  
     -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
  renderCompatibilitySection() {
    const { userDataset, config, dataNoun } = this.props;
    const { projectId, displayName } = config;
    const compatibilityTableState = MesaState.create({
      columns: this.getCompatibilityTableColumns(userDataset),
      rows: userDataset.dependencies,
    });
    const { buildNumber } = config;
    const { isCompatible } = userDataset;
    const isCompatibleProject = userDataset.projects.includes(projectId);
    return _jsxs(
      'section',
      Object.assign(
        { id: 'dataset-compatibility' },
        {
          children: [
            _jsxs('h2', {
              children: ['Use This ', dataNoun.singular, ' in ', displayName],
            }),
            _jsxs(
              'h3',
              Object.assign(
                { className: classify('SectionTitle') },
                {
                  children: [
                    _jsx(Icon, { fa: 'puzzle-piece' }),
                    'Compatibility Information \u00A0',
                    _jsx(
                      AnchoredTooltip,
                      Object.assign(
                        {
                          content: `The data and genomes listed here are requisite for using the data in this user ${dataNoun.singular.toLowerCase()}.`,
                        },
                        {
                          children: _jsx(
                            'div',
                            Object.assign(
                              { className: 'HelpTrigger' },
                              {
                                children: _jsx(Icon, { fa: 'question-circle' }),
                              }
                            )
                          ),
                        }
                      )
                    ),
                  ],
                }
              )
            ),
            _jsx(
              'div',
              Object.assign(
                { style: { maxWidth: '600px' } },
                { children: _jsx(Mesa, { state: compatibilityTableState }) }
              )
            ),
            isCompatibleProject && isCompatible
              ? _jsxs(
                  'p',
                  Object.assign(
                    { className: 'success' },
                    {
                      children: [
                        'This ',
                        dataNoun.singular.toLowerCase(),
                        ' is compatible with the current release, build ',
                        buildNumber,
                        ', of ',
                        _jsx('b', { children: projectId }),
                        '. It is installed for use.',
                      ],
                    }
                  )
                )
              : _jsxs(
                  'p',
                  Object.assign(
                    { className: 'danger' },
                    {
                      children: [
                        'This ',
                        dataNoun.singular.toLowerCase(),
                        ' is not compatible with the current release, build ',
                        buildNumber,
                        ', of ',
                        _jsx('b', { children: projectId }),
                        '. It is not installed for use.',
                      ],
                    }
                  )
                ),
          ],
        }
      )
    );
  }
  getCompatibilityTableColumns() {
    const { userDataset } = this.props;
    const { projects } = userDataset;
    return [
      {
        key: 'project',
        name: 'VEuPathDB Website',
        renderCell() {
          return projects.join(', ');
        },
      },
      {
        key: 'resourceDisplayName',
        name: 'Required Resource',
        renderCell({ row }) {
          const { resourceDisplayName } = row;
          return resourceDisplayName;
        },
      },
      {
        key: 'resourceVersion',
        name: 'Required Resource Release',
      },
      {
        key: 'installedVersion',
        name: 'Installed Resource Release',
        renderCell({ row }) {
          const { compatibilityInfo } = row;
          const { currentBuild } = compatibilityInfo ? compatibilityInfo : {};
          return compatibilityInfo === null || currentBuild === null
            ? 'N/A'
            : currentBuild;
        },
      },
    ];
  }
  /* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  
                                  General Rendering
  
     -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
  // This is needed to resolve downstream typescript errors.
  // TypeScript infers that this method returns JSX.Element[].
  // Some classes extending this will return (JSX.Element | null)[].
  // The ReactNode type is better suited, here, since it allows for null values.
  /** @return {import("react").ReactNode[]} */
  getPageSections() {
    return [
      this.renderHeaderSection,
      this.renderCompatibilitySection,
      this.renderFileSection,
    ];
  }
  render() {
    const {
      user,
      userDataset,
      shareUserDatasets,
      unshareUserDatasets,
      dataNoun,
    } = this.props;
    const AllDatasetsLink = this.renderAllDatasetsLink;
    if (!userDataset)
      return _jsx(NotFound, { children: _jsx(AllDatasetsLink, {}) });
    const isOwner = this.isMyDataset();
    const { sharingModalOpen } = this.state;
    return _jsxs(
      'div',
      Object.assign(
        { className: classify() },
        {
          children: [
            this.getPageSections().map((Section, key) =>
              _jsx(Section, {}, key)
            ),
            !isOwner || !sharingModalOpen
              ? null
              : _jsx(SharingModal, {
                  user: user,
                  datasets: [userDataset],
                  onClose: this.closeSharingModal,
                  shareUserDatasets: shareUserDatasets,
                  unshareUserDatasets: unshareUserDatasets,
                  dataNoun: dataNoun,
                }),
          ],
        }
      )
    );
  }
}
UserDatasetDetail.contextType = WdkDependenciesContext;
export default UserDatasetDetail;
//# sourceMappingURL=UserDatasetDetail.js.map
