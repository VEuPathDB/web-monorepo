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

  // format is {text}({link})
  var formatLink = function formatLink(link, opts) {
    opts = opts || {};
    var newWindow = !!opts.newWindow;
    var match = /(.*)\((.*)\)/.exec(link.replace(/\n/g, ' '));
    return match ? ( React.createElement("a", {target: newWindow ? '_blank' : '_self', href: match[2]}, match[1]) ) : null;
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
    var name = version.find(function(v)  {return v.get('name') === 'version';});
    return (
      name.get('value') + ' (The data provider\'s version number or publication date, from' +
      ' the site the data was acquired. In the rare case neither is available,' +
      ' the download date.)'
    );
  };

  var Organisms = React.createClass({displayName: "Organisms",
    render:function() {
      var $__0=    this.props,organisms=$__0.organisms;
      if (!organisms) return null;
      return (
        React.createElement("div", null, 
          React.createElement("h3", null, "Organisms this data set is mapped to in PlasmoDB"), 
          React.createElement("ul", null, organisms.split(/,\s*/).map(this._renderOrganism).toArray())
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
      var searches = this.props.searches.get('rows').filter(this._rowIsQuestion);

      if (searches.size === 0 && links.get('rows').size === 0) return null;

      return (
        React.createElement("div", null, 
          React.createElement("h3", null, "Search or view this data set in PlasmoDB"), 
          React.createElement("ul", null, 
            searches.map(this._renderSearch).toArray(), 
            links.get('rows').map(this._renderLink).toArray()
          )
        )
      );
    },

    _rowIsQuestion:function(row) {
      var type = row.find(function(attr)  {return attr.get('name') == 'target_type';});
      return type && type.get('value') == 'question';
    },

    _renderSearch:function(search, index) {
      var name = search.find(function(attr)  {return attr.get('name') == 'target_name';}).get('value');
      var question = this.props.questions.find(function(q)  {return q.get('name') === name;});

      if (question == null) return null;

      var recordClass = this.props.recordClasses.find(function(r)  {return r.get('fullName') === question.get('class');});
      var searchName = ("Identify " + recordClass.get('displayNamePlural') + " by " + question.get('displayName'));
      return (
        React.createElement("li", {key: index}, 
          React.createElement("a", {href: '/a/showQuestion.do?questionFullName=' + name}, searchName)
        )
      );
    },

    _renderLink:function(link, index) {
      var hyperLink = link.find(function(attr)  {return attr.get('name') == 'hyper_link';});
      return (
        React.createElement("li", {key: index}, formatLink(hyperLink.get('value')))
      );
    }
  });

  var Links = React.createClass({displayName: "Links",
    render:function() {
      var $__0=    this.props,links=$__0.links;

      if (links.get('rows').size === 0) return null;

      return (
        React.createElement("div", null, 
          React.createElement("h3", null, "External Links"), 
          React.createElement("ul", null, " ", links.get('rows').map(this._renderLink).toArray(), " ")
        )
      );
    },

    _renderLink:function(link, index) {
      var hyperLink = link.find(function(attr)  {return attr.get('name') == 'hyper_link';});
      return (
        React.createElement("li", {key: index}, formatLink(hyperLink.get('value')))
      );
    }
  });

  var Contacts = React.createClass({displayName: "Contacts",
    render:function() {
      var $__0=    this.props,contacts=$__0.contacts;
      if (contacts.get('rows').size === 0) return null;
      return (
        React.createElement("div", null, 
          React.createElement("h4", null, "Contacts"), 
          React.createElement("ul", null, 
            contacts.get('rows').map(this._renderContact).toArray()
          )
        )
      );
    },

    _renderContact:function(contact, index) {
      var contact_name = contact.find(function(c)  {return c.get('name') == 'contact_name';});
      var affiliation = contact.find(function(c)  {return c.get('name') == 'affiliation';});
      return (
        React.createElement("li", {key: index}, contact_name.get('value'), ", ", affiliation.get('value'))
      );
    }
  });

  var Publications = React.createClass({displayName: "Publications",
    render:function() {
      var $__0=    this.props,publications=$__0.publications;
      var rows = publications.get('rows');
      if (rows.size === 0) return null;
      return (
        React.createElement("div", null, 
          React.createElement("h4", null, "Publications"), 
          React.createElement("ul", null, rows.map(this._renderPublication).toArray())
        )
      );
    },

    _renderPublication:function(publication, index) {
      var pubmed_link = publication.find(function(p)  {return p.get('name') == 'pubmed_link';});
      return (
        React.createElement("li", {key: index}, formatLink(pubmed_link.get('value')))
      );
    }
  });

  var ContactsAndPublications = React.createClass({displayName: "ContactsAndPublications",
    render:function() {
      var $__0=     this.props,contacts=$__0.contacts,publications=$__0.publications;

      if (contacts.get('rows').size === 0 && publications.get('rows').size === 0) return null;

      return (
        React.createElement("div", null, 
          React.createElement("h3", null, "Additional Contacts and Publications"), 
          React.createElement(Contacts, {contacts: contacts}), 
          React.createElement(Publications, {publications: publications})
        )
      );
    }
  });

  var ReleaseHistory = React.createClass({displayName: "ReleaseHistory",
    render:function() {
      var $__0=    this.props,history=$__0.history;
      if (history.get('rows').size === 0) return null;
      return (
        React.createElement("div", null, 
          React.createElement("h3", null, "Data Set Release History"), 
          React.createElement("table", null, 
            React.createElement("thead", null, 
              React.createElement("tr", null, 
                React.createElement("th", null, "EuPathDB Release"), 
                React.createElement("th", null, "Genome Source"), 
                React.createElement("th", null, "Annotation Source"), 
                React.createElement("th", null, "Notes")
              )
            ), 
            React.createElement("tbody", null, 
              history.get('rows').map(this._renderRow).toArray()
            )
          )
        )
      );
    },

    _renderRow:function(attributes) {
      var attrs = _.indexBy(attributes.toJS(), 'name');

      var release = attrs.build.value ? 'Release ' + attrs.build.value
        : 'Initial release';

      var releaseDate = new Date(attrs.release_date.value)
        .toDateString()
        .split(' ')
        .slice(1)
        .join(' ');

      var genomeSource = attrs.genome_source.value
        ? attrs.genome_source.value + ' (' + attrs.genome_version.value + ')'
        : '';

      var annotationSource = attrs.annotation_source.value
        ? attrs.annotation_source.value + ' (' + attrs.annotation_version.value + ')'
        : '';

      return (
        React.createElement("tr", null, 
          React.createElement("td", null, release, " (", releaseDate, ", ", attrs.project.value, " ", attrs.release_number.value, ")"), 
          React.createElement("td", null, genomeSource), 
          React.createElement("td", null, annotationSource), 
          React.createElement("td", null, attrs.note.value)
        )
      );
    }
  });

  var Versions = React.createClass({displayName: "Versions",
    render:function() {
      var $__0=    this.props,versions=$__0.versions;
      var rows = versions.get('rows');

      if (rows.size === 0) return null;

      return (
        React.createElement("div", null, 
          React.createElement("h3", null, "Version"), 
          React.createElement("p", null, 
            "The data set version shown here is the data provider's version" + ' ' +
            "number or publication date indicated on the site from which we" + ' ' +
            "downloaded the data. In the rare case that these are not available," + ' ' +
            "the version is the date that the data set was downloaded."
          ), 
          React.createElement("table", null, 
            React.createElement("thead", null, 
              React.createElement("tr", null, 
                React.createElement("th", null, "Organism"), 
                React.createElement("th", null, "Provider's Version")
              )
            ), 
            React.createElement("tbody", null, 
              rows.map(this._renderRow).toArray()
            )
          )
        )
      );
    },

    _renderRow:function(attributes) {
      var attrs = _.indexBy(attributes.toJS(), 'name');
      return (
        React.createElement("tr", null, 
          React.createElement("td", null, attrs.organism.value), 
          React.createElement("td", null, attrs.version.value)
        )
      );
    }
  });

  var Graphs = React.createClass({displayName: "Graphs",
    render:function() {
      var $__0=    this.props,graphs=$__0.graphs;
      var rows = graphs.get('rows');
      if (rows.size === 0) return null;
      return (
        React.createElement("div", null, 
          React.createElement("h3", null, "Example Graphs"), 
          React.createElement("ul", null, rows.map(this._renderGraph).toArray())
        )
      );
    },

    _renderGraph:function(graph, index) {
      var g = _.indexBy(graph.toJS(), 'name');
      var url = '/cgi-bin/dataPlotter.pl' +
        '?type=' + g.module.value +
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
      var $__0=      this.props,record=$__0.record,questions=$__0.questions,recordClasses=$__0.recordClasses;
      var attributes = record.get('attributes');
      var tables = record.get('tables');
      var titleClass = 'eupathdb-DatasetRecord-title';

      var id = record.get('id');
      var summary = attributes.getIn(['summary', 'value']);
      var releaseInfo = attributes.getIn(['build_number_introduced', 'value']);
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
      var GenomeHistory = tables.get('GenomeHistory');
      var Version = tables.get('Version');
      var ExampleGraphs = tables.get('ExampleGraphs');

      return (
        React.createElement("div", {className: "eupathdb-DatasetRecord"}, 
          React.createElement("h1", {dangerouslySetInnerHTML: {
            __html: 'Data Set: <span class="' + titleClass + '">' + id + '</span>'
          }}), 

          React.createElement("hr", null), 

          React.createElement("table", {className: "eupathdb-DatasetRecord-headerTable"}, 
            React.createElement("tbody", null, 

              React.createElement("tr", null, 
                React.createElement("th", null, "Summary:"), 
                React.createElement("td", {dangerouslySetInnerHTML: {__html: summary}})
              ), 
              primaryPublication ? (
                React.createElement("tr", null, 
                  React.createElement("th", null, "Primary publication:"), 
                  React.createElement("td", null, renderPrimaryPublication(primaryPublication))
                )
              ) : null, 

              contact && institution ? (
                React.createElement("tr", null, 
                  React.createElement("th", null, "Primary contact:"), 
                  React.createElement("td", null, renderPrimaryContact(contact, institution))
                )
              ) : null, 

              version ? (
                React.createElement("tr", null, 
                  React.createElement("th", null, "Source version:"), 
                  React.createElement("td", null, renderSourceVersion(version))
                )
              ) : null, 

              releaseInfo ? (
                React.createElement("tr", null, 
                  React.createElement("th", null, "EuPathDB release:"), 
                  React.createElement("td", null, releaseInfo)
                )
              ) : null

            )
          ), 

          React.createElement("hr", null), 

          React.createElement(Organisms, {organisms: organisms}), 

          React.createElement(Searches, {searches: References, links: HyperLinks, questions: questions, recordClasses: recordClasses}), 

          React.createElement(Links, {links: HyperLinks}), 

          React.createElement("h3", null, "Detailed Description"), 
          React.createElement("div", {dangerouslySetInnerHTML: {__html: description}}), 

          React.createElement(ContactsAndPublications, {contacts: Contacts, publications: Publications}), 

          React.createElement(ReleaseHistory, {history: GenomeHistory}), 

          React.createElement(Versions, {versions: Version}), 

          React.createElement(Graphs, {graphs: ExampleGraphs})
        )
      );
    }
  });

  ns.DatasetRecord = DatasetRecord;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWQuanMiLCJzb3VyY2VzIjpbbnVsbF0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHdCQUF3QjtBQUN4Qiw4Q0FBOEM7O0FBRTlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsR0FBRzs7QUFFSCxHQUFHLENBQUMsU0FBUyxDQUFDLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUM7QUFDaEQsRUFBRSxZQUFZLENBQUM7O0FBRWYsRUFBRSxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO0FBQ3hCOztFQUVFLElBQUksVUFBVSxHQUFHLFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUNoRCxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNsQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUNqQyxJQUFJLEtBQUssR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDMUQsT0FBTyxLQUFLLEtBQUssb0JBQUEsR0FBRSxFQUFBLENBQUEsQ0FBQyxNQUFBLEVBQU0sQ0FBRSxTQUFTLEdBQUcsUUFBUSxHQUFHLE9BQU8sRUFBQyxDQUFDLElBQUEsRUFBSSxDQUFFLEtBQUssQ0FBQyxDQUFDLENBQUcsQ0FBQSxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQU0sQ0FBQSxLQUFLLElBQUksQ0FBQztBQUN4RyxHQUFHLENBQUM7O0VBRUYsSUFBSSx3QkFBd0IsR0FBRyxTQUFTLHdCQUF3QixDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzdFLElBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztNQUMvQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksYUFBYSxDQUFDO0tBQ3pDLENBQUMsQ0FBQztJQUNILE9BQU8sVUFBVSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUNwRSxHQUFHLENBQUM7O0VBRUYsSUFBSSxvQkFBb0IsR0FBRyxTQUFTLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsQ0FBQztJQUM5RSxPQUFPLE9BQU8sR0FBRyxJQUFJLEdBQUcsV0FBVyxDQUFDO0FBQ3hDLEdBQUcsQ0FBQzs7RUFFRixJQUFJLG1CQUFtQixHQUFHLFNBQVMsT0FBTyxFQUFFLENBQUM7SUFDM0MsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFBLENBQUEsQ0FBQyxDQUFBLElBQUksQ0FBQSxPQUFBLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssU0FBUyxFQUFBLENBQUMsQ0FBQztJQUMxRDtNQUNFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsaUVBQWlFO01BQ3JGLHlFQUF5RTtNQUN6RSxzQkFBc0I7TUFDdEI7QUFDTixHQUFHLENBQUM7O0VBRUYsSUFBSSwrQkFBK0IseUJBQUE7SUFDakMsTUFBTSxTQUFBLEdBQUcsQ0FBQztNQUNSLElBQUksS0FBQSxnQkFBZ0IsSUFBSSxDQUFDLEtBQUsseUJBQUEsQ0FBQztNQUMvQixJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sSUFBSSxDQUFDO01BQzVCO1FBQ0Usb0JBQUEsS0FBSSxFQUFBLElBQUMsRUFBQTtVQUNILG9CQUFBLElBQUcsRUFBQSxJQUFDLEVBQUEsa0RBQXFELENBQUEsRUFBQTtVQUN6RCxvQkFBQSxJQUFHLEVBQUEsSUFBQyxFQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxPQUFPLEVBQVEsQ0FBQTtRQUNsRSxDQUFBO1FBQ047QUFDUixLQUFLOztJQUVELGVBQWUsU0FBQSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQztNQUNoQztRQUNFLG9CQUFBLElBQUcsRUFBQSxDQUFBLENBQUMsR0FBQSxFQUFHLENBQUUsS0FBTyxDQUFBLEVBQUEsb0JBQUEsR0FBRSxFQUFBLElBQUMsRUFBQyxRQUFhLENBQUssQ0FBQTtRQUN0QztLQUNIO0FBQ0wsR0FBRyxDQUFDLENBQUM7O0VBRUgsSUFBSSw4QkFBOEIsd0JBQUE7SUFDaEMsTUFBTSxTQUFBLEdBQUcsQ0FBQztNQUNSLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQ25DLE1BQU0sSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7O0FBRWpGLE1BQU0sSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUM7O01BRXJFO1FBQ0Usb0JBQUEsS0FBSSxFQUFBLElBQUMsRUFBQTtVQUNILG9CQUFBLElBQUcsRUFBQSxJQUFDLEVBQUEsMENBQTZDLENBQUEsRUFBQTtVQUNqRCxvQkFBQSxJQUFHLEVBQUEsSUFBQyxFQUFBO1lBQ0QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUM7WUFDM0MsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sRUFBRztVQUNoRCxDQUFBO1FBQ0QsQ0FBQTtRQUNOO0FBQ1IsS0FBSzs7SUFFRCxjQUFjLFNBQUEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztNQUNuQixJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQUEsQ0FBQSxJQUFJLENBQUEsSUFBSSxDQUFBLE9BQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxhQUFhLEVBQUEsQ0FBQyxDQUFDO01BQy9ELE9BQU8sSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksVUFBVSxDQUFDO0FBQ3JELEtBQUs7O0lBRUQsYUFBYSxTQUFBLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDO01BQzVCLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBQSxDQUFBLElBQUksQ0FBQSxJQUFJLENBQUEsT0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLGFBQWEsRUFBQSxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3JGLE1BQU0sSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQUEsQ0FBQSxDQUFDLENBQUEsSUFBSSxDQUFBLE9BQUEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLEVBQUEsQ0FBQyxDQUFDOztBQUU1RSxNQUFNLElBQUksUUFBUSxJQUFJLElBQUksRUFBRSxPQUFPLElBQUksQ0FBQzs7TUFFbEMsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQUEsQ0FBQSxDQUFDLENBQUEsSUFBSSxDQUFBLE9BQUEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFBLENBQUMsQ0FBQztNQUNsRyxJQUFJLFVBQVUsR0FBRyxDQUFBLFdBQUEsR0FBQSxZQUFZLG9DQUFvQyxHQUFBLE1BQUEsR0FBQSxPQUFPLDJCQUE2QixDQUFBLENBQUM7TUFDdEc7UUFDRSxvQkFBQSxJQUFHLEVBQUEsQ0FBQSxDQUFDLEdBQUEsRUFBRyxDQUFFLEtBQU8sQ0FBQSxFQUFBO1VBQ2Qsb0JBQUEsR0FBRSxFQUFBLENBQUEsQ0FBQyxJQUFBLEVBQUksQ0FBRSxzQ0FBc0MsR0FBRyxJQUFNLENBQUEsRUFBQyxVQUFlLENBQUE7UUFDckUsQ0FBQTtRQUNMO0FBQ1IsS0FBSzs7SUFFRCxXQUFXLFNBQUEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7TUFDeEIsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFBLENBQUEsSUFBSSxDQUFBLElBQUksQ0FBQSxPQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksWUFBWSxFQUFBLENBQUMsQ0FBQztNQUNwRTtRQUNFLG9CQUFBLElBQUcsRUFBQSxDQUFBLENBQUMsR0FBQSxFQUFHLENBQUUsS0FBTyxDQUFBLEVBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQU8sQ0FBQTtRQUN6RDtLQUNIO0FBQ0wsR0FBRyxDQUFDLENBQUM7O0VBRUgsSUFBSSwyQkFBMkIscUJBQUE7SUFDN0IsTUFBTSxTQUFBLEdBQUcsQ0FBQztBQUNkLE1BQU0sSUFBSSxLQUFBLFlBQVksSUFBSSxDQUFDLEtBQUssaUJBQUEsQ0FBQzs7QUFFakMsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRSxPQUFPLElBQUksQ0FBQzs7TUFFOUM7UUFDRSxvQkFBQSxLQUFJLEVBQUEsSUFBQyxFQUFBO1VBQ0gsb0JBQUEsSUFBRyxFQUFBLElBQUMsRUFBQSxnQkFBbUIsQ0FBQSxFQUFBO1VBQ3ZCLG9CQUFBLElBQUcsRUFBQSxJQUFDLEVBQUEsR0FBQSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBQyxHQUFNLENBQUE7UUFDMUQsQ0FBQTtRQUNOO0FBQ1IsS0FBSzs7SUFFRCxXQUFXLFNBQUEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7TUFDeEIsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFBLENBQUEsSUFBSSxDQUFBLElBQUksQ0FBQSxPQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksWUFBWSxFQUFBLENBQUMsQ0FBQztNQUNwRTtRQUNFLG9CQUFBLElBQUcsRUFBQSxDQUFBLENBQUMsR0FBQSxFQUFHLENBQUUsS0FBTyxDQUFBLEVBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQU8sQ0FBQTtRQUN6RDtLQUNIO0FBQ0wsR0FBRyxDQUFDLENBQUM7O0VBRUgsSUFBSSw4QkFBOEIsd0JBQUE7SUFDaEMsTUFBTSxTQUFBLEdBQUcsQ0FBQztNQUNSLElBQUksS0FBQSxlQUFlLElBQUksQ0FBQyxLQUFLLHVCQUFBLENBQUM7TUFDOUIsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUM7TUFDakQ7UUFDRSxvQkFBQSxLQUFJLEVBQUEsSUFBQyxFQUFBO1VBQ0gsb0JBQUEsSUFBRyxFQUFBLElBQUMsRUFBQSxVQUFhLENBQUEsRUFBQTtVQUNqQixvQkFBQSxJQUFHLEVBQUEsSUFBQyxFQUFBO1lBQ0QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLE9BQU8sRUFBRztVQUN0RCxDQUFBO1FBQ0QsQ0FBQTtRQUNOO0FBQ1IsS0FBSzs7SUFFRCxjQUFjLFNBQUEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUM7TUFDOUIsSUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFBLENBQUEsQ0FBQyxDQUFBLElBQUksQ0FBQSxPQUFBLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksY0FBYyxFQUFBLENBQUMsQ0FBQztNQUN0RSxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQUEsQ0FBQSxDQUFDLENBQUEsSUFBSSxDQUFBLE9BQUEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxhQUFhLEVBQUEsQ0FBQyxDQUFDO01BQ3BFO1FBQ0Usb0JBQUEsSUFBRyxFQUFBLENBQUEsQ0FBQyxHQUFBLEVBQUcsQ0FBRSxLQUFPLENBQUEsRUFBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFDLElBQUEsRUFBRyxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBTyxDQUFBO1FBQzVFO0tBQ0g7QUFDTCxHQUFHLENBQUMsQ0FBQzs7RUFFSCxJQUFJLGtDQUFrQyw0QkFBQTtJQUNwQyxNQUFNLFNBQUEsR0FBRyxDQUFDO01BQ1IsSUFBSSxLQUFBLG1CQUFtQixJQUFJLENBQUMsS0FBSywrQkFBQSxDQUFDO01BQ2xDLElBQUksSUFBSSxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7TUFDcEMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRSxPQUFPLElBQUksQ0FBQztNQUNqQztRQUNFLG9CQUFBLEtBQUksRUFBQSxJQUFDLEVBQUE7VUFDSCxvQkFBQSxJQUFHLEVBQUEsSUFBQyxFQUFBLGNBQWlCLENBQUEsRUFBQTtVQUNyQixvQkFBQSxJQUFHLEVBQUEsSUFBQyxFQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsT0FBTyxFQUFRLENBQUE7UUFDbEQsQ0FBQTtRQUNOO0FBQ1IsS0FBSzs7SUFFRCxrQkFBa0IsU0FBQSxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztNQUN0QyxJQUFJLFdBQVcsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQUEsQ0FBQSxDQUFDLENBQUEsSUFBSSxDQUFBLE9BQUEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxhQUFhLEVBQUEsQ0FBQyxDQUFDO01BQ3hFO1FBQ0Usb0JBQUEsSUFBRyxFQUFBLENBQUEsQ0FBQyxHQUFBLEVBQUcsQ0FBRSxLQUFPLENBQUEsRUFBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBTyxDQUFBO1FBQzNEO0tBQ0g7QUFDTCxHQUFHLENBQUMsQ0FBQzs7RUFFSCxJQUFJLDZDQUE2Qyx1Q0FBQTtJQUMvQyxNQUFNLFNBQUEsR0FBRyxDQUFDO0FBQ2QsTUFBTSxJQUFJLEtBQUEsNkJBQTZCLElBQUksQ0FBQyxLQUFLLHNEQUFBLENBQUM7O0FBRWxELE1BQU0sSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFLE9BQU8sSUFBSSxDQUFDOztNQUV4RjtRQUNFLG9CQUFBLEtBQUksRUFBQSxJQUFDLEVBQUE7VUFDSCxvQkFBQSxJQUFHLEVBQUEsSUFBQyxFQUFBLHNDQUF5QyxDQUFBLEVBQUE7VUFDN0Msb0JBQUMsUUFBUSxFQUFBLENBQUEsQ0FBQyxRQUFBLEVBQVEsQ0FBRSxRQUFTLENBQUUsQ0FBQSxFQUFBO1VBQy9CLG9CQUFDLFlBQVksRUFBQSxDQUFBLENBQUMsWUFBQSxFQUFZLENBQUUsWUFBYSxDQUFFLENBQUE7UUFDdkMsQ0FBQTtRQUNOO0tBQ0g7QUFDTCxHQUFHLENBQUMsQ0FBQzs7RUFFSCxJQUFJLG9DQUFvQyw4QkFBQTtJQUN0QyxNQUFNLFNBQUEsR0FBRyxDQUFDO01BQ1IsSUFBSSxLQUFBLGNBQWMsSUFBSSxDQUFDLEtBQUsscUJBQUEsQ0FBQztNQUM3QixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRSxPQUFPLElBQUksQ0FBQztNQUNoRDtRQUNFLG9CQUFBLEtBQUksRUFBQSxJQUFDLEVBQUE7VUFDSCxvQkFBQSxJQUFHLEVBQUEsSUFBQyxFQUFBLDBCQUE2QixDQUFBLEVBQUE7VUFDakMsb0JBQUEsT0FBTSxFQUFBLElBQUMsRUFBQTtZQUNMLG9CQUFBLE9BQU0sRUFBQSxJQUFDLEVBQUE7Y0FDTCxvQkFBQSxJQUFHLEVBQUEsSUFBQyxFQUFBO2dCQUNGLG9CQUFBLElBQUcsRUFBQSxJQUFDLEVBQUEsa0JBQXFCLENBQUEsRUFBQTtnQkFDekIsb0JBQUEsSUFBRyxFQUFBLElBQUMsRUFBQSxlQUFrQixDQUFBLEVBQUE7Z0JBQ3RCLG9CQUFBLElBQUcsRUFBQSxJQUFDLEVBQUEsbUJBQXNCLENBQUEsRUFBQTtnQkFDMUIsb0JBQUEsSUFBRyxFQUFBLElBQUMsRUFBQSxPQUFVLENBQUE7Y0FDWCxDQUFBO1lBQ0MsQ0FBQSxFQUFBO1lBQ1Isb0JBQUEsT0FBTSxFQUFBLElBQUMsRUFBQTtjQUNKLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLEVBQUc7WUFDOUMsQ0FBQTtVQUNGLENBQUE7UUFDSixDQUFBO1FBQ047QUFDUixLQUFLOztJQUVELFVBQVUsU0FBQSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQzVCLE1BQU0sSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7O01BRWpELElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFVBQVUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUs7QUFDdEUsVUFBVSxpQkFBaUIsQ0FBQzs7TUFFdEIsSUFBSSxXQUFXLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7U0FDakQsWUFBWSxFQUFFO1NBQ2QsS0FBSyxDQUFDLEdBQUcsQ0FBQztTQUNWLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDakIsU0FBUyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7O01BRWIsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLO1VBQ3hDLEtBQUssQ0FBQyxhQUFhLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLEtBQUssR0FBRyxHQUFHO0FBQzdFLFVBQVUsRUFBRSxDQUFDOztNQUVQLElBQUksZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEtBQUs7VUFDaEQsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEtBQUssR0FBRyxHQUFHO0FBQ3JGLFVBQVUsRUFBRSxDQUFDOztNQUVQO1FBQ0Usb0JBQUEsSUFBRyxFQUFBLElBQUMsRUFBQTtVQUNGLG9CQUFBLElBQUcsRUFBQSxJQUFDLEVBQUMsT0FBTyxFQUFDLElBQUEsRUFBRyxXQUFXLEVBQUMsSUFBQSxFQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFDLEdBQUEsRUFBRSxLQUFLLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBQyxHQUFNLENBQUEsRUFBQTtVQUN0RixvQkFBQSxJQUFHLEVBQUEsSUFBQyxFQUFDLFlBQWtCLENBQUEsRUFBQTtVQUN2QixvQkFBQSxJQUFHLEVBQUEsSUFBQyxFQUFDLGdCQUFzQixDQUFBLEVBQUE7VUFDM0Isb0JBQUEsSUFBRyxFQUFBLElBQUMsRUFBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQVcsQ0FBQTtRQUN4QixDQUFBO1FBQ0w7S0FDSDtBQUNMLEdBQUcsQ0FBQyxDQUFDOztFQUVILElBQUksOEJBQThCLHdCQUFBO0lBQ2hDLE1BQU0sU0FBQSxHQUFHLENBQUM7TUFDUixJQUFJLEtBQUEsZUFBZSxJQUFJLENBQUMsS0FBSyx1QkFBQSxDQUFDO0FBQ3BDLE1BQU0sSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFdEMsTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFLE9BQU8sSUFBSSxDQUFDOztNQUVqQztRQUNFLG9CQUFBLEtBQUksRUFBQSxJQUFDLEVBQUE7VUFDSCxvQkFBQSxJQUFHLEVBQUEsSUFBQyxFQUFBLFNBQVksQ0FBQSxFQUFBO1VBQ2hCLG9CQUFBLEdBQUUsRUFBQSxJQUFDLEVBQUE7QUFBQSxZQUFBLHdFQUFBO0FBQUEsWUFBQSx3RUFBQTtBQUFBLFlBQUEsNkVBQUE7QUFBQSxZQUFBLDJEQUFBO0FBQUEsVUFLQyxDQUFBLEVBQUE7VUFDSixvQkFBQSxPQUFNLEVBQUEsSUFBQyxFQUFBO1lBQ0wsb0JBQUEsT0FBTSxFQUFBLElBQUMsRUFBQTtjQUNMLG9CQUFBLElBQUcsRUFBQSxJQUFDLEVBQUE7Z0JBQ0Ysb0JBQUEsSUFBRyxFQUFBLElBQUMsRUFBQSxVQUFhLENBQUEsRUFBQTtnQkFDakIsb0JBQUEsSUFBRyxFQUFBLElBQUMsRUFBQSxvQkFBdUIsQ0FBQTtjQUN4QixDQUFBO1lBQ0MsQ0FBQSxFQUFBO1lBQ1Isb0JBQUEsT0FBTSxFQUFBLElBQUMsRUFBQTtjQUNKLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sRUFBRztZQUMvQixDQUFBO1VBQ0YsQ0FBQTtRQUNKLENBQUE7UUFDTjtBQUNSLEtBQUs7O0lBRUQsVUFBVSxTQUFBLENBQUMsVUFBVSxFQUFFLENBQUM7TUFDdEIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7TUFDakQ7UUFDRSxvQkFBQSxJQUFHLEVBQUEsSUFBQyxFQUFBO1VBQ0Ysb0JBQUEsSUFBRyxFQUFBLElBQUMsRUFBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQVcsQ0FBQSxFQUFBO1VBQy9CLG9CQUFBLElBQUcsRUFBQSxJQUFDLEVBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFXLENBQUE7UUFDM0IsQ0FBQTtRQUNMO0tBQ0g7QUFDTCxHQUFHLENBQUMsQ0FBQzs7RUFFSCxJQUFJLDRCQUE0QixzQkFBQTtJQUM5QixNQUFNLFNBQUEsR0FBRyxDQUFDO01BQ1IsSUFBSSxLQUFBLGFBQWEsSUFBSSxDQUFDLEtBQUssbUJBQUEsQ0FBQztNQUM1QixJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO01BQzlCLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUM7TUFDakM7UUFDRSxvQkFBQSxLQUFJLEVBQUEsSUFBQyxFQUFBO1VBQ0gsb0JBQUEsSUFBRyxFQUFBLElBQUMsRUFBQSxnQkFBbUIsQ0FBQSxFQUFBO1VBQ3ZCLG9CQUFBLElBQUcsRUFBQSxJQUFDLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxFQUFRLENBQUE7UUFDNUMsQ0FBQTtRQUNOO0FBQ1IsS0FBSzs7SUFFRCxZQUFZLFNBQUEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUM7TUFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7TUFDeEMsSUFBSSxHQUFHLEdBQUcseUJBQXlCO1FBQ2pDLFFBQVEsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUs7UUFDekIsY0FBYyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSztRQUNuQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFLO1FBQ2xDLHlCQUF5QixHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO01BQ2hEO1FBQ0Usb0JBQUEsSUFBRyxFQUFBLENBQUEsQ0FBQyxHQUFBLEVBQUcsQ0FBRSxLQUFPLENBQUEsRUFBQSxvQkFBQSxLQUFJLEVBQUEsQ0FBQSxDQUFDLEdBQUEsRUFBRyxDQUFFLEdBQUksQ0FBRSxDQUFLLENBQUE7UUFDckM7S0FDSDtBQUNMLEdBQUcsQ0FBQyxDQUFDOztFQUVILElBQUksbUNBQW1DLDZCQUFBO0lBQ3JDLE1BQU0sU0FBQSxHQUFHLENBQUM7TUFDUixJQUFJLEtBQUEsdUNBQXVDLElBQUksQ0FBQyxLQUFLLDZFQUFBLENBQUM7TUFDdEQsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztNQUMxQyxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3hDLE1BQU0sSUFBSSxVQUFVLEdBQUcsOEJBQThCLENBQUM7O01BRWhELElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7TUFDMUIsSUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO01BQ3JELElBQUksV0FBVyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyx5QkFBeUIsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO01BQ3pFLElBQUksa0JBQWtCLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLGNBQWMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUNuRSxJQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7TUFDckQsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO01BQzdELElBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFDdkQsSUFBSSxTQUFTLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO01BQ3pELElBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7TUFDMUMsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztNQUMxQyxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO01BQ3RDLElBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7TUFDOUMsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO01BQzdELElBQUksYUFBYSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7TUFDaEQsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMxQyxNQUFNLElBQUksYUFBYSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7O01BRWhEO1FBQ0Usb0JBQUEsS0FBSSxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQyx3QkFBeUIsQ0FBQSxFQUFBO1VBQ3RDLG9CQUFBLElBQUcsRUFBQSxDQUFBLENBQUMsdUJBQUEsRUFBdUIsQ0FBRTtZQUMzQixNQUFNLEVBQUUseUJBQXlCLEdBQUcsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsU0FBUztBQUNsRixXQUFZLENBQUUsQ0FBQSxFQUFBOztBQUVkLFVBQVUsb0JBQUEsSUFBRyxFQUFBLElBQUUsQ0FBQSxFQUFBOztVQUVMLG9CQUFBLE9BQU0sRUFBQSxDQUFBLENBQUMsU0FBQSxFQUFTLENBQUMsb0NBQXFDLENBQUEsRUFBQTtBQUNoRSxZQUFZLG9CQUFBLE9BQU0sRUFBQSxJQUFDLEVBQUE7O2NBRUwsb0JBQUEsSUFBRyxFQUFBLElBQUMsRUFBQTtnQkFDRixvQkFBQSxJQUFHLEVBQUEsSUFBQyxFQUFBLFVBQWEsQ0FBQSxFQUFBO2dCQUNqQixvQkFBQSxJQUFHLEVBQUEsQ0FBQSxDQUFDLHVCQUFBLEVBQXVCLENBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFFLENBQUUsQ0FBQTtjQUM5QyxDQUFBLEVBQUE7Y0FDSixrQkFBa0I7Z0JBQ2pCLG9CQUFBLElBQUcsRUFBQSxJQUFDLEVBQUE7a0JBQ0Ysb0JBQUEsSUFBRyxFQUFBLElBQUMsRUFBQSxzQkFBeUIsQ0FBQSxFQUFBO2tCQUM3QixvQkFBQSxJQUFHLEVBQUEsSUFBQyxFQUFDLHdCQUF3QixDQUFDLGtCQUFrQixDQUFPLENBQUE7Z0JBQ3BELENBQUE7QUFDckIsa0JBQWtCLElBQUksRUFBQzs7Y0FFUixPQUFPLElBQUksV0FBVztnQkFDckIsb0JBQUEsSUFBRyxFQUFBLElBQUMsRUFBQTtrQkFDRixvQkFBQSxJQUFHLEVBQUEsSUFBQyxFQUFBLGtCQUFxQixDQUFBLEVBQUE7a0JBQ3pCLG9CQUFBLElBQUcsRUFBQSxJQUFDLEVBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBTyxDQUFBO2dCQUNsRCxDQUFBO0FBQ3JCLGtCQUFrQixJQUFJLEVBQUM7O2NBRVIsT0FBTztnQkFDTixvQkFBQSxJQUFHLEVBQUEsSUFBQyxFQUFBO2tCQUNGLG9CQUFBLElBQUcsRUFBQSxJQUFDLEVBQUEsaUJBQW9CLENBQUEsRUFBQTtrQkFDeEIsb0JBQUEsSUFBRyxFQUFBLElBQUMsRUFBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQU8sQ0FBQTtnQkFDcEMsQ0FBQTtBQUNyQixrQkFBa0IsSUFBSSxFQUFDOztjQUVSLFdBQVc7Z0JBQ1Ysb0JBQUEsSUFBRyxFQUFBLElBQUMsRUFBQTtrQkFDRixvQkFBQSxJQUFHLEVBQUEsSUFBQyxFQUFBLG1CQUFzQixDQUFBLEVBQUE7a0JBQzFCLG9CQUFBLElBQUcsRUFBQSxJQUFDLEVBQUMsV0FBaUIsQ0FBQTtnQkFDbkIsQ0FBQTtBQUNyQixrQkFBa0IsSUFBSzs7WUFFSCxDQUFBO0FBQ3BCLFVBQWtCLENBQUEsRUFBQTs7QUFFbEIsVUFBVSxvQkFBQSxJQUFHLEVBQUEsSUFBRSxDQUFBLEVBQUE7O0FBRWYsVUFBVSxvQkFBQyxTQUFTLEVBQUEsQ0FBQSxDQUFDLFNBQUEsRUFBUyxDQUFFLFNBQVUsQ0FBRSxDQUFBLEVBQUE7O0FBRTVDLFVBQVUsb0JBQUMsUUFBUSxFQUFBLENBQUEsQ0FBQyxRQUFBLEVBQVEsQ0FBRSxVQUFVLEVBQUMsQ0FBQyxLQUFBLEVBQUssQ0FBRSxVQUFVLEVBQUMsQ0FBQyxTQUFBLEVBQVMsQ0FBRSxTQUFTLEVBQUMsQ0FBQyxhQUFBLEVBQWEsQ0FBRSxhQUFjLENBQUUsQ0FBQSxFQUFBOztBQUVsSCxVQUFVLG9CQUFDLEtBQUssRUFBQSxDQUFBLENBQUMsS0FBQSxFQUFLLENBQUUsVUFBVyxDQUFFLENBQUEsRUFBQTs7VUFFM0Isb0JBQUEsSUFBRyxFQUFBLElBQUMsRUFBQSxzQkFBeUIsQ0FBQSxFQUFBO0FBQ3ZDLFVBQVUsb0JBQUEsS0FBSSxFQUFBLENBQUEsQ0FBQyx1QkFBQSxFQUF1QixDQUFFLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBRSxDQUFFLENBQUEsRUFBQTs7QUFFaEUsVUFBVSxvQkFBQyx1QkFBdUIsRUFBQSxDQUFBLENBQUMsUUFBQSxFQUFRLENBQUUsUUFBUSxFQUFDLENBQUMsWUFBQSxFQUFZLENBQUUsWUFBYSxDQUFFLENBQUEsRUFBQTs7QUFFcEYsVUFBVSxvQkFBQyxjQUFjLEVBQUEsQ0FBQSxDQUFDLE9BQUEsRUFBTyxDQUFFLGFBQWMsQ0FBRSxDQUFBLEVBQUE7O0FBRW5ELFVBQVUsb0JBQUMsUUFBUSxFQUFBLENBQUEsQ0FBQyxRQUFBLEVBQVEsQ0FBRSxPQUFRLENBQUUsQ0FBQSxFQUFBOztVQUU5QixvQkFBQyxNQUFNLEVBQUEsQ0FBQSxDQUFDLE1BQUEsRUFBTSxDQUFFLGFBQWMsQ0FBRSxDQUFBO1FBQzVCLENBQUE7UUFDTjtLQUNIO0FBQ0wsR0FBRyxDQUFDLENBQUM7O0VBRUgsRUFBRSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7Q0FDbEMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZ2xvYmFsIF8sIFdkaywgd2RrICovXG4vKiBqc2hpbnQgZXNuZXh0OiB0cnVlLCBlcW51bGw6IHRydWUsIC1XMDE0ICovXG5cbi8qKlxuICogVGhpcyBmaWxlIHByb3ZpZGVzIGEgY3VzdG9tIFJlY29yZCBDb21wb25lbnQgd2hpY2ggaXMgdXNlZCBieSB0aGUgbmV3IFdka1xuICogRmx1eCBhcmNoaXRlY3R1cmUuXG4gKlxuICogVGhlIHNpYmxpbmcgZmlsZSBEYXRhc2V0UmVjb3JkQ2xhc3Nlcy5EYXRhc2V0UmVjb3JkQ2xhc3MuanMgaXMgZ2VuZXJhdGVkXG4gKiBmcm9tIHRoaXMgZmlsZSB1c2luZyB0aGUganN4IGNvbXBpbGVyLiBFdmVudHVhbGx5LCB0aGlzIGZpbGUgd2lsbCBiZVxuICogY29tcGlsZWQgZHVyaW5nIGJ1aWxkIHRpbWUtLXRoaXMgaXMgYSBzaG9ydC10ZXJtIHNvbHV0aW9uLlxuICpcbiAqIGB3ZGtgIGlzIHRoZSBsZWdhY3kgZ2xvYmFsIG9iamVjdCwgYW5kIGBXZGtgIGlzIHRoZSBuZXcgZ2xvYmFsIG9iamVjdFxuICovXG5cbndkay5uYW1lc3BhY2UoJ2V1cGF0aGRiLnJlY29yZHMnLCBmdW5jdGlvbihucykge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgUmVhY3QgPSBXZGsuUmVhY3Q7XG5cbiAgLy8gZm9ybWF0IGlzIHt0ZXh0fSh7bGlua30pXG4gIHZhciBmb3JtYXRMaW5rID0gZnVuY3Rpb24gZm9ybWF0TGluayhsaW5rLCBvcHRzKSB7XG4gICAgb3B0cyA9IG9wdHMgfHwge307XG4gICAgdmFyIG5ld1dpbmRvdyA9ICEhb3B0cy5uZXdXaW5kb3c7XG4gICAgdmFyIG1hdGNoID0gLyguKilcXCgoLiopXFwpLy5leGVjKGxpbmsucmVwbGFjZSgvXFxuL2csICcgJykpO1xuICAgIHJldHVybiBtYXRjaCA/ICggPGEgdGFyZ2V0PXtuZXdXaW5kb3cgPyAnX2JsYW5rJyA6ICdfc2VsZid9IGhyZWY9e21hdGNoWzJdfT57bWF0Y2hbMV19PC9hPiApIDogbnVsbDtcbiAgfTtcblxuICB2YXIgcmVuZGVyUHJpbWFyeVB1YmxpY2F0aW9uID0gZnVuY3Rpb24gcmVuZGVyUHJpbWFyeVB1YmxpY2F0aW9uKHB1YmxpY2F0aW9uKSB7XG4gICAgdmFyIHB1Ym1lZExpbmsgPSBwdWJsaWNhdGlvbi5maW5kKGZ1bmN0aW9uKHB1Yikge1xuICAgICAgcmV0dXJuIHB1Yi5nZXQoJ25hbWUnKSA9PSAncHVibWVkX2xpbmsnO1xuICAgIH0pO1xuICAgIHJldHVybiBmb3JtYXRMaW5rKHB1Ym1lZExpbmsuZ2V0KCd2YWx1ZScpLCB7IG5ld1dpbmRvdzogdHJ1ZSB9KTtcbiAgfTtcblxuICB2YXIgcmVuZGVyUHJpbWFyeUNvbnRhY3QgPSBmdW5jdGlvbiByZW5kZXJQcmltYXJ5Q29udGFjdChjb250YWN0LCBpbnN0aXR1dGlvbikge1xuICAgIHJldHVybiBjb250YWN0ICsgJywgJyArIGluc3RpdHV0aW9uO1xuICB9O1xuXG4gIHZhciByZW5kZXJTb3VyY2VWZXJzaW9uID0gZnVuY3Rpb24odmVyc2lvbikge1xuICAgIHZhciBuYW1lID0gdmVyc2lvbi5maW5kKHYgPT4gdi5nZXQoJ25hbWUnKSA9PT0gJ3ZlcnNpb24nKTtcbiAgICByZXR1cm4gKFxuICAgICAgbmFtZS5nZXQoJ3ZhbHVlJykgKyAnIChUaGUgZGF0YSBwcm92aWRlclxcJ3MgdmVyc2lvbiBudW1iZXIgb3IgcHVibGljYXRpb24gZGF0ZSwgZnJvbScgK1xuICAgICAgJyB0aGUgc2l0ZSB0aGUgZGF0YSB3YXMgYWNxdWlyZWQuIEluIHRoZSByYXJlIGNhc2UgbmVpdGhlciBpcyBhdmFpbGFibGUsJyArXG4gICAgICAnIHRoZSBkb3dubG9hZCBkYXRlLiknXG4gICAgKTtcbiAgfTtcblxuICB2YXIgT3JnYW5pc21zID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IG9yZ2FuaXNtcyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGlmICghb3JnYW5pc21zKSByZXR1cm4gbnVsbDtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGgzPk9yZ2FuaXNtcyB0aGlzIGRhdGEgc2V0IGlzIG1hcHBlZCB0byBpbiBQbGFzbW9EQjwvaDM+XG4gICAgICAgICAgPHVsPntvcmdhbmlzbXMuc3BsaXQoLyxcXHMqLykubWFwKHRoaXMuX3JlbmRlck9yZ2FuaXNtKS50b0FycmF5KCl9PC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyT3JnYW5pc20ob3JnYW5pc20sIGluZGV4KSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGkga2V5PXtpbmRleH0+PGk+e29yZ2FuaXNtfTwvaT48L2xpPlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBTZWFyY2hlcyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgbGlua3MgPSB0aGlzLnByb3BzLmxpbmtzO1xuICAgICAgdmFyIHNlYXJjaGVzID0gdGhpcy5wcm9wcy5zZWFyY2hlcy5nZXQoJ3Jvd3MnKS5maWx0ZXIodGhpcy5fcm93SXNRdWVzdGlvbik7XG5cbiAgICAgIGlmIChzZWFyY2hlcy5zaXplID09PSAwICYmIGxpbmtzLmdldCgncm93cycpLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoMz5TZWFyY2ggb3IgdmlldyB0aGlzIGRhdGEgc2V0IGluIFBsYXNtb0RCPC9oMz5cbiAgICAgICAgICA8dWw+XG4gICAgICAgICAgICB7c2VhcmNoZXMubWFwKHRoaXMuX3JlbmRlclNlYXJjaCkudG9BcnJheSgpfVxuICAgICAgICAgICAge2xpbmtzLmdldCgncm93cycpLm1hcCh0aGlzLl9yZW5kZXJMaW5rKS50b0FycmF5KCl9XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcm93SXNRdWVzdGlvbihyb3cpIHtcbiAgICAgIHZhciB0eXBlID0gcm93LmZpbmQoYXR0ciA9PiBhdHRyLmdldCgnbmFtZScpID09ICd0YXJnZXRfdHlwZScpO1xuICAgICAgcmV0dXJuIHR5cGUgJiYgdHlwZS5nZXQoJ3ZhbHVlJykgPT0gJ3F1ZXN0aW9uJztcbiAgICB9LFxuXG4gICAgX3JlbmRlclNlYXJjaChzZWFyY2gsIGluZGV4KSB7XG4gICAgICB2YXIgbmFtZSA9IHNlYXJjaC5maW5kKGF0dHIgPT4gYXR0ci5nZXQoJ25hbWUnKSA9PSAndGFyZ2V0X25hbWUnKS5nZXQoJ3ZhbHVlJyk7XG4gICAgICB2YXIgcXVlc3Rpb24gPSB0aGlzLnByb3BzLnF1ZXN0aW9ucy5maW5kKHEgPT4gcS5nZXQoJ25hbWUnKSA9PT0gbmFtZSk7XG5cbiAgICAgIGlmIChxdWVzdGlvbiA9PSBudWxsKSByZXR1cm4gbnVsbDtcblxuICAgICAgdmFyIHJlY29yZENsYXNzID0gdGhpcy5wcm9wcy5yZWNvcmRDbGFzc2VzLmZpbmQociA9PiByLmdldCgnZnVsbE5hbWUnKSA9PT0gcXVlc3Rpb24uZ2V0KCdjbGFzcycpKTtcbiAgICAgIHZhciBzZWFyY2hOYW1lID0gYElkZW50aWZ5ICR7cmVjb3JkQ2xhc3MuZ2V0KCdkaXNwbGF5TmFtZVBsdXJhbCcpfSBieSAke3F1ZXN0aW9uLmdldCgnZGlzcGxheU5hbWUnKX1gO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGxpIGtleT17aW5kZXh9PlxuICAgICAgICAgIDxhIGhyZWY9eycvYS9zaG93UXVlc3Rpb24uZG8/cXVlc3Rpb25GdWxsTmFtZT0nICsgbmFtZX0+e3NlYXJjaE5hbWV9PC9hPlxuICAgICAgICA8L2xpPlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3JlbmRlckxpbmsobGluaywgaW5kZXgpIHtcbiAgICAgIHZhciBoeXBlckxpbmsgPSBsaW5rLmZpbmQoYXR0ciA9PiBhdHRyLmdldCgnbmFtZScpID09ICdoeXBlcl9saW5rJyk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGkga2V5PXtpbmRleH0+e2Zvcm1hdExpbmsoaHlwZXJMaW5rLmdldCgndmFsdWUnKSl9PC9saT5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgTGlua3MgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyKCkge1xuICAgICAgdmFyIHsgbGlua3MgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgIGlmIChsaW5rcy5nZXQoJ3Jvd3MnKS5zaXplID09PSAwKSByZXR1cm4gbnVsbDtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aDM+RXh0ZXJuYWwgTGlua3M8L2gzPlxuICAgICAgICAgIDx1bD4ge2xpbmtzLmdldCgncm93cycpLm1hcCh0aGlzLl9yZW5kZXJMaW5rKS50b0FycmF5KCl9IDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3JlbmRlckxpbmsobGluaywgaW5kZXgpIHtcbiAgICAgIHZhciBoeXBlckxpbmsgPSBsaW5rLmZpbmQoYXR0ciA9PiBhdHRyLmdldCgnbmFtZScpID09ICdoeXBlcl9saW5rJyk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGkga2V5PXtpbmRleH0+e2Zvcm1hdExpbmsoaHlwZXJMaW5rLmdldCgndmFsdWUnKSl9PC9saT5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgQ29udGFjdHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyKCkge1xuICAgICAgdmFyIHsgY29udGFjdHMgfSA9IHRoaXMucHJvcHM7XG4gICAgICBpZiAoY29udGFjdHMuZ2V0KCdyb3dzJykuc2l6ZSA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoND5Db250YWN0czwvaDQ+XG4gICAgICAgICAgPHVsPlxuICAgICAgICAgICAge2NvbnRhY3RzLmdldCgncm93cycpLm1hcCh0aGlzLl9yZW5kZXJDb250YWN0KS50b0FycmF5KCl9XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyQ29udGFjdChjb250YWN0LCBpbmRleCkge1xuICAgICAgdmFyIGNvbnRhY3RfbmFtZSA9IGNvbnRhY3QuZmluZChjID0+IGMuZ2V0KCduYW1lJykgPT0gJ2NvbnRhY3RfbmFtZScpO1xuICAgICAgdmFyIGFmZmlsaWF0aW9uID0gY29udGFjdC5maW5kKGMgPT4gYy5nZXQoJ25hbWUnKSA9PSAnYWZmaWxpYXRpb24nKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaSBrZXk9e2luZGV4fT57Y29udGFjdF9uYW1lLmdldCgndmFsdWUnKX0sIHthZmZpbGlhdGlvbi5nZXQoJ3ZhbHVlJyl9PC9saT5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgUHVibGljYXRpb25zID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IHB1YmxpY2F0aW9ucyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIHZhciByb3dzID0gcHVibGljYXRpb25zLmdldCgncm93cycpO1xuICAgICAgaWYgKHJvd3Muc2l6ZSA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoND5QdWJsaWNhdGlvbnM8L2g0PlxuICAgICAgICAgIDx1bD57cm93cy5tYXAodGhpcy5fcmVuZGVyUHVibGljYXRpb24pLnRvQXJyYXkoKX08L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSxcblxuICAgIF9yZW5kZXJQdWJsaWNhdGlvbihwdWJsaWNhdGlvbiwgaW5kZXgpIHtcbiAgICAgIHZhciBwdWJtZWRfbGluayA9IHB1YmxpY2F0aW9uLmZpbmQocCA9PiBwLmdldCgnbmFtZScpID09ICdwdWJtZWRfbGluaycpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGxpIGtleT17aW5kZXh9Pntmb3JtYXRMaW5rKHB1Ym1lZF9saW5rLmdldCgndmFsdWUnKSl9PC9saT5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgQ29udGFjdHNBbmRQdWJsaWNhdGlvbnMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyKCkge1xuICAgICAgdmFyIHsgY29udGFjdHMsIHB1YmxpY2F0aW9ucyB9ID0gdGhpcy5wcm9wcztcblxuICAgICAgaWYgKGNvbnRhY3RzLmdldCgncm93cycpLnNpemUgPT09IDAgJiYgcHVibGljYXRpb25zLmdldCgncm93cycpLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoMz5BZGRpdGlvbmFsIENvbnRhY3RzIGFuZCBQdWJsaWNhdGlvbnM8L2gzPlxuICAgICAgICAgIDxDb250YWN0cyBjb250YWN0cz17Y29udGFjdHN9Lz5cbiAgICAgICAgICA8UHVibGljYXRpb25zIHB1YmxpY2F0aW9ucz17cHVibGljYXRpb25zfS8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBSZWxlYXNlSGlzdG9yeSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyBoaXN0b3J5IH0gPSB0aGlzLnByb3BzO1xuICAgICAgaWYgKGhpc3RvcnkuZ2V0KCdyb3dzJykuc2l6ZSA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoMz5EYXRhIFNldCBSZWxlYXNlIEhpc3Rvcnk8L2gzPlxuICAgICAgICAgIDx0YWJsZT5cbiAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgIDx0aD5FdVBhdGhEQiBSZWxlYXNlPC90aD5cbiAgICAgICAgICAgICAgICA8dGg+R2Vub21lIFNvdXJjZTwvdGg+XG4gICAgICAgICAgICAgICAgPHRoPkFubm90YXRpb24gU291cmNlPC90aD5cbiAgICAgICAgICAgICAgICA8dGg+Tm90ZXM8L3RoPlxuICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAge2hpc3RvcnkuZ2V0KCdyb3dzJykubWFwKHRoaXMuX3JlbmRlclJvdykudG9BcnJheSgpfVxuICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSxcblxuICAgIF9yZW5kZXJSb3coYXR0cmlidXRlcykge1xuICAgICAgdmFyIGF0dHJzID0gXy5pbmRleEJ5KGF0dHJpYnV0ZXMudG9KUygpLCAnbmFtZScpO1xuXG4gICAgICB2YXIgcmVsZWFzZSA9IGF0dHJzLmJ1aWxkLnZhbHVlID8gJ1JlbGVhc2UgJyArIGF0dHJzLmJ1aWxkLnZhbHVlXG4gICAgICAgIDogJ0luaXRpYWwgcmVsZWFzZSc7XG5cbiAgICAgIHZhciByZWxlYXNlRGF0ZSA9IG5ldyBEYXRlKGF0dHJzLnJlbGVhc2VfZGF0ZS52YWx1ZSlcbiAgICAgICAgLnRvRGF0ZVN0cmluZygpXG4gICAgICAgIC5zcGxpdCgnICcpXG4gICAgICAgIC5zbGljZSgxKVxuICAgICAgICAuam9pbignICcpO1xuXG4gICAgICB2YXIgZ2Vub21lU291cmNlID0gYXR0cnMuZ2Vub21lX3NvdXJjZS52YWx1ZVxuICAgICAgICA/IGF0dHJzLmdlbm9tZV9zb3VyY2UudmFsdWUgKyAnICgnICsgYXR0cnMuZ2Vub21lX3ZlcnNpb24udmFsdWUgKyAnKSdcbiAgICAgICAgOiAnJztcblxuICAgICAgdmFyIGFubm90YXRpb25Tb3VyY2UgPSBhdHRycy5hbm5vdGF0aW9uX3NvdXJjZS52YWx1ZVxuICAgICAgICA/IGF0dHJzLmFubm90YXRpb25fc291cmNlLnZhbHVlICsgJyAoJyArIGF0dHJzLmFubm90YXRpb25fdmVyc2lvbi52YWx1ZSArICcpJ1xuICAgICAgICA6ICcnO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRkPntyZWxlYXNlfSAoe3JlbGVhc2VEYXRlfSwge2F0dHJzLnByb2plY3QudmFsdWV9IHthdHRycy5yZWxlYXNlX251bWJlci52YWx1ZX0pPC90ZD5cbiAgICAgICAgICA8dGQ+e2dlbm9tZVNvdXJjZX08L3RkPlxuICAgICAgICAgIDx0ZD57YW5ub3RhdGlvblNvdXJjZX08L3RkPlxuICAgICAgICAgIDx0ZD57YXR0cnMubm90ZS52YWx1ZX08L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBWZXJzaW9ucyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyB2ZXJzaW9ucyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIHZhciByb3dzID0gdmVyc2lvbnMuZ2V0KCdyb3dzJyk7XG5cbiAgICAgIGlmIChyb3dzLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoMz5WZXJzaW9uPC9oMz5cbiAgICAgICAgICA8cD5cbiAgICAgICAgICAgIFRoZSBkYXRhIHNldCB2ZXJzaW9uIHNob3duIGhlcmUgaXMgdGhlIGRhdGEgcHJvdmlkZXIncyB2ZXJzaW9uXG4gICAgICAgICAgICBudW1iZXIgb3IgcHVibGljYXRpb24gZGF0ZSBpbmRpY2F0ZWQgb24gdGhlIHNpdGUgZnJvbSB3aGljaCB3ZVxuICAgICAgICAgICAgZG93bmxvYWRlZCB0aGUgZGF0YS4gSW4gdGhlIHJhcmUgY2FzZSB0aGF0IHRoZXNlIGFyZSBub3QgYXZhaWxhYmxlLFxuICAgICAgICAgICAgdGhlIHZlcnNpb24gaXMgdGhlIGRhdGUgdGhhdCB0aGUgZGF0YSBzZXQgd2FzIGRvd25sb2FkZWQuXG4gICAgICAgICAgPC9wPlxuICAgICAgICAgIDx0YWJsZT5cbiAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgIDx0aD5PcmdhbmlzbTwvdGg+XG4gICAgICAgICAgICAgICAgPHRoPlByb3ZpZGVyJ3MgVmVyc2lvbjwvdGg+XG4gICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICB7cm93cy5tYXAodGhpcy5fcmVuZGVyUm93KS50b0FycmF5KCl9XG4gICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3JlbmRlclJvdyhhdHRyaWJ1dGVzKSB7XG4gICAgICB2YXIgYXR0cnMgPSBfLmluZGV4QnkoYXR0cmlidXRlcy50b0pTKCksICduYW1lJyk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRkPnthdHRycy5vcmdhbmlzbS52YWx1ZX08L3RkPlxuICAgICAgICAgIDx0ZD57YXR0cnMudmVyc2lvbi52YWx1ZX08L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBHcmFwaHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyKCkge1xuICAgICAgdmFyIHsgZ3JhcGhzIH0gPSB0aGlzLnByb3BzO1xuICAgICAgdmFyIHJvd3MgPSBncmFwaHMuZ2V0KCdyb3dzJyk7XG4gICAgICBpZiAocm93cy5zaXplID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGgzPkV4YW1wbGUgR3JhcGhzPC9oMz5cbiAgICAgICAgICA8dWw+e3Jvd3MubWFwKHRoaXMuX3JlbmRlckdyYXBoKS50b0FycmF5KCl9PC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyR3JhcGgoZ3JhcGgsIGluZGV4KSB7XG4gICAgICB2YXIgZyA9IF8uaW5kZXhCeShncmFwaC50b0pTKCksICduYW1lJyk7XG4gICAgICB2YXIgdXJsID0gJy9jZ2ktYmluL2RhdGFQbG90dGVyLnBsJyArXG4gICAgICAgICc/dHlwZT0nICsgZy5tb2R1bGUudmFsdWUgK1xuICAgICAgICAnJnByb2plY3RfaWQ9JyArIGcucHJvamVjdF9pZC52YWx1ZSArXG4gICAgICAgICcmZGF0YXNldD0nICsgZy5kYXRhc2V0X25hbWUudmFsdWUgK1xuICAgICAgICAnJnRlbXBsYXRlPTEmZm10PXBuZyZpZD0nICsgZy5ncmFwaF9pZHMudmFsdWU7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGkga2V5PXtpbmRleH0+PGltZyBzcmM9e3VybH0vPjwvbGk+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIERhdGFzZXRSZWNvcmQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyKCkge1xuICAgICAgdmFyIHsgcmVjb3JkLCBxdWVzdGlvbnMsIHJlY29yZENsYXNzZXMgfSA9IHRoaXMucHJvcHM7XG4gICAgICB2YXIgYXR0cmlidXRlcyA9IHJlY29yZC5nZXQoJ2F0dHJpYnV0ZXMnKTtcbiAgICAgIHZhciB0YWJsZXMgPSByZWNvcmQuZ2V0KCd0YWJsZXMnKTtcbiAgICAgIHZhciB0aXRsZUNsYXNzID0gJ2V1cGF0aGRiLURhdGFzZXRSZWNvcmQtdGl0bGUnO1xuXG4gICAgICB2YXIgaWQgPSByZWNvcmQuZ2V0KCdpZCcpO1xuICAgICAgdmFyIHN1bW1hcnkgPSBhdHRyaWJ1dGVzLmdldEluKFsnc3VtbWFyeScsICd2YWx1ZSddKTtcbiAgICAgIHZhciByZWxlYXNlSW5mbyA9IGF0dHJpYnV0ZXMuZ2V0SW4oWydidWlsZF9udW1iZXJfaW50cm9kdWNlZCcsICd2YWx1ZSddKTtcbiAgICAgIHZhciBwcmltYXJ5UHVibGljYXRpb24gPSB0YWJsZXMuZ2V0SW4oWydQdWJsaWNhdGlvbnMnLCAncm93cycsIDBdKTtcbiAgICAgIHZhciBjb250YWN0ID0gYXR0cmlidXRlcy5nZXRJbihbJ2NvbnRhY3QnLCAndmFsdWUnXSk7XG4gICAgICB2YXIgaW5zdGl0dXRpb24gPSBhdHRyaWJ1dGVzLmdldEluKFsnaW5zdGl0dXRpb24nLCAndmFsdWUnXSk7XG4gICAgICB2YXIgdmVyc2lvbiA9IGF0dHJpYnV0ZXMuZ2V0SW4oWydWZXJzaW9uJywgJ3Jvd3MnLCAwXSk7XG4gICAgICB2YXIgb3JnYW5pc21zID0gYXR0cmlidXRlcy5nZXRJbihbJ29yZ2FuaXNtcycsICd2YWx1ZSddKTtcbiAgICAgIHZhciBSZWZlcmVuY2VzID0gdGFibGVzLmdldCgnUmVmZXJlbmNlcycpO1xuICAgICAgdmFyIEh5cGVyTGlua3MgPSB0YWJsZXMuZ2V0KCdIeXBlckxpbmtzJyk7XG4gICAgICB2YXIgQ29udGFjdHMgPSB0YWJsZXMuZ2V0KCdDb250YWN0cycpO1xuICAgICAgdmFyIFB1YmxpY2F0aW9ucyA9IHRhYmxlcy5nZXQoJ1B1YmxpY2F0aW9ucycpO1xuICAgICAgdmFyIGRlc2NyaXB0aW9uID0gYXR0cmlidXRlcy5nZXRJbihbJ2Rlc2NyaXB0aW9uJywgJ3ZhbHVlJ10pO1xuICAgICAgdmFyIEdlbm9tZUhpc3RvcnkgPSB0YWJsZXMuZ2V0KCdHZW5vbWVIaXN0b3J5Jyk7XG4gICAgICB2YXIgVmVyc2lvbiA9IHRhYmxlcy5nZXQoJ1ZlcnNpb24nKTtcbiAgICAgIHZhciBFeGFtcGxlR3JhcGhzID0gdGFibGVzLmdldCgnRXhhbXBsZUdyYXBocycpO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImV1cGF0aGRiLURhdGFzZXRSZWNvcmRcIj5cbiAgICAgICAgICA8aDEgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tcbiAgICAgICAgICAgIF9faHRtbDogJ0RhdGEgU2V0OiA8c3BhbiBjbGFzcz1cIicgKyB0aXRsZUNsYXNzICsgJ1wiPicgKyBpZCArICc8L3NwYW4+J1xuICAgICAgICAgIH19Lz5cblxuICAgICAgICAgIDxoci8+XG5cbiAgICAgICAgICA8dGFibGUgY2xhc3NOYW1lPVwiZXVwYXRoZGItRGF0YXNldFJlY29yZC1oZWFkZXJUYWJsZVwiPlxuICAgICAgICAgICAgPHRib2R5PlxuXG4gICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICA8dGg+U3VtbWFyeTo8L3RoPlxuICAgICAgICAgICAgICAgIDx0ZCBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogc3VtbWFyeX19Lz5cbiAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAge3ByaW1hcnlQdWJsaWNhdGlvbiA/IChcbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICA8dGg+UHJpbWFyeSBwdWJsaWNhdGlvbjo8L3RoPlxuICAgICAgICAgICAgICAgICAgPHRkPntyZW5kZXJQcmltYXJ5UHVibGljYXRpb24ocHJpbWFyeVB1YmxpY2F0aW9uKX08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAgICAgIHtjb250YWN0ICYmIGluc3RpdHV0aW9uID8gKFxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgIDx0aD5QcmltYXJ5IGNvbnRhY3Q6PC90aD5cbiAgICAgICAgICAgICAgICAgIDx0ZD57cmVuZGVyUHJpbWFyeUNvbnRhY3QoY29udGFjdCwgaW5zdGl0dXRpb24pfTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICAgICAge3ZlcnNpb24gPyAoXG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgPHRoPlNvdXJjZSB2ZXJzaW9uOjwvdGg+XG4gICAgICAgICAgICAgICAgICA8dGQ+e3JlbmRlclNvdXJjZVZlcnNpb24odmVyc2lvbil9PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgICAgICB7cmVsZWFzZUluZm8gPyAoXG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgPHRoPkV1UGF0aERCIHJlbGVhc2U6PC90aD5cbiAgICAgICAgICAgICAgICAgIDx0ZD57cmVsZWFzZUluZm99PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICA8L3RhYmxlPlxuXG4gICAgICAgICAgPGhyLz5cblxuICAgICAgICAgIDxPcmdhbmlzbXMgb3JnYW5pc21zPXtvcmdhbmlzbXN9Lz5cblxuICAgICAgICAgIDxTZWFyY2hlcyBzZWFyY2hlcz17UmVmZXJlbmNlc30gbGlua3M9e0h5cGVyTGlua3N9IHF1ZXN0aW9ucz17cXVlc3Rpb25zfSByZWNvcmRDbGFzc2VzPXtyZWNvcmRDbGFzc2VzfS8+XG5cbiAgICAgICAgICA8TGlua3MgbGlua3M9e0h5cGVyTGlua3N9Lz5cblxuICAgICAgICAgIDxoMz5EZXRhaWxlZCBEZXNjcmlwdGlvbjwvaDM+XG4gICAgICAgICAgPGRpdiBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogZGVzY3JpcHRpb259fS8+XG5cbiAgICAgICAgICA8Q29udGFjdHNBbmRQdWJsaWNhdGlvbnMgY29udGFjdHM9e0NvbnRhY3RzfSBwdWJsaWNhdGlvbnM9e1B1YmxpY2F0aW9uc30vPlxuXG4gICAgICAgICAgPFJlbGVhc2VIaXN0b3J5IGhpc3Rvcnk9e0dlbm9tZUhpc3Rvcnl9Lz5cblxuICAgICAgICAgIDxWZXJzaW9ucyB2ZXJzaW9ucz17VmVyc2lvbn0vPlxuXG4gICAgICAgICAgPEdyYXBocyBncmFwaHM9e0V4YW1wbGVHcmFwaHN9Lz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgbnMuRGF0YXNldFJlY29yZCA9IERhdGFzZXRSZWNvcmQ7XG59KTtcbiJdfQ==
