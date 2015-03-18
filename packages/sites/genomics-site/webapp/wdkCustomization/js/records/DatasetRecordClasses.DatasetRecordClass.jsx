/* global _, Wdk, wdk */

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

  // format is {text}({link})
  var formatLink = function formatLink(link, opts) {
    opts = opts || {};
    var newWindow = !!opts.newWindow;
    var match = /(.*)\((.*)\)/.exec(link.replace(/\n/g, ' '));
    return match ? ( <a target={newWindow ? '_blank' : '_self'} href={match[2]}>{match[1]}</a> ) : null;
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
          <h3>Organisms this data set is mapped to in PlasmoDB</h3>
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
      var links = this.props.links;
      var searches = this.props.searches.get('rows').filter(this._rowIsQuestion);

      if (searches.size === 0 && links.get('rows').size === 0) return null;

      return (
        <div>
          <h3>Search or view this data set in PlasmoDB</h3>
          <ul>
            {searches.map(this._renderSearch).toArray()}
            {links.get('rows').map(this._renderLink).toArray()}
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
      var question = this.props.questions.find(q => q.get('name') === name).get('displayName');
      return (
        <li key={index}>
          <a href={'/a/showQuestion.do?questionFullName=' + name}>{question}</a>
        </li>
      );
    },

    _renderLink(link, index) {
      var hyperLink = link.find(attr => attr.get('name') == 'hyper_link');
      return (
        <li key={index}>{formatLink(hyperLink.get('value'))}</li>
      );
    }
  });

  var Links = React.createClass({
    render() {
      var { links } = this.props;

      if (links.get('rows').size === 0) return null;

      return (
        <div>
          <h3>External Links</h3>
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
          <h3>Additional Contacts and Publications</h3>
          <Contacts contacts={contacts}/>
          <Publications publications={publications}/>
        </div>
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
          <h3>Example Graphs</h3>
          <ul>{rows.map(this._renderGraph).toArray()}</ul>
        </div>
      );
    },

    _renderGraph(graph, index) {
      var g = _.indexBy(graph.toJS(), 'name');
      var url = '/cgi-bin/dataPlotter.pl' +
        '?type=' + g.module.value +
        '&project_id=' + g.project_id.value +
        '&dataset=' + g.dataset_name.value +
        '&template=1&fmt=png&id=' + g.graph_ids.value;
      return (
        <li key={index}><img src={url}/></li>
      );
    }
  });

  var DatasetRecord = React.createClass({
    render() {
      var { record } = this.props;
      var attributes = record.get('attributes');
      var tables = record.get('tables');
      var titleClass = 'eupathdb-DatasetRecord-title';

      var id = record.get('id');
      var summary = attributes.getIn(['summary', 'value']);
      var primaryPublication = tables.getIn(['Publications', 'rows', 0]);
      var contact = attributes.getIn(['contact', 'value']);
      var institution = attributes.getIn(['institution', 'value']);
      var version = attributes.getIn(['Version', 'rows', 0]);
      var organisms = attributes.getIn(['organisms', 'value']);
      var References = tables.get('References');
      var HyperLinks = tables.get('HyperLinks');
      var Contacts = tables.get('Contacts');
      var Publications = tables.get('Publications');
      var description = attributes.getIn(['description', 'value']);
      var ExampleGraphs = tables.get('ExampleGraphs');

      return (
        <div className="eupathdb-DatasetRecord">
          <h1 dangerouslySetInnerHTML={{
            __html: 'Data set: <span class="' + titleClass + '">' + id + '</span>'
          }}/>

          <hr/>

          <p
            className="eupathdb-DatasetRecord-summary"
            dangerouslySetInnerHTML={{__html: summary}}
          />

          <table className="eupathdb-DatasetRecord-headerTable">
            <tbody>
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

            </tbody>
          </table>

          <hr/>

          <Organisms organisms={organisms}/>
          <Searches searches={References} links={HyperLinks} questions={this.props.questions}/>
          <Links links={HyperLinks}/>
          <ContactsAndPublications contacts={Contacts} publications={Publications}/>


          <h3>Detailed Description</h3>
          <div dangerouslySetInnerHTML={{__html: description}}/>

          <Graphs graphs={ExampleGraphs}/>
        </div>
      );
    }
  });

  ns.DatasetRecord = DatasetRecord;
});
