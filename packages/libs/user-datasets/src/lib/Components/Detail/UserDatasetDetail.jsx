import React from 'react';
import { Public } from '@material-ui/icons';

import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import SaveableTextEditor from '@veupathdb/wdk-client/lib/Components/InputControls/SaveableTextEditor';
import Link from '@veupathdb/wdk-client/lib/Components/Link';
import { Mesa, MesaState } from '@veupathdb/coreui/lib/components/Mesa';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { bytesToHuman } from '@veupathdb/wdk-client/lib/Utils/Converters';
import RadioList from '@veupathdb/wdk-client/lib/Components/InputControls/RadioList';

import NotFound from '@veupathdb/wdk-client/lib/Views/NotFound/NotFound';

import SharingModal from '../Sharing/UserDatasetSharingModal';
import CommunityModal from '../Sharing/UserDatasetCommunityModal';
import UserDatasetStatus from '../UserDatasetStatus';
import { makeClassifier } from '../UserDatasetUtils';
import { ThemedGrantAccessButton } from '../ThemedGrantAccessButton';
import { ThemedDeleteButton } from '../ThemedDeleteButton';

import { DateTime } from '../DateTime';

import '../UserDatasets.scss';
import './UserDatasetDetail.scss';
import { PublicationInput } from '../UploadForm';
import OutlinedButton from '@veupathdb/coreui/lib/components/buttons/OutlinedButton';
import AddIcon from '@material-ui/icons/Add';

const classify = makeClassifier('UserDatasetDetail');

class UserDatasetDetail extends React.Component {
  constructor(props) {
    super(props);

    this.onMetaSave = this.onMetaSave.bind(this);
    this.isMyDataset = this.isMyDataset.bind(this);
    this.validateKey = this.validateKey.bind(this);
    this.handleDelete = this.handleDelete.bind(this);

    this.getAttributes = this.getAttributes.bind(this);
    this.renderAttributeList = this.renderAttributeList.bind(this);
    this.renderHeaderSection = this.renderHeaderSection.bind(this);
    this.renderDatasetActions = this.renderDatasetActions.bind(this);

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
    this.props.sharingSuccess(undefined);
    this.props.sharingError(undefined);
    this.props.updateSharingModalState(true);
  }

  closeSharingModal() {
    this.props.updateSharingModalState(false);
  }

  validateKey(key) {
    const META_KEYS = [
      'name',
      'summary',
      'description',
      'publications',
      'contacts',
      'hyperlinks',
      'organisms',
    ];
    if (typeof key !== 'string' || !META_KEYS.includes(key))
      throw new TypeError(
        `Can't edit meta for invalid key: ${JSON.stringify(key)}`
      );
  }

  // Sets values within the meta object.
  // There are multiple types of metadata fields.
  // First, the easy key-value example. this.onMetaSave('name')('my new name');
  // Second, for fields that are arrays of objects, like meta.publications[index].name, specify the nestedKey and index. this.onMetaSave('publications', 'pubMedId', 0)('new pubMedId value');
  // Third, for arrays of strings, like meta.organisms[index], just specify the index. this.onMetaSave('organisms', undefined, 0)('new organism value');
  onMetaSave(
    key,
    nestedKey = undefined,
    index = undefined,
    emptyObject = undefined
  ) {
    this.validateKey(key);

    return (value) => {
      if (typeof value !== 'string' && typeof value !== 'boolean') {
        throw new TypeError(
          `onMetaSave: expected input value to be string or boolean; got ${typeof value}`
        );
      }
      if (nestedKey && typeof nestedKey !== 'string') {
        throw new TypeError(
          `onMetaSave: expected nestedKey to be a string; got ${typeof nestedKey}`
        );
      }
      if (index && !Number.isInteger(index)) {
        throw new TypeError(
          `onMetaSave: expected index to be an integer; got ${typeof index} with value ${index}`
        );
      }
      if (emptyObject && typeof emptyObject !== 'object') {
        throw new TypeError(
          `onMetaSave: expected emptyObject to be an object; got ${typeof emptyObject}`
        );
      }

      const { userDataset, updateUserDatasetDetail } = this.props;
      let updatedMeta = {};
      if (index !== undefined && Number.isInteger(index) && index >= 0) {
        // Handle nested array case, for example meta.contacts[index].name
        let arrayField = [...userDataset.meta[key]];
        const arrayLength = arrayField.length ?? 0;
        if (index <= arrayLength - 1) {
          if (nestedKey !== undefined && typeof nestedKey === 'string') {
            // Update the nested key at the correct index in the array of objects.
            // Example: meta.contacts
            arrayField[index][nestedKey] = value;
          } else {
            // With no nestedKey, just set the value directly on the array.
            // Example: meta.organisms
            arrayField[index] = value;
          }
          updatedMeta = { ...userDataset.meta, [key]: arrayField };
        } else {
          // Add new entry to the array
          arrayField.push(emptyObject);
          updatedMeta = { ...userDataset.meta, [key]: arrayField };
        }
      } else {
        // Regular key-value update.
        updatedMeta = { ...userDataset.meta, [key]: value };
      }

      // FOR TESTSING ONLY
      console.log('updatedMeta', updatedMeta);

      return updateUserDatasetDetail(userDataset, updatedMeta);
    };
  }

  handleDelete() {
    const { baseUrl, isOwner, userDataset, removeUserDataset, dataNoun } =
      this.props;
    const { sharedWith } = userDataset;
    const shareCount = !Array.isArray(sharedWith) ? null : sharedWith.length;

    const question = `Are you sure you want to ${
      isOwner ? 'delete' : 'remove'
    } this ${dataNoun.singular.toLowerCase()}? `;

    const visibilityMessage =
      userDataset.meta.visibility === 'public'
        ? 'It will no longer be visible to the community'
        : null;

    const shareMessage =
      !isOwner || !shareCount
        ? ''
        : `${shareCount} collaborator${
            shareCount === 1 ? '' : 's'
          } you've shared with will lose access.`;

    const message =
      question +
      (visibilityMessage && shareMessage
        ? `${visibilityMessage}, and ${shareMessage}`
        : visibilityMessage || shareMessage);

    if (window.confirm(message)) {
      removeUserDataset(userDataset, baseUrl);
    }
  }

  renderAllDatasetsLink() {
    if (!this.props.includeAllLink) return null;
    return (
      <Link className="AllDatasetsLink" to={this.props.baseUrl}>
        <Icon fa="chevron-left" />
        &nbsp; All {this.props.workspaceTitle}
      </Link>
    );
  }

  isInstalled() {
    const { config } = this.props;
    const { status } = this.props.userDataset;
    return (
      status?.import === 'complete' &&
      status?.install?.find((d) => d.projectId === config.projectId)
        ?.dataStatus === 'complete'
    );
  }

  getAttributes() {
    const { userDataset, questionMap, dataNoun } = this.props;
    const { onMetaSave } = this;
    const { id, type, meta, size, owner, created, sharedWith, status } =
      userDataset;
    console.log('userDataset', userDataset);
    const { display, name, version } = type;
    const isOwner = this.isMyDataset();
    const isInstalled = this.isInstalled();
    const questions = Object.values(questionMap).filter(
      (q) =>
        'userDatasetType' in q.properties &&
        q.properties.userDatasetType.includes(type.name)
    );
    // FOR TESTING ONLY
    meta.publications = [
      {
        pubMedId: 'id1',
        citation: 'citation1',
      },
      {
        pubMedId: 'id2',
        citation: 'citation2',
      },
    ];
    meta.contacts = [
      {
        name: 'Kay',
        email: 'buzz.com',
      },
      {
        name: 'Ray',
        city: 'Pizza place',
      },
      {
        name: 'Fey',
        affiliation: 'A hundred and 3 University',
      },
    ];
    meta.hyperlinks = [
      {
        url: 'abc.com',
        text: 'abc',
        description: 'abc description',
        isPublication: false, // this is optional, default is false
      },
    ];
    meta.organisms = ['E coli', 'Staph', 'Beavers'];
    meta.publications = [
      {
        pubMedId: 'id1',
        citation: 'citation1',
      },
      {
        pubMedId: 'id2',
      },
    ];

    return [
      this.props.includeNameHeader
        ? {
            attribute: this.props.detailsPageTitle,
            className: classify('Name'),
            value: (
              <SaveableTextEditor
                value={meta.name}
                readOnly={!isOwner}
                onSave={this.onMetaSave('name')}
              />
            ),
          }
        : null,
      {
        attribute: 'Status',
        value: (
          <UserDatasetStatus
            linkToDataset={false}
            useTooltip={false}
            userDataset={userDataset}
            projectId={this.props.config.projectId}
            displayName={this.props.config.displayName}
            dataNoun={dataNoun}
          />
        ),
      },
      !questions || !questions.length || !isInstalled
        ? null
        : {
            attribute: 'Available searches',
            value: (
              <ul>
                {questions.map((q) => {
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
                  return (
                    <li key={q.fullName}>
                      <Link to={url}>{q.displayName}</Link>
                    </li>
                  );
                })}
              </ul>
            ),
          },
      {
        attribute: 'Owner',
        value: isOwner ? 'Me' : owner,
      },
      {
        attribute: 'Visibility',
        value:
          meta.visibility === 'public' ? (
            <>
              {' '}
              <Public className="Community-visible" /> This is a "Community{' '}
              {dataNoun.singular}" made accessible to the public by user {owner}
              .
            </>
          ) : (
            <>
              This {dataNoun.singular.toLowerCase()} is only visible to the
              owner and those they have shared it with.
            </>
          ),
      },
      !isOwner || !sharedWith || !sharedWith.length
        ? null
        : {
            attribute: 'Shared with',
            className: classify('SharedWith'),
            value: (
              <ul>
                {sharedWith.map((share, index) => (
                  <li key={`${share.userDisplayName}-${index}`}>
                    {share.userDisplayName}
                  </li>
                ))}
              </ul>
            ),
          },
      {
        attribute: 'Summary',
        value: (
          <SaveableTextEditor
            multiLine={true}
            value={meta.summary}
            readOnly={!isOwner}
            onSave={onMetaSave('summary')}
            emptyText="No Summary"
          />
        ),
      },
      {
        attribute: 'Description',
        value: (
          <SaveableTextEditor
            value={meta.description}
            multiLine={true}
            readOnly={!isOwner}
            onSave={this.onMetaSave('description')}
            emptyText="No Description"
          />
        ),
      },
      {
        attribute: 'Created',
        value: <DateTime datetime={created} />,
      },
      { attribute: 'Data set size', value: bytesToHuman(size) },
      { attribute: 'ID', value: id },
      {
        attribute: 'Data type',
        value: (
          <span>
            {display} ({name} {version})
          </span>
        ),
      },
      {
        attribute: 'Publications',
        value: (
          <div>
            <br></br>
            {meta.publications.map((publication, index) => {
              return (
                <div className={classify('NestedField')}>
                  <span>Publication {index + 1}</span>
                  <div className={classify('NestedFieldValues')}>
                    <span>PubMed ID: </span>
                    <SaveableTextEditor
                      value={publication.pubMedId || ''}
                      multiLine={false}
                      readOnly={!isOwner}
                      onSave={this.onMetaSave(
                        'publications',
                        'pubMedId',
                        index
                      )} // Save PubMed ID for the specific publication entry
                      emptyText="No PubMed ID"
                    />
                    <span>Citation : </span>
                    <SaveableTextEditor
                      value={publication.citation || ''}
                      multiLine={false}
                      readOnly={!isOwner}
                      onSave={this.onMetaSave(
                        'publications',
                        'citation',
                        index
                      )} // Save citation for the specific publication entry
                      emptyText="No Citation"
                    />
                  </div>
                </div>
              );
            })}
            <OutlinedButton
              text="Add Publication"
              onPress={(event) => {
                event.preventDefault();
                this.onMetaSave(
                  'publications',
                  undefined,
                  meta.publications.length,
                  { pubMedId: '', citation: '' }
                )();
              }}
              icon={AddIcon}
            />
            <br></br>
          </div>
        ),
      },
      {
        attribute: 'Contacts',
        value: (
          <div>
            <br></br>
            {meta.contacts.map((contact, index) => {
              return (
                <div className={classify('NestedField')}>
                  <span>Contact {index + 1}</span>
                  <div className={classify('NestedFieldValues')}>
                    <span>Name: </span>
                    <SaveableTextEditor
                      value={contact.name || ''}
                      multiLine={false}
                      readOnly={!isOwner}
                      onSave={this.onMetaSave('contacts', 'name', index)}
                      emptyText="No Contact Name"
                    />
                    <span>Email: </span>
                    <SaveableTextEditor
                      value={contact.email || ''}
                      multiLine={false}
                      readOnly={!isOwner}
                      onSave={this.onMetaSave('contacts', 'email', index)}
                      emptyText="No Contact Email"
                    />
                    <span>Affiliation: </span>
                    <SaveableTextEditor
                      value={contact.affiliation || ''}
                      multiLine={false}
                      readOnly={!isOwner}
                      onSave={this.onMetaSave('contacts', 'affiliation', index)}
                      emptyText="No Contact Affiliation"
                    />
                    <span>City: </span>
                    <SaveableTextEditor
                      value={contact.city || ''}
                      multiLine={false}
                      readOnly={!isOwner}
                      onSave={this.onMetaSave('contacts', 'city', index)}
                      emptyText="No Contact City"
                    />
                    <span>State: </span>
                    <SaveableTextEditor
                      value={contact.state || ''}
                      multiLine={false}
                      readOnly={!isOwner}
                      onSave={this.onMetaSave('contacts', 'state', index)}
                      emptyText="No Contact State"
                    />
                    <span>Country: </span>
                    <SaveableTextEditor
                      value={contact.country || ''}
                      multiLine={false}
                      readOnly={!isOwner}
                      onSave={this.onMetaSave('contacts', 'country', index)}
                      emptyText="No Contact Country"
                    />
                    <span>Address: </span>
                    <SaveableTextEditor
                      value={contact.address || ''}
                      multiLine={false}
                      readOnly={!isOwner}
                      onSave={this.onMetaSave('contacts', 'address', index)}
                      emptyText="No Contact Address"
                    />
                    <span>Is Primary: </span>
                    <RadioList
                      name={`isPrimary-${index}`}
                      className="horizontal"
                      value={contact.isPrimary === true ? 'true' : 'false'}
                      onChange={(value) => {
                        this.onMetaSave(
                          'contacts',
                          'isPrimary', // this is the key in the hyperlink object
                          index // the index of the hyperlink in the array
                        )(value === 'true' ? true : false);
                      }}
                      items={[
                        { value: 'true', display: 'Yes' },
                        { value: 'false', display: 'No' },
                      ]}
                    />
                  </div>
                </div>
              );
            })}
            <OutlinedButton
              text="Add Contact"
              onPress={(event) => {
                event.preventDefault();
                this.onMetaSave(
                  'contacts',
                  undefined, // no nested key since we're adding a new contact
                  meta.contacts.length, // add to the end of the array
                  {
                    // new contact entry
                    name: '',
                    email: '',
                    affiliation: '',
                    city: '',
                    state: '',
                    country: '',
                    address: '',
                    isPrimary: false,
                  }
                )();
              }}
              icon={AddIcon}
            />
            <br></br>
          </div>
        ),
      },
      {
        attribute: 'Hyperlinks',
        value: (
          <div>
            <br></br>
            {meta.hyperlinks.map((hyperlink, index) => {
              return (
                <div className={classify('NestedField')}>
                  <span>Hyperlink {index + 1}</span>
                  <div className={classify('NestedFieldValues')}>
                    <span>URL: </span>
                    <SaveableTextEditor
                      value={hyperlink.url || ''}
                      multiLine={false}
                      readOnly={!isOwner}
                      onSave={this.onMetaSave('hyperlinks', 'url', index)}
                      emptyText="No Hyperlink URL"
                    />
                    <span>Text: </span>
                    <SaveableTextEditor
                      value={hyperlink.text || ''}
                      multiLine={false}
                      readOnly={!isOwner}
                      onSave={this.onMetaSave('hyperlinks', 'text', index)}
                      emptyText="No Hyperlink Text"
                    />
                    <span>Description: </span>
                    <SaveableTextEditor
                      value={hyperlink.description || ''}
                      multiLine={false}
                      readOnly={!isOwner}
                      onSave={this.onMetaSave(
                        'hyperlinks',
                        'description',
                        index
                      )}
                      emptyText="No Hyperlink Description"
                    />
                    <span>Is Publication: </span>
                    <RadioList
                      name={`isPublication-${index}`}
                      className="horizontal"
                      value={
                        hyperlink.isPublication === true ? 'true' : 'false'
                      }
                      onChange={(value) => {
                        this.onMetaSave(
                          'hyperlinks',
                          'isPublication', // this is the key in the hyperlink object
                          index // the index of the hyperlink in the array
                        )(value === 'true' ? true : false);
                      }}
                      items={[
                        { value: 'true', display: 'Yes' },
                        { value: 'false', display: 'No' },
                      ]}
                    />
                  </div>
                </div>
              );
            })}
            <OutlinedButton
              text="Add Hyperlink"
              onPress={(event) => {
                event.preventDefault();
                this.onMetaSave(
                  'hyperlinks',
                  undefined, // no nested key since we're adding a new hyperlink
                  meta.hyperlinks.length, // add to the end of the array
                  {
                    // new hyperlink entry
                    url: '',
                    text: '',
                    description: '',
                    isPublication: false, // default to false unless specified
                  }
                )();
              }}
              icon={AddIcon}
            />
            <br></br>
          </div>
        ),
      },
      {
        attribute: 'Organisms',
        value: (
          <div>
            <br></br>
            <div>
              {meta.organisms.map((organism, index) => {
                return (
                  <div className={classify('NestedFieldValues-Organisms')}>
                    <span>Organism {index + 1}: </span>
                    <SaveableTextEditor
                      value={organism || ''}
                      multiLine={false}
                      readOnly={!isOwner}
                      onSave={this.onMetaSave('organisms', undefined, index)}
                      emptyText="No Organism"
                    />
                  </div>
                );
              })}
            </div>
            <OutlinedButton
              text="Add Organism"
              onPress={(event) => {
                event.preventDefault();
                this.onMetaSave(
                  'organisms',
                  undefined, // no nested key since we're adding a new organism
                  meta.organisms.length ?? 0, // add to the end of the array
                  '' // default value for new organism entry
                )();
              }}
              icon={AddIcon}
            />
            <br></br>
          </div>
        ),
      },
    ].filter((attr) => attr);
  }

  renderHeaderSection() {
    const AllLink = this.renderAllDatasetsLink;
    const AttributeList = this.renderAttributeList;
    const DatasetActions = this.renderDatasetActions;

    return (
      <section id="dataset-header">
        <AllLink />
        <div className={classify('Header')}>
          <div className={classify('Header-Attributes')}>
            <AttributeList />
          </div>
          <div className={classify('Header-Actions')}>
            <DatasetActions />
          </div>
        </div>
      </section>
    );
  }

  renderAttributeList() {
    const attributes = this.getAttributes();
    return (
      <div className={classify('AttributeList')}>
        {attributes.map(({ attribute, value, className }, index) => (
          <div
            className={
              classify('AttributeRow') +
              ' ' +
              (className ?? classify(attribute))
            }
            key={index}
          >
            <div className={classify('AttributeName')}>
              {typeof attribute === 'string' ? (
                <strong>{attribute}:</strong>
              ) : (
                attribute
              )}
            </div>
            <div className={classify('AttributeValue')}>{value}</div>
          </div>
        ))}
      </div>
    );
  }

  renderDatasetActions() {
    const isOwner = this.isMyDataset();
    return (
      <div className={classify('Actions')}>
        {!isOwner ? null : (
          <ThemedGrantAccessButton
            buttonText={`Grant Access to ${this.props.dataNoun.plural}`}
            onPress={(grantType) => {
              switch (grantType) {
                case 'community':
                  this.props.updateCommunityModalVisibility(true);
                  break;
                case 'individual':
                  this.openSharingModal();
                  break;
                default:
                  // noop
                  break;
              }
            }}
            enablePublicUserDatasets={this.props.enablePublicUserDatasets}
          />
        )}
        {isOwner ? (
          <ThemedDeleteButton buttonText="Delete" onPress={this.handleDelete} />
        ) : null}
      </div>
    );
  }

  renderDetailsSection() {
    const { userDataset } = this.props;
    return (
      <section>
        <details>
          <pre>
            <code>{JSON.stringify(userDataset, null, '  ')}</code>
          </pre>
        </details>
      </section>
    );
  }

  /* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

                                    Files Table

   -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

  renderFileSection() {
    const { userDataset, dataNoun } = this.props;
    const { fileListing } = userDataset;
    const uploadZipFileState = MesaState.create({
      columns: this.getFileTableColumns('upload'),
      rows: [{ name: 'upload.zip', size: fileListing?.upload?.zipSize }],
    });
    const processedZipFileState = MesaState.create({
      columns: this.getFileTableColumns('data'),
      rows: [{ name: 'install.zip', size: fileListing?.install?.zipSize }],
    });

    return (
      <section id="dataset-files">
        <h2>Data Files</h2>
        <h3>
          <Icon fa="files-o" />
          Uploaded Files in {dataNoun.singular}
        </h3>
        <Mesa state={uploadZipFileState} />
        <h3>
          <Icon fa="files-o" />
          Processed Files in {dataNoun.singular}
        </h3>
        <Mesa state={processedZipFileState} />
      </section>
    );
  }

  getFileTableColumns(fileType) {
    const { userDataset, config } = this.props;
    const { projectId } = config;
    const { id, fileListing, status } = userDataset;
    const { wdkService } = this.context;

    const fileListIndex = fileType === 'upload' ? 'upload' : 'install';

    const fileListElement = fileListing[fileListIndex]?.contents?.length && (
      <details style={{ margin: '1em 0 0 0.25em' }}>
        <summary>
          List of {fileType === 'upload' ? 'uploaded' : 'processed'} files:
        </summary>
        <ol
          style={{
            margin: '0.25em 0 0 0',
            lineHeight: '1.5em',
            padding: '0 0 0 2em',
          }}
        >
          {fileListing[fileListIndex].contents.map((file, index) => (
            <li key={`${file.fileName}-${index}`}>
              {file.fileName} <span>({bytesToHuman(file.fileSize)})</span>
            </li>
          ))}
        </ol>
      </details>
    );

    return [
      {
        key: 'name',
        name: 'File Name',
        renderCell({ row }) {
          const { name } = row;
          return (
            <>
              <code>{name}</code>
              {fileListElement}
            </>
          );
        },
      },
      {
        key: 'size',
        name: 'File Size',
        renderCell({ row }) {
          const { size } = row;
          return size ? bytesToHuman(size) : '';
        },
      },
      {
        key: 'download',
        name: 'Download',
        width: '130px',
        headingStyle: { textAlign: 'center' },
        renderCell() {
          const downloadServiceAvailable = 'getUserDatasetFiles' in wdkService;
          const enableDownload =
            fileType === 'upload'
              ? true
              : status.install?.find((d) => d.projectId === projectId)
                  ?.dataStatus === 'complete';

          return (
            <button
              className="btn btn-info"
              disabled={!downloadServiceAvailable || !enableDownload}
              title={
                downloadServiceAvailable && enableDownload
                  ? 'Download this file'
                  : 'This download is unavailable. Please contact us if this problem persists.'
              }
              onClick={(e) => {
                e.preventDefault();
                wdkService.getUserDatasetFiles(id, fileType);
              }}
            >
              <Icon fa="save" className="left-side" /> Download
            </button>
          );
        },
      },
    ].filter((column) => column);
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
    return [this.renderHeaderSection, this.renderFileSection];
  }

  render() {
    const {
      user,
      userDataset,
      shareUserDatasets,
      unshareUserDatasets,
      dataNoun,
      sharingModalOpen,
      sharingDatasetPending,
      shareSuccessful,
      shareError,
      updateUserDatasetDetail,
      enablePublicUserDatasets,
      updateDatasetCommunityVisibility,
      updateCommunityModalVisibility,
      updateDatasetCommunityVisibilityError,
      updateDatasetCommunityVisibilityPending,
      updateDatasetCommunityVisibilitySuccess,
    } = this.props;
    const AllDatasetsLink = this.renderAllDatasetsLink;
    if (!userDataset)
      return (
        <NotFound>
          <AllDatasetsLink />
        </NotFound>
      );
    const isOwner = this.isMyDataset();

    return (
      <div className={classify()}>
        {this.getPageSections().map((Section, key) => (
          <Section key={key} />
        ))}
        {!isOwner || !sharingModalOpen ? null : (
          <SharingModal
            user={user}
            datasets={[userDataset]}
            onClose={this.closeSharingModal}
            shareUserDatasets={shareUserDatasets}
            context="datasetDetails"
            unshareUserDatasets={unshareUserDatasets}
            dataNoun={dataNoun}
            sharingDatasetPending={sharingDatasetPending}
            shareSuccessful={shareSuccessful}
            shareError={shareError}
            updateUserDatasetDetail={updateUserDatasetDetail}
            enablePublicUserDatasets={enablePublicUserDatasets}
          />
        )}
        {this.props.communityModalOpen && enablePublicUserDatasets ? (
          <CommunityModal
            user={user}
            datasets={[userDataset]}
            context="datasetDetails"
            onClose={() => updateCommunityModalVisibility(false)}
            dataNoun={dataNoun}
            updateDatasetCommunityVisibility={updateDatasetCommunityVisibility}
            updatePending={updateDatasetCommunityVisibilityPending}
            updateSuccessful={updateDatasetCommunityVisibilitySuccess}
            updateError={updateDatasetCommunityVisibilityError}
          />
        ) : null}
      </div>
    );
  }
}

UserDatasetDetail.contextType = WdkDependenciesContext;

export default UserDatasetDetail;
