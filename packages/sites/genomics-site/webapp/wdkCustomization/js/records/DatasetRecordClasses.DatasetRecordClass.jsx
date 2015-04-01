/* global _, Wdk, wdk */
/* jshint esnext: true, eqnull: true, -W014 */

/**
 * This file provides a custom Record Component which is used by the new Wdk
 * Flux architecture.
 *
 * The sibling file DatasetRecordClasses.DatasetRecordClass.js is generated
 * from this file using the jsx compiler. Eventually, this file will be
 * compiled during build time--this is a short-term solution.
 *
 * `wdk` is the legacy global object, and `Wdk` is the new global object
 */

wdk.namespace('eupathdb.records', function(ns) {
  "use strict";

  var React = Wdk.React;

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
    var match = /(.*)\((.*)\)/.exec(link.replace(/\n/g, ' '));
    if (match) {
      var text = stripXML(match[1]);
      var url = match[2];
      return ( <a target={newWindow ? '_blank' : '_self'} href={url}>{text}</a> );
    }
    return null;
  };

  var renderPrimaryPublication = function renderPrimaryPublication(publication) {
    var pubmedLink = publication.find(function(pub) {
      return pub.get('name') == 'pubmed_link';
    });
    return formatLink(pubmedLink.get('value'), { newWindow: true });
  };

  var renderPrimaryContact = function renderPrimaryContact(contact, institution) {
    return contact + ', ' + institution;
  };

  var renderSourceVersion = function(version) {
    var name = version.find(v => v.get('name') === 'version');
    return (
      name.get('value') + ' (The data provider\'s version number or publication date, from' +
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
          <ul>{organisms.split(/,\s*/).map(this._renderOrganism).toArray()}</ul>
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
      var searches = this.props.searches.get('rows').filter(this._rowIsQuestion);

      if (searches.size === 0) return null;

      return (
        <div>
          <h2>Search or view this data set in PlasmoDB</h2>
          <ul>
            {searches.map(this._renderSearch).toArray()}
          </ul>
        </div>
      );
    },

    _rowIsQuestion(row) {
      var type = row.find(attr => attr.get('name') == 'target_type');
      return type && type.get('value') == 'question';
    },

    _renderSearch(search, index) {
      var name = search.find(attr => attr.get('name') == 'target_name').get('value');
      var question = this.props.questions.find(q => q.get('name') === name);

      if (question == null) return null;

      var recordClass = this.props.recordClasses.find(r => r.get('fullName') === question.get('class'));
      var searchName = `Identify ${recordClass.get('displayNamePlural')} by ${question.get('displayName')}`;
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

      if (links.get('rows').size === 0) return null;

      return (
        <div>
          <h2>Links</h2>
          <ul> {links.get('rows').map(this._renderLink).toArray()} </ul>
        </div>
      );
    },

    _renderLink(link, index) {
      var hyperLink = link.find(attr => attr.get('name') == 'hyper_link');
      return (
        <li key={index}>{formatLink(hyperLink.get('value'))}</li>
      );
    }
  });

  var Contacts = React.createClass({
    render() {
      var { contacts } = this.props;
      if (contacts.get('rows').size === 0) return null;
      return (
        <div>
          <h4>Contacts</h4>
          <ul>
            {contacts.get('rows').map(this._renderContact).toArray()}
          </ul>
        </div>
      );
    },

    _renderContact(contact, index) {
      var contact_name = contact.find(c => c.get('name') == 'contact_name');
      var affiliation = contact.find(c => c.get('name') == 'affiliation');
      return (
        <li key={index}>{contact_name.get('value')}, {affiliation.get('value')}</li>
      );
    }
  });

  var Publications = React.createClass({
    render() {
      var { publications } = this.props;
      var rows = publications.get('rows');
      if (rows.size === 0) return null;
      return (
        <div>
          <h4>Publications</h4>
          <ul>{rows.map(this._renderPublication).toArray()}</ul>
        </div>
      );
    },

    _renderPublication(publication, index) {
      var pubmed_link = publication.find(p => p.get('name') == 'pubmed_link');
      return (
        <li key={index}>{formatLink(pubmed_link.get('value'))}</li>
      );
    }
  });

  var ContactsAndPublications = React.createClass({
    render() {
      var { contacts, publications } = this.props;

      if (contacts.get('rows').size === 0 && publications.get('rows').size === 0) return null;

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
      if (history.get('rows').size === 0) return null;
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
              {history.get('rows').map(this._renderRow).toArray()}
            </tbody>
          </table>
        </div>
      );
    },

    _renderRow(attributes) {
      var attrs = _.indexBy(attributes.toJS(), 'name');

      var release = attrs.build.value ? 'Release ' + attrs.build.value
        : 'Initial release';

      var releaseDate = attrs.release_date.value.split(/\s+/)[0];

      var genomeSource = attrs.genome_source.value
        ? attrs.genome_source.value + ' (' + attrs.genome_version.value + ')'
        : '';

      var annotationSource = attrs.annotation_source.value
        ? attrs.annotation_source.value + ' (' + attrs.annotation_version.value + ')'
        : '';

      return (
        <tr>
          <td>{release} ({releaseDate}, {attrs.project.value} {attrs.release_number.value})</td>
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
      var rows = versions.get('rows');

      if (rows.size === 0) return null;

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
              {rows.map(this._renderRow).toArray()}
            </tbody>
          </table>
        </div>
      );
    },

    _renderRow(attributes) {
      var attrs = _.indexBy(attributes.toJS(), 'name');
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
      var rows = graphs.get('rows');
      if (rows.size === 0) return null;
      return (
        <div>
          <h2>Example Graphs</h2>
          <ul>{rows.map(this._renderGraph).toArray()}</ul>
        </div>
      );
    },

    _renderGraph(graph, index) {
      var g = _.indexBy(graph.toJS(), 'name');

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

  var DatasetRecord = React.createClass({
    render() {
      var { record, questions, recordClasses } = this.props;
      var attributes = record.get('attributes');
      var tables = record.get('tables');
      var titleClass = 'eupathdb-DatasetRecord-title';

      var id = record.get('id');
      var summary = attributes.getIn(['summary', 'value']);
      var releaseInfo = attributes.getIn(['eupath_release', 'value']);
      var primaryPublication = tables.getIn(['Publications', 'rows', 0]);
      var contact = attributes.getIn(['contact', 'value']);
      var institution = attributes.getIn(['institution', 'value']);
      var version = attributes.getIn(['Version', 'rows', 0]);
      var organism = attributes.getIn(['organism_prefix', 'value']);
      var organisms = attributes.getIn(['organisms', 'value']);
      var References = tables.get('References');
      var HyperLinks = tables.get('HyperLinks');
      var Contacts = tables.get('Contacts');
      var Publications = tables.get('Publications');
      var description = attributes.getIn(['description', 'value']);
      var GenomeHistory = tables.get('GenomeHistory');
      var Version = tables.get('Version');
      var ExampleGraphs = tables.get('ExampleGraphs');

      return (
        <div className="eupathdb-DatasetRecord ui-helper-clearfix">
          <h1 dangerouslySetInnerHTML={{
            __html: 'Data Set: <span class="' + titleClass + '">' + id + '</span>'
          }}/>

          <div className="eupathdb-DatasetRecord-Container ui-helper-clearfix">

            <hr/>

            <table className="eupathdb-DatasetRecord-headerTable">
              <tbody>

                <tr>
                  <th>Summary:</th>
                  <td dangerouslySetInnerHTML={{__html: summary}}/>
                </tr>

                {organism ? (
                  <tr>
                    <th>Organism (source or reference):</th>
                    <td dangerouslySetInnerHTML={{__html: organism}}/>
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

                {releaseInfo ? (
                  <tr>
                    <th>EuPathDB release # / date:</th>
                    <td>{releaseInfo}</td>
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
      if (this.props.text == null) return;

      var text = `<div style="max-height: 200px; overflow-y: auto; padding: 2px;">${this.props.text}</div>`;
      var width = this.props.width;

      this.$target = $(this.getDOMNode()).find('.wdk-RecordTable-recordLink')
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
      child.props.className += " public_fixedDataTableCell_cellContent";
      return child;
      //return this.props.children;
    }
  });

  function datasetCellRenderer(attribute, attributeName, attributes, index, columnData, width, defaultRenderer) {
    var reactElement = defaultRenderer(attribute, attributeName, attributes, index, columnData, width);

    if (attribute.get('name') === 'primary_key') {
      return (
        <Tooltip
          text={attributes.get('description').get('value')}
          width={width}
        >{reactElement}</Tooltip>
      );
    }
    else {
      return reactElement;
    }
  }

  ns.DatasetRecord = DatasetRecord;
  ns.datasetCellRenderer = datasetCellRenderer;
});
