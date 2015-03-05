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
    var match = /(.*)\((.*)\)/.exec(link.value);
    return match ? ( <a target={newWindow ? '_blank' : '_self'} href={match[2]}>{match[1]}</a> ) : null;
  };

  var renderPrimaryPublication = function renderPrimaryPublication(publication) {
    var pubmedLink = _.find(publication, { name: 'pubmed_link' });
    return formatLink(pubmedLink, { newWindow: true });
  };

  var renderPrimaryContact = function renderPrimaryContact(contact, institution) {
    return contact.value + ', ' + institution.value;
  };

  var renderSourceVersion = function(version) {
    var v = _.find(version, { name: 'version' });
    return (
      v.value + ' (The data provider\'s version number or publication date, from' +
      ' the site the data was acquired. In the rare case neither is available,' +
      ' the download date.)'
    );
  };

  var Organisms = React.createClass({
    render() {
      var { organisms } = this.props;
      if (!organisms.value) return null;
      return (
        <div>
          <h3>Organisms this data set is mapped to in PlasmoDB</h3>
          <ul>{organisms.value.split(/,\s*/).map(this._renderOrganism)}</ul>
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
      var searches = this.props.searches.rows.filter(this._rowIsQuestion);

      if (searches.length === 0 && links.rows.length === 0) return null;

      return (
        <div>
          <h3>Search or view this data set in PlasmoDB</h3>
          <ul>
            {searches.map(this._renderSearch)}
            {links.rows.map(this._renderLink)}
          </ul>
        </div>
      );
    },

    _rowIsQuestion(row) {
      var type = _.find(row, { name: 'target_type' });
      return type && type.value == 'question';
    },

    _renderSearch(search, index) {
      var name = _.find(search, { name: 'target_name' });
      var names = [
        'Identify Genes based on P berghei ANKA 5 asexual and sexual stage transcriptomes RNASeq (fold change)',
        'Identify Genes based on P berghei ANKA 5 asexual and sexual stage transcriptomes RNASeq (fold change w/ pvalue)',
        'Identify Genes based on P berghei ANKA 5 asexual and sexual stage transcriptomes RNASeq (percentile)'
      ];
      return (
        <li key={index}><a href={'/a/showQuestion.do?questionFullName=' + name.value}>{names[index]}</a></li>
      );
    },

    _renderLink(link, index) {
      return (
        <li key={index}>{formatLink(_.find(link, { name: 'hyper_link'}))}</li>
      );
    }
  });

  var Links = React.createClass({
    render() {
      var { links } = this.props;

      if (links.rows.length === 0) return null;

      return (
        <div>
          <h3>External Links</h3>
          { /* <ul> {links.rows.map(this._renderLink)} </ul> */}
          <ul>
            <li><a href="http://www.ncbi.nlm.nih.gov/geo/tools/profileGraph.cgi?ID=GDS5092:10483626">GEO</a></li>
          </ul>
        </div>
      );
    },

    _renderLink(link, index) {
      return (
        <li key={index}>{formatLink(_.find(link, { name: 'hyper_link'}))}</li>
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
      var c = _.indexBy(contact, 'name');
      return (
        <li key={index}>{c.contact_name.value}, {c.affiliation.value}</li>
      );
    }
  });

  var Publications = React.createClass({
    render() {
      var { publications } = this.props;
      if (publications.rows.length === 0) return null;
      return (
        <div>
          <h4>Publications</h4>
          <ul>{publications.rows.map(this._renderPublication)}</ul>
        </div>
      );
    },

    _renderPublication(publication, index) {
      var p = _.indexBy(publication, 'name');
      return (
        <li key={index}>{formatLink(p.pubmed_link)}</li>
      );
    }
  });

  var ContactsAndPublications = React.createClass({
    render() {
      var { contacts, publications } = this.props;

      if (contacts.rows.length === 0 && publications.rows.length === 0) return null;

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
      if (graphs.rows.length === 0) return null;
      return (
        <div>
          <h3>Example Graphs</h3>
          <ul>{graphs.rows.map(this._renderGraph)}</ul>
        </div>
      );
    },

    _renderGraph(graph, index) {
      var g = _.indexBy(graph, 'name');
      var url = '/cgi-bin/dataPlotter.pl' +
        '?type= ' + g.module.value +
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
      var attributes = _.indexBy(record.attributes, 'name');
      var tables = _.indexBy(record.tables, 'name');
      var titleClass = 'eupathdb-DatasetRecord-title';

      return (
        <div className="eupathdb-DatasetRecord">
          <h1 dangerouslySetInnerHTML={{
            __html: 'Data set: <span class="' + titleClass + '">' + record.id + '</span>'
          }}/>

          <hr/>

          <p
            className="eupathdb-DatasetRecord-summary"
            dangerouslySetInnerHTML={{__html: attributes.summary.value}}
          />

          <table className="eupathdb-DatasetRecord-headerTable">
            <tbody>
              {tables.Publications.rows[0] ? (
                <tr>
                  <th>Primary publication:</th>
                  <td>{renderPrimaryPublication(tables.Publications.rows[0])}</td>
                </tr>
              ) : null}

              {attributes.contact.value && attributes.institution.value ? (
                <tr>
                  <th>Primary contact:</th>
                  <td>{renderPrimaryContact(attributes.contact, attributes.institution)}</td>
                </tr>
              ) : null}

              {tables.Version.rows[0] ? (
                <tr>
                  <th>Source version:</th>
                  <td>{renderSourceVersion(tables.Version.rows[0])}</td>
                </tr>
              ) : null}

            </tbody>
          </table>

          <hr/>

          <Organisms organisms={attributes.organisms}/>
          <Searches searches={tables.References} links={tables.HyperLinks}/>
          <Links links={tables.HyperLinks}/>
          <ContactsAndPublications contacts={tables.Contacts} publications={tables.Publications}/>


          <h3>Detailed Description</h3>
          <div dangerouslySetInnerHTML={{__html: attributes.description.value}}/>

          <Graphs graphs={tables.ExampleGraphs}/>
        </div>
      );
    }
  });

  ns.DatasetRecord = DatasetRecord;
});
