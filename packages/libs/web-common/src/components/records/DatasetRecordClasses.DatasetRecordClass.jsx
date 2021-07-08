import React from 'react';
import { connect } from 'react-redux';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import {pure} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import DatasetGraph from 'ebrc-client/components/DatasetGraph';

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
  if (newcategory === 'Genomics') {
    return (
      <span>
        {version}&nbsp;
        <i className="fa fa-question-circle" style={{ color: 'blue' }}
        title={'The source versions from' +
        ' the site the data was acquired.'}/>
      </span>
    );
  } else {
    return (
      <span>
        {version.version}&nbsp;
        <i className="fa fa-question-circle" style={{ color: 'blue' }}
          title={'The data provider\'s version number or publication date, from' +
          ' the site the data was acquired. In the rare case neither is available,' +
          ' the download date.'}/>
      </span>
    );
  }
}


function getSourceVersion(attributes, tables) {
  let version;
  if (attributes.newcategory === 'Genomics') {
    version = attributes.functional_annotation_version ? attributes.genome_version + ", " + attributes.annotation_version + ", " + attributes.functional_annotation_version : attributes.genome_version + ", " + attributes.annotation_version;
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
    megabase_pairs
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
            <strong>VEuPathDB release # / date: </strong>
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

      if (question == null) throw new Error("cannot find question with name:" + name) ;

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
      // Use text and url (after cleaning) to create link
      let cleanUrl = row.url.replace('/a/app','');
      return (
        <li key={index}>
          <Link to={`${cleanUrl}`}>
            {row.text}
          </Link>
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
