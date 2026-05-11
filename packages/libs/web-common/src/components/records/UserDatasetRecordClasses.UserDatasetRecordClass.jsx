import React from 'react';
import { connect } from 'react-redux';
import { HelpIcon, Link } from '@veupathdb/wdk-client/lib/Components';
import Loading from '@veupathdb/wdk-client/lib/Components/Loading/Loading';
import { projectId } from '../../config';
import { usePermissions } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';
import { useAttemptActionCallback } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';
import { isUserApprovedForAction } from '@veupathdb/study-data-access/lib/study-access/permission';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { BlockRecordAttributeSection } from '@veupathdb/wdk-client/lib/Views/Records/RecordAttributes/RecordAttributeSection';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { wdkRecordIdToDiyUserDatasetId } from '@veupathdb/user-datasets/lib/Utils/diyDatasets';
import { isVdiCompatibleWdkService } from '@veupathdb/user-datasets/lib/Service';
import { UserDatasetFiles } from '@veupathdb/user-datasets/lib/Components/UserDatasetFiles';

// Use Element.innerText to strip XML
function stripXML(str) {
  let div = document.createElement('div');
  div.innerHTML = str;
  return div.textContent;
}

export function formatLink(link, opts) {
  opts = opts || {};
  let newWindow = !!opts.newWindow;
  return (
    <a href={link.url} target={newWindow ? '_blank' : '_self'}>
      {stripXML(link.displayText)}
    </a>
  );
}

function renderPrimaryPublication(publication) {
  return formatLink(publication.publication_link, { newWindow: true });
}

function renderPrimaryContact(contact, institution, email, record) {
  return record.id[0].value == 'DS_010e5612b8' ||
    record.id[0].value == 'DS_c56b76b581' ? (
    <span>
      {contact}, <a href={'mailto:' + email}>{email}</a>, {institution}
    </span>
  ) : (
    contact + ', ' + institution
  );
}

export function RecordHeading(props) {
  let { record, questions, recordClasses } = props;
  let { attributes, tables } = record;
  let {
    primary_publication,
    primary_affiliation,
    primary_contact_name,
    primary_country,
    primary_email,
    name,
    creation_date,
    summary,
    accessibility,
  } = attributes;

  let datasetID = record.id[0].value;
  let vdiDatasetId = wdkRecordIdToDiyUserDatasetId(datasetID);

  // Fetch user dataset files
  const userDatasetFilesResult = useWdkService(
    async (wdkService) => {
      if (!vdiDatasetId) {
        return { data: null, error: null };
      }

      if (!isVdiCompatibleWdkService(wdkService)) {
        return {
          data: null,
          error: 'VDI service is not configured. Unable to load dataset files.',
        };
      }

      try {
        const files = await wdkService.getUserDatasetFileListing(vdiDatasetId);
        return { data: files, error: null };
      } catch (error) {
        console.error('Failed to fetch user dataset files:', error);
        return {
          data: null,
          error: 'Failed to load dataset files. Please try again later.',
        };
      }
    },
    [vdiDatasetId]
  );

  return (
    <>
      <props.DefaultComponent {...props} />
      <div className="wdk-RecordOverview eupathdb-RecordOverview">
        <dl>
          <dt>Primary Publication:</dt>
          {primary_publication ? (
            <>
              <dd>{primary_publication}</dd>
            </>
          ) : null}

          <dt>Primary Contact:</dt>
          {primary_contact_name ? (
            <>
              <dd>{primary_contact_name}</dd>
            </>
          ) : null}

          <dt>VEuPathDB Dataset ID:</dt>
          <dd>{datasetID}</dd>

          <dt>Dataset Version / Date:</dt>
          <dd>v1, {creation_date}</dd>

          <dt>Summary:</dt>
          <dd
            style={{ whiteSpace: 'normal' }}
            dangerouslySetInnerHTML={{ __html: summary }}
          />

          <dt>Data Accessibility:</dt>
          <dd>
            {accessibility}
            {accessibility === 'private' ? (
              <div style={{ color: '#666', fontSize: '.8em', fontWeight: 400 }}>
                This dataset can only be discovered, explored, and downloaded by
                the owner and explicitly invited collaborators.
              </div>
            ) : (
              <div style={{ color: '#666', fontSize: '.8em', fontWeight: 400 }}>
                No access restrictions; anyone can download the data without
                registering.
              </div>
            )}
          </dd>
        </dl>
      </div>
      {userDatasetFilesResult?.error ? (
        <div className="error-message" style={{ marginTop: '1.5em' }}>
          <h2>Data Files</h2>
          <p>{userDatasetFilesResult.error}</p>
        </div>
      ) : userDatasetFilesResult?.data ? (
        <div style={{ marginTop: '1.5em' }}>
          <UserDatasetFiles
            datasetId={vdiDatasetId}
            files={userDatasetFilesResult.data}
            installStatus="complete"
          />
        </div>
      ) : userDatasetFilesResult === undefined ? (
        <div style={{ marginTop: '1.5em' }}>
          <h2>Data Files</h2>
          <Loading />
        </div>
      ) : null}
    </>
  );
}

function References(props) {
  let { questions, recordClasses } = props;
  if (questions == null || recordClasses == null) {
    return null;
  }
  let value = props.value
    .filter(
      (row) =>
        row.target_type === 'question' || row.link_type === 'genomicsInternal'
    )
    .map((row, index) => {
      if (row.link_type === 'question') {
        let name = row.target_name;
        let question = questions.find((q) => q.fullName === name);

        if (question == null) {
          if (projectId === 'EuPathDB') {
            console.warn(
              'Ignoring dataset reference `',
              name,
              '`. Unable to resolve with model.'
            );
            return null;
          }
          throw new Error('cannot find question with name:' + name);
          // There are too many cases that are difficult to address right now, so we opt to ignore
        }

        let recordClass = recordClasses.find(
          (r) => r.urlSegment === question.outputRecordClassName
        );
        let searchName = `Identify ${recordClass.displayNamePlural} based on ${question.displayName}`;
        return (
          <li key={name}>
            <Link
              to={`/search/${recordClass.urlSegment}/${question.urlSegment}`}
            >
              {searchName}
            </Link>
          </li>
        );
      } else {
        return (
          <li key={index}>
            <a target="_blank" href={row.url}>
              {row.text}
            </a>
          </li>
        );
      }
    });
  return value.length === 0 ? <em>No data available</em> : <ul>{value}</ul>;
}

const ConnectedReferences = connect(
  (state) => ({
    questions: state.globalData.questions,
    recordClasses: state.globalData.recordClasses,
  }),
  null
)(References);

export function RecordAttributeSection({ DefaultComponent, ...props }) {
  if (props.attribute.name === 'description') {
    return <BlockRecordAttributeSection {...props} />;
  }
  return <DefaultComponent {...props} />;
}

export function RecordTable(props) {
  if (props.table.name === 'References') {
    return <ConnectedReferences {...props} />;
  }
  return <props.DefaultComponent {...props} />;
}
