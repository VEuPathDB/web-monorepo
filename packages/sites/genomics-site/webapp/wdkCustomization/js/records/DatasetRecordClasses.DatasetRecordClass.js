/* global _, Wdk, wdk */
/* jshint esnext: true, -W014 */

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWQuanMiLCJzb3VyY2VzIjpbbnVsbF0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHdCQUF3QjtBQUN4QixnQ0FBZ0M7O0FBRWhDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsR0FBRzs7QUFFSCxHQUFHLENBQUMsU0FBUyxDQUFDLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUM7QUFDaEQsRUFBRSxZQUFZLENBQUM7O0FBRWYsRUFBRSxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO0FBQ3hCOztFQUVFLElBQUksVUFBVSxHQUFHLFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUNoRCxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNsQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUNqQyxJQUFJLEtBQUssR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDMUQsT0FBTyxLQUFLLEtBQUssb0JBQUEsR0FBRSxFQUFBLENBQUEsQ0FBQyxNQUFBLEVBQU0sQ0FBRSxTQUFTLEdBQUcsUUFBUSxHQUFHLE9BQU8sRUFBQyxDQUFDLElBQUEsRUFBSSxDQUFFLEtBQUssQ0FBQyxDQUFDLENBQUcsQ0FBQSxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQU0sQ0FBQSxLQUFLLElBQUksQ0FBQztBQUN4RyxHQUFHLENBQUM7O0VBRUYsSUFBSSx3QkFBd0IsR0FBRyxTQUFTLHdCQUF3QixDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzdFLElBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztNQUMvQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksYUFBYSxDQUFDO0tBQ3pD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LFVBQVUsRUFBQyxDQUFDLEtBQUEsRUFBSyxDQUFFLFVBQVUsRUFBQyxDQUFDLFNBQUEsRUFBUyxDQUFFLFNBQVMsRUFBQyxDQUFDLGFBQUEsRUFBYSxDQUFFLGFBQWMsQ0FBRSxDQUFBLEVBQUE7O0FBRWxILFVBQVUsb0JBQUMsS0FBSyxFQUFBLENBQUEsQ0FBQyxLQUFBLEVBQUssQ0FBRSxVQUFXLENBQUUsQ0FBQSxFQUFBOztVQUUzQixvQkFBQSxJQUFHLEVBQUEsSUFBQyxFQUFBLHNCQUF5QixDQUFBLEVBQUE7QUFDdkMsVUFBVSxvQkFBQSxLQUFJLEVBQUEsQ0FBQSxDQUFDLHVCQUFBLEVBQXVCLENBQUUsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFFLENBQUUsQ0FBQSxFQUFBOztBQUVoRSxVQUFVLG9CQUFDLHVCQUF1QixFQUFBLENBQUEsQ0FBQyxRQUFBLEVBQVEsQ0FBRSxRQUFRLEVBQUMsQ0FBQyxZQUFBLEVBQVksQ0FBRSxZQUFhLENBQUUsQ0FBQSxFQUFBOztBQUVwRixVQUFVLG9CQUFDLGNBQWMsRUFBQSxDQUFBLENBQUMsT0FBQSxFQUFPLENBQUUsYUFBYyxDQUFFLENBQUEsRUFBQTs7QUFFbkQsVUFBVSxvQkFBQyxRQUFRLEVBQUEsQ0FBQSxDQUFDLFFBQUEsRUFBUSxDQUFFLE9BQVEsQ0FBRSxDQUFBLEVBQUE7O1VBRTlCLG9CQUFDLE1BQU0sRUFBQSxDQUFBLENBQUMsTUFBQSxFQUFNLENBQUUsYUFBYyxDQUFFLENBQUE7UUFDNUIsQ0FBQTtRQUNOO0tBQ0g7QUFDTCxHQUFHLENBQUMsQ0FBQzs7RUFFSCxFQUFFLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztDQUNsQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBnbG9iYWwgXywgV2RrLCB3ZGsgKi9cbi8qIGpzaGludCBlc25leHQ6IHRydWUsIC1XMDE0ICovXG5cbi8qKlxuICogVGhpcyBmaWxlIHByb3ZpZGVzIGEgY3VzdG9tIFJlY29yZCBDb21wb25lbnQgd2hpY2ggaXMgdXNlZCBieSB0aGUgbmV3IFdka1xuICogRmx1eCBhcmNoaXRlY3R1cmUuXG4gKlxuICogVGhlIHNpYmxpbmcgZmlsZSBEYXRhc2V0UmVjb3JkQ2xhc3Nlcy5EYXRhc2V0UmVjb3JkQ2xhc3MuanMgaXMgZ2VuZXJhdGVkXG4gKiBmcm9tIHRoaXMgZmlsZSB1c2luZyB0aGUganN4IGNvbXBpbGVyLiBFdmVudHVhbGx5LCB0aGlzIGZpbGUgd2lsbCBiZVxuICogY29tcGlsZWQgZHVyaW5nIGJ1aWxkIHRpbWUtLXRoaXMgaXMgYSBzaG9ydC10ZXJtIHNvbHV0aW9uLlxuICpcbiAqIGB3ZGtgIGlzIHRoZSBsZWdhY3kgZ2xvYmFsIG9iamVjdCwgYW5kIGBXZGtgIGlzIHRoZSBuZXcgZ2xvYmFsIG9iamVjdFxuICovXG5cbndkay5uYW1lc3BhY2UoJ2V1cGF0aGRiLnJlY29yZHMnLCBmdW5jdGlvbihucykge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgUmVhY3QgPSBXZGsuUmVhY3Q7XG5cbiAgLy8gZm9ybWF0IGlzIHt0ZXh0fSh7bGlua30pXG4gIHZhciBmb3JtYXRMaW5rID0gZnVuY3Rpb24gZm9ybWF0TGluayhsaW5rLCBvcHRzKSB7XG4gICAgb3B0cyA9IG9wdHMgfHwge307XG4gICAgdmFyIG5ld1dpbmRvdyA9ICEhb3B0cy5uZXdXaW5kb3c7XG4gICAgdmFyIG1hdGNoID0gLyguKilcXCgoLiopXFwpLy5leGVjKGxpbmsucmVwbGFjZSgvXFxuL2csICcgJykpO1xuICAgIHJldHVybiBtYXRjaCA/ICggPGEgdGFyZ2V0PXtuZXdXaW5kb3cgPyAnX2JsYW5rJyA6ICdfc2VsZid9IGhyZWY9e21hdGNoWzJdfT57bWF0Y2hbMV19PC9hPiApIDogbnVsbDtcbiAgfTtcblxuICB2YXIgcmVuZGVyUHJpbWFyeVB1YmxpY2F0aW9uID0gZnVuY3Rpb24gcmVuZGVyUHJpbWFyeVB1YmxpY2F0aW9uKHB1YmxpY2F0aW9uKSB7XG4gICAgdmFyIHB1Ym1lZExpbmsgPSBwdWJsaWNhdGlvbi5maW5kKGZ1bmN0aW9uKHB1Yikge1xuICAgICAgcmV0dXJuIHB1Yi5nZXQoJ25hbWUnKSA9PSAncHVibWVkX2xpbmsnO1xuICAgIH0pO1xuICAgIHJldHVybiBmb3JtYXRMaW5rKHB1Ym1lZExpbmsuZ2V0KCd2YWx1ZScpLCB7IG5ld1dpbmRvdzogdHJ1ZSB9KTtcbiAgfTtcblxuICB2YXIgcmVuZGVyUHJpbWFyeUNvbnRhY3QgPSBmdW5jdGlvbiByZW5kZXJQcmltYXJ5Q29udGFjdChjb250YWN0LCBpbnN0aXR1dGlvbikge1xuICAgIHJldHVybiBjb250YWN0ICsgJywgJyArIGluc3RpdHV0aW9uO1xuICB9O1xuXG4gIHZhciByZW5kZXJTb3VyY2VWZXJzaW9uID0gZnVuY3Rpb24odmVyc2lvbikge1xuICAgIHZhciBuYW1lID0gdmVyc2lvbi5maW5kKHYgPT4gdi5nZXQoJ25hbWUnKSA9PT0gJ3ZlcnNpb24nKTtcbiAgICByZXR1cm4gKFxuICAgICAgbmFtZS5nZXQoJ3ZhbHVlJykgKyAnIChUaGUgZGF0YSBwcm92aWRlclxcJ3MgdmVyc2lvbiBudW1iZXIgb3IgcHVibGljYXRpb24gZGF0ZSwgZnJvbScgK1xuICAgICAgJyB0aGUgc2l0ZSB0aGUgZGF0YSB3YXMgYWNxdWlyZWQuIEluIHRoZSByYXJlIGNhc2UgbmVpdGhlciBpcyBhdmFpbGFibGUsJyArXG4gICAgICAnIHRoZSBkb3dubG9hZCBkYXRlLiknXG4gICAgKTtcbiAgfTtcblxuICB2YXIgT3JnYW5pc21zID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IG9yZ2FuaXNtcyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGlmICghb3JnYW5pc21zKSByZXR1cm4gbnVsbDtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGgzPk9yZ2FuaXNtcyB0aGlzIGRhdGEgc2V0IGlzIG1hcHBlZCB0byBpbiBQbGFzbW9EQjwvaDM+XG4gICAgICAgICAgPHVsPntvcmdhbmlzbXMuc3BsaXQoLyxcXHMqLykubWFwKHRoaXMuX3JlbmRlck9yZ2FuaXNtKS50b0FycmF5KCl9PC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyT3JnYW5pc20ob3JnYW5pc20sIGluZGV4KSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGkga2V5PXtpbmRleH0+PGk+e29yZ2FuaXNtfTwvaT48L2xpPlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBTZWFyY2hlcyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgbGlua3MgPSB0aGlzLnByb3BzLmxpbmtzO1xuICAgICAgdmFyIHNlYXJjaGVzID0gdGhpcy5wcm9wcy5zZWFyY2hlcy5nZXQoJ3Jvd3MnKS5maWx0ZXIodGhpcy5fcm93SXNRdWVzdGlvbik7XG5cbiAgICAgIGlmIChzZWFyY2hlcy5zaXplID09PSAwICYmIGxpbmtzLmdldCgncm93cycpLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoMz5TZWFyY2ggb3IgdmlldyB0aGlzIGRhdGEgc2V0IGluIFBsYXNtb0RCPC9oMz5cbiAgICAgICAgICA8dWw+XG4gICAgICAgICAgICB7c2VhcmNoZXMubWFwKHRoaXMuX3JlbmRlclNlYXJjaCkudG9BcnJheSgpfVxuICAgICAgICAgICAge2xpbmtzLmdldCgncm93cycpLm1hcCh0aGlzLl9yZW5kZXJMaW5rKS50b0FycmF5KCl9XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcm93SXNRdWVzdGlvbihyb3cpIHtcbiAgICAgIHZhciB0eXBlID0gcm93LmZpbmQoYXR0ciA9PiBhdHRyLmdldCgnbmFtZScpID09ICd0YXJnZXRfdHlwZScpO1xuICAgICAgcmV0dXJuIHR5cGUgJiYgdHlwZS5nZXQoJ3ZhbHVlJykgPT0gJ3F1ZXN0aW9uJztcbiAgICB9LFxuXG4gICAgX3JlbmRlclNlYXJjaChzZWFyY2gsIGluZGV4KSB7XG4gICAgICB2YXIgbmFtZSA9IHNlYXJjaC5maW5kKGF0dHIgPT4gYXR0ci5nZXQoJ25hbWUnKSA9PSAndGFyZ2V0X25hbWUnKS5nZXQoJ3ZhbHVlJyk7XG4gICAgICB2YXIgcXVlc3Rpb24gPSB0aGlzLnByb3BzLnF1ZXN0aW9ucy5maW5kKHEgPT4gcS5nZXQoJ25hbWUnKSA9PT0gbmFtZSk7XG4gICAgICB2YXIgcmVjb3JkQ2xhc3MgPSB0aGlzLnByb3BzLnJlY29yZENsYXNzZXMuZmluZChyID0+IHIuZ2V0KCdmdWxsTmFtZScpID09PSBxdWVzdGlvbi5nZXQoJ2NsYXNzJykpO1xuICAgICAgdmFyIHNlYXJjaE5hbWUgPSBgSWRlbnRpZnkgJHtyZWNvcmRDbGFzcy5nZXQoJ2Rpc3BsYXlOYW1lUGx1cmFsJyl9IGJ5ICR7cXVlc3Rpb24uZ2V0KCdkaXNwbGF5TmFtZScpfWA7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGkga2V5PXtpbmRleH0+XG4gICAgICAgICAgPGEgaHJlZj17Jy9hL3Nob3dRdWVzdGlvbi5kbz9xdWVzdGlvbkZ1bGxOYW1lPScgKyBuYW1lfT57c2VhcmNoTmFtZX08L2E+XG4gICAgICAgIDwvbGk+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyTGluayhsaW5rLCBpbmRleCkge1xuICAgICAgdmFyIGh5cGVyTGluayA9IGxpbmsuZmluZChhdHRyID0+IGF0dHIuZ2V0KCduYW1lJykgPT0gJ2h5cGVyX2xpbmsnKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaSBrZXk9e2luZGV4fT57Zm9ybWF0TGluayhoeXBlckxpbmsuZ2V0KCd2YWx1ZScpKX08L2xpPlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBMaW5rcyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyBsaW5rcyB9ID0gdGhpcy5wcm9wcztcblxuICAgICAgaWYgKGxpbmtzLmdldCgncm93cycpLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoMz5FeHRlcm5hbCBMaW5rczwvaDM+XG4gICAgICAgICAgPHVsPiB7bGlua3MuZ2V0KCdyb3dzJykubWFwKHRoaXMuX3JlbmRlckxpbmspLnRvQXJyYXkoKX0gPC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyTGluayhsaW5rLCBpbmRleCkge1xuICAgICAgdmFyIGh5cGVyTGluayA9IGxpbmsuZmluZChhdHRyID0+IGF0dHIuZ2V0KCduYW1lJykgPT0gJ2h5cGVyX2xpbmsnKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaSBrZXk9e2luZGV4fT57Zm9ybWF0TGluayhoeXBlckxpbmsuZ2V0KCd2YWx1ZScpKX08L2xpPlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBDb250YWN0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyBjb250YWN0cyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGlmIChjb250YWN0cy5nZXQoJ3Jvd3MnKS5zaXplID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGg0PkNvbnRhY3RzPC9oND5cbiAgICAgICAgICA8dWw+XG4gICAgICAgICAgICB7Y29udGFjdHMuZ2V0KCdyb3dzJykubWFwKHRoaXMuX3JlbmRlckNvbnRhY3QpLnRvQXJyYXkoKX1cbiAgICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSxcblxuICAgIF9yZW5kZXJDb250YWN0KGNvbnRhY3QsIGluZGV4KSB7XG4gICAgICB2YXIgY29udGFjdF9uYW1lID0gY29udGFjdC5maW5kKGMgPT4gYy5nZXQoJ25hbWUnKSA9PSAnY29udGFjdF9uYW1lJyk7XG4gICAgICB2YXIgYWZmaWxpYXRpb24gPSBjb250YWN0LmZpbmQoYyA9PiBjLmdldCgnbmFtZScpID09ICdhZmZpbGlhdGlvbicpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGxpIGtleT17aW5kZXh9Pntjb250YWN0X25hbWUuZ2V0KCd2YWx1ZScpfSwge2FmZmlsaWF0aW9uLmdldCgndmFsdWUnKX08L2xpPlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBQdWJsaWNhdGlvbnMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyKCkge1xuICAgICAgdmFyIHsgcHVibGljYXRpb25zIH0gPSB0aGlzLnByb3BzO1xuICAgICAgdmFyIHJvd3MgPSBwdWJsaWNhdGlvbnMuZ2V0KCdyb3dzJyk7XG4gICAgICBpZiAocm93cy5zaXplID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGg0PlB1YmxpY2F0aW9uczwvaDQ+XG4gICAgICAgICAgPHVsPntyb3dzLm1hcCh0aGlzLl9yZW5kZXJQdWJsaWNhdGlvbikudG9BcnJheSgpfTwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3JlbmRlclB1YmxpY2F0aW9uKHB1YmxpY2F0aW9uLCBpbmRleCkge1xuICAgICAgdmFyIHB1Ym1lZF9saW5rID0gcHVibGljYXRpb24uZmluZChwID0+IHAuZ2V0KCduYW1lJykgPT0gJ3B1Ym1lZF9saW5rJyk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGkga2V5PXtpbmRleH0+e2Zvcm1hdExpbmsocHVibWVkX2xpbmsuZ2V0KCd2YWx1ZScpKX08L2xpPlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBDb250YWN0c0FuZFB1YmxpY2F0aW9ucyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyBjb250YWN0cywgcHVibGljYXRpb25zIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgICBpZiAoY29udGFjdHMuZ2V0KCdyb3dzJykuc2l6ZSA9PT0gMCAmJiBwdWJsaWNhdGlvbnMuZ2V0KCdyb3dzJykuc2l6ZSA9PT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGgzPkFkZGl0aW9uYWwgQ29udGFjdHMgYW5kIFB1YmxpY2F0aW9uczwvaDM+XG4gICAgICAgICAgPENvbnRhY3RzIGNvbnRhY3RzPXtjb250YWN0c30vPlxuICAgICAgICAgIDxQdWJsaWNhdGlvbnMgcHVibGljYXRpb25zPXtwdWJsaWNhdGlvbnN9Lz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIFJlbGVhc2VIaXN0b3J5ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IGhpc3RvcnkgfSA9IHRoaXMucHJvcHM7XG4gICAgICBpZiAoaGlzdG9yeS5nZXQoJ3Jvd3MnKS5zaXplID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGgzPkRhdGEgU2V0IFJlbGVhc2UgSGlzdG9yeTwvaDM+XG4gICAgICAgICAgPHRhYmxlPlxuICAgICAgICAgICAgPHRoZWFkPlxuICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgPHRoPkV1UGF0aERCIFJlbGVhc2U8L3RoPlxuICAgICAgICAgICAgICAgIDx0aD5HZW5vbWUgU291cmNlPC90aD5cbiAgICAgICAgICAgICAgICA8dGg+QW5ub3RhdGlvbiBTb3VyY2U8L3RoPlxuICAgICAgICAgICAgICAgIDx0aD5Ob3RlczwvdGg+XG4gICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICB7aGlzdG9yeS5nZXQoJ3Jvd3MnKS5tYXAodGhpcy5fcmVuZGVyUm93KS50b0FycmF5KCl9XG4gICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3JlbmRlclJvdyhhdHRyaWJ1dGVzKSB7XG4gICAgICB2YXIgYXR0cnMgPSBfLmluZGV4QnkoYXR0cmlidXRlcy50b0pTKCksICduYW1lJyk7XG5cbiAgICAgIHZhciByZWxlYXNlID0gYXR0cnMuYnVpbGQudmFsdWUgPyAnUmVsZWFzZSAnICsgYXR0cnMuYnVpbGQudmFsdWVcbiAgICAgICAgOiAnSW5pdGlhbCByZWxlYXNlJztcblxuICAgICAgdmFyIHJlbGVhc2VEYXRlID0gbmV3IERhdGUoYXR0cnMucmVsZWFzZV9kYXRlLnZhbHVlKVxuICAgICAgICAudG9EYXRlU3RyaW5nKClcbiAgICAgICAgLnNwbGl0KCcgJylcbiAgICAgICAgLnNsaWNlKDEpXG4gICAgICAgIC5qb2luKCcgJyk7XG5cbiAgICAgIHZhciBnZW5vbWVTb3VyY2UgPSBhdHRycy5nZW5vbWVfc291cmNlLnZhbHVlXG4gICAgICAgID8gYXR0cnMuZ2Vub21lX3NvdXJjZS52YWx1ZSArICcgKCcgKyBhdHRycy5nZW5vbWVfdmVyc2lvbi52YWx1ZSArICcpJ1xuICAgICAgICA6ICcnO1xuXG4gICAgICB2YXIgYW5ub3RhdGlvblNvdXJjZSA9IGF0dHJzLmFubm90YXRpb25fc291cmNlLnZhbHVlXG4gICAgICAgID8gYXR0cnMuYW5ub3RhdGlvbl9zb3VyY2UudmFsdWUgKyAnICgnICsgYXR0cnMuYW5ub3RhdGlvbl92ZXJzaW9uLnZhbHVlICsgJyknXG4gICAgICAgIDogJyc7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQ+e3JlbGVhc2V9ICh7cmVsZWFzZURhdGV9LCB7YXR0cnMucHJvamVjdC52YWx1ZX0ge2F0dHJzLnJlbGVhc2VfbnVtYmVyLnZhbHVlfSk8L3RkPlxuICAgICAgICAgIDx0ZD57Z2Vub21lU291cmNlfTwvdGQ+XG4gICAgICAgICAgPHRkPnthbm5vdGF0aW9uU291cmNlfTwvdGQ+XG4gICAgICAgICAgPHRkPnthdHRycy5ub3RlLnZhbHVlfTwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIFZlcnNpb25zID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IHZlcnNpb25zIH0gPSB0aGlzLnByb3BzO1xuICAgICAgdmFyIHJvd3MgPSB2ZXJzaW9ucy5nZXQoJ3Jvd3MnKTtcblxuICAgICAgaWYgKHJvd3Muc2l6ZSA9PT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGgzPlZlcnNpb248L2gzPlxuICAgICAgICAgIDxwPlxuICAgICAgICAgICAgVGhlIGRhdGEgc2V0IHZlcnNpb24gc2hvd24gaGVyZSBpcyB0aGUgZGF0YSBwcm92aWRlcidzIHZlcnNpb25cbiAgICAgICAgICAgIG51bWJlciBvciBwdWJsaWNhdGlvbiBkYXRlIGluZGljYXRlZCBvbiB0aGUgc2l0ZSBmcm9tIHdoaWNoIHdlXG4gICAgICAgICAgICBkb3dubG9hZGVkIHRoZSBkYXRhLiBJbiB0aGUgcmFyZSBjYXNlIHRoYXQgdGhlc2UgYXJlIG5vdCBhdmFpbGFibGUsXG4gICAgICAgICAgICB0aGUgdmVyc2lvbiBpcyB0aGUgZGF0ZSB0aGF0IHRoZSBkYXRhIHNldCB3YXMgZG93bmxvYWRlZC5cbiAgICAgICAgICA8L3A+XG4gICAgICAgICAgPHRhYmxlPlxuICAgICAgICAgICAgPHRoZWFkPlxuICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgPHRoPk9yZ2FuaXNtPC90aD5cbiAgICAgICAgICAgICAgICA8dGg+UHJvdmlkZXIncyBWZXJzaW9uPC90aD5cbiAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgIHtyb3dzLm1hcCh0aGlzLl9yZW5kZXJSb3cpLnRvQXJyYXkoKX1cbiAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyUm93KGF0dHJpYnV0ZXMpIHtcbiAgICAgIHZhciBhdHRycyA9IF8uaW5kZXhCeShhdHRyaWJ1dGVzLnRvSlMoKSwgJ25hbWUnKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQ+e2F0dHJzLm9yZ2FuaXNtLnZhbHVlfTwvdGQ+XG4gICAgICAgICAgPHRkPnthdHRycy52ZXJzaW9uLnZhbHVlfTwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIEdyYXBocyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyBncmFwaHMgfSA9IHRoaXMucHJvcHM7XG4gICAgICB2YXIgcm93cyA9IGdyYXBocy5nZXQoJ3Jvd3MnKTtcbiAgICAgIGlmIChyb3dzLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aDM+RXhhbXBsZSBHcmFwaHM8L2gzPlxuICAgICAgICAgIDx1bD57cm93cy5tYXAodGhpcy5fcmVuZGVyR3JhcGgpLnRvQXJyYXkoKX08L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSxcblxuICAgIF9yZW5kZXJHcmFwaChncmFwaCwgaW5kZXgpIHtcbiAgICAgIHZhciBnID0gXy5pbmRleEJ5KGdyYXBoLnRvSlMoKSwgJ25hbWUnKTtcbiAgICAgIHZhciB1cmwgPSAnL2NnaS1iaW4vZGF0YVBsb3R0ZXIucGwnICtcbiAgICAgICAgJz90eXBlPScgKyBnLm1vZHVsZS52YWx1ZSArXG4gICAgICAgICcmcHJvamVjdF9pZD0nICsgZy5wcm9qZWN0X2lkLnZhbHVlICtcbiAgICAgICAgJyZkYXRhc2V0PScgKyBnLmRhdGFzZXRfbmFtZS52YWx1ZSArXG4gICAgICAgICcmdGVtcGxhdGU9MSZmbXQ9cG5nJmlkPScgKyBnLmdyYXBoX2lkcy52YWx1ZTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaSBrZXk9e2luZGV4fT48aW1nIHNyYz17dXJsfS8+PC9saT5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgRGF0YXNldFJlY29yZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyByZWNvcmQsIHF1ZXN0aW9ucywgcmVjb3JkQ2xhc3NlcyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIHZhciBhdHRyaWJ1dGVzID0gcmVjb3JkLmdldCgnYXR0cmlidXRlcycpO1xuICAgICAgdmFyIHRhYmxlcyA9IHJlY29yZC5nZXQoJ3RhYmxlcycpO1xuICAgICAgdmFyIHRpdGxlQ2xhc3MgPSAnZXVwYXRoZGItRGF0YXNldFJlY29yZC10aXRsZSc7XG5cbiAgICAgIHZhciBpZCA9IHJlY29yZC5nZXQoJ2lkJyk7XG4gICAgICB2YXIgc3VtbWFyeSA9IGF0dHJpYnV0ZXMuZ2V0SW4oWydzdW1tYXJ5JywgJ3ZhbHVlJ10pO1xuICAgICAgdmFyIHJlbGVhc2VJbmZvID0gYXR0cmlidXRlcy5nZXRJbihbJ2J1aWxkX251bWJlcl9pbnRyb2R1Y2VkJywgJ3ZhbHVlJ10pO1xuICAgICAgdmFyIHByaW1hcnlQdWJsaWNhdGlvbiA9IHRhYmxlcy5nZXRJbihbJ1B1YmxpY2F0aW9ucycsICdyb3dzJywgMF0pO1xuICAgICAgdmFyIGNvbnRhY3QgPSBhdHRyaWJ1dGVzLmdldEluKFsnY29udGFjdCcsICd2YWx1ZSddKTtcbiAgICAgIHZhciBpbnN0aXR1dGlvbiA9IGF0dHJpYnV0ZXMuZ2V0SW4oWydpbnN0aXR1dGlvbicsICd2YWx1ZSddKTtcbiAgICAgIHZhciB2ZXJzaW9uID0gYXR0cmlidXRlcy5nZXRJbihbJ1ZlcnNpb24nLCAncm93cycsIDBdKTtcbiAgICAgIHZhciBvcmdhbmlzbXMgPSBhdHRyaWJ1dGVzLmdldEluKFsnb3JnYW5pc21zJywgJ3ZhbHVlJ10pO1xuICAgICAgdmFyIFJlZmVyZW5jZXMgPSB0YWJsZXMuZ2V0KCdSZWZlcmVuY2VzJyk7XG4gICAgICB2YXIgSHlwZXJMaW5rcyA9IHRhYmxlcy5nZXQoJ0h5cGVyTGlua3MnKTtcbiAgICAgIHZhciBDb250YWN0cyA9IHRhYmxlcy5nZXQoJ0NvbnRhY3RzJyk7XG4gICAgICB2YXIgUHVibGljYXRpb25zID0gdGFibGVzLmdldCgnUHVibGljYXRpb25zJyk7XG4gICAgICB2YXIgZGVzY3JpcHRpb24gPSBhdHRyaWJ1dGVzLmdldEluKFsnZGVzY3JpcHRpb24nLCAndmFsdWUnXSk7XG4gICAgICB2YXIgR2Vub21lSGlzdG9yeSA9IHRhYmxlcy5nZXQoJ0dlbm9tZUhpc3RvcnknKTtcbiAgICAgIHZhciBWZXJzaW9uID0gdGFibGVzLmdldCgnVmVyc2lvbicpO1xuICAgICAgdmFyIEV4YW1wbGVHcmFwaHMgPSB0YWJsZXMuZ2V0KCdFeGFtcGxlR3JhcGhzJyk7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXVwYXRoZGItRGF0YXNldFJlY29yZFwiPlxuICAgICAgICAgIDxoMSBkYW5nZXJvdXNseVNldElubmVySFRNTD17e1xuICAgICAgICAgICAgX19odG1sOiAnRGF0YSBTZXQ6IDxzcGFuIGNsYXNzPVwiJyArIHRpdGxlQ2xhc3MgKyAnXCI+JyArIGlkICsgJzwvc3Bhbj4nXG4gICAgICAgICAgfX0vPlxuXG4gICAgICAgICAgPGhyLz5cblxuICAgICAgICAgIDx0YWJsZSBjbGFzc05hbWU9XCJldXBhdGhkYi1EYXRhc2V0UmVjb3JkLWhlYWRlclRhYmxlXCI+XG4gICAgICAgICAgICA8dGJvZHk+XG5cbiAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgIDx0aD5TdW1tYXJ5OjwvdGg+XG4gICAgICAgICAgICAgICAgPHRkIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBzdW1tYXJ5fX0vPlxuICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICB7cHJpbWFyeVB1YmxpY2F0aW9uID8gKFxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgIDx0aD5QcmltYXJ5IHB1YmxpY2F0aW9uOjwvdGg+XG4gICAgICAgICAgICAgICAgICA8dGQ+e3JlbmRlclByaW1hcnlQdWJsaWNhdGlvbihwcmltYXJ5UHVibGljYXRpb24pfTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICAgICAge2NvbnRhY3QgJiYgaW5zdGl0dXRpb24gPyAoXG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgPHRoPlByaW1hcnkgY29udGFjdDo8L3RoPlxuICAgICAgICAgICAgICAgICAgPHRkPntyZW5kZXJQcmltYXJ5Q29udGFjdChjb250YWN0LCBpbnN0aXR1dGlvbil9PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgICAgICB7dmVyc2lvbiA/IChcbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICA8dGg+U291cmNlIHZlcnNpb246PC90aD5cbiAgICAgICAgICAgICAgICAgIDx0ZD57cmVuZGVyU291cmNlVmVyc2lvbih2ZXJzaW9uKX08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAgICAgIHtyZWxlYXNlSW5mbyA/IChcbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICA8dGg+RXVQYXRoREIgcmVsZWFzZTo8L3RoPlxuICAgICAgICAgICAgICAgICAgPHRkPntyZWxlYXNlSW5mb308L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgIDwvdGFibGU+XG5cbiAgICAgICAgICA8aHIvPlxuXG4gICAgICAgICAgPE9yZ2FuaXNtcyBvcmdhbmlzbXM9e29yZ2FuaXNtc30vPlxuXG4gICAgICAgICAgPFNlYXJjaGVzIHNlYXJjaGVzPXtSZWZlcmVuY2VzfSBsaW5rcz17SHlwZXJMaW5rc30gcXVlc3Rpb25zPXtxdWVzdGlvbnN9IHJlY29yZENsYXNzZXM9e3JlY29yZENsYXNzZXN9Lz5cblxuICAgICAgICAgIDxMaW5rcyBsaW5rcz17SHlwZXJMaW5rc30vPlxuXG4gICAgICAgICAgPGgzPkRldGFpbGVkIERlc2NyaXB0aW9uPC9oMz5cbiAgICAgICAgICA8ZGl2IGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBkZXNjcmlwdGlvbn19Lz5cblxuICAgICAgICAgIDxDb250YWN0c0FuZFB1YmxpY2F0aW9ucyBjb250YWN0cz17Q29udGFjdHN9IHB1YmxpY2F0aW9ucz17UHVibGljYXRpb25zfS8+XG5cbiAgICAgICAgICA8UmVsZWFzZUhpc3RvcnkgaGlzdG9yeT17R2Vub21lSGlzdG9yeX0vPlxuXG4gICAgICAgICAgPFZlcnNpb25zIHZlcnNpb25zPXtWZXJzaW9ufS8+XG5cbiAgICAgICAgICA8R3JhcGhzIGdyYXBocz17RXhhbXBsZUdyYXBoc30vPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICBucy5EYXRhc2V0UmVjb3JkID0gRGF0YXNldFJlY29yZDtcbn0pO1xuIl19
