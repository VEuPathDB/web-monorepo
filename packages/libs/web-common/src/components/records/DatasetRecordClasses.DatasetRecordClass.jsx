import React from 'react';
import { connect } from 'react-redux';
import { HelpIcon, Link } from '@veupathdb/wdk-client/lib/Components';
import {pure} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import DatasetGraph from 'ebrc-client/components/DatasetGraph';
import { projectId } from 'ebrc-client/config';
import { usePermissions } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';
import { useAttemptActionCallback } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';
import { isUserApprovedForAction } from '@veupathdb/study-data-access/lib/study-access/permission';

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
    <a href={link.url} target={newWindow ? '_blank' : '_self'}>{stripXML(link.displayText)}</a>
  );
}


function renderPrimaryPublication(publication) {
  return formatLink(publication.pubmed_link, { newWindow: true });
}

function renderPrimaryContact(contact, institution, email, record) {
  return ( (record.id[0].value == 'DS_010e5612b8' || record.id[0].value == 'DS_c56b76b581')?  
  	   <span>{contact}, <a href={'mailto:' + email} >{email}</a>, {institution}</span>
           :  contact + ', ' + institution
        );
}

function renderSourceVersion(version, newcategory) {
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
        {version.version}&nbsp;
        <HelpIcon>
          {'The data provider\'s version number or publication date, from' +
          ' the site the data was acquired. In the rare case neither is available,' +
          ' the download date.'}
        </HelpIcon>
      </span>
    );
  }
}


function getSourceVersion(attributes, tables) {
  let version;
  if (attributes.newcategory === 'Genomes') {
    let g_version = attributes.genome_version ? attributes.genome_version : "n/a";
    let a_version = attributes.annotation_version ? attributes.annotation_version : "n/a";
    let fa_version = attributes.functional_annotation_version ? attributes.functional_annotation_version : "n/a";
    
    version = g_version + ", " + a_version + ", " + fa_version;
  } else {
    version = tables.Version && tables.Version[0];
  }

  return (version);
}

export function RecordHeading(props) {
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
  } = attributes;

  let version = getSourceVersion(attributes, tables);
  let primaryPublication = getPrimaryPublication(record);

  return (
    <div>
      <props.DefaultComponent {...props}/>
      <div className="wdk-RecordOverview eupathdb-RecordOverview">
        
        {organism_prefix ? (
          <div className="eupathdb-RecordOverviewItem">
            <strong>Organism (source or reference): </strong>
            <span dangerouslySetInnerHTML={{__html: organism_prefix}}/>
          </div>
        ) : null}

        {newcategory ? (
          <div className="eupathdb-RecordOverviewItem">
            <strong>Category: </strong>
            <span>{newcategory}</span>
          </div>
        ) : null}

        {primaryPublication && primaryPublication.pubmed_link ? (
          <div className="eupathdb-RecordOverviewItem">
            <strong>Primary publication: </strong>
            <span>{renderPrimaryPublication(primaryPublication)}</span>
          </div>
        ) : null}

        {contact && institution ? (
          <div className="eupathdb-RecordOverviewItem">
            <strong>Primary contact: </strong>

            <span>{renderPrimaryContact(contact, institution, email, record)}</span>

          </div>
        ) : null}

        {version ? (
          <div className="eupathdb-RecordOverviewItem">
            <strong>Source version(s): </strong>
            <span>{renderSourceVersion(version, newcategory)}</span>
          </div>
        ) : null}

        {eupath_release ? (
          <div className="eupathdb-RecordOverviewItem">
            <strong>Release # / date: </strong>
            <span>{eupath_release}</span>
          </div>
        ) : null}
        
        <div className="eupathdb-RecordOverviewItem">
          <strong>Summary: </strong>
          <span style={{ whiteSpace: 'normal' }} dangerouslySetInnerHTML={{__html: summary}}/>
        </div>
     
        {megabase_pairs ? (
          <div className="eupathdb-RecordOverviewItem">
            <strong>Megabase Pairs: </strong>
            <span>{megabase_pairs}</span>
          </div>
        ) : null}

        {study_access ? (
          <StudyAccessOverviewItem study_access={study_access} record={record} />
        ) : null}

     </div>
    </div>
  );
}

const DatasetGraphTable = pure(function DatasetGraphTable(props) {
  return (
    <props.DefaultComponent
      {...props}
      childRow={childProps =>
        <DatasetGraph rowData={props.value[childProps.rowIndex]}/>}
    />
  );
});

function References(props) {
  let {questions, recordClasses} = props;
  if (questions == null || recordClasses == null) {
    return null;
  }
  let value = props.value
  .filter(row => row.target_type === 'question' || row.link_type === 'genomicsInternal')
  .map((row, index) => {
    if (row.link_type === 'question'){
      let name = row.target_name;
      let question = questions.find(q => q.fullName === name);

      if (question == null) {
        if (projectId === 'EuPathDB') {
          console.warn("Ignoring dataset reference `", name, "`. Unable to resolve with model.");
          return null;
        }
        throw new Error("cannot find question with name:" + name) ;
        // There are too many cases that are difficult to address right now, so we opt to ignore
      }

      let recordClass = recordClasses.find(r => r.urlSegment === question.outputRecordClassName);
      let searchName = `Identify ${recordClass.displayNamePlural} based on ${question.displayName}`;
      return (
        <li key={name}>
          <Link to={`/search/${recordClass.urlSegment}/${question.urlSegment}`}>
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
  state => ({
    questions: state.globalData.questions,
    recordClasses: state.globalData.recordClasses
  }),
  null
)(References);

export function RecordTable(props) {
  if (props.table.name === 'References') {
    return <ConnectedReferences {...props}/>;
  }
  if (props.table.name === 'ExampleGraphs') {
    return <DatasetGraphTable {...props}/>;
  }
  return <props.DefaultComponent {...props}/>;
}

export function RecordUI({ DefaultComponent, ...props }) {
  return (
    <React.Fragment>
      <DefaultComponent {...props}/>
      <JsonLinkedData {...props}/>
    </React.Fragment>
  );
}

function JsonLinkedData(props) {
  const { record } = props;
  const primaryPublication = getPrimaryPublication(record);
  const contacts = record.tables.Contacts && record.tables.Contacts.map(row => ({
    '@type': 'Person',
    name: row.contact_name,
    affiliation: row.affiliation
  }));

  const metadata = {
    "@context": "http://schema.org/",
    "@type": "Dataset",
    name: record.displayName,
    description: record.attributes.summary,
    publication: primaryPublication && {
      name: primaryPublication.pubmed_link.displayText,
      url: primaryPublication.pubmed_link.url,
    },
    contributor: contacts
  };

  return (
    <script type='application/ld+json'>{JSON.stringify(metadata)}</script>
  );
}


// helpers
function getPrimaryPublication(record) {
  const { tables } = record;
  return tables.Publications && tables.Publications[0];
}

function StudyAccessOverviewItem(props) {
  const { study_access, record } = props;
  const { loading, permissions } = usePermissions();
  const isUserApproved = !loading && isUserApprovedForAction(
    permissions,
    record.attributes.dataset_id,
    'download'
  );

  const attemptAction = useAttemptActionCallback();

  const requestAccessButton = (
    <button type="button" className="link" onClick={() => attemptAction('download', {
      studyId: record.attributes.dataset_id
    })}
    >request access</button>
  )

  function makeMessage() {
    switch(study_access) {
      case 'Prerelease':
        return 'Data downloads for this study are not yet available on this website.';
      case 'Public':
        return 'Data downloads for this study are public. Data are available without logging in.';
      case 'Controlled':
        return isUserApproved
          ? 'You have been granted access to download the data.'
          : <>To download data, please {requestAccessButton}. Data will be available immediately after submitting the request.</>;
      case 'Protected':
      default:
        return isUserApproved
          ? 'You have been granted access to download the data.'
          : <>To download data, please {requestAccessButton}. Data will be available upon study team review and approval.</>;
    }
  }

  return (
    <>
      <div className="eupathdb-RecordOverviewItem">
        <strong>Data accessibility: </strong>
        <span>{study_access}</span>
      </div>
      {loading ? null : (
        <div style={{ color: '#666', fontSize: '1.2em' }}>
          {makeMessage()}
        </div>
      )}
    </>
  );
}
