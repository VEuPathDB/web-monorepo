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

  var Tooltip = React.createClass({displayName: "Tooltip",
    componentDidMount:function() {
      var text = ("<div style=\"max-height: 200px; overflow-y: auto; padding: 2px;\">" + this.props.text + "</div>");
      $(this.getDOMNode()).wdkTooltip({
        content: { text:text },
        position: { viewport: false },
        show: { delay: 1000 }
      });
    },
    componentWillUnmount:function() {
      $(this.getDOMNode()).qtip('destroy', true);
    },
    render:function() {
      return (
        React.createElement("div", null, 
          this.props.children
        )
      );
    }
  });

  function datasetCellRenderer(attribute, attributeName, attributes, index, columnData, width, defaultRenderer) {
    if (attribute.get('name') === 'primary_key') {
      return (
        React.createElement(Tooltip, {text: attributes.get('description').get('value')}, 
          defaultRenderer(attribute, attributeName, attributes, index, columnData, width)
        )
      );
    }
    else {
      return defaultRenderer(attribute, attributeName, attributes, index, columnData, width);
    }
  }

  ns.DatasetRecord = DatasetRecord;
  ns.datasetCellRenderer = datasetCellRenderer;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWQuanMiLCJzb3VyY2VzIjpbbnVsbF0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHdCQUF3QjtBQUN4Qiw4Q0FBOEM7O0FBRTlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsR0FBRzs7QUFFSCxHQUFHLENBQUMsU0FBUyxDQUFDLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUM7QUFDaEQsRUFBRSxZQUFZLENBQUM7O0FBRWYsRUFBRSxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO0FBQ3hCOztFQUVFLElBQUksVUFBVSxHQUFHLFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUNoRCxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNsQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUNqQyxJQUFJLEtBQUssR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDMUQsT0FBTyxLQUFLLEtBQUssb0JBQUEsR0FBRSxFQUFBLENBQUEsQ0FBQyxNQUFBLEVBQU0sQ0FBRSxTQUFTLEdBQUcsUUFBUSxHQUFHLE9BQU8sRUFBQyxDQUFDLElBQUEsRUFBSSxDQUFFLEtBQUssQ0FBQyxDQUFDLENBQUcsQ0FBQSxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQU0sQ0FBQSxLQUFLLElBQUksQ0FBQztBQUN4RyxHQUFHLENBQUM7O0VBRUYsSUFBSSx3QkFBd0IsR0FBRyxTQUFTLHdCQUF3QixDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzdFLElBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztNQUMvQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksYUFBYSxDQUFDO0tBQ3pD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QWEsR0FBRyxhQUFhLENBQUM7RUFDakMsRUFBRSxDQUFDLG1CQUFtQixHQUFHLG1CQUFtQixDQUFDO0NBQzlDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGdsb2JhbCBfLCBXZGssIHdkayAqL1xuLyoganNoaW50IGVzbmV4dDogdHJ1ZSwgZXFudWxsOiB0cnVlLCAtVzAxNCAqL1xuXG4vKipcbiAqIFRoaXMgZmlsZSBwcm92aWRlcyBhIGN1c3RvbSBSZWNvcmQgQ29tcG9uZW50IHdoaWNoIGlzIHVzZWQgYnkgdGhlIG5ldyBXZGtcbiAqIEZsdXggYXJjaGl0ZWN0dXJlLlxuICpcbiAqIFRoZSBzaWJsaW5nIGZpbGUgRGF0YXNldFJlY29yZENsYXNzZXMuRGF0YXNldFJlY29yZENsYXNzLmpzIGlzIGdlbmVyYXRlZFxuICogZnJvbSB0aGlzIGZpbGUgdXNpbmcgdGhlIGpzeCBjb21waWxlci4gRXZlbnR1YWxseSwgdGhpcyBmaWxlIHdpbGwgYmVcbiAqIGNvbXBpbGVkIGR1cmluZyBidWlsZCB0aW1lLS10aGlzIGlzIGEgc2hvcnQtdGVybSBzb2x1dGlvbi5cbiAqXG4gKiBgd2RrYCBpcyB0aGUgbGVnYWN5IGdsb2JhbCBvYmplY3QsIGFuZCBgV2RrYCBpcyB0aGUgbmV3IGdsb2JhbCBvYmplY3RcbiAqL1xuXG53ZGsubmFtZXNwYWNlKCdldXBhdGhkYi5yZWNvcmRzJywgZnVuY3Rpb24obnMpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIFJlYWN0ID0gV2RrLlJlYWN0O1xuXG4gIC8vIGZvcm1hdCBpcyB7dGV4dH0oe2xpbmt9KVxuICB2YXIgZm9ybWF0TGluayA9IGZ1bmN0aW9uIGZvcm1hdExpbmsobGluaywgb3B0cykge1xuICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuICAgIHZhciBuZXdXaW5kb3cgPSAhIW9wdHMubmV3V2luZG93O1xuICAgIHZhciBtYXRjaCA9IC8oLiopXFwoKC4qKVxcKS8uZXhlYyhsaW5rLnJlcGxhY2UoL1xcbi9nLCAnICcpKTtcbiAgICByZXR1cm4gbWF0Y2ggPyAoIDxhIHRhcmdldD17bmV3V2luZG93ID8gJ19ibGFuaycgOiAnX3NlbGYnfSBocmVmPXttYXRjaFsyXX0+e21hdGNoWzFdfTwvYT4gKSA6IG51bGw7XG4gIH07XG5cbiAgdmFyIHJlbmRlclByaW1hcnlQdWJsaWNhdGlvbiA9IGZ1bmN0aW9uIHJlbmRlclByaW1hcnlQdWJsaWNhdGlvbihwdWJsaWNhdGlvbikge1xuICAgIHZhciBwdWJtZWRMaW5rID0gcHVibGljYXRpb24uZmluZChmdW5jdGlvbihwdWIpIHtcbiAgICAgIHJldHVybiBwdWIuZ2V0KCduYW1lJykgPT0gJ3B1Ym1lZF9saW5rJztcbiAgICB9KTtcbiAgICByZXR1cm4gZm9ybWF0TGluayhwdWJtZWRMaW5rLmdldCgndmFsdWUnKSwgeyBuZXdXaW5kb3c6IHRydWUgfSk7XG4gIH07XG5cbiAgdmFyIHJlbmRlclByaW1hcnlDb250YWN0ID0gZnVuY3Rpb24gcmVuZGVyUHJpbWFyeUNvbnRhY3QoY29udGFjdCwgaW5zdGl0dXRpb24pIHtcbiAgICByZXR1cm4gY29udGFjdCArICcsICcgKyBpbnN0aXR1dGlvbjtcbiAgfTtcblxuICB2YXIgcmVuZGVyU291cmNlVmVyc2lvbiA9IGZ1bmN0aW9uKHZlcnNpb24pIHtcbiAgICB2YXIgbmFtZSA9IHZlcnNpb24uZmluZCh2ID0+IHYuZ2V0KCduYW1lJykgPT09ICd2ZXJzaW9uJyk7XG4gICAgcmV0dXJuIChcbiAgICAgIG5hbWUuZ2V0KCd2YWx1ZScpICsgJyAoVGhlIGRhdGEgcHJvdmlkZXJcXCdzIHZlcnNpb24gbnVtYmVyIG9yIHB1YmxpY2F0aW9uIGRhdGUsIGZyb20nICtcbiAgICAgICcgdGhlIHNpdGUgdGhlIGRhdGEgd2FzIGFjcXVpcmVkLiBJbiB0aGUgcmFyZSBjYXNlIG5laXRoZXIgaXMgYXZhaWxhYmxlLCcgK1xuICAgICAgJyB0aGUgZG93bmxvYWQgZGF0ZS4pJ1xuICAgICk7XG4gIH07XG5cbiAgdmFyIE9yZ2FuaXNtcyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyBvcmdhbmlzbXMgfSA9IHRoaXMucHJvcHM7XG4gICAgICBpZiAoIW9yZ2FuaXNtcykgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoMz5PcmdhbmlzbXMgdGhpcyBkYXRhIHNldCBpcyBtYXBwZWQgdG8gaW4gUGxhc21vREI8L2gzPlxuICAgICAgICAgIDx1bD57b3JnYW5pc21zLnNwbGl0KC8sXFxzKi8pLm1hcCh0aGlzLl9yZW5kZXJPcmdhbmlzbSkudG9BcnJheSgpfTwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3JlbmRlck9yZ2FuaXNtKG9yZ2FuaXNtLCBpbmRleCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGxpIGtleT17aW5kZXh9PjxpPntvcmdhbmlzbX08L2k+PC9saT5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgU2VhcmNoZXMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyKCkge1xuICAgICAgdmFyIGxpbmtzID0gdGhpcy5wcm9wcy5saW5rcztcbiAgICAgIHZhciBzZWFyY2hlcyA9IHRoaXMucHJvcHMuc2VhcmNoZXMuZ2V0KCdyb3dzJykuZmlsdGVyKHRoaXMuX3Jvd0lzUXVlc3Rpb24pO1xuXG4gICAgICBpZiAoc2VhcmNoZXMuc2l6ZSA9PT0gMCAmJiBsaW5rcy5nZXQoJ3Jvd3MnKS5zaXplID09PSAwKSByZXR1cm4gbnVsbDtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aDM+U2VhcmNoIG9yIHZpZXcgdGhpcyBkYXRhIHNldCBpbiBQbGFzbW9EQjwvaDM+XG4gICAgICAgICAgPHVsPlxuICAgICAgICAgICAge3NlYXJjaGVzLm1hcCh0aGlzLl9yZW5kZXJTZWFyY2gpLnRvQXJyYXkoKX1cbiAgICAgICAgICAgIHtsaW5rcy5nZXQoJ3Jvd3MnKS5tYXAodGhpcy5fcmVuZGVyTGluaykudG9BcnJheSgpfVxuICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3Jvd0lzUXVlc3Rpb24ocm93KSB7XG4gICAgICB2YXIgdHlwZSA9IHJvdy5maW5kKGF0dHIgPT4gYXR0ci5nZXQoJ25hbWUnKSA9PSAndGFyZ2V0X3R5cGUnKTtcbiAgICAgIHJldHVybiB0eXBlICYmIHR5cGUuZ2V0KCd2YWx1ZScpID09ICdxdWVzdGlvbic7XG4gICAgfSxcblxuICAgIF9yZW5kZXJTZWFyY2goc2VhcmNoLCBpbmRleCkge1xuICAgICAgdmFyIG5hbWUgPSBzZWFyY2guZmluZChhdHRyID0+IGF0dHIuZ2V0KCduYW1lJykgPT0gJ3RhcmdldF9uYW1lJykuZ2V0KCd2YWx1ZScpO1xuICAgICAgdmFyIHF1ZXN0aW9uID0gdGhpcy5wcm9wcy5xdWVzdGlvbnMuZmluZChxID0+IHEuZ2V0KCduYW1lJykgPT09IG5hbWUpO1xuXG4gICAgICBpZiAocXVlc3Rpb24gPT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIHZhciByZWNvcmRDbGFzcyA9IHRoaXMucHJvcHMucmVjb3JkQ2xhc3Nlcy5maW5kKHIgPT4gci5nZXQoJ2Z1bGxOYW1lJykgPT09IHF1ZXN0aW9uLmdldCgnY2xhc3MnKSk7XG4gICAgICB2YXIgc2VhcmNoTmFtZSA9IGBJZGVudGlmeSAke3JlY29yZENsYXNzLmdldCgnZGlzcGxheU5hbWVQbHVyYWwnKX0gYnkgJHtxdWVzdGlvbi5nZXQoJ2Rpc3BsYXlOYW1lJyl9YDtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaSBrZXk9e2luZGV4fT5cbiAgICAgICAgICA8YSBocmVmPXsnL2Evc2hvd1F1ZXN0aW9uLmRvP3F1ZXN0aW9uRnVsbE5hbWU9JyArIG5hbWV9PntzZWFyY2hOYW1lfTwvYT5cbiAgICAgICAgPC9saT5cbiAgICAgICk7XG4gICAgfSxcblxuICAgIF9yZW5kZXJMaW5rKGxpbmssIGluZGV4KSB7XG4gICAgICB2YXIgaHlwZXJMaW5rID0gbGluay5maW5kKGF0dHIgPT4gYXR0ci5nZXQoJ25hbWUnKSA9PSAnaHlwZXJfbGluaycpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGxpIGtleT17aW5kZXh9Pntmb3JtYXRMaW5rKGh5cGVyTGluay5nZXQoJ3ZhbHVlJykpfTwvbGk+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIExpbmtzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IGxpbmtzIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgICBpZiAobGlua3MuZ2V0KCdyb3dzJykuc2l6ZSA9PT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGgzPkV4dGVybmFsIExpbmtzPC9oMz5cbiAgICAgICAgICA8dWw+IHtsaW5rcy5nZXQoJ3Jvd3MnKS5tYXAodGhpcy5fcmVuZGVyTGluaykudG9BcnJheSgpfSA8L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSxcblxuICAgIF9yZW5kZXJMaW5rKGxpbmssIGluZGV4KSB7XG4gICAgICB2YXIgaHlwZXJMaW5rID0gbGluay5maW5kKGF0dHIgPT4gYXR0ci5nZXQoJ25hbWUnKSA9PSAnaHlwZXJfbGluaycpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGxpIGtleT17aW5kZXh9Pntmb3JtYXRMaW5rKGh5cGVyTGluay5nZXQoJ3ZhbHVlJykpfTwvbGk+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIENvbnRhY3RzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IGNvbnRhY3RzIH0gPSB0aGlzLnByb3BzO1xuICAgICAgaWYgKGNvbnRhY3RzLmdldCgncm93cycpLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aDQ+Q29udGFjdHM8L2g0PlxuICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgIHtjb250YWN0cy5nZXQoJ3Jvd3MnKS5tYXAodGhpcy5fcmVuZGVyQ29udGFjdCkudG9BcnJheSgpfVxuICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3JlbmRlckNvbnRhY3QoY29udGFjdCwgaW5kZXgpIHtcbiAgICAgIHZhciBjb250YWN0X25hbWUgPSBjb250YWN0LmZpbmQoYyA9PiBjLmdldCgnbmFtZScpID09ICdjb250YWN0X25hbWUnKTtcbiAgICAgIHZhciBhZmZpbGlhdGlvbiA9IGNvbnRhY3QuZmluZChjID0+IGMuZ2V0KCduYW1lJykgPT0gJ2FmZmlsaWF0aW9uJyk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGkga2V5PXtpbmRleH0+e2NvbnRhY3RfbmFtZS5nZXQoJ3ZhbHVlJyl9LCB7YWZmaWxpYXRpb24uZ2V0KCd2YWx1ZScpfTwvbGk+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIFB1YmxpY2F0aW9ucyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyBwdWJsaWNhdGlvbnMgfSA9IHRoaXMucHJvcHM7XG4gICAgICB2YXIgcm93cyA9IHB1YmxpY2F0aW9ucy5nZXQoJ3Jvd3MnKTtcbiAgICAgIGlmIChyb3dzLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aDQ+UHVibGljYXRpb25zPC9oND5cbiAgICAgICAgICA8dWw+e3Jvd3MubWFwKHRoaXMuX3JlbmRlclB1YmxpY2F0aW9uKS50b0FycmF5KCl9PC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyUHVibGljYXRpb24ocHVibGljYXRpb24sIGluZGV4KSB7XG4gICAgICB2YXIgcHVibWVkX2xpbmsgPSBwdWJsaWNhdGlvbi5maW5kKHAgPT4gcC5nZXQoJ25hbWUnKSA9PSAncHVibWVkX2xpbmsnKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaSBrZXk9e2luZGV4fT57Zm9ybWF0TGluayhwdWJtZWRfbGluay5nZXQoJ3ZhbHVlJykpfTwvbGk+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIENvbnRhY3RzQW5kUHVibGljYXRpb25zID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IGNvbnRhY3RzLCBwdWJsaWNhdGlvbnMgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgIGlmIChjb250YWN0cy5nZXQoJ3Jvd3MnKS5zaXplID09PSAwICYmIHB1YmxpY2F0aW9ucy5nZXQoJ3Jvd3MnKS5zaXplID09PSAwKSByZXR1cm4gbnVsbDtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aDM+QWRkaXRpb25hbCBDb250YWN0cyBhbmQgUHVibGljYXRpb25zPC9oMz5cbiAgICAgICAgICA8Q29udGFjdHMgY29udGFjdHM9e2NvbnRhY3RzfS8+XG4gICAgICAgICAgPFB1YmxpY2F0aW9ucyBwdWJsaWNhdGlvbnM9e3B1YmxpY2F0aW9uc30vPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgUmVsZWFzZUhpc3RvcnkgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyKCkge1xuICAgICAgdmFyIHsgaGlzdG9yeSB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGlmIChoaXN0b3J5LmdldCgncm93cycpLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aDM+RGF0YSBTZXQgUmVsZWFzZSBIaXN0b3J5PC9oMz5cbiAgICAgICAgICA8dGFibGU+XG4gICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICA8dGg+RXVQYXRoREIgUmVsZWFzZTwvdGg+XG4gICAgICAgICAgICAgICAgPHRoPkdlbm9tZSBTb3VyY2U8L3RoPlxuICAgICAgICAgICAgICAgIDx0aD5Bbm5vdGF0aW9uIFNvdXJjZTwvdGg+XG4gICAgICAgICAgICAgICAgPHRoPk5vdGVzPC90aD5cbiAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgIHtoaXN0b3J5LmdldCgncm93cycpLm1hcCh0aGlzLl9yZW5kZXJSb3cpLnRvQXJyYXkoKX1cbiAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyUm93KGF0dHJpYnV0ZXMpIHtcbiAgICAgIHZhciBhdHRycyA9IF8uaW5kZXhCeShhdHRyaWJ1dGVzLnRvSlMoKSwgJ25hbWUnKTtcblxuICAgICAgdmFyIHJlbGVhc2UgPSBhdHRycy5idWlsZC52YWx1ZSA/ICdSZWxlYXNlICcgKyBhdHRycy5idWlsZC52YWx1ZVxuICAgICAgICA6ICdJbml0aWFsIHJlbGVhc2UnO1xuXG4gICAgICB2YXIgcmVsZWFzZURhdGUgPSBuZXcgRGF0ZShhdHRycy5yZWxlYXNlX2RhdGUudmFsdWUpXG4gICAgICAgIC50b0RhdGVTdHJpbmcoKVxuICAgICAgICAuc3BsaXQoJyAnKVxuICAgICAgICAuc2xpY2UoMSlcbiAgICAgICAgLmpvaW4oJyAnKTtcblxuICAgICAgdmFyIGdlbm9tZVNvdXJjZSA9IGF0dHJzLmdlbm9tZV9zb3VyY2UudmFsdWVcbiAgICAgICAgPyBhdHRycy5nZW5vbWVfc291cmNlLnZhbHVlICsgJyAoJyArIGF0dHJzLmdlbm9tZV92ZXJzaW9uLnZhbHVlICsgJyknXG4gICAgICAgIDogJyc7XG5cbiAgICAgIHZhciBhbm5vdGF0aW9uU291cmNlID0gYXR0cnMuYW5ub3RhdGlvbl9zb3VyY2UudmFsdWVcbiAgICAgICAgPyBhdHRycy5hbm5vdGF0aW9uX3NvdXJjZS52YWx1ZSArICcgKCcgKyBhdHRycy5hbm5vdGF0aW9uX3ZlcnNpb24udmFsdWUgKyAnKSdcbiAgICAgICAgOiAnJztcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0ZD57cmVsZWFzZX0gKHtyZWxlYXNlRGF0ZX0sIHthdHRycy5wcm9qZWN0LnZhbHVlfSB7YXR0cnMucmVsZWFzZV9udW1iZXIudmFsdWV9KTwvdGQ+XG4gICAgICAgICAgPHRkPntnZW5vbWVTb3VyY2V9PC90ZD5cbiAgICAgICAgICA8dGQ+e2Fubm90YXRpb25Tb3VyY2V9PC90ZD5cbiAgICAgICAgICA8dGQ+e2F0dHJzLm5vdGUudmFsdWV9PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgVmVyc2lvbnMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyKCkge1xuICAgICAgdmFyIHsgdmVyc2lvbnMgfSA9IHRoaXMucHJvcHM7XG4gICAgICB2YXIgcm93cyA9IHZlcnNpb25zLmdldCgncm93cycpO1xuXG4gICAgICBpZiAocm93cy5zaXplID09PSAwKSByZXR1cm4gbnVsbDtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aDM+VmVyc2lvbjwvaDM+XG4gICAgICAgICAgPHA+XG4gICAgICAgICAgICBUaGUgZGF0YSBzZXQgdmVyc2lvbiBzaG93biBoZXJlIGlzIHRoZSBkYXRhIHByb3ZpZGVyJ3MgdmVyc2lvblxuICAgICAgICAgICAgbnVtYmVyIG9yIHB1YmxpY2F0aW9uIGRhdGUgaW5kaWNhdGVkIG9uIHRoZSBzaXRlIGZyb20gd2hpY2ggd2VcbiAgICAgICAgICAgIGRvd25sb2FkZWQgdGhlIGRhdGEuIEluIHRoZSByYXJlIGNhc2UgdGhhdCB0aGVzZSBhcmUgbm90IGF2YWlsYWJsZSxcbiAgICAgICAgICAgIHRoZSB2ZXJzaW9uIGlzIHRoZSBkYXRlIHRoYXQgdGhlIGRhdGEgc2V0IHdhcyBkb3dubG9hZGVkLlxuICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8dGFibGU+XG4gICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICA8dGg+T3JnYW5pc208L3RoPlxuICAgICAgICAgICAgICAgIDx0aD5Qcm92aWRlcidzIFZlcnNpb248L3RoPlxuICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAge3Jvd3MubWFwKHRoaXMuX3JlbmRlclJvdykudG9BcnJheSgpfVxuICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSxcblxuICAgIF9yZW5kZXJSb3coYXR0cmlidXRlcykge1xuICAgICAgdmFyIGF0dHJzID0gXy5pbmRleEJ5KGF0dHJpYnV0ZXMudG9KUygpLCAnbmFtZScpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0ZD57YXR0cnMub3JnYW5pc20udmFsdWV9PC90ZD5cbiAgICAgICAgICA8dGQ+e2F0dHJzLnZlcnNpb24udmFsdWV9PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgR3JhcGhzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IGdyYXBocyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIHZhciByb3dzID0gZ3JhcGhzLmdldCgncm93cycpO1xuICAgICAgaWYgKHJvd3Muc2l6ZSA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoMz5FeGFtcGxlIEdyYXBoczwvaDM+XG4gICAgICAgICAgPHVsPntyb3dzLm1hcCh0aGlzLl9yZW5kZXJHcmFwaCkudG9BcnJheSgpfTwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3JlbmRlckdyYXBoKGdyYXBoLCBpbmRleCkge1xuICAgICAgdmFyIGcgPSBfLmluZGV4QnkoZ3JhcGgudG9KUygpLCAnbmFtZScpO1xuICAgICAgdmFyIHVybCA9ICcvY2dpLWJpbi9kYXRhUGxvdHRlci5wbCcgK1xuICAgICAgICAnP3R5cGU9JyArIGcubW9kdWxlLnZhbHVlICtcbiAgICAgICAgJyZwcm9qZWN0X2lkPScgKyBnLnByb2plY3RfaWQudmFsdWUgK1xuICAgICAgICAnJmRhdGFzZXQ9JyArIGcuZGF0YXNldF9uYW1lLnZhbHVlICtcbiAgICAgICAgJyZ0ZW1wbGF0ZT0xJmZtdD1wbmcmaWQ9JyArIGcuZ3JhcGhfaWRzLnZhbHVlO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGxpIGtleT17aW5kZXh9PjxpbWcgc3JjPXt1cmx9Lz48L2xpPlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBEYXRhc2V0UmVjb3JkID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IHJlY29yZCwgcXVlc3Rpb25zLCByZWNvcmRDbGFzc2VzIH0gPSB0aGlzLnByb3BzO1xuICAgICAgdmFyIGF0dHJpYnV0ZXMgPSByZWNvcmQuZ2V0KCdhdHRyaWJ1dGVzJyk7XG4gICAgICB2YXIgdGFibGVzID0gcmVjb3JkLmdldCgndGFibGVzJyk7XG4gICAgICB2YXIgdGl0bGVDbGFzcyA9ICdldXBhdGhkYi1EYXRhc2V0UmVjb3JkLXRpdGxlJztcblxuICAgICAgdmFyIGlkID0gcmVjb3JkLmdldCgnaWQnKTtcbiAgICAgIHZhciBzdW1tYXJ5ID0gYXR0cmlidXRlcy5nZXRJbihbJ3N1bW1hcnknLCAndmFsdWUnXSk7XG4gICAgICB2YXIgcmVsZWFzZUluZm8gPSBhdHRyaWJ1dGVzLmdldEluKFsnYnVpbGRfbnVtYmVyX2ludHJvZHVjZWQnLCAndmFsdWUnXSk7XG4gICAgICB2YXIgcHJpbWFyeVB1YmxpY2F0aW9uID0gdGFibGVzLmdldEluKFsnUHVibGljYXRpb25zJywgJ3Jvd3MnLCAwXSk7XG4gICAgICB2YXIgY29udGFjdCA9IGF0dHJpYnV0ZXMuZ2V0SW4oWydjb250YWN0JywgJ3ZhbHVlJ10pO1xuICAgICAgdmFyIGluc3RpdHV0aW9uID0gYXR0cmlidXRlcy5nZXRJbihbJ2luc3RpdHV0aW9uJywgJ3ZhbHVlJ10pO1xuICAgICAgdmFyIHZlcnNpb24gPSBhdHRyaWJ1dGVzLmdldEluKFsnVmVyc2lvbicsICdyb3dzJywgMF0pO1xuICAgICAgdmFyIG9yZ2FuaXNtcyA9IGF0dHJpYnV0ZXMuZ2V0SW4oWydvcmdhbmlzbXMnLCAndmFsdWUnXSk7XG4gICAgICB2YXIgUmVmZXJlbmNlcyA9IHRhYmxlcy5nZXQoJ1JlZmVyZW5jZXMnKTtcbiAgICAgIHZhciBIeXBlckxpbmtzID0gdGFibGVzLmdldCgnSHlwZXJMaW5rcycpO1xuICAgICAgdmFyIENvbnRhY3RzID0gdGFibGVzLmdldCgnQ29udGFjdHMnKTtcbiAgICAgIHZhciBQdWJsaWNhdGlvbnMgPSB0YWJsZXMuZ2V0KCdQdWJsaWNhdGlvbnMnKTtcbiAgICAgIHZhciBkZXNjcmlwdGlvbiA9IGF0dHJpYnV0ZXMuZ2V0SW4oWydkZXNjcmlwdGlvbicsICd2YWx1ZSddKTtcbiAgICAgIHZhciBHZW5vbWVIaXN0b3J5ID0gdGFibGVzLmdldCgnR2Vub21lSGlzdG9yeScpO1xuICAgICAgdmFyIFZlcnNpb24gPSB0YWJsZXMuZ2V0KCdWZXJzaW9uJyk7XG4gICAgICB2YXIgRXhhbXBsZUdyYXBocyA9IHRhYmxlcy5nZXQoJ0V4YW1wbGVHcmFwaHMnKTtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJldXBhdGhkYi1EYXRhc2V0UmVjb3JkXCI+XG4gICAgICAgICAgPGgxIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7XG4gICAgICAgICAgICBfX2h0bWw6ICdEYXRhIFNldDogPHNwYW4gY2xhc3M9XCInICsgdGl0bGVDbGFzcyArICdcIj4nICsgaWQgKyAnPC9zcGFuPidcbiAgICAgICAgICB9fS8+XG5cbiAgICAgICAgICA8aHIvPlxuXG4gICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cImV1cGF0aGRiLURhdGFzZXRSZWNvcmQtaGVhZGVyVGFibGVcIj5cbiAgICAgICAgICAgIDx0Ym9keT5cblxuICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgPHRoPlN1bW1hcnk6PC90aD5cbiAgICAgICAgICAgICAgICA8dGQgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IHN1bW1hcnl9fS8+XG4gICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgIHtwcmltYXJ5UHVibGljYXRpb24gPyAoXG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgPHRoPlByaW1hcnkgcHVibGljYXRpb246PC90aD5cbiAgICAgICAgICAgICAgICAgIDx0ZD57cmVuZGVyUHJpbWFyeVB1YmxpY2F0aW9uKHByaW1hcnlQdWJsaWNhdGlvbil9PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgICAgICB7Y29udGFjdCAmJiBpbnN0aXR1dGlvbiA/IChcbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICA8dGg+UHJpbWFyeSBjb250YWN0OjwvdGg+XG4gICAgICAgICAgICAgICAgICA8dGQ+e3JlbmRlclByaW1hcnlDb250YWN0KGNvbnRhY3QsIGluc3RpdHV0aW9uKX08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAgICAgIHt2ZXJzaW9uID8gKFxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgIDx0aD5Tb3VyY2UgdmVyc2lvbjo8L3RoPlxuICAgICAgICAgICAgICAgICAgPHRkPntyZW5kZXJTb3VyY2VWZXJzaW9uKHZlcnNpb24pfTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICAgICAge3JlbGVhc2VJbmZvID8gKFxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgIDx0aD5FdVBhdGhEQiByZWxlYXNlOjwvdGg+XG4gICAgICAgICAgICAgICAgICA8dGQ+e3JlbGVhc2VJbmZvfTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgPC90YWJsZT5cblxuICAgICAgICAgIDxoci8+XG5cbiAgICAgICAgICA8T3JnYW5pc21zIG9yZ2FuaXNtcz17b3JnYW5pc21zfS8+XG5cbiAgICAgICAgICA8U2VhcmNoZXMgc2VhcmNoZXM9e1JlZmVyZW5jZXN9IGxpbmtzPXtIeXBlckxpbmtzfSBxdWVzdGlvbnM9e3F1ZXN0aW9uc30gcmVjb3JkQ2xhc3Nlcz17cmVjb3JkQ2xhc3Nlc30vPlxuXG4gICAgICAgICAgPExpbmtzIGxpbmtzPXtIeXBlckxpbmtzfS8+XG5cbiAgICAgICAgICA8aDM+RGV0YWlsZWQgRGVzY3JpcHRpb248L2gzPlxuICAgICAgICAgIDxkaXYgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IGRlc2NyaXB0aW9ufX0vPlxuXG4gICAgICAgICAgPENvbnRhY3RzQW5kUHVibGljYXRpb25zIGNvbnRhY3RzPXtDb250YWN0c30gcHVibGljYXRpb25zPXtQdWJsaWNhdGlvbnN9Lz5cblxuICAgICAgICAgIDxSZWxlYXNlSGlzdG9yeSBoaXN0b3J5PXtHZW5vbWVIaXN0b3J5fS8+XG5cbiAgICAgICAgICA8VmVyc2lvbnMgdmVyc2lvbnM9e1ZlcnNpb259Lz5cblxuICAgICAgICAgIDxHcmFwaHMgZ3JhcGhzPXtFeGFtcGxlR3JhcGhzfS8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBUb29sdGlwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgdmFyIHRleHQgPSBgPGRpdiBzdHlsZT1cIm1heC1oZWlnaHQ6IDIwMHB4OyBvdmVyZmxvdy15OiBhdXRvOyBwYWRkaW5nOiAycHg7XCI+JHt0aGlzLnByb3BzLnRleHR9PC9kaXY+YDtcbiAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLndka1Rvb2x0aXAoe1xuICAgICAgICBjb250ZW50OiB7IHRleHQgfSxcbiAgICAgICAgcG9zaXRpb246IHsgdmlld3BvcnQ6IGZhbHNlIH0sXG4gICAgICAgIHNob3c6IHsgZGVsYXk6IDEwMDAgfVxuICAgICAgfSk7XG4gICAgfSxcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLnF0aXAoJ2Rlc3Ryb3knLCB0cnVlKTtcbiAgICB9LFxuICAgIHJlbmRlcigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAge3RoaXMucHJvcHMuY2hpbGRyZW59XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGRhdGFzZXRDZWxsUmVuZGVyZXIoYXR0cmlidXRlLCBhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVzLCBpbmRleCwgY29sdW1uRGF0YSwgd2lkdGgsIGRlZmF1bHRSZW5kZXJlcikge1xuICAgIGlmIChhdHRyaWJ1dGUuZ2V0KCduYW1lJykgPT09ICdwcmltYXJ5X2tleScpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxUb29sdGlwIHRleHQ9e2F0dHJpYnV0ZXMuZ2V0KCdkZXNjcmlwdGlvbicpLmdldCgndmFsdWUnKX0+XG4gICAgICAgICAge2RlZmF1bHRSZW5kZXJlcihhdHRyaWJ1dGUsIGF0dHJpYnV0ZU5hbWUsIGF0dHJpYnV0ZXMsIGluZGV4LCBjb2x1bW5EYXRhLCB3aWR0aCl9XG4gICAgICAgIDwvVG9vbHRpcD5cbiAgICAgICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIGRlZmF1bHRSZW5kZXJlcihhdHRyaWJ1dGUsIGF0dHJpYnV0ZU5hbWUsIGF0dHJpYnV0ZXMsIGluZGV4LCBjb2x1bW5EYXRhLCB3aWR0aCk7XG4gICAgfVxuICB9XG5cbiAgbnMuRGF0YXNldFJlY29yZCA9IERhdGFzZXRSZWNvcmQ7XG4gIG5zLmRhdGFzZXRDZWxsUmVuZGVyZXIgPSBkYXRhc2V0Q2VsbFJlbmRlcmVyO1xufSk7XG4iXX0=
