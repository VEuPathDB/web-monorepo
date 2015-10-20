import React from 'react';

let { Main } = Wdk.client.Components;

// Use Element.innerText to strip XML
function stripXML(str) {
  let div = document.createElement('div');
  div.innerHTML = str;
  return div.textContent;
}

// format is {text}({link})
let formatLink = function formatLink(link, opts) {
  opts = opts || {};
  let newWindow = !!opts.newWindow;
  return (
    <a href={link.url} target={newWindow ? '_blank' : '_self'}>{stripXML(link.displayText)}</a>
  );
};

let renderPrimaryPublication = function renderPrimaryPublication(publication) {
  return formatLink(publication.pubmed_link, { newWindow: true });
};

let renderPrimaryContact = function renderPrimaryContact(contact, institution) {
  return contact + ', ' + institution;
};

let renderSourceVersion = function(version) {
  return (
    version.version + ' (The data provider\'s version number or publication date, from' +
    ' the site the data was acquired. In the rare case neither is available,' +
    ' the download date.)'
  );
};

let Organisms = React.createClass({
  render() {
    let { organisms } = this.props;
    if (!organisms) return null;
    return (
      <div>
        <h2>Organisms this data set is mapped to in {wdk.MODEL_NAME}</h2>
        <ul>{organisms.split(/,\s*/).map(this._renderOrganism)}</ul>
      </div>
    );
  },

  _renderOrganism(organism, index) {
    return (
      <li key={index}><i>{organism}</i></li>
    );
  }
});

let Searches = React.createClass({
  render() {
    let rows = this.props.searches.filter(search => search.target_type === 'question');

    if (rows.length === 0) return null;

    return (
      <div>
        <h2>Search or view this data set in {wdk.MODEL_NAME}</h2>
        <ul>
          {rows.map(this._renderSearch)}
        </ul>
      </div>
    );
  },

  _renderSearch(row, index) {
    let name = row.target_name;
    let question = this.props.questions.find(q => q.name === name);

    if (question == null) return null;

    let recordClass = this.props.recordClasses.find(r => r.fullName === question.class);
    let searchName = `Identify ${recordClass.displayNamePlural} by ${question.displayName}`;
    return (
      <li key={index}>
        <a href={'/a/showQuestion.do?questionFullName=' + name}>{searchName}</a>
      </li>
    );
  }
});

let Links = React.createClass({
  render() {
    let { links } = this.props;

    if (links.length === 0) return null;

    return (
      <div>
        <h2>Links</h2>
        <ul> {links.map(this._renderLink)} </ul>
      </div>
    );
  },

  _renderLink(link, index) {
    return (
      <li key={index}>{formatLink(link.hyper_link)}</li>
    );
  }
});

let Contacts = React.createClass({
  render() {
    let { contacts } = this.props;
    if (contacts.length === 0) return null;
    return (
      <div>
        <h4>Contacts</h4>
        <ul>
          {contacts.map(this._renderContact)}
        </ul>
      </div>
    );
  },

  _renderContact(contact, index) {
    return (
      <li key={index}>{contact.contact_name}, {contact.affiliation}</li>
    );
  }
});

let Publications = React.createClass({
  render() {
    let { publications } = this.props;
    if (publications.length === 0) return null;
    return (
      <div>
        <h4>Publications</h4>
        <ul>{publications.map(this._renderPublication)}</ul>
      </div>
    );
  },

  _renderPublication(publication, index) {
    return (
      <li key={index}>{formatLink(publication.pubmed_link)}</li>
    );
  }
});

let ContactsAndPublications = React.createClass({
  render() {
    let { contacts, publications } = this.props;

    if (contacts.length === 0 && publications.length === 0) return null;

    return (
      <div>
        <h2>Additional Contacts and Publications</h2>
        <Contacts contacts={contacts}/>
        <Publications publications={publications}/>
      </div>
    );
  }
});

let ReleaseHistory = React.createClass({
  render() {
    let { history } = this.props;
    if (history.length === 0) return null;
    return (
      <div>
        <h2>Data Set Release History</h2>
        <table>
          <thead>
            <tr>
              <th>EuPathDB Release</th>
              <th>Genome Source</th>
              <th>Annotation Source</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {history.map(this._renderRow)}
          </tbody>
        </table>
      </div>
    );
  },

  _renderRow(attributes) {
    let releaseDate = attributes.release_date.split(/\s+/)[0];

    let release = attributes.build == 0
      ? 'Initial release'
      : `${attributes.project} ${attributes.release_number} ${releaseDate}`;

    let genomeSource = attributes.genome_source
      ? attributes.genome_source + ' (' + attributes.genome_version + ')'
      : '';

    let annotationSource = attributes.annotation_source
      ? attributes.annotation_source + ' (' + attributes.annotation_version + ')'
      : '';

    return (
      <tr>
        <td>{release}</td>
        <td>{genomeSource}</td>
        <td>{annotationSource}</td>
        <td>{attributes.note}</td>
      </tr>
    );
  }
});

let Versions = React.createClass({
  render() {
    let { versions } = this.props;

    if (versions.length === 0) return null;

    return (
      <div>
        <h2>Provider's Version</h2>
        <p>
          The data set version shown here is the data provider's version
          number or publication date indicated on the site from which we
          downloaded the data. In the rare case that these are not available,
          the version is the date that the data set was downloaded.
        </p>
        <table>
          <thead>
            <tr>
              <th>Organism</th>
              <th>Provider's Version</th>
            </tr>
          </thead>
          <tbody>
            {versions.map(this._renderRow)}
          </tbody>
        </table>
      </div>
    );
  },

  _renderRow(attributes) {
    return (
      <tr>
        <td>{attributes.organism}</td>
        <td>{attributes.version}</td>
      </tr>
    );
  }
});

let Graphs = React.createClass({
  render() {
    let { graphs } = this.props;
    if (graphs.length === 0) return null;
    return (
      <div>
        <h2>Example Graphs</h2>
        <ul>{graphs.map(this._renderGraph)}</ul>
      </div>
    );
  },

  _renderGraph(graph, index) {
    let displayName = graph.display_name;

    let baseUrl = '/cgi-bin/dataPlotter.pl' +
      '?type=' + graph.module +
      '&project_id=' + graph.project_id +
      '&dataset=' + graph.dataset_name +
      '&template=' + (graph.is_graph_custom === 'false' ? 1 : '') +
      '&id=' + graph.graph_ids;

    let imgUrl = baseUrl + '&fmt=png';
    let tableUrl = baseUrl + '&fmt=table';

    return (
      <li key={index}>
        <h3>{displayName}</h3>
        <div className="eupathdb-DatasetRecord-GraphMeta">
          <h3>Description</h3>
          <p dangerouslySetInnerHTML={{__html: graph.description}}/>
          <h3>X-axis</h3>
          <p>{graph.x_axis}</p>
          <h3>Y-axis</h3>
          <p>{graph.y_axis}</p>
        </div>
        <div className="eupathdb-DatasetRecord-GraphData">
          <img className="eupathdb-DatasetRecord-GraphImg" src={imgUrl}/>
        </div>
      </li>
    );
  }
});

let IsolatesList = React.createClass({

  render() {
    let { isolates } = this.props;
    if (isolates.length === 0) return null;
    return (
      <div>
        <h2>Isolates / Samples</h2>
        <ul>{isolates.map(this._renderRow)}</ul>
      </div>
    );
  },

  _renderRow(attributes) {
    return (
      <li>{formatLink(attributes.isolate_link)}</li>
    );
  }
});

export let DatasetRecord = React.createClass({
  render() {
    let titleClass = 'eupathdb-DatasetRecord-title';
    let { record, questions, recordClasses } = this.props;
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

    let version = tables.Version[0];
    let primaryPublication = tables.Publications[0];

    let {
      References,
      HyperLinks,
      Contacts,
      Publications,
      GenomeHistory,
      Version,
      ExampleGraphs,
      Isolates
    } = tables;

    return (
      <Main className="eupathdb-DatasetRecord">
        <h1 dangerouslySetInnerHTML={{
          __html: 'Data Set: <span class="' + titleClass + '">' + attributes.primary_key + '</span>'
        }}/>

        <div className="eupathdb-DatasetRecord-Container ui-helper-clearfix">

          <hr/>

          <table className="eupathdb-DatasetRecord-headerTable">
            <tbody>

              <tr>
                <th>Summary:</th>
                <td dangerouslySetInnerHTML={{__html: summary}}/>
              </tr>

              {organism_prefix ? (
                <tr>
                  <th>Organism (source or reference):</th>
                  <td dangerouslySetInnerHTML={{__html: organism_prefix}}/>
                </tr>
              ) : null}

              {primaryPublication ? (
                <tr>
                  <th>Primary publication:</th>
                  <td>{renderPrimaryPublication(primaryPublication)}</td>
                </tr>
              ) : null}

              {contact && institution ? (
                <tr>
                  <th>Primary contact:</th>
                  <td>{renderPrimaryContact(contact, institution)}</td>
                </tr>
              ) : null}

              {version ? (
                <tr>
                  <th>Source version:</th>
                  <td>{renderSourceVersion(version)}</td>
                </tr>
              ) : null}

              {eupath_release ? (
                <tr>
                  <th>EuPathDB release # / date:</th>
                  <td>{eupath_release}</td>
                </tr>
              ) : null}

            </tbody>
          </table>

          <hr/>

          <div className="eupathdb-DatasetRecord-Main">
            <h2>Detailed Description</h2>
            <div dangerouslySetInnerHTML={{__html: description}}/>
            <ContactsAndPublications contacts={Contacts} publications={Publications}/>
          </div>

          <div className="eupathdb-DatasetRecord-Sidebar">
            <Organisms organisms={organisms}/>
            <Searches searches={References} questions={questions} recordClasses={recordClasses}/>
            <Links links={HyperLinks}/>
            <IsolatesList isolates={Isolates}/>
            <ReleaseHistory history={GenomeHistory}/>
            <Versions versions={Version}/>
          </div>

        </div>
        <Graphs graphs={ExampleGraphs}/>
      </Main>
    );
  }
});

export let Tooltip = React.createClass({
  componentDidMount() {
    this.$target = $(React.findDOMNode(this));
    this._setupTooltip();
  },
  componentDidUpdate() {
    this._destroyTooltip();
    this._setupTooltip();
  },
  componentWillUnmount() {
    this._destroyTooltip();
  },
  _setupTooltip() {
    if (this.props.text == null || this.$target.data('hasqtip') != null) return;

    let text = `<div style="max-height: 200px; overflow-y: auto; padding: 2px;">${this.props.text}</div>`;
    let width = this.props.width;

    this.$target
      .wdkTooltip({
        overwrite: true,
        content: { text },
        show: { delay: 1000 },
        position: { my: 'top left', at: 'bottom left', adjust: { y: 12 } }
      });
  },
  _destroyTooltip() {
    // if _setupTooltip doesn't do anything, this is a noop
    if (this.$target) {
      this.$target.qtip('destroy', true);
    }
  },
  render() {
    return this.props.children;
  }
});
