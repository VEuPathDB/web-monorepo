import React from 'react';
import { connect } from 'react-redux';
import { HelpIcon, Link } from '@veupathdb/wdk-client/lib/Components';
import { pure } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import DatasetGraph from '../../components/DatasetGraph';
import { projectId } from '../../config';
import { usePermissions } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';
import { useAttemptActionCallback } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';
import { isUserApprovedForAction } from '@veupathdb/study-data-access/lib/study-access/permission';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { BlockRecordAttributeSection } from '@veupathdb/wdk-client/lib/Views/Records/RecordAttributes/RecordAttributeSection';
import {
  RecordClass,
  RecordInstance,
  Question,
  AttributeValue,
  LinkAttributeValue,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';

// Use Element.innerText to strip XML
function stripXML(str: string) {
  let div = document.createElement('div');
  div.innerHTML = str;
  return div.textContent;
}

export function formatLink(
  link: LinkAttributeValue,
  opts?: { newWindow?: boolean }
) {
  opts = opts || {};
  let newWindow = !!opts.newWindow;
  return (
    <a href={link.url} target={newWindow ? '_blank' : '_self'}>
      {stripXML(link.displayText)}
    </a>
  );
}

interface PrimaryPublication {
  pubmed_link: LinkAttributeValue;
}

function renderPrimaryPublication(publication: PrimaryPublication) {
  return formatLink(publication.pubmed_link, { newWindow: true });
}

function renderPrimaryContact(
  contact: string,
  institution: string,
  email: string,
  record: RecordInstance
) {
  return record.id[0].value == 'DS_010e5612b8' ||
    record.id[0].value == 'DS_c56b76b581' ? (
    <span>
      {contact}, <a href={'mailto:' + email}>{email}</a>, {institution}
    </span>
  ) : (
    contact + ', ' + institution
  );
}

interface VersionObject {
  version: string;
}

function renderSourceVersion(
  version: string | VersionObject,
  newcategory: string
) {
  if (newcategory === 'Genomes') {
    return (
      <span>
        {version}&nbsp;
        <HelpIcon>
          {'The source versions for the assembly, ' +
            'structural annotation and functional annotation.  ' +
            'See the Data Set Release History table for more details.'}
        </HelpIcon>
      </span>
    );
  } else {
    return (
      <span>
        {(version as VersionObject).version}&nbsp;
        <HelpIcon>
          {"The data provider's version number or publication date, from" +
            ' the site the data was acquired. In the rare case neither is available,' +
            ' the download date.'}
        </HelpIcon>
      </span>
    );
  }
}

interface VersionTable {
  version?: string;
  [key: string]: any;
}

function getSourceVersion(
  attributes: any,
  tables: any
): string | VersionObject | undefined {
  let version: string | VersionObject | undefined;
  if (attributes.newcategory === 'Genomes') {
    let g_version = attributes.genome_version
      ? attributes.genome_version
      : 'n/a';
    let a_version = attributes.annotation_version
      ? attributes.annotation_version
      : 'n/a';
    let fa_version = attributes.functional_annotation_version
      ? attributes.functional_annotation_version
      : 'n/a';

    version = g_version + ', ' + a_version + ', ' + fa_version;
  } else {
    version = tables.Version && tables.Version[0];
  }

  return version;
}

interface RecordHeadingProps {
  record: RecordInstance;
  questions?: Question[];
  recordClasses?: RecordClass[];
  DefaultComponent: React.ComponentType<any>;
}

export function RecordHeading(props: RecordHeadingProps) {
  let { record, questions, recordClasses } = props;
  let { attributes, tables } = record;
  let {
    summary,
    eupath_release,
    contact,
    email,
    institution,
    organism_prefix,
    newcategory,
    megabase_pairs,
    study_access,
    custom_download_tab,
  } = attributes;

  let version = getSourceVersion(attributes, tables);
  let primaryPublication = getPrimaryPublication(record);

  return (
    <>
      <props.DefaultComponent {...props} />
      <div className="wdk-RecordOverview eupathdb-RecordOverview">
        <dl>
          {organism_prefix ? (
            <>
              <dt>Organism (source or reference)</dt>
              <dd dangerouslySetInnerHTML={{ __html: organism_prefix }} />
            </>
          ) : null}

          {newcategory ? (
            <>
              <dt>Category</dt>
              <dd>{newcategory}</dd>
            </>
          ) : null}

          {primaryPublication && primaryPublication.pubmed_link ? (
            <>
              <dt>Primary publication</dt>
              <dd>{renderPrimaryPublication(primaryPublication)}</dd>
            </>
          ) : null}

          {contact && institution ? (
            <>
              <dt>Primary contact</dt>
              <dd>
                {renderPrimaryContact(contact, institution, email, record)}
              </dd>
            </>
          ) : null}

          {version ? (
            <>
              <dt>Source version(s)</dt>
              <dd>{renderSourceVersion(version, newcategory)}</dd>
            </>
          ) : null}

          {eupath_release ? (
            <>
              <dt>Release # / date</dt>
              <dd>{eupath_release}</dd>
            </>
          ) : null}

          <dt>Summary</dt>
          <dd
            style={{ whiteSpace: 'normal' }}
            dangerouslySetInnerHTML={{ __html: summary }}
          />

          {megabase_pairs ? (
            <>
              <dt>Megabase Pairs</dt>
              <dd>{megabase_pairs}</dd>
            </>
          ) : null}

          {study_access ? (
            <StudyAccessOverviewItem
              study_access={study_access}
              record={record}
            />
          ) : null}
        </dl>
      </div>
    </>
  );
}

interface DatasetGraphTableProps {
  DefaultComponent: React.ComponentType<any>;
  value: any[];
  [key: string]: any;
}

const DatasetGraphTable = pure(function DatasetGraphTable(
  props: DatasetGraphTableProps
) {
  return (
    <props.DefaultComponent
      {...props}
      childRow={(childProps: any) => (
        <DatasetGraph rowData={props.value[childProps.rowIndex]} />
      )}
    />
  );
});

interface ReferencesProps {
  questions?: Question[];
  recordClasses?: RecordClass[];
  value: any[];
}

function References(props: ReferencesProps) {
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
        let searchName = `Identify ${recordClass!.displayNamePlural} based on ${
          question.displayName
        }`;
        return (
          <li key={name}>
            <Link
              to={`/search/${recordClass!.urlSegment}/${question.urlSegment}`}
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
  (state: any) => ({
    questions: state.globalData.questions,
    recordClasses: state.globalData.recordClasses,
  }),
  null
)(References);

interface RecordAttributeSectionProps {
  DefaultComponent: React.ComponentType<any>;
  attribute: any;
  [key: string]: any;
}

export function RecordAttributeSection({
  DefaultComponent,
  ...props
}: RecordAttributeSectionProps) {
  if (props.attribute.name === 'description') {
    return <BlockRecordAttributeSection {...props} />;
  }
  return <DefaultComponent {...props} />;
}

interface RecordTableProps {
  DefaultComponent: React.ComponentType<any>;
  table: any;
  [key: string]: any;
}

export function RecordTable(props: RecordTableProps) {
  if (props.table.name === 'References') {
    return <ConnectedReferences {...props} />;
  }
  if (props.table.name === 'ExampleGraphs') {
    return <DatasetGraphTable {...props} />;
  }
  return <props.DefaultComponent {...props} />;
}

interface RecordUIProps {
  DefaultComponent: React.ComponentType<any>;
  [key: string]: any;
}

export function RecordUI({ DefaultComponent, ...props }: RecordUIProps) {
  return (
    <React.Fragment>
      <DefaultComponent {...props} />
      <JsonLinkedData {...props} />
    </React.Fragment>
  );
}

interface ContactRow {
  contact_name: string;
  affiliation: string;
}

interface JsonLinkedDataProps {
  record: RecordInstance;
}

function JsonLinkedData(props: JsonLinkedDataProps) {
  const { record } = props;
  const primaryPublication = getPrimaryPublication(record);
  const contacts =
    record.tables.Contacts &&
    record.tables.Contacts.map((row: ContactRow) => ({
      '@type': 'Person',
      name: row.contact_name,
      affiliation: row.affiliation,
    }));

  const metadata = {
    '@context': 'http://schema.org/',
    '@type': 'Dataset',
    name: record.displayName,
    description: record.attributes.summary,
    publication: primaryPublication && {
      name: primaryPublication.pubmed_link.displayText,
      url: primaryPublication.pubmed_link.url,
    },
    contributor: contacts,
  };

  return <script type="application/ld+json">{JSON.stringify(metadata)}</script>;
}

// helpers
function getPrimaryPublication(
  record: RecordInstance
): PrimaryPublication | undefined {
  const { tables } = record;
  return tables.Publications && tables.Publications[0];
}

interface StudyAccessOverviewItemProps {
  study_access: string;
  record: RecordInstance;
}

function StudyAccessOverviewItem(props: StudyAccessOverviewItemProps) {
  const { study_access, record } = props;
  const { loading, permissions } = usePermissions();
  const isUserApproved =
    !loading &&
    isUserApprovedForAction(
      permissions,
      record.attributes.dataset_id,
      'download'
    );

  const attemptAction = useAttemptActionCallback();

  const requestAccessButton = (
    <button
      type="button"
      className="link"
      onClick={() =>
        attemptAction('download', {
          studyId: record.attributes.dataset_id,
        })
      }
    >
      request access
    </button>
  );

  function makeMessage() {
    if (typeof record.attributes.custom_download_tab === 'string') {
      return (
        <Banner
          banner={{
            type: 'info',
            message: safeHtml(
              record.attributes.custom_download_tab,
              null,
              'div'
            ),
          }}
        />
      );
    } else {
      switch (study_access) {
        case 'Prerelease':
          return 'Data downloads for this study are not yet available on this website.';
        case 'Public':
          return 'Data downloads for this study are public. Data are available without logging in.';
        case 'Controlled':
          return isUserApproved ? (
            'You have been granted access to download the data.'
          ) : (
            <>
              To download data, please {requestAccessButton}. Data will be
              available immediately after submitting the request.
            </>
          );
        case 'Protected':
        default:
          return isUserApproved ? (
            'You have been granted access to download the data.'
          ) : (
            <>
              To download data, please {requestAccessButton}. Data will be
              available upon study team review and approval.
            </>
          );
      }
    }
  }

  return (
    <>
      <dt>Data accessibility</dt>
      <dd>
        {study_access}
        {loading ? null : (
          <div style={{ color: '#666', fontSize: '.8em', fontWeight: 400 }}>
            {makeMessage()}
          </div>
        )}
      </dd>
    </>
  );
}
