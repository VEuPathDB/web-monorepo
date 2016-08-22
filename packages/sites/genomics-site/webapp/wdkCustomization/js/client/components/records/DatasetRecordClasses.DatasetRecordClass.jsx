import React from 'react';
import DatasetGraph from '../common/DatasetGraph';

// Use Element.innerText to strip XML
function stripXML(str) {
  let div = document.createElement('div');
  div.innerHTML = str;
  return div.textContent;
}

function formatLink(link, opts) {
  opts = opts || {};
  let newWindow = !!opts.newWindow;
  return (
    <a href={link.url} target={newWindow ? '_blank' : '_self'}>{stripXML(link.displayText)}</a>
  );
}

function renderPrimaryPublication(publication) {
  return formatLink(publication.pubmed_link, { newWindow: true });
}

function renderPrimaryContact(contact, institution) {
  return contact + ', ' + institution;
}

function renderSourceVersion(version) {
  return (
    version.version + ' (The data provider\'s version number or publication date, from' +
    ' the site the data was acquired. In the rare case neither is available,' +
    ' the download date.)'
  );
}

export function RecordOverview(props) {
  let titleClass = 'eupathdb-DatasetRecord-title';
  let { record, questions, recordClasses } = props;
  let { attributes, tables } = record;
  let {
    summary,
    eupath_release,
    contact,
    institution,
    organism_prefix,
    organisms,
    description
  } = attributes;

  let version = tables.Version && tables.Version[0];
  let primaryPublication = tables.Publications && tables.Publications[0];

  return (
    <div className="wdk-RecordOverview eupathdb-RecordOverview">
      <div className="eupathdb-RecordOverviewItem">
        <strong>Summary: </strong>
        <span dangerouslySetInnerHTML={{__html: summary}}/>
      </div>

      {organism_prefix ? (
        <div className="eupathdb-RecordOverviewItem">
          <strong>Organism (source or reference): </strong>
          <span dangerouslySetInnerHTML={{__html: organism_prefix}}/>
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
          <span>{renderPrimaryContact(contact, institution)}</span>
        </div>
      ) : null}

      {version ? (
        <div className="eupathdb-RecordOverviewItem">
          <strong>Source version: </strong>
          <span>{renderSourceVersion(version)}</span>
        </div>
      ) : null}

      {eupath_release ? (
        <div className="eupathdb-RecordOverviewItem">
          <strong>EuPathDB release # / date: </strong>
          <span>{eupath_release}</span>
        </div>
      ) : null}
    </div>
  );
}

function DatasetGraphTable(props) {
  let included = props.table.properties.includeInTable || [];
  let table = Object.assign({}, props.table, {
    attributes: props.table.attributes.filter(tm => included.indexOf(tm.name) > -1)
  });

  return (
    <props.DefaultComponent
      {...props}
      table={table}
      childRow={childProps =>
        <DatasetGraph rowData={props.value[childProps.rowIndex]}/>}
      />
  );
}

function References(props, context) {
  let {questions, recordClasses, config} = context.store.getState().globalData || {};
  if (questions == null || recordClasses == null || config == null) {
    return <noscript/>;
  }
  let value = props.value
  .filter(row => row.target_type === 'question')
  .map(row => {
    let name = row.target_name;
    let question = questions.find(q => q.name === name);

    if (question == null) return null;

    let recordClass = recordClasses.find(r => r.name === question.recordClassName);
    let searchName = `Identify ${recordClass.displayNamePlural} by ${question.displayName}`;
    return (
      <li key={name}>
        <a href={`${config.webAppUrl}/showQuestion.do?questionFullName=${name}`}>{searchName}</a>
      </li>
    );
  });
  return value.length === 0 ? <em>No data available</em> : <ul>{value}</ul>;
}

References.contextTypes = {
  store: React.PropTypes.object.isRequired
};

export function RecordTable(props) {
  if (props.table.name === 'References') {
    return <References {...props}/>;
  }
  if (props.table.name === 'ExampleGraphs') {
    return <DatasetGraphTable {...props}/>;
  }
  return <props.DefaultComponent {...props}/>;
}
