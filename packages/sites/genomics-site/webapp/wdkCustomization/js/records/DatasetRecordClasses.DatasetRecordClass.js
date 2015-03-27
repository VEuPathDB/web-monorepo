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
          React.createElement("h2", null, "Organisms this data set is mapped to in PlasmoDB"), 
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
          React.createElement("h2", null, "Search or view this data set in PlasmoDB"), 
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
          React.createElement("h2", null, "External Links"), 
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
          React.createElement("h2", null, "Additional Contacts and Publications"), 
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
          React.createElement("h2", null, "Data Set Release History"), 
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
          React.createElement("h2", null, "Version"), 
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
          React.createElement("h2", null, "Example Graphs"), 
          React.createElement("ul", null, rows.map(this._renderGraph).toArray())
        )
      );
    },

    _renderGraph:function(graph, index) {
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
        React.createElement("li", {key: index}, 
          React.createElement("h3", null, displayName), 
          React.createElement("div", {className: "eupathdb-DatasetRecord-GraphMeta"}, 
            React.createElement("h3", null, "Description"), 
            React.createElement("p", {dangerouslySetInnerHTML: {__html: g.description.value}}), 
            React.createElement("h3", null, "X-axis"), 
            React.createElement("p", null, g.x_axis.value), 
            React.createElement("h3", null, "Y-axis"), 
            React.createElement("p", null, g.y_axis.value)
          ), 
          React.createElement("div", {className: "eupathdb-DatasetRecord-GraphData"}, 
            React.createElement("img", {className: "eupathdb-DatasetRecord-GraphImg", src: imgUrl})
          )
        )
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
        React.createElement("div", {className: "eupathdb-DatasetRecord ui-helper-clearfix"}, 
          React.createElement("h1", {dangerouslySetInnerHTML: {
            __html: 'Data Set: <span class="' + titleClass + '">' + id + '</span>'
          }}), 

          React.createElement("div", {className: "eupathdb-DatasetRecord-Container ui-helper-clearfix"}, 

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

            React.createElement("div", {className: "eupathdb-DatasetRecord-Main"}, 
              React.createElement("h2", null, "Detailed Description"), 
              React.createElement("div", {dangerouslySetInnerHTML: {__html: description}}), 
              React.createElement(ContactsAndPublications, {contacts: Contacts, publications: Publications})
            ), 

            React.createElement("div", {className: "eupathdb-DatasetRecord-Sidebar"}, 
              React.createElement(Organisms, {organisms: organisms}), 
              React.createElement(Searches, {searches: References, links: HyperLinks, questions: questions, recordClasses: recordClasses}), 
              React.createElement(Links, {links: HyperLinks}), 
              React.createElement(ReleaseHistory, {history: GenomeHistory}), 
              React.createElement(Versions, {versions: Version})
            )

          ), 
          React.createElement(Graphs, {graphs: ExampleGraphs})
        )
      );
    }
  });

  var Tooltip = React.createClass({displayName: "Tooltip",
    componentDidMount:function() {
      this._setupTooltip();
    },
    componentDidUpdate:function() {
      this._destroyTooltip();
      this._setupTooltip();
    },
    componentWillUnmount:function() {
      this._destroyTooltip();
    },
    _setupTooltip:function() {
      if (this.props.text == null) return;

      var text = ("<div style=\"max-height: 200px; overflow-y: auto; padding: 2px;\">" + this.props.text + "</div>");
      var width = this.props.width;

      this.$target = $(this.getDOMNode()).find('.wdk-RecordTable-recordLink')
        .wdkTooltip({
          overwrite: true,
          content: { text:text },
          show: { delay: 1000 },
          position: { my: 'top left', at: 'bottom left', adjust: { y: 12 } }
        });
    },
    _destroyTooltip:function() {
      // if _setupTooltip doesn't do anything, this is a noop
      if (this.$target) {
        this.$target.qtip('destroy', true);
      }
    },
    render:function() {
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
        React.createElement(Tooltip, {
          text: attributes.get('description').get('value'), 
          width: width
        }, reactElement)
      );
    }
    else {
      return reactElement;
    }
  }

  ns.DatasetRecord = DatasetRecord;
  ns.datasetCellRenderer = datasetCellRenderer;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWQuanMiLCJzb3VyY2VzIjpbbnVsbF0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHdCQUF3QjtBQUN4Qiw4Q0FBOEM7O0FBRTlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsR0FBRzs7QUFFSCxHQUFHLENBQUMsU0FBUyxDQUFDLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUM7QUFDaEQsRUFBRSxZQUFZLENBQUM7O0FBRWYsRUFBRSxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO0FBQ3hCOztFQUVFLElBQUksVUFBVSxHQUFHLFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUNoRCxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNsQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUNqQyxJQUFJLEtBQUssR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDMUQsT0FBTyxLQUFLLEtBQUssb0JBQUEsR0FBRSxFQUFBLENBQUEsQ0FBQyxNQUFBLEVBQU0sQ0FBRSxTQUFTLEdBQUcsUUFBUSxHQUFHLE9BQU8sRUFBQyxDQUFDLElBQUEsRUFBSSxDQUFFLEtBQUssQ0FBQyxDQUFDLENBQUcsQ0FBQSxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQU0sQ0FBQSxLQUFLLElBQUksQ0FBQztBQUN4RyxHQUFHLENBQUM7O0VBRUYsSUFBSSx3QkFBd0IsR0FBRyxTQUFTLHdCQUF3QixDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzdFLElBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztNQUMvQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksYUFBYSxDQUFDO0tBQ3pD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Q0FBQyxDQUFDO09BQ3BDO0tBQ0Y7QUFDTCxJQUFJLE1BQU0sU0FBQSxHQUFHLENBQUM7QUFDZDs7TUFFTSxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO01BQ3JELEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxJQUFJLHdDQUF3QyxDQUFDO0FBQ3hFLE1BQU0sT0FBTyxLQUFLLENBQUM7O0tBRWQ7QUFDTCxHQUFHLENBQUMsQ0FBQzs7RUFFSCxTQUFTLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxDQUFDO0FBQ2pILElBQUksSUFBSSxZQUFZLEdBQUcsZUFBZSxDQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7O0lBRW5HLElBQUksU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxhQUFhLEVBQUU7TUFDM0M7UUFDRSxvQkFBQyxPQUFPLEVBQUEsQ0FBQTtVQUNOLElBQUEsRUFBSSxDQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFDO1VBQ2pELEtBQUEsRUFBSyxDQUFFLEtBQU07UUFDZCxDQUFBLEVBQUMsWUFBdUIsQ0FBQTtRQUN6QjtLQUNIO1NBQ0k7TUFDSCxPQUFPLFlBQVksQ0FBQztLQUNyQjtBQUNMLEdBQUc7O0VBRUQsRUFBRSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7RUFDakMsRUFBRSxDQUFDLG1CQUFtQixHQUFHLG1CQUFtQixDQUFDO0NBQzlDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGdsb2JhbCBfLCBXZGssIHdkayAqL1xuLyoganNoaW50IGVzbmV4dDogdHJ1ZSwgZXFudWxsOiB0cnVlLCAtVzAxNCAqL1xuXG4vKipcbiAqIFRoaXMgZmlsZSBwcm92aWRlcyBhIGN1c3RvbSBSZWNvcmQgQ29tcG9uZW50IHdoaWNoIGlzIHVzZWQgYnkgdGhlIG5ldyBXZGtcbiAqIEZsdXggYXJjaGl0ZWN0dXJlLlxuICpcbiAqIFRoZSBzaWJsaW5nIGZpbGUgRGF0YXNldFJlY29yZENsYXNzZXMuRGF0YXNldFJlY29yZENsYXNzLmpzIGlzIGdlbmVyYXRlZFxuICogZnJvbSB0aGlzIGZpbGUgdXNpbmcgdGhlIGpzeCBjb21waWxlci4gRXZlbnR1YWxseSwgdGhpcyBmaWxlIHdpbGwgYmVcbiAqIGNvbXBpbGVkIGR1cmluZyBidWlsZCB0aW1lLS10aGlzIGlzIGEgc2hvcnQtdGVybSBzb2x1dGlvbi5cbiAqXG4gKiBgd2RrYCBpcyB0aGUgbGVnYWN5IGdsb2JhbCBvYmplY3QsIGFuZCBgV2RrYCBpcyB0aGUgbmV3IGdsb2JhbCBvYmplY3RcbiAqL1xuXG53ZGsubmFtZXNwYWNlKCdldXBhdGhkYi5yZWNvcmRzJywgZnVuY3Rpb24obnMpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIFJlYWN0ID0gV2RrLlJlYWN0O1xuXG4gIC8vIGZvcm1hdCBpcyB7dGV4dH0oe2xpbmt9KVxuICB2YXIgZm9ybWF0TGluayA9IGZ1bmN0aW9uIGZvcm1hdExpbmsobGluaywgb3B0cykge1xuICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuICAgIHZhciBuZXdXaW5kb3cgPSAhIW9wdHMubmV3V2luZG93O1xuICAgIHZhciBtYXRjaCA9IC8oLiopXFwoKC4qKVxcKS8uZXhlYyhsaW5rLnJlcGxhY2UoL1xcbi9nLCAnICcpKTtcbiAgICByZXR1cm4gbWF0Y2ggPyAoIDxhIHRhcmdldD17bmV3V2luZG93ID8gJ19ibGFuaycgOiAnX3NlbGYnfSBocmVmPXttYXRjaFsyXX0+e21hdGNoWzFdfTwvYT4gKSA6IG51bGw7XG4gIH07XG5cbiAgdmFyIHJlbmRlclByaW1hcnlQdWJsaWNhdGlvbiA9IGZ1bmN0aW9uIHJlbmRlclByaW1hcnlQdWJsaWNhdGlvbihwdWJsaWNhdGlvbikge1xuICAgIHZhciBwdWJtZWRMaW5rID0gcHVibGljYXRpb24uZmluZChmdW5jdGlvbihwdWIpIHtcbiAgICAgIHJldHVybiBwdWIuZ2V0KCduYW1lJykgPT0gJ3B1Ym1lZF9saW5rJztcbiAgICB9KTtcbiAgICByZXR1cm4gZm9ybWF0TGluayhwdWJtZWRMaW5rLmdldCgndmFsdWUnKSwgeyBuZXdXaW5kb3c6IHRydWUgfSk7XG4gIH07XG5cbiAgdmFyIHJlbmRlclByaW1hcnlDb250YWN0ID0gZnVuY3Rpb24gcmVuZGVyUHJpbWFyeUNvbnRhY3QoY29udGFjdCwgaW5zdGl0dXRpb24pIHtcbiAgICByZXR1cm4gY29udGFjdCArICcsICcgKyBpbnN0aXR1dGlvbjtcbiAgfTtcblxuICB2YXIgcmVuZGVyU291cmNlVmVyc2lvbiA9IGZ1bmN0aW9uKHZlcnNpb24pIHtcbiAgICB2YXIgbmFtZSA9IHZlcnNpb24uZmluZCh2ID0+IHYuZ2V0KCduYW1lJykgPT09ICd2ZXJzaW9uJyk7XG4gICAgcmV0dXJuIChcbiAgICAgIG5hbWUuZ2V0KCd2YWx1ZScpICsgJyAoVGhlIGRhdGEgcHJvdmlkZXJcXCdzIHZlcnNpb24gbnVtYmVyIG9yIHB1YmxpY2F0aW9uIGRhdGUsIGZyb20nICtcbiAgICAgICcgdGhlIHNpdGUgdGhlIGRhdGEgd2FzIGFjcXVpcmVkLiBJbiB0aGUgcmFyZSBjYXNlIG5laXRoZXIgaXMgYXZhaWxhYmxlLCcgK1xuICAgICAgJyB0aGUgZG93bmxvYWQgZGF0ZS4pJ1xuICAgICk7XG4gIH07XG5cbiAgdmFyIE9yZ2FuaXNtcyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyBvcmdhbmlzbXMgfSA9IHRoaXMucHJvcHM7XG4gICAgICBpZiAoIW9yZ2FuaXNtcykgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoMj5PcmdhbmlzbXMgdGhpcyBkYXRhIHNldCBpcyBtYXBwZWQgdG8gaW4gUGxhc21vREI8L2gyPlxuICAgICAgICAgIDx1bD57b3JnYW5pc21zLnNwbGl0KC8sXFxzKi8pLm1hcCh0aGlzLl9yZW5kZXJPcmdhbmlzbSkudG9BcnJheSgpfTwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3JlbmRlck9yZ2FuaXNtKG9yZ2FuaXNtLCBpbmRleCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGxpIGtleT17aW5kZXh9PjxpPntvcmdhbmlzbX08L2k+PC9saT5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgU2VhcmNoZXMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyKCkge1xuICAgICAgdmFyIGxpbmtzID0gdGhpcy5wcm9wcy5saW5rcztcbiAgICAgIHZhciBzZWFyY2hlcyA9IHRoaXMucHJvcHMuc2VhcmNoZXMuZ2V0KCdyb3dzJykuZmlsdGVyKHRoaXMuX3Jvd0lzUXVlc3Rpb24pO1xuXG4gICAgICBpZiAoc2VhcmNoZXMuc2l6ZSA9PT0gMCAmJiBsaW5rcy5nZXQoJ3Jvd3MnKS5zaXplID09PSAwKSByZXR1cm4gbnVsbDtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aDI+U2VhcmNoIG9yIHZpZXcgdGhpcyBkYXRhIHNldCBpbiBQbGFzbW9EQjwvaDI+XG4gICAgICAgICAgPHVsPlxuICAgICAgICAgICAge3NlYXJjaGVzLm1hcCh0aGlzLl9yZW5kZXJTZWFyY2gpLnRvQXJyYXkoKX1cbiAgICAgICAgICAgIHtsaW5rcy5nZXQoJ3Jvd3MnKS5tYXAodGhpcy5fcmVuZGVyTGluaykudG9BcnJheSgpfVxuICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3Jvd0lzUXVlc3Rpb24ocm93KSB7XG4gICAgICB2YXIgdHlwZSA9IHJvdy5maW5kKGF0dHIgPT4gYXR0ci5nZXQoJ25hbWUnKSA9PSAndGFyZ2V0X3R5cGUnKTtcbiAgICAgIHJldHVybiB0eXBlICYmIHR5cGUuZ2V0KCd2YWx1ZScpID09ICdxdWVzdGlvbic7XG4gICAgfSxcblxuICAgIF9yZW5kZXJTZWFyY2goc2VhcmNoLCBpbmRleCkge1xuICAgICAgdmFyIG5hbWUgPSBzZWFyY2guZmluZChhdHRyID0+IGF0dHIuZ2V0KCduYW1lJykgPT0gJ3RhcmdldF9uYW1lJykuZ2V0KCd2YWx1ZScpO1xuICAgICAgdmFyIHF1ZXN0aW9uID0gdGhpcy5wcm9wcy5xdWVzdGlvbnMuZmluZChxID0+IHEuZ2V0KCduYW1lJykgPT09IG5hbWUpO1xuXG4gICAgICBpZiAocXVlc3Rpb24gPT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIHZhciByZWNvcmRDbGFzcyA9IHRoaXMucHJvcHMucmVjb3JkQ2xhc3Nlcy5maW5kKHIgPT4gci5nZXQoJ2Z1bGxOYW1lJykgPT09IHF1ZXN0aW9uLmdldCgnY2xhc3MnKSk7XG4gICAgICB2YXIgc2VhcmNoTmFtZSA9IGBJZGVudGlmeSAke3JlY29yZENsYXNzLmdldCgnZGlzcGxheU5hbWVQbHVyYWwnKX0gYnkgJHtxdWVzdGlvbi5nZXQoJ2Rpc3BsYXlOYW1lJyl9YDtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaSBrZXk9e2luZGV4fT5cbiAgICAgICAgICA8YSBocmVmPXsnL2Evc2hvd1F1ZXN0aW9uLmRvP3F1ZXN0aW9uRnVsbE5hbWU9JyArIG5hbWV9PntzZWFyY2hOYW1lfTwvYT5cbiAgICAgICAgPC9saT5cbiAgICAgICk7XG4gICAgfSxcblxuICAgIF9yZW5kZXJMaW5rKGxpbmssIGluZGV4KSB7XG4gICAgICB2YXIgaHlwZXJMaW5rID0gbGluay5maW5kKGF0dHIgPT4gYXR0ci5nZXQoJ25hbWUnKSA9PSAnaHlwZXJfbGluaycpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGxpIGtleT17aW5kZXh9Pntmb3JtYXRMaW5rKGh5cGVyTGluay5nZXQoJ3ZhbHVlJykpfTwvbGk+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIExpbmtzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IGxpbmtzIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgICBpZiAobGlua3MuZ2V0KCdyb3dzJykuc2l6ZSA9PT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGgyPkV4dGVybmFsIExpbmtzPC9oMj5cbiAgICAgICAgICA8dWw+IHtsaW5rcy5nZXQoJ3Jvd3MnKS5tYXAodGhpcy5fcmVuZGVyTGluaykudG9BcnJheSgpfSA8L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSxcblxuICAgIF9yZW5kZXJMaW5rKGxpbmssIGluZGV4KSB7XG4gICAgICB2YXIgaHlwZXJMaW5rID0gbGluay5maW5kKGF0dHIgPT4gYXR0ci5nZXQoJ25hbWUnKSA9PSAnaHlwZXJfbGluaycpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGxpIGtleT17aW5kZXh9Pntmb3JtYXRMaW5rKGh5cGVyTGluay5nZXQoJ3ZhbHVlJykpfTwvbGk+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIENvbnRhY3RzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IGNvbnRhY3RzIH0gPSB0aGlzLnByb3BzO1xuICAgICAgaWYgKGNvbnRhY3RzLmdldCgncm93cycpLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aDQ+Q29udGFjdHM8L2g0PlxuICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgIHtjb250YWN0cy5nZXQoJ3Jvd3MnKS5tYXAodGhpcy5fcmVuZGVyQ29udGFjdCkudG9BcnJheSgpfVxuICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3JlbmRlckNvbnRhY3QoY29udGFjdCwgaW5kZXgpIHtcbiAgICAgIHZhciBjb250YWN0X25hbWUgPSBjb250YWN0LmZpbmQoYyA9PiBjLmdldCgnbmFtZScpID09ICdjb250YWN0X25hbWUnKTtcbiAgICAgIHZhciBhZmZpbGlhdGlvbiA9IGNvbnRhY3QuZmluZChjID0+IGMuZ2V0KCduYW1lJykgPT0gJ2FmZmlsaWF0aW9uJyk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGkga2V5PXtpbmRleH0+e2NvbnRhY3RfbmFtZS5nZXQoJ3ZhbHVlJyl9LCB7YWZmaWxpYXRpb24uZ2V0KCd2YWx1ZScpfTwvbGk+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIFB1YmxpY2F0aW9ucyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyBwdWJsaWNhdGlvbnMgfSA9IHRoaXMucHJvcHM7XG4gICAgICB2YXIgcm93cyA9IHB1YmxpY2F0aW9ucy5nZXQoJ3Jvd3MnKTtcbiAgICAgIGlmIChyb3dzLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aDQ+UHVibGljYXRpb25zPC9oND5cbiAgICAgICAgICA8dWw+e3Jvd3MubWFwKHRoaXMuX3JlbmRlclB1YmxpY2F0aW9uKS50b0FycmF5KCl9PC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyUHVibGljYXRpb24ocHVibGljYXRpb24sIGluZGV4KSB7XG4gICAgICB2YXIgcHVibWVkX2xpbmsgPSBwdWJsaWNhdGlvbi5maW5kKHAgPT4gcC5nZXQoJ25hbWUnKSA9PSAncHVibWVkX2xpbmsnKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaSBrZXk9e2luZGV4fT57Zm9ybWF0TGluayhwdWJtZWRfbGluay5nZXQoJ3ZhbHVlJykpfTwvbGk+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIENvbnRhY3RzQW5kUHVibGljYXRpb25zID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IGNvbnRhY3RzLCBwdWJsaWNhdGlvbnMgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgIGlmIChjb250YWN0cy5nZXQoJ3Jvd3MnKS5zaXplID09PSAwICYmIHB1YmxpY2F0aW9ucy5nZXQoJ3Jvd3MnKS5zaXplID09PSAwKSByZXR1cm4gbnVsbDtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aDI+QWRkaXRpb25hbCBDb250YWN0cyBhbmQgUHVibGljYXRpb25zPC9oMj5cbiAgICAgICAgICA8Q29udGFjdHMgY29udGFjdHM9e2NvbnRhY3RzfS8+XG4gICAgICAgICAgPFB1YmxpY2F0aW9ucyBwdWJsaWNhdGlvbnM9e3B1YmxpY2F0aW9uc30vPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgUmVsZWFzZUhpc3RvcnkgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyKCkge1xuICAgICAgdmFyIHsgaGlzdG9yeSB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGlmIChoaXN0b3J5LmdldCgncm93cycpLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aDI+RGF0YSBTZXQgUmVsZWFzZSBIaXN0b3J5PC9oMj5cbiAgICAgICAgICA8dGFibGU+XG4gICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICA8dGg+RXVQYXRoREIgUmVsZWFzZTwvdGg+XG4gICAgICAgICAgICAgICAgPHRoPkdlbm9tZSBTb3VyY2U8L3RoPlxuICAgICAgICAgICAgICAgIDx0aD5Bbm5vdGF0aW9uIFNvdXJjZTwvdGg+XG4gICAgICAgICAgICAgICAgPHRoPk5vdGVzPC90aD5cbiAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgIHtoaXN0b3J5LmdldCgncm93cycpLm1hcCh0aGlzLl9yZW5kZXJSb3cpLnRvQXJyYXkoKX1cbiAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyUm93KGF0dHJpYnV0ZXMpIHtcbiAgICAgIHZhciBhdHRycyA9IF8uaW5kZXhCeShhdHRyaWJ1dGVzLnRvSlMoKSwgJ25hbWUnKTtcblxuICAgICAgdmFyIHJlbGVhc2UgPSBhdHRycy5idWlsZC52YWx1ZSA/ICdSZWxlYXNlICcgKyBhdHRycy5idWlsZC52YWx1ZVxuICAgICAgICA6ICdJbml0aWFsIHJlbGVhc2UnO1xuXG4gICAgICB2YXIgcmVsZWFzZURhdGUgPSBuZXcgRGF0ZShhdHRycy5yZWxlYXNlX2RhdGUudmFsdWUpXG4gICAgICAgIC50b0RhdGVTdHJpbmcoKVxuICAgICAgICAuc3BsaXQoJyAnKVxuICAgICAgICAuc2xpY2UoMSlcbiAgICAgICAgLmpvaW4oJyAnKTtcblxuICAgICAgdmFyIGdlbm9tZVNvdXJjZSA9IGF0dHJzLmdlbm9tZV9zb3VyY2UudmFsdWVcbiAgICAgICAgPyBhdHRycy5nZW5vbWVfc291cmNlLnZhbHVlICsgJyAoJyArIGF0dHJzLmdlbm9tZV92ZXJzaW9uLnZhbHVlICsgJyknXG4gICAgICAgIDogJyc7XG5cbiAgICAgIHZhciBhbm5vdGF0aW9uU291cmNlID0gYXR0cnMuYW5ub3RhdGlvbl9zb3VyY2UudmFsdWVcbiAgICAgICAgPyBhdHRycy5hbm5vdGF0aW9uX3NvdXJjZS52YWx1ZSArICcgKCcgKyBhdHRycy5hbm5vdGF0aW9uX3ZlcnNpb24udmFsdWUgKyAnKSdcbiAgICAgICAgOiAnJztcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0ZD57cmVsZWFzZX0gKHtyZWxlYXNlRGF0ZX0sIHthdHRycy5wcm9qZWN0LnZhbHVlfSB7YXR0cnMucmVsZWFzZV9udW1iZXIudmFsdWV9KTwvdGQ+XG4gICAgICAgICAgPHRkPntnZW5vbWVTb3VyY2V9PC90ZD5cbiAgICAgICAgICA8dGQ+e2Fubm90YXRpb25Tb3VyY2V9PC90ZD5cbiAgICAgICAgICA8dGQ+e2F0dHJzLm5vdGUudmFsdWV9PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgVmVyc2lvbnMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyKCkge1xuICAgICAgdmFyIHsgdmVyc2lvbnMgfSA9IHRoaXMucHJvcHM7XG4gICAgICB2YXIgcm93cyA9IHZlcnNpb25zLmdldCgncm93cycpO1xuXG4gICAgICBpZiAocm93cy5zaXplID09PSAwKSByZXR1cm4gbnVsbDtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aDI+VmVyc2lvbjwvaDI+XG4gICAgICAgICAgPHA+XG4gICAgICAgICAgICBUaGUgZGF0YSBzZXQgdmVyc2lvbiBzaG93biBoZXJlIGlzIHRoZSBkYXRhIHByb3ZpZGVyJ3MgdmVyc2lvblxuICAgICAgICAgICAgbnVtYmVyIG9yIHB1YmxpY2F0aW9uIGRhdGUgaW5kaWNhdGVkIG9uIHRoZSBzaXRlIGZyb20gd2hpY2ggd2VcbiAgICAgICAgICAgIGRvd25sb2FkZWQgdGhlIGRhdGEuIEluIHRoZSByYXJlIGNhc2UgdGhhdCB0aGVzZSBhcmUgbm90IGF2YWlsYWJsZSxcbiAgICAgICAgICAgIHRoZSB2ZXJzaW9uIGlzIHRoZSBkYXRlIHRoYXQgdGhlIGRhdGEgc2V0IHdhcyBkb3dubG9hZGVkLlxuICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8dGFibGU+XG4gICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICA8dGg+T3JnYW5pc208L3RoPlxuICAgICAgICAgICAgICAgIDx0aD5Qcm92aWRlcidzIFZlcnNpb248L3RoPlxuICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAge3Jvd3MubWFwKHRoaXMuX3JlbmRlclJvdykudG9BcnJheSgpfVxuICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSxcblxuICAgIF9yZW5kZXJSb3coYXR0cmlidXRlcykge1xuICAgICAgdmFyIGF0dHJzID0gXy5pbmRleEJ5KGF0dHJpYnV0ZXMudG9KUygpLCAnbmFtZScpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0ZD57YXR0cnMub3JnYW5pc20udmFsdWV9PC90ZD5cbiAgICAgICAgICA8dGQ+e2F0dHJzLnZlcnNpb24udmFsdWV9PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgR3JhcGhzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IGdyYXBocyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIHZhciByb3dzID0gZ3JhcGhzLmdldCgncm93cycpO1xuICAgICAgaWYgKHJvd3Muc2l6ZSA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoMj5FeGFtcGxlIEdyYXBoczwvaDI+XG4gICAgICAgICAgPHVsPntyb3dzLm1hcCh0aGlzLl9yZW5kZXJHcmFwaCkudG9BcnJheSgpfTwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3JlbmRlckdyYXBoKGdyYXBoLCBpbmRleCkge1xuICAgICAgdmFyIGcgPSBfLmluZGV4QnkoZ3JhcGgudG9KUygpLCAnbmFtZScpO1xuXG4gICAgICB2YXIgZGlzcGxheU5hbWUgPSBnLmRpc3BsYXlfbmFtZS52YWx1ZTtcblxuICAgICAgdmFyIGJhc2VVcmwgPSAnL2NnaS1iaW4vZGF0YVBsb3R0ZXIucGwnICtcbiAgICAgICAgJz90eXBlPScgKyBnLm1vZHVsZS52YWx1ZSArXG4gICAgICAgICcmcHJvamVjdF9pZD0nICsgZy5wcm9qZWN0X2lkLnZhbHVlICtcbiAgICAgICAgJyZkYXRhc2V0PScgKyBnLmRhdGFzZXRfbmFtZS52YWx1ZSArXG4gICAgICAgICcmdGVtcGxhdGU9JyArIChnLmlzX2dyYXBoX2N1c3RvbS52YWx1ZSA9PT0gJ2ZhbHNlJyA/IDEgOiAnJykgK1xuICAgICAgICAnJmlkPScgKyBnLmdyYXBoX2lkcy52YWx1ZTtcblxuICAgICAgdmFyIGltZ1VybCA9IGJhc2VVcmwgKyAnJmZtdD1wbmcnO1xuICAgICAgdmFyIHRhYmxlVXJsID0gYmFzZVVybCArICcmZm10PXRhYmxlJztcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGxpIGtleT17aW5kZXh9PlxuICAgICAgICAgIDxoMz57ZGlzcGxheU5hbWV9PC9oMz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImV1cGF0aGRiLURhdGFzZXRSZWNvcmQtR3JhcGhNZXRhXCI+XG4gICAgICAgICAgICA8aDM+RGVzY3JpcHRpb248L2gzPlxuICAgICAgICAgICAgPHAgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IGcuZGVzY3JpcHRpb24udmFsdWV9fS8+XG4gICAgICAgICAgICA8aDM+WC1heGlzPC9oMz5cbiAgICAgICAgICAgIDxwPntnLnhfYXhpcy52YWx1ZX08L3A+XG4gICAgICAgICAgICA8aDM+WS1heGlzPC9oMz5cbiAgICAgICAgICAgIDxwPntnLnlfYXhpcy52YWx1ZX08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJldXBhdGhkYi1EYXRhc2V0UmVjb3JkLUdyYXBoRGF0YVwiPlxuICAgICAgICAgICAgPGltZyBjbGFzc05hbWU9XCJldXBhdGhkYi1EYXRhc2V0UmVjb3JkLUdyYXBoSW1nXCIgc3JjPXtpbWdVcmx9Lz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9saT5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgRGF0YXNldFJlY29yZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyByZWNvcmQsIHF1ZXN0aW9ucywgcmVjb3JkQ2xhc3NlcyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIHZhciBhdHRyaWJ1dGVzID0gcmVjb3JkLmdldCgnYXR0cmlidXRlcycpO1xuICAgICAgdmFyIHRhYmxlcyA9IHJlY29yZC5nZXQoJ3RhYmxlcycpO1xuICAgICAgdmFyIHRpdGxlQ2xhc3MgPSAnZXVwYXRoZGItRGF0YXNldFJlY29yZC10aXRsZSc7XG5cbiAgICAgIHZhciBpZCA9IHJlY29yZC5nZXQoJ2lkJyk7XG4gICAgICB2YXIgc3VtbWFyeSA9IGF0dHJpYnV0ZXMuZ2V0SW4oWydzdW1tYXJ5JywgJ3ZhbHVlJ10pO1xuICAgICAgdmFyIHJlbGVhc2VJbmZvID0gYXR0cmlidXRlcy5nZXRJbihbJ2J1aWxkX251bWJlcl9pbnRyb2R1Y2VkJywgJ3ZhbHVlJ10pO1xuICAgICAgdmFyIHByaW1hcnlQdWJsaWNhdGlvbiA9IHRhYmxlcy5nZXRJbihbJ1B1YmxpY2F0aW9ucycsICdyb3dzJywgMF0pO1xuICAgICAgdmFyIGNvbnRhY3QgPSBhdHRyaWJ1dGVzLmdldEluKFsnY29udGFjdCcsICd2YWx1ZSddKTtcbiAgICAgIHZhciBpbnN0aXR1dGlvbiA9IGF0dHJpYnV0ZXMuZ2V0SW4oWydpbnN0aXR1dGlvbicsICd2YWx1ZSddKTtcbiAgICAgIHZhciB2ZXJzaW9uID0gYXR0cmlidXRlcy5nZXRJbihbJ1ZlcnNpb24nLCAncm93cycsIDBdKTtcbiAgICAgIHZhciBvcmdhbmlzbXMgPSBhdHRyaWJ1dGVzLmdldEluKFsnb3JnYW5pc21zJywgJ3ZhbHVlJ10pO1xuICAgICAgdmFyIFJlZmVyZW5jZXMgPSB0YWJsZXMuZ2V0KCdSZWZlcmVuY2VzJyk7XG4gICAgICB2YXIgSHlwZXJMaW5rcyA9IHRhYmxlcy5nZXQoJ0h5cGVyTGlua3MnKTtcbiAgICAgIHZhciBDb250YWN0cyA9IHRhYmxlcy5nZXQoJ0NvbnRhY3RzJyk7XG4gICAgICB2YXIgUHVibGljYXRpb25zID0gdGFibGVzLmdldCgnUHVibGljYXRpb25zJyk7XG4gICAgICB2YXIgZGVzY3JpcHRpb24gPSBhdHRyaWJ1dGVzLmdldEluKFsnZGVzY3JpcHRpb24nLCAndmFsdWUnXSk7XG4gICAgICB2YXIgR2Vub21lSGlzdG9yeSA9IHRhYmxlcy5nZXQoJ0dlbm9tZUhpc3RvcnknKTtcbiAgICAgIHZhciBWZXJzaW9uID0gdGFibGVzLmdldCgnVmVyc2lvbicpO1xuICAgICAgdmFyIEV4YW1wbGVHcmFwaHMgPSB0YWJsZXMuZ2V0KCdFeGFtcGxlR3JhcGhzJyk7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXVwYXRoZGItRGF0YXNldFJlY29yZCB1aS1oZWxwZXItY2xlYXJmaXhcIj5cbiAgICAgICAgICA8aDEgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tcbiAgICAgICAgICAgIF9faHRtbDogJ0RhdGEgU2V0OiA8c3BhbiBjbGFzcz1cIicgKyB0aXRsZUNsYXNzICsgJ1wiPicgKyBpZCArICc8L3NwYW4+J1xuICAgICAgICAgIH19Lz5cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXVwYXRoZGItRGF0YXNldFJlY29yZC1Db250YWluZXIgdWktaGVscGVyLWNsZWFyZml4XCI+XG5cbiAgICAgICAgICAgIDxoci8+XG5cbiAgICAgICAgICAgIDx0YWJsZSBjbGFzc05hbWU9XCJldXBhdGhkYi1EYXRhc2V0UmVjb3JkLWhlYWRlclRhYmxlXCI+XG4gICAgICAgICAgICAgIDx0Ym9keT5cblxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgIDx0aD5TdW1tYXJ5OjwvdGg+XG4gICAgICAgICAgICAgICAgICA8dGQgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IHN1bW1hcnl9fS8+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICB7cHJpbWFyeVB1YmxpY2F0aW9uID8gKFxuICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGg+UHJpbWFyeSBwdWJsaWNhdGlvbjo8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+e3JlbmRlclByaW1hcnlQdWJsaWNhdGlvbihwcmltYXJ5UHVibGljYXRpb24pfTwvdGQ+XG4gICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAgICAgICAge2NvbnRhY3QgJiYgaW5zdGl0dXRpb24gPyAoXG4gICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5QcmltYXJ5IGNvbnRhY3Q6PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPntyZW5kZXJQcmltYXJ5Q29udGFjdChjb250YWN0LCBpbnN0aXR1dGlvbil9PC90ZD5cbiAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICAgICAgICB7dmVyc2lvbiA/IChcbiAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRoPlNvdXJjZSB2ZXJzaW9uOjwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD57cmVuZGVyU291cmNlVmVyc2lvbih2ZXJzaW9uKX08L3RkPlxuICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgICAgICAgIHtyZWxlYXNlSW5mbyA/IChcbiAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRoPkV1UGF0aERCIHJlbGVhc2U6PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPntyZWxlYXNlSW5mb308L3RkPlxuICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgPC90YWJsZT5cblxuICAgICAgICAgICAgPGhyLz5cblxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJldXBhdGhkYi1EYXRhc2V0UmVjb3JkLU1haW5cIj5cbiAgICAgICAgICAgICAgPGgyPkRldGFpbGVkIERlc2NyaXB0aW9uPC9oMj5cbiAgICAgICAgICAgICAgPGRpdiBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogZGVzY3JpcHRpb259fS8+XG4gICAgICAgICAgICAgIDxDb250YWN0c0FuZFB1YmxpY2F0aW9ucyBjb250YWN0cz17Q29udGFjdHN9IHB1YmxpY2F0aW9ucz17UHVibGljYXRpb25zfS8+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJldXBhdGhkYi1EYXRhc2V0UmVjb3JkLVNpZGViYXJcIj5cbiAgICAgICAgICAgICAgPE9yZ2FuaXNtcyBvcmdhbmlzbXM9e29yZ2FuaXNtc30vPlxuICAgICAgICAgICAgICA8U2VhcmNoZXMgc2VhcmNoZXM9e1JlZmVyZW5jZXN9IGxpbmtzPXtIeXBlckxpbmtzfSBxdWVzdGlvbnM9e3F1ZXN0aW9uc30gcmVjb3JkQ2xhc3Nlcz17cmVjb3JkQ2xhc3Nlc30vPlxuICAgICAgICAgICAgICA8TGlua3MgbGlua3M9e0h5cGVyTGlua3N9Lz5cbiAgICAgICAgICAgICAgPFJlbGVhc2VIaXN0b3J5IGhpc3Rvcnk9e0dlbm9tZUhpc3Rvcnl9Lz5cbiAgICAgICAgICAgICAgPFZlcnNpb25zIHZlcnNpb25zPXtWZXJzaW9ufS8+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxHcmFwaHMgZ3JhcGhzPXtFeGFtcGxlR3JhcGhzfS8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBUb29sdGlwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgdGhpcy5fc2V0dXBUb29sdGlwKCk7XG4gICAgfSxcbiAgICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgICB0aGlzLl9kZXN0cm95VG9vbHRpcCgpO1xuICAgICAgdGhpcy5fc2V0dXBUb29sdGlwKCk7XG4gICAgfSxcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgIHRoaXMuX2Rlc3Ryb3lUb29sdGlwKCk7XG4gICAgfSxcbiAgICBfc2V0dXBUb29sdGlwKCkge1xuICAgICAgaWYgKHRoaXMucHJvcHMudGV4dCA9PSBudWxsKSByZXR1cm47XG5cbiAgICAgIHZhciB0ZXh0ID0gYDxkaXYgc3R5bGU9XCJtYXgtaGVpZ2h0OiAyMDBweDsgb3ZlcmZsb3cteTogYXV0bzsgcGFkZGluZzogMnB4O1wiPiR7dGhpcy5wcm9wcy50ZXh0fTwvZGl2PmA7XG4gICAgICB2YXIgd2lkdGggPSB0aGlzLnByb3BzLndpZHRoO1xuXG4gICAgICB0aGlzLiR0YXJnZXQgPSAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5maW5kKCcud2RrLVJlY29yZFRhYmxlLXJlY29yZExpbmsnKVxuICAgICAgICAud2RrVG9vbHRpcCh7XG4gICAgICAgICAgb3ZlcndyaXRlOiB0cnVlLFxuICAgICAgICAgIGNvbnRlbnQ6IHsgdGV4dCB9LFxuICAgICAgICAgIHNob3c6IHsgZGVsYXk6IDEwMDAgfSxcbiAgICAgICAgICBwb3NpdGlvbjogeyBteTogJ3RvcCBsZWZ0JywgYXQ6ICdib3R0b20gbGVmdCcsIGFkanVzdDogeyB5OiAxMiB9IH1cbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBfZGVzdHJveVRvb2x0aXAoKSB7XG4gICAgICAvLyBpZiBfc2V0dXBUb29sdGlwIGRvZXNuJ3QgZG8gYW55dGhpbmcsIHRoaXMgaXMgYSBub29wXG4gICAgICBpZiAodGhpcy4kdGFyZ2V0KSB7XG4gICAgICAgIHRoaXMuJHRhcmdldC5xdGlwKCdkZXN0cm95JywgdHJ1ZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZW5kZXIoKSB7XG4gICAgICAvLyBGSVhNRSAtIEZpZ3VyZSBvdXQgd2h5IHdlIGxvc2UgdGhlIGZpeGVkLWRhdGEtdGFibGUgY2xhc3NOYW1lXG4gICAgICAvLyBMb3NpbmcgdGhlIGZpeGVkLWRhdGEtdGFibGUgY2xhc3NOYW1lIGZvciBzb21lIHJlYXNvbi4uLiBhZGRpbmcgaXQgYmFjay5cbiAgICAgIHZhciBjaGlsZCA9IFJlYWN0LkNoaWxkcmVuLm9ubHkodGhpcy5wcm9wcy5jaGlsZHJlbik7XG4gICAgICBjaGlsZC5wcm9wcy5jbGFzc05hbWUgKz0gXCIgcHVibGljX2ZpeGVkRGF0YVRhYmxlQ2VsbF9jZWxsQ29udGVudFwiO1xuICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgLy9yZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGRhdGFzZXRDZWxsUmVuZGVyZXIoYXR0cmlidXRlLCBhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVzLCBpbmRleCwgY29sdW1uRGF0YSwgd2lkdGgsIGRlZmF1bHRSZW5kZXJlcikge1xuICAgIHZhciByZWFjdEVsZW1lbnQgPSBkZWZhdWx0UmVuZGVyZXIoYXR0cmlidXRlLCBhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVzLCBpbmRleCwgY29sdW1uRGF0YSwgd2lkdGgpO1xuXG4gICAgaWYgKGF0dHJpYnV0ZS5nZXQoJ25hbWUnKSA9PT0gJ3ByaW1hcnlfa2V5Jykge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFRvb2x0aXBcbiAgICAgICAgICB0ZXh0PXthdHRyaWJ1dGVzLmdldCgnZGVzY3JpcHRpb24nKS5nZXQoJ3ZhbHVlJyl9XG4gICAgICAgICAgd2lkdGg9e3dpZHRofVxuICAgICAgICA+e3JlYWN0RWxlbWVudH08L1Rvb2x0aXA+XG4gICAgICApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiByZWFjdEVsZW1lbnQ7XG4gICAgfVxuICB9XG5cbiAgbnMuRGF0YXNldFJlY29yZCA9IERhdGFzZXRSZWNvcmQ7XG4gIG5zLmRhdGFzZXRDZWxsUmVuZGVyZXIgPSBkYXRhc2V0Q2VsbFJlbmRlcmVyO1xufSk7XG4iXX0=
