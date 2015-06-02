import React from 'react';

// Use Element.innerText to strip XML
function stripXML(str) {
  var div = document.createElement('div');
  div.innerHTML = str;
  return div.textContent;
}

// format is {text}({link})
var formatLink = function formatLink(link, opts) {
  opts = opts || {};
  var newWindow = !!opts.newWindow;
  return (
    <a href={link.url} target={newWindow ? '_blank' : '_self'}>{stripXML(link.displayText)}</a>
  );
};

var renderPrimaryPublication = function renderPrimaryPublication(publication) {
  var pubmedLink = publication.find(function(pub) {
    return pub.name == 'pubmed_link';
  });
  return formatLink(pubmedLink.value, { newWindow: true });
};

var renderPrimaryContact = function renderPrimaryContact(contact, institution) {
  return contact + ', ' + institution;
};

var renderSourceVersion = function(version) {
  var name = version.find(v => v.name === 'version');
  return (
    name.value + ' (The data provider\'s version number or publication date, from' +
    ' the site the data was acquired. In the rare case neither is available,' +
    ' the download date.)'
  );
};

var Organisms = React.createClass({
  render() {
    var { organisms } = this.props;
    if (!organisms) return null;
    return (
      <div>
        <h2>Organisms this data set is mapped to in PlasmoDB</h2>
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

var Searches = React.createClass({
  render() {
    var rows = this.props.searches.rows;
    rows.map(row => _.indexBy(row, 'name')).filter(this._rowIsQuestion);

    if (rows.length === 0) return null;

    return (
      <div>
        <h2>Search or view this data set in PlasmoDB</h2>
        <ul>
          {rows.map(this._renderSearch)}
        </ul>
      </div>
    );
  },

  _rowIsQuestion(row) {
    var target_type = row.target_type;
    return target_type && target_type.value == 'question';
  },

  _renderSearch(row, index) {
    var name = row.find(attr => attr.name == 'target_name').value;
    var question = this.props.questions.find(q => q.name === name);

    if (question == null) return null;

    var recordClass = this.props.recordClasses.find(r => r.fullName === question.class);
    var searchName = `Identify ${recordClass.displayNamePlural} by ${question.displayName}`;
    return (
      <li key={index}>
        <a href={'/a/showQuestion.do?questionFullName=' + name}>{searchName}</a>
      </li>
    );
  }
});

var Links = React.createClass({
  render() {
    var { links } = this.props;

    if (links.rows.length === 0) return null;

    return (
      <div>
        <h2>Links</h2>
        <ul> {links.rows.map(this._renderLink)} </ul>
      </div>
    );
  },

  _renderLink(link, index) {
    var hyperLink = link.find(attr => attr.name == 'hyper_link');
    return (
      <li key={index}>{formatLink(hyperLink.value)}</li>
    );
  }
});

var Contacts = React.createClass({
  render() {
    var { contacts } = this.props;
    if (contacts.rows.length === 0) return null;
    return (
      <div>
        <h4>Contacts</h4>
        <ul>
          {contacts.rows.map(this._renderContact)}
        </ul>
      </div>
    );
  },

  _renderContact(contact, index) {
    var contact_name = contact.find(c => c.name == 'contact_name');
    var affiliation = contact.find(c => c.name == 'affiliation');
    return (
      <li key={index}>{contact_name.value}, {affiliation.value}</li>
    );
  }
});

var Publications = React.createClass({
  render() {
    var { publications } = this.props;
    var rows = publications.rows;
    if (rows.length === 0) return null;
    return (
      <div>
        <h4>Publications</h4>
        <ul>{rows.map(this._renderPublication)}</ul>
      </div>
    );
  },

  _renderPublication(publication, index) {
    var pubmed_link = publication.find(p => p.name == 'pubmed_link');
    return (
      <li key={index}>{formatLink(pubmed_link.value)}</li>
    );
  }
});

var ContactsAndPublications = React.createClass({
  render() {
    var { contacts, publications } = this.props;

    if (contacts.rows.length === 0 && publications.rows.length === 0) return null;

    return (
      <div>
        <h2>Additional Contacts and Publications</h2>
        <Contacts contacts={contacts}/>
        <Publications publications={publications}/>
      </div>
    );
  }
});

var ReleaseHistory = React.createClass({
  render() {
    var { history } = this.props;
    if (history.rows.length === 0) return null;
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
            {history.rows.map(this._renderRow)}
          </tbody>
        </table>
      </div>
    );
  },

  _renderRow(attributes) {
    var attrs = _.indexBy(attributes, 'name');

    var releaseDate = attrs.release_date.value.split(/\s+/)[0];

    var release = attrs.build.value == 0
      ? 'Initial release'
      : `${attrs.project.value} ${attrs.release_number.value} ${releaseDate}`;

    var genomeSource = attrs.genome_source.value
      ? attrs.genome_source.value + ' (' + attrs.genome_version.value + ')'
      : '';

    var annotationSource = attrs.annotation_source.value
      ? attrs.annotation_source.value + ' (' + attrs.annotation_version.value + ')'
      : '';

    return (
      <tr>
        <td>{release}</td>
        <td>{genomeSource}</td>
        <td>{annotationSource}</td>
        <td>{attrs.note.value}</td>
      </tr>
    );
  }
});

var Versions = React.createClass({
  render() {
    var { versions } = this.props;
    var rows = versions.rows;

    if (rows.length === 0) return null;

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
            {rows.map(this._renderRow)}
          </tbody>
        </table>
      </div>
    );
  },

  _renderRow(attributes) {
    var attrs = _.indexBy(attributes, 'name');
    return (
      <tr>
        <td>{attrs.organism.value}</td>
        <td>{attrs.version.value}</td>
      </tr>
    );
  }
});

var Graphs = React.createClass({
  render() {
    var { graphs } = this.props;
    var rows = graphs.rows;
    if (rows.length === 0) return null;
    return (
      <div>
        <h2>Example Graphs</h2>
        <ul>{rows.map(this._renderGraph)}</ul>
      </div>
    );
  },

  _renderGraph(graph, index) {
    var g = _.indexBy(graph, 'name');

    var displayName = g.display_name.value;

    var baseUrl = '/cgi-bin/dataPlotter.pl' +
      '?type=' + g.module.value +
      '&project_id=' + g.project_id.value +
      '&dataset=' + g.dataset_name.value +
      '&template=' + (g.is_graph_custom.value === 'false' ? 1 : '') +
      '&id=' + g.graph_ids.value;

    var imgUrl = baseUrl + '&fmt=png';
    var tableUrl = baseUrl + '&fmt=table';

    return (
      <li key={index}>
        <h3>{displayName}</h3>
        <div className="eupathdb-DatasetRecord-GraphMeta">
          <h3>Description</h3>
          <p dangerouslySetInnerHTML={{__html: g.description.value}}/>
          <h3>X-axis</h3>
          <p>{g.x_axis.value}</p>
          <h3>Y-axis</h3>
          <p>{g.y_axis.value}</p>
        </div>
        <div className="eupathdb-DatasetRecord-GraphData">
          <img className="eupathdb-DatasetRecord-GraphImg" src={imgUrl}/>
        </div>
      </li>
    );
  }
});

var IsolatesList = React.createClass({

  render() {
    var { rows } = this.props.isolates;
    if (rows.length === 0) return null;
    return (
      <div>
        <h2>Isolates / Samples</h2>
        <ul>{rows.map(this._renderRow)}</ul>
      </div>
    );
  },

  _renderRow(attributes) {
    var isolate_link = attributes.find(attr => attr.name === 'isolate_link');
    return (
      <li>{formatLink(isolate_link.value)}</li>
    );
  }
});

export var DatasetRecord = React.createClass({
  render() {
    var titleClass = 'eupathdb-DatasetRecord-title';
    var { record, questions, recordClasses } = this.props;
    var { attributes, tables } = record;
    var title = attributes.primary_key.value;
    var {
      summary,
      eupath_release,
      contact,
      institution,
      organism_prefix,
      organisms,
      description
    } = attributes;

    var version = tables.Version.rows[0];
    var primaryPublication = tables.Publications.rows[0];

    var {
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
      <div className="eupathdb-DatasetRecord ui-helper-clearfix">
        <h1 dangerouslySetInnerHTML={{
          __html: 'Data Set: <span class="' + titleClass + '">' + title + '</span>'
        }}/>

        <div className="eupathdb-DatasetRecord-Container ui-helper-clearfix">

          <hr/>

          <table className="eupathdb-DatasetRecord-headerTable">
            <tbody>

              <tr>
                <th>Summary:</th>
                <td dangerouslySetInnerHTML={{__html: summary.value}}/>
              </tr>

              {organism_prefix.value ? (
                <tr>
                  <th>Organism (source or reference):</th>
                  <td dangerouslySetInnerHTML={{__html: organism_prefix.value}}/>
                </tr>
              ) : null}

              {primaryPublication ? (
                <tr>
                  <th>Primary publication:</th>
                  <td>{renderPrimaryPublication(primaryPublication)}</td>
                </tr>
              ) : null}

              {contact.value && institution.value ? (
                <tr>
                  <th>Primary contact:</th>
                  <td>{renderPrimaryContact(contact.value, institution.value)}</td>
                </tr>
              ) : null}

              {version ? (
                <tr>
                  <th>Source version:</th>
                  <td>{renderSourceVersion(version)}</td>
                </tr>
              ) : null}

              {eupath_release.value ? (
                <tr>
                  <th>EuPathDB release # / date:</th>
                  <td>{eupath_release.value}</td>
                </tr>
              ) : null}

            </tbody>
          </table>

          <hr/>

          <div className="eupathdb-DatasetRecord-Main">
            <h2>Detailed Description</h2>
            <div dangerouslySetInnerHTML={{__html: description.value}}/>
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
      </div>
    );
  }
});

var Tooltip = React.createClass({
  componentDidMount() {
    //this._setupTooltip();
    this.$target = $(this.getDOMNode()).find('.wdk-RecordTable-recordLink');
  },
  componentDidUpdate() {
    this._destroyTooltip();
    //this._setupTooltip();
  },
  componentWillUnmount() {
    this._destroyTooltip();
  },
  _setupTooltip() {
    if (this.props.text == null || this.$target.data('hasqtip') != null) return;

    var text = `<div style="max-height: 200px; overflow-y: auto; padding: 2px;">${this.props.text}</div>`;
    var width = this.props.width;

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
    // FIXME - Figure out why we lose the fixed-data-table className
    // Losing the fixed-data-table className for some reason... adding it back.
    var child = React.Children.only(this.props.children);
    return React.addons.cloneWithProps(child, {
      className: child.props.className + " public_fixedDataTableCell_cellContent",
      onMouseOver: this._setupTooltip
    });
  }
});

export function datasetCellRenderer(attribute, attributeName, attributes, index, columnData, width, defaultRenderer) {
  var reactElement = defaultRenderer(attribute, attributeName, attributes, index, columnData, width);

  if (attribute.name === 'primary_key') {
    return (
      <Tooltip
        text={attributes.description.value}
        width={width}
      >{reactElement}</Tooltip>
    );
  }
  else {
    return reactElement;
  }
}
