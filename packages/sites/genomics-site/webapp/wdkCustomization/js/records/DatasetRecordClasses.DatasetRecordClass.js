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
    return match ? ( React.createElement("a", {target: newWindow ? '_blank' : '_self', href: match[2]}, match[1]) ) : null;
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

  var Organisms = React.createClass({displayName: "Organisms",
    render:function() {
      var $__0=    this.props,organisms=$__0.organisms;
      if (!organisms.value) return null;
      return (
        React.createElement("div", null, 
          React.createElement("h3", null, "Organisms this data set is mapped to in PlasmoDB"), 
          React.createElement("ul", null, organisms.value.split(/,\s*/).map(this._renderOrganism))
        )
      );
    },

    _renderOrganism:function(organism, index) {
      return (
        React.createElement("li", {key: index}, React.createElement("i", null, organism))
      );
    }
  });

  var Searches = React.createClass({displayName: "Searches",
    render:function() {
      var links = this.props.links;
      var searches = this.props.searches.rows.filter(this._rowIsQuestion);

      if (searches.length === 0 && links.rows.length === 0) return null;

      return (
        React.createElement("div", null, 
          React.createElement("h3", null, "Search or view this data set in PlasmoDB"), 
          React.createElement("ul", null, 
            searches.map(this._renderSearch), 
            links.rows.map(this._renderLink)
          )
        )
      );
    },

    _rowIsQuestion:function(row) {
      var type = _.find(row, { name: 'target_type' });
      return type && type.value == 'question';
    },

    _renderSearch:function(search, index) {
      var name = _.find(search, { name: 'target_name' });
      var names = [
        'Identify Genes based on P berghei ANKA 5 asexual and sexual stage transcriptomes RNASeq (fold change)',
        'Identify Genes based on P berghei ANKA 5 asexual and sexual stage transcriptomes RNASeq (fold change w/ pvalue)',
        'Identify Genes based on P berghei ANKA 5 asexual and sexual stage transcriptomes RNASeq (percentile)'
      ];
      return (
        React.createElement("li", {key: index}, React.createElement("a", {href: '/a/showQuestion.do?questionFullName=' + name.value}, names[index]))
      );
    },

    _renderLink:function(link, index) {
      return (
        React.createElement("li", {key: index}, formatLink(_.find(link, { name: 'hyper_link'})))
      );
    }
  });

  var Links = React.createClass({displayName: "Links",
    render:function() {
      var $__0=    this.props,links=$__0.links;

      if (links.rows.length === 0) return null;

      return (
        React.createElement("div", null, 
          React.createElement("h3", null, "External Links"), 
          /* <ul> {links.rows.map(this._renderLink)} </ul> */
          React.createElement("ul", null, 
            React.createElement("li", null, React.createElement("a", {href: "http://www.ncbi.nlm.nih.gov/geo/tools/profileGraph.cgi?ID=GDS5092:10483626"}, "GEO"))
          )
        )
      );
    },

    _renderLink:function(link, index) {
      return (
        React.createElement("li", {key: index}, formatLink(_.find(link, { name: 'hyper_link'})))
      );
    }
  });

  var Contacts = React.createClass({displayName: "Contacts",
    render:function() {
      var $__0=    this.props,contacts=$__0.contacts;
      if (contacts.rows.length === 0) return null;
      return (
        React.createElement("div", null, 
          React.createElement("h4", null, "Contacts"), 
          React.createElement("ul", null, 
            contacts.rows.map(this._renderContact)
          )
        )
      );
    },

    _renderContact:function(contact, index) {
      var c = _.indexBy(contact, 'name');
      return (
        React.createElement("li", {key: index}, c.contact_name.value, ", ", c.affiliation.value)
      );
    }
  });

  var Publications = React.createClass({displayName: "Publications",
    render:function() {
      var $__0=    this.props,publications=$__0.publications;
      if (publications.rows.length === 0) return null;
      return (
        React.createElement("div", null, 
          React.createElement("h4", null, "Publications"), 
          React.createElement("ul", null, publications.rows.map(this._renderPublication))
        )
      );
    },

    _renderPublication:function(publication, index) {
      var p = _.indexBy(publication, 'name');
      return (
        React.createElement("li", {key: index}, formatLink(p.pubmed_link))
      );
    }
  });

  var ContactsAndPublications = React.createClass({displayName: "ContactsAndPublications",
    render:function() {
      var $__0=     this.props,contacts=$__0.contacts,publications=$__0.publications;

      if (contacts.rows.length === 0 && publications.rows.length === 0) return null;

      return (
        React.createElement("div", null, 
          React.createElement("h3", null, "Additional Contacts and Publications"), 
          React.createElement(Contacts, {contacts: contacts}), 
          React.createElement(Publications, {publications: publications})
        )
      );
    }
  });

  var Graphs = React.createClass({displayName: "Graphs",
    render:function() {
      var $__0=    this.props,graphs=$__0.graphs;
      if (graphs.rows.length === 0) return null;
      return (
        React.createElement("div", null, 
          React.createElement("h3", null, "Example Graphs"), 
          React.createElement("ul", null, graphs.rows.map(this._renderGraph))
        )
      );
    },

    _renderGraph:function(graph, index) {
      var g = _.indexBy(graph, 'name');
      var url = '/cgi-bin/dataPlotter.pl' +
        '?type= ' + g.module.value +
        '&project_id=' + g.project_id.value +
        '&dataset=' + g.dataset_name.value +
        '&template=1&fmt=png&id=' + g.graph_ids.value;
      return (
        React.createElement("li", {key: index}, React.createElement("img", {src: url}))
      );
    }
  });

  var DatasetRecord = React.createClass({displayName: "DatasetRecord",
    render:function() {
      var $__0=    this.props,record=$__0.record;
      var attributes = _.indexBy(record.attributes, 'name');
      var tables = _.indexBy(record.tables, 'name');
      var titleClass = 'eupathdb-DatasetRecord-title';

      return (
        React.createElement("div", {className: "eupathdb-DatasetRecord"}, 
          React.createElement("h1", {dangerouslySetInnerHTML: {
            __html: 'Data set: <span class="' + titleClass + '">' + record.id + '</span>'
          }}), 

          React.createElement("hr", null), 

          React.createElement("p", {
            className: "eupathdb-DatasetRecord-summary", 
            dangerouslySetInnerHTML: {__html: attributes.summary.value}}
          ), 

          React.createElement("table", {className: "eupathdb-DatasetRecord-headerTable"}, 
            React.createElement("tbody", null, 
              tables.Publications.rows[0] ? (
                React.createElement("tr", null, 
                  React.createElement("th", null, "Primary publication:"), 
                  React.createElement("td", null, renderPrimaryPublication(tables.Publications.rows[0]))
                )
              ) : null, 

              attributes.contact.value && attributes.institution.value ? (
                React.createElement("tr", null, 
                  React.createElement("th", null, "Primary contact:"), 
                  React.createElement("td", null, renderPrimaryContact(attributes.contact, attributes.institution))
                )
              ) : null, 

              tables.Version.rows[0] ? (
                React.createElement("tr", null, 
                  React.createElement("th", null, "Source version:"), 
                  React.createElement("td", null, renderSourceVersion(tables.Version.rows[0]))
                )
              ) : null

            )
          ), 

          React.createElement("hr", null), 

          React.createElement(Organisms, {organisms: attributes.organisms}), 
          React.createElement(Searches, {searches: tables.References, links: tables.HyperLinks}), 
          React.createElement(Links, {links: tables.HyperLinks}), 
          React.createElement(ContactsAndPublications, {contacts: tables.Contacts, publications: tables.Publications}), 


          React.createElement("h3", null, "Detailed Description"), 
          React.createElement("div", {dangerouslySetInnerHTML: {__html: attributes.description.value}}), 

          React.createElement(Graphs, {graphs: tables.ExampleGraphs})
        )
      );
    }
  });

  ns.DatasetRecord = DatasetRecord;
});
