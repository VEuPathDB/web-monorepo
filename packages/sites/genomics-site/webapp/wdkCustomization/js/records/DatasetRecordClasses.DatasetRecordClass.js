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
      return ( React.createElement("a", {target: newWindow ? '_blank' : '_self', href: url}, text) );
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
      var searches = this.props.searches.get('rows').filter(this._rowIsQuestion);

      if (searches.size === 0) return null;

      return (
        React.createElement("div", null, 
          React.createElement("h2", null, "Search or view this data set in PlasmoDB"), 
          React.createElement("ul", null, 
            searches.map(this._renderSearch).toArray()
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
    }
  });

  var Links = React.createClass({displayName: "Links",
    render:function() {
      var $__0=    this.props,links=$__0.links;

      if (links.get('rows').size === 0) return null;

      return (
        React.createElement("div", null, 
          React.createElement("h2", null, "Links"), 
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

      var releaseDate = attrs.release_date.value.split(/\s+/)[0];

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
          React.createElement("h2", null, "Provider's Version"), 
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

                organism ? (
                  React.createElement("tr", null, 
                    React.createElement("th", null, "Organism (source or reference):"), 
                    React.createElement("td", {dangerouslySetInnerHTML: {__html: organism}})
                  )
                ) : null, 

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
                    React.createElement("th", null, "EuPathDB release # / date:"), 
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
              React.createElement(Searches, {searches: References, questions: questions, recordClasses: recordClasses}), 
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWQuanMiLCJzb3VyY2VzIjpbbnVsbF0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHdCQUF3QjtBQUN4Qiw4Q0FBOEM7O0FBRTlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsR0FBRzs7QUFFSCxHQUFHLENBQUMsU0FBUyxDQUFDLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUM7QUFDaEQsRUFBRSxZQUFZLENBQUM7O0FBRWYsRUFBRSxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO0FBQ3hCOztFQUVFLFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3RCLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDeEMsR0FBRyxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7SUFDcEIsT0FBTyxHQUFHLENBQUMsV0FBVyxDQUFDO0FBQzNCLEdBQUc7QUFDSDs7RUFFRSxJQUFJLFVBQVUsR0FBRyxTQUFTLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFDaEQsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDbEIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDakMsSUFBSSxLQUFLLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzFELElBQUksS0FBSyxFQUFFO01BQ1QsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQzlCLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUNuQixTQUFTLG9CQUFBLEdBQUUsRUFBQSxDQUFBLENBQUMsTUFBQSxFQUFNLENBQUUsU0FBUyxHQUFHLFFBQVEsR0FBRyxP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QU0sU0FBQSxHQUFHLENBQUM7QUFDZDs7TUFFTSxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO01BQ3JELEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxJQUFJLHdDQUF3QyxDQUFDO0FBQ3hFLE1BQU0sT0FBTyxLQUFLLENBQUM7O0tBRWQ7QUFDTCxHQUFHLENBQUMsQ0FBQzs7RUFFSCxTQUFTLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxDQUFDO0FBQ2pILElBQUksSUFBSSxZQUFZLEdBQUcsZUFBZSxDQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7O0lBRW5HLElBQUksU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxhQUFhLEVBQUU7TUFDM0M7UUFDRSxvQkFBQyxPQUFPLEVBQUEsQ0FBQTtVQUNOLElBQUEsRUFBSSxDQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFDO1VBQ2pELEtBQUEsRUFBSyxDQUFFLEtBQU07UUFDZCxDQUFBLEVBQUMsWUFBdUIsQ0FBQTtRQUN6QjtLQUNIO1NBQ0k7TUFDSCxPQUFPLFlBQVksQ0FBQztLQUNyQjtBQUNMLEdBQUc7O0VBRUQsRUFBRSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7RUFDakMsRUFBRSxDQUFDLG1CQUFtQixHQUFHLG1CQUFtQixDQUFDO0NBQzlDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGdsb2JhbCBfLCBXZGssIHdkayAqL1xuLyoganNoaW50IGVzbmV4dDogdHJ1ZSwgZXFudWxsOiB0cnVlLCAtVzAxNCAqL1xuXG4vKipcbiAqIFRoaXMgZmlsZSBwcm92aWRlcyBhIGN1c3RvbSBSZWNvcmQgQ29tcG9uZW50IHdoaWNoIGlzIHVzZWQgYnkgdGhlIG5ldyBXZGtcbiAqIEZsdXggYXJjaGl0ZWN0dXJlLlxuICpcbiAqIFRoZSBzaWJsaW5nIGZpbGUgRGF0YXNldFJlY29yZENsYXNzZXMuRGF0YXNldFJlY29yZENsYXNzLmpzIGlzIGdlbmVyYXRlZFxuICogZnJvbSB0aGlzIGZpbGUgdXNpbmcgdGhlIGpzeCBjb21waWxlci4gRXZlbnR1YWxseSwgdGhpcyBmaWxlIHdpbGwgYmVcbiAqIGNvbXBpbGVkIGR1cmluZyBidWlsZCB0aW1lLS10aGlzIGlzIGEgc2hvcnQtdGVybSBzb2x1dGlvbi5cbiAqXG4gKiBgd2RrYCBpcyB0aGUgbGVnYWN5IGdsb2JhbCBvYmplY3QsIGFuZCBgV2RrYCBpcyB0aGUgbmV3IGdsb2JhbCBvYmplY3RcbiAqL1xuXG53ZGsubmFtZXNwYWNlKCdldXBhdGhkYi5yZWNvcmRzJywgZnVuY3Rpb24obnMpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIFJlYWN0ID0gV2RrLlJlYWN0O1xuXG4gIC8vIFVzZSBFbGVtZW50LmlubmVyVGV4dCB0byBzdHJpcCBYTUxcbiAgZnVuY3Rpb24gc3RyaXBYTUwoc3RyKSB7XG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdi5pbm5lckhUTUwgPSBzdHI7XG4gICAgcmV0dXJuIGRpdi50ZXh0Q29udGVudDtcbiAgfVxuXG4gIC8vIGZvcm1hdCBpcyB7dGV4dH0oe2xpbmt9KVxuICB2YXIgZm9ybWF0TGluayA9IGZ1bmN0aW9uIGZvcm1hdExpbmsobGluaywgb3B0cykge1xuICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuICAgIHZhciBuZXdXaW5kb3cgPSAhIW9wdHMubmV3V2luZG93O1xuICAgIHZhciBtYXRjaCA9IC8oLiopXFwoKC4qKVxcKS8uZXhlYyhsaW5rLnJlcGxhY2UoL1xcbi9nLCAnICcpKTtcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIHZhciB0ZXh0ID0gc3RyaXBYTUwobWF0Y2hbMV0pO1xuICAgICAgdmFyIHVybCA9IG1hdGNoWzJdO1xuICAgICAgcmV0dXJuICggPGEgdGFyZ2V0PXtuZXdXaW5kb3cgPyAnX2JsYW5rJyA6ICdfc2VsZid9IGhyZWY9e3VybH0+e3RleHR9PC9hPiApO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICB2YXIgcmVuZGVyUHJpbWFyeVB1YmxpY2F0aW9uID0gZnVuY3Rpb24gcmVuZGVyUHJpbWFyeVB1YmxpY2F0aW9uKHB1YmxpY2F0aW9uKSB7XG4gICAgdmFyIHB1Ym1lZExpbmsgPSBwdWJsaWNhdGlvbi5maW5kKGZ1bmN0aW9uKHB1Yikge1xuICAgICAgcmV0dXJuIHB1Yi5nZXQoJ25hbWUnKSA9PSAncHVibWVkX2xpbmsnO1xuICAgIH0pO1xuICAgIHJldHVybiBmb3JtYXRMaW5rKHB1Ym1lZExpbmsuZ2V0KCd2YWx1ZScpLCB7IG5ld1dpbmRvdzogdHJ1ZSB9KTtcbiAgfTtcblxuICB2YXIgcmVuZGVyUHJpbWFyeUNvbnRhY3QgPSBmdW5jdGlvbiByZW5kZXJQcmltYXJ5Q29udGFjdChjb250YWN0LCBpbnN0aXR1dGlvbikge1xuICAgIHJldHVybiBjb250YWN0ICsgJywgJyArIGluc3RpdHV0aW9uO1xuICB9O1xuXG4gIHZhciByZW5kZXJTb3VyY2VWZXJzaW9uID0gZnVuY3Rpb24odmVyc2lvbikge1xuICAgIHZhciBuYW1lID0gdmVyc2lvbi5maW5kKHYgPT4gdi5nZXQoJ25hbWUnKSA9PT0gJ3ZlcnNpb24nKTtcbiAgICByZXR1cm4gKFxuICAgICAgbmFtZS5nZXQoJ3ZhbHVlJykgKyAnIChUaGUgZGF0YSBwcm92aWRlclxcJ3MgdmVyc2lvbiBudW1iZXIgb3IgcHVibGljYXRpb24gZGF0ZSwgZnJvbScgK1xuICAgICAgJyB0aGUgc2l0ZSB0aGUgZGF0YSB3YXMgYWNxdWlyZWQuIEluIHRoZSByYXJlIGNhc2UgbmVpdGhlciBpcyBhdmFpbGFibGUsJyArXG4gICAgICAnIHRoZSBkb3dubG9hZCBkYXRlLiknXG4gICAgKTtcbiAgfTtcblxuICB2YXIgT3JnYW5pc21zID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IG9yZ2FuaXNtcyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGlmICghb3JnYW5pc21zKSByZXR1cm4gbnVsbDtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGgyPk9yZ2FuaXNtcyB0aGlzIGRhdGEgc2V0IGlzIG1hcHBlZCB0byBpbiBQbGFzbW9EQjwvaDI+XG4gICAgICAgICAgPHVsPntvcmdhbmlzbXMuc3BsaXQoLyxcXHMqLykubWFwKHRoaXMuX3JlbmRlck9yZ2FuaXNtKS50b0FycmF5KCl9PC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyT3JnYW5pc20ob3JnYW5pc20sIGluZGV4KSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGkga2V5PXtpbmRleH0+PGk+e29yZ2FuaXNtfTwvaT48L2xpPlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBTZWFyY2hlcyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgc2VhcmNoZXMgPSB0aGlzLnByb3BzLnNlYXJjaGVzLmdldCgncm93cycpLmZpbHRlcih0aGlzLl9yb3dJc1F1ZXN0aW9uKTtcblxuICAgICAgaWYgKHNlYXJjaGVzLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoMj5TZWFyY2ggb3IgdmlldyB0aGlzIGRhdGEgc2V0IGluIFBsYXNtb0RCPC9oMj5cbiAgICAgICAgICA8dWw+XG4gICAgICAgICAgICB7c2VhcmNoZXMubWFwKHRoaXMuX3JlbmRlclNlYXJjaCkudG9BcnJheSgpfVxuICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3Jvd0lzUXVlc3Rpb24ocm93KSB7XG4gICAgICB2YXIgdHlwZSA9IHJvdy5maW5kKGF0dHIgPT4gYXR0ci5nZXQoJ25hbWUnKSA9PSAndGFyZ2V0X3R5cGUnKTtcbiAgICAgIHJldHVybiB0eXBlICYmIHR5cGUuZ2V0KCd2YWx1ZScpID09ICdxdWVzdGlvbic7XG4gICAgfSxcblxuICAgIF9yZW5kZXJTZWFyY2goc2VhcmNoLCBpbmRleCkge1xuICAgICAgdmFyIG5hbWUgPSBzZWFyY2guZmluZChhdHRyID0+IGF0dHIuZ2V0KCduYW1lJykgPT0gJ3RhcmdldF9uYW1lJykuZ2V0KCd2YWx1ZScpO1xuICAgICAgdmFyIHF1ZXN0aW9uID0gdGhpcy5wcm9wcy5xdWVzdGlvbnMuZmluZChxID0+IHEuZ2V0KCduYW1lJykgPT09IG5hbWUpO1xuXG4gICAgICBpZiAocXVlc3Rpb24gPT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIHZhciByZWNvcmRDbGFzcyA9IHRoaXMucHJvcHMucmVjb3JkQ2xhc3Nlcy5maW5kKHIgPT4gci5nZXQoJ2Z1bGxOYW1lJykgPT09IHF1ZXN0aW9uLmdldCgnY2xhc3MnKSk7XG4gICAgICB2YXIgc2VhcmNoTmFtZSA9IGBJZGVudGlmeSAke3JlY29yZENsYXNzLmdldCgnZGlzcGxheU5hbWVQbHVyYWwnKX0gYnkgJHtxdWVzdGlvbi5nZXQoJ2Rpc3BsYXlOYW1lJyl9YDtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaSBrZXk9e2luZGV4fT5cbiAgICAgICAgICA8YSBocmVmPXsnL2Evc2hvd1F1ZXN0aW9uLmRvP3F1ZXN0aW9uRnVsbE5hbWU9JyArIG5hbWV9PntzZWFyY2hOYW1lfTwvYT5cbiAgICAgICAgPC9saT5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgTGlua3MgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyKCkge1xuICAgICAgdmFyIHsgbGlua3MgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgIGlmIChsaW5rcy5nZXQoJ3Jvd3MnKS5zaXplID09PSAwKSByZXR1cm4gbnVsbDtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aDI+TGlua3M8L2gyPlxuICAgICAgICAgIDx1bD4ge2xpbmtzLmdldCgncm93cycpLm1hcCh0aGlzLl9yZW5kZXJMaW5rKS50b0FycmF5KCl9IDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3JlbmRlckxpbmsobGluaywgaW5kZXgpIHtcbiAgICAgIHZhciBoeXBlckxpbmsgPSBsaW5rLmZpbmQoYXR0ciA9PiBhdHRyLmdldCgnbmFtZScpID09ICdoeXBlcl9saW5rJyk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGkga2V5PXtpbmRleH0+e2Zvcm1hdExpbmsoaHlwZXJMaW5rLmdldCgndmFsdWUnKSl9PC9saT5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgQ29udGFjdHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyKCkge1xuICAgICAgdmFyIHsgY29udGFjdHMgfSA9IHRoaXMucHJvcHM7XG4gICAgICBpZiAoY29udGFjdHMuZ2V0KCdyb3dzJykuc2l6ZSA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoND5Db250YWN0czwvaDQ+XG4gICAgICAgICAgPHVsPlxuICAgICAgICAgICAge2NvbnRhY3RzLmdldCgncm93cycpLm1hcCh0aGlzLl9yZW5kZXJDb250YWN0KS50b0FycmF5KCl9XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyQ29udGFjdChjb250YWN0LCBpbmRleCkge1xuICAgICAgdmFyIGNvbnRhY3RfbmFtZSA9IGNvbnRhY3QuZmluZChjID0+IGMuZ2V0KCduYW1lJykgPT0gJ2NvbnRhY3RfbmFtZScpO1xuICAgICAgdmFyIGFmZmlsaWF0aW9uID0gY29udGFjdC5maW5kKGMgPT4gYy5nZXQoJ25hbWUnKSA9PSAnYWZmaWxpYXRpb24nKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaSBrZXk9e2luZGV4fT57Y29udGFjdF9uYW1lLmdldCgndmFsdWUnKX0sIHthZmZpbGlhdGlvbi5nZXQoJ3ZhbHVlJyl9PC9saT5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgUHVibGljYXRpb25zID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IHB1YmxpY2F0aW9ucyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIHZhciByb3dzID0gcHVibGljYXRpb25zLmdldCgncm93cycpO1xuICAgICAgaWYgKHJvd3Muc2l6ZSA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoND5QdWJsaWNhdGlvbnM8L2g0PlxuICAgICAgICAgIDx1bD57cm93cy5tYXAodGhpcy5fcmVuZGVyUHVibGljYXRpb24pLnRvQXJyYXkoKX08L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSxcblxuICAgIF9yZW5kZXJQdWJsaWNhdGlvbihwdWJsaWNhdGlvbiwgaW5kZXgpIHtcbiAgICAgIHZhciBwdWJtZWRfbGluayA9IHB1YmxpY2F0aW9uLmZpbmQocCA9PiBwLmdldCgnbmFtZScpID09ICdwdWJtZWRfbGluaycpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGxpIGtleT17aW5kZXh9Pntmb3JtYXRMaW5rKHB1Ym1lZF9saW5rLmdldCgndmFsdWUnKSl9PC9saT5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgQ29udGFjdHNBbmRQdWJsaWNhdGlvbnMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyKCkge1xuICAgICAgdmFyIHsgY29udGFjdHMsIHB1YmxpY2F0aW9ucyB9ID0gdGhpcy5wcm9wcztcblxuICAgICAgaWYgKGNvbnRhY3RzLmdldCgncm93cycpLnNpemUgPT09IDAgJiYgcHVibGljYXRpb25zLmdldCgncm93cycpLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoMj5BZGRpdGlvbmFsIENvbnRhY3RzIGFuZCBQdWJsaWNhdGlvbnM8L2gyPlxuICAgICAgICAgIDxDb250YWN0cyBjb250YWN0cz17Y29udGFjdHN9Lz5cbiAgICAgICAgICA8UHVibGljYXRpb25zIHB1YmxpY2F0aW9ucz17cHVibGljYXRpb25zfS8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBSZWxlYXNlSGlzdG9yeSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyBoaXN0b3J5IH0gPSB0aGlzLnByb3BzO1xuICAgICAgaWYgKGhpc3RvcnkuZ2V0KCdyb3dzJykuc2l6ZSA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoMj5EYXRhIFNldCBSZWxlYXNlIEhpc3Rvcnk8L2gyPlxuICAgICAgICAgIDx0YWJsZT5cbiAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgIDx0aD5FdVBhdGhEQiBSZWxlYXNlPC90aD5cbiAgICAgICAgICAgICAgICA8dGg+R2Vub21lIFNvdXJjZTwvdGg+XG4gICAgICAgICAgICAgICAgPHRoPkFubm90YXRpb24gU291cmNlPC90aD5cbiAgICAgICAgICAgICAgICA8dGg+Tm90ZXM8L3RoPlxuICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAge2hpc3RvcnkuZ2V0KCdyb3dzJykubWFwKHRoaXMuX3JlbmRlclJvdykudG9BcnJheSgpfVxuICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSxcblxuICAgIF9yZW5kZXJSb3coYXR0cmlidXRlcykge1xuICAgICAgdmFyIGF0dHJzID0gXy5pbmRleEJ5KGF0dHJpYnV0ZXMudG9KUygpLCAnbmFtZScpO1xuXG4gICAgICB2YXIgcmVsZWFzZSA9IGF0dHJzLmJ1aWxkLnZhbHVlID8gJ1JlbGVhc2UgJyArIGF0dHJzLmJ1aWxkLnZhbHVlXG4gICAgICAgIDogJ0luaXRpYWwgcmVsZWFzZSc7XG5cbiAgICAgIHZhciByZWxlYXNlRGF0ZSA9IGF0dHJzLnJlbGVhc2VfZGF0ZS52YWx1ZS5zcGxpdCgvXFxzKy8pWzBdO1xuXG4gICAgICB2YXIgZ2Vub21lU291cmNlID0gYXR0cnMuZ2Vub21lX3NvdXJjZS52YWx1ZVxuICAgICAgICA/IGF0dHJzLmdlbm9tZV9zb3VyY2UudmFsdWUgKyAnICgnICsgYXR0cnMuZ2Vub21lX3ZlcnNpb24udmFsdWUgKyAnKSdcbiAgICAgICAgOiAnJztcblxuICAgICAgdmFyIGFubm90YXRpb25Tb3VyY2UgPSBhdHRycy5hbm5vdGF0aW9uX3NvdXJjZS52YWx1ZVxuICAgICAgICA/IGF0dHJzLmFubm90YXRpb25fc291cmNlLnZhbHVlICsgJyAoJyArIGF0dHJzLmFubm90YXRpb25fdmVyc2lvbi52YWx1ZSArICcpJ1xuICAgICAgICA6ICcnO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRkPntyZWxlYXNlfSAoe3JlbGVhc2VEYXRlfSwge2F0dHJzLnByb2plY3QudmFsdWV9IHthdHRycy5yZWxlYXNlX251bWJlci52YWx1ZX0pPC90ZD5cbiAgICAgICAgICA8dGQ+e2dlbm9tZVNvdXJjZX08L3RkPlxuICAgICAgICAgIDx0ZD57YW5ub3RhdGlvblNvdXJjZX08L3RkPlxuICAgICAgICAgIDx0ZD57YXR0cnMubm90ZS52YWx1ZX08L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBWZXJzaW9ucyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyB2ZXJzaW9ucyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIHZhciByb3dzID0gdmVyc2lvbnMuZ2V0KCdyb3dzJyk7XG5cbiAgICAgIGlmIChyb3dzLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoMj5Qcm92aWRlcidzIFZlcnNpb248L2gyPlxuICAgICAgICAgIDxwPlxuICAgICAgICAgICAgVGhlIGRhdGEgc2V0IHZlcnNpb24gc2hvd24gaGVyZSBpcyB0aGUgZGF0YSBwcm92aWRlcidzIHZlcnNpb25cbiAgICAgICAgICAgIG51bWJlciBvciBwdWJsaWNhdGlvbiBkYXRlIGluZGljYXRlZCBvbiB0aGUgc2l0ZSBmcm9tIHdoaWNoIHdlXG4gICAgICAgICAgICBkb3dubG9hZGVkIHRoZSBkYXRhLiBJbiB0aGUgcmFyZSBjYXNlIHRoYXQgdGhlc2UgYXJlIG5vdCBhdmFpbGFibGUsXG4gICAgICAgICAgICB0aGUgdmVyc2lvbiBpcyB0aGUgZGF0ZSB0aGF0IHRoZSBkYXRhIHNldCB3YXMgZG93bmxvYWRlZC5cbiAgICAgICAgICA8L3A+XG4gICAgICAgICAgPHRhYmxlPlxuICAgICAgICAgICAgPHRoZWFkPlxuICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgPHRoPk9yZ2FuaXNtPC90aD5cbiAgICAgICAgICAgICAgICA8dGg+UHJvdmlkZXIncyBWZXJzaW9uPC90aD5cbiAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgIHtyb3dzLm1hcCh0aGlzLl9yZW5kZXJSb3cpLnRvQXJyYXkoKX1cbiAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyUm93KGF0dHJpYnV0ZXMpIHtcbiAgICAgIHZhciBhdHRycyA9IF8uaW5kZXhCeShhdHRyaWJ1dGVzLnRvSlMoKSwgJ25hbWUnKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQ+e2F0dHJzLm9yZ2FuaXNtLnZhbHVlfTwvdGQ+XG4gICAgICAgICAgPHRkPnthdHRycy52ZXJzaW9uLnZhbHVlfTwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIEdyYXBocyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyBncmFwaHMgfSA9IHRoaXMucHJvcHM7XG4gICAgICB2YXIgcm93cyA9IGdyYXBocy5nZXQoJ3Jvd3MnKTtcbiAgICAgIGlmIChyb3dzLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aDI+RXhhbXBsZSBHcmFwaHM8L2gyPlxuICAgICAgICAgIDx1bD57cm93cy5tYXAodGhpcy5fcmVuZGVyR3JhcGgpLnRvQXJyYXkoKX08L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSxcblxuICAgIF9yZW5kZXJHcmFwaChncmFwaCwgaW5kZXgpIHtcbiAgICAgIHZhciBnID0gXy5pbmRleEJ5KGdyYXBoLnRvSlMoKSwgJ25hbWUnKTtcblxuICAgICAgdmFyIGRpc3BsYXlOYW1lID0gZy5kaXNwbGF5X25hbWUudmFsdWU7XG5cbiAgICAgIHZhciBiYXNlVXJsID0gJy9jZ2ktYmluL2RhdGFQbG90dGVyLnBsJyArXG4gICAgICAgICc/dHlwZT0nICsgZy5tb2R1bGUudmFsdWUgK1xuICAgICAgICAnJnByb2plY3RfaWQ9JyArIGcucHJvamVjdF9pZC52YWx1ZSArXG4gICAgICAgICcmZGF0YXNldD0nICsgZy5kYXRhc2V0X25hbWUudmFsdWUgK1xuICAgICAgICAnJnRlbXBsYXRlPScgKyAoZy5pc19ncmFwaF9jdXN0b20udmFsdWUgPT09ICdmYWxzZScgPyAxIDogJycpICtcbiAgICAgICAgJyZpZD0nICsgZy5ncmFwaF9pZHMudmFsdWU7XG5cbiAgICAgIHZhciBpbWdVcmwgPSBiYXNlVXJsICsgJyZmbXQ9cG5nJztcbiAgICAgIHZhciB0YWJsZVVybCA9IGJhc2VVcmwgKyAnJmZtdD10YWJsZSc7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaSBrZXk9e2luZGV4fT5cbiAgICAgICAgICA8aDM+e2Rpc3BsYXlOYW1lfTwvaDM+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJldXBhdGhkYi1EYXRhc2V0UmVjb3JkLUdyYXBoTWV0YVwiPlxuICAgICAgICAgICAgPGgzPkRlc2NyaXB0aW9uPC9oMz5cbiAgICAgICAgICAgIDxwIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBnLmRlc2NyaXB0aW9uLnZhbHVlfX0vPlxuICAgICAgICAgICAgPGgzPlgtYXhpczwvaDM+XG4gICAgICAgICAgICA8cD57Zy54X2F4aXMudmFsdWV9PC9wPlxuICAgICAgICAgICAgPGgzPlktYXhpczwvaDM+XG4gICAgICAgICAgICA8cD57Zy55X2F4aXMudmFsdWV9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXVwYXRoZGItRGF0YXNldFJlY29yZC1HcmFwaERhdGFcIj5cbiAgICAgICAgICAgIDxpbWcgY2xhc3NOYW1lPVwiZXVwYXRoZGItRGF0YXNldFJlY29yZC1HcmFwaEltZ1wiIHNyYz17aW1nVXJsfS8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvbGk+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIERhdGFzZXRSZWNvcmQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyKCkge1xuICAgICAgdmFyIHsgcmVjb3JkLCBxdWVzdGlvbnMsIHJlY29yZENsYXNzZXMgfSA9IHRoaXMucHJvcHM7XG4gICAgICB2YXIgYXR0cmlidXRlcyA9IHJlY29yZC5nZXQoJ2F0dHJpYnV0ZXMnKTtcbiAgICAgIHZhciB0YWJsZXMgPSByZWNvcmQuZ2V0KCd0YWJsZXMnKTtcbiAgICAgIHZhciB0aXRsZUNsYXNzID0gJ2V1cGF0aGRiLURhdGFzZXRSZWNvcmQtdGl0bGUnO1xuXG4gICAgICB2YXIgaWQgPSByZWNvcmQuZ2V0KCdpZCcpO1xuICAgICAgdmFyIHN1bW1hcnkgPSBhdHRyaWJ1dGVzLmdldEluKFsnc3VtbWFyeScsICd2YWx1ZSddKTtcbiAgICAgIHZhciByZWxlYXNlSW5mbyA9IGF0dHJpYnV0ZXMuZ2V0SW4oWydldXBhdGhfcmVsZWFzZScsICd2YWx1ZSddKTtcbiAgICAgIHZhciBwcmltYXJ5UHVibGljYXRpb24gPSB0YWJsZXMuZ2V0SW4oWydQdWJsaWNhdGlvbnMnLCAncm93cycsIDBdKTtcbiAgICAgIHZhciBjb250YWN0ID0gYXR0cmlidXRlcy5nZXRJbihbJ2NvbnRhY3QnLCAndmFsdWUnXSk7XG4gICAgICB2YXIgaW5zdGl0dXRpb24gPSBhdHRyaWJ1dGVzLmdldEluKFsnaW5zdGl0dXRpb24nLCAndmFsdWUnXSk7XG4gICAgICB2YXIgdmVyc2lvbiA9IGF0dHJpYnV0ZXMuZ2V0SW4oWydWZXJzaW9uJywgJ3Jvd3MnLCAwXSk7XG4gICAgICB2YXIgb3JnYW5pc20gPSBhdHRyaWJ1dGVzLmdldEluKFsnb3JnYW5pc21fcHJlZml4JywgJ3ZhbHVlJ10pO1xuICAgICAgdmFyIG9yZ2FuaXNtcyA9IGF0dHJpYnV0ZXMuZ2V0SW4oWydvcmdhbmlzbXMnLCAndmFsdWUnXSk7XG4gICAgICB2YXIgUmVmZXJlbmNlcyA9IHRhYmxlcy5nZXQoJ1JlZmVyZW5jZXMnKTtcbiAgICAgIHZhciBIeXBlckxpbmtzID0gdGFibGVzLmdldCgnSHlwZXJMaW5rcycpO1xuICAgICAgdmFyIENvbnRhY3RzID0gdGFibGVzLmdldCgnQ29udGFjdHMnKTtcbiAgICAgIHZhciBQdWJsaWNhdGlvbnMgPSB0YWJsZXMuZ2V0KCdQdWJsaWNhdGlvbnMnKTtcbiAgICAgIHZhciBkZXNjcmlwdGlvbiA9IGF0dHJpYnV0ZXMuZ2V0SW4oWydkZXNjcmlwdGlvbicsICd2YWx1ZSddKTtcbiAgICAgIHZhciBHZW5vbWVIaXN0b3J5ID0gdGFibGVzLmdldCgnR2Vub21lSGlzdG9yeScpO1xuICAgICAgdmFyIFZlcnNpb24gPSB0YWJsZXMuZ2V0KCdWZXJzaW9uJyk7XG4gICAgICB2YXIgRXhhbXBsZUdyYXBocyA9IHRhYmxlcy5nZXQoJ0V4YW1wbGVHcmFwaHMnKTtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJldXBhdGhkYi1EYXRhc2V0UmVjb3JkIHVpLWhlbHBlci1jbGVhcmZpeFwiPlxuICAgICAgICAgIDxoMSBkYW5nZXJvdXNseVNldElubmVySFRNTD17e1xuICAgICAgICAgICAgX19odG1sOiAnRGF0YSBTZXQ6IDxzcGFuIGNsYXNzPVwiJyArIHRpdGxlQ2xhc3MgKyAnXCI+JyArIGlkICsgJzwvc3Bhbj4nXG4gICAgICAgICAgfX0vPlxuXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJldXBhdGhkYi1EYXRhc2V0UmVjb3JkLUNvbnRhaW5lciB1aS1oZWxwZXItY2xlYXJmaXhcIj5cblxuICAgICAgICAgICAgPGhyLz5cblxuICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cImV1cGF0aGRiLURhdGFzZXRSZWNvcmQtaGVhZGVyVGFibGVcIj5cbiAgICAgICAgICAgICAgPHRib2R5PlxuXG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgPHRoPlN1bW1hcnk6PC90aD5cbiAgICAgICAgICAgICAgICAgIDx0ZCBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogc3VtbWFyeX19Lz5cbiAgICAgICAgICAgICAgICA8L3RyPlxuXG4gICAgICAgICAgICAgICAge29yZ2FuaXNtID8gKFxuICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGg+T3JnYW5pc20gKHNvdXJjZSBvciByZWZlcmVuY2UpOjwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0ZCBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogb3JnYW5pc219fS8+XG4gICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAgICAgICAge3ByaW1hcnlQdWJsaWNhdGlvbiA/IChcbiAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRoPlByaW1hcnkgcHVibGljYXRpb246PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPntyZW5kZXJQcmltYXJ5UHVibGljYXRpb24ocHJpbWFyeVB1YmxpY2F0aW9uKX08L3RkPlxuICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgICAgICAgIHtjb250YWN0ICYmIGluc3RpdHV0aW9uID8gKFxuICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGg+UHJpbWFyeSBjb250YWN0OjwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD57cmVuZGVyUHJpbWFyeUNvbnRhY3QoY29udGFjdCwgaW5zdGl0dXRpb24pfTwvdGQ+XG4gICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAgICAgICAge3ZlcnNpb24gPyAoXG4gICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5Tb3VyY2UgdmVyc2lvbjo8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+e3JlbmRlclNvdXJjZVZlcnNpb24odmVyc2lvbil9PC90ZD5cbiAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICAgICAgICB7cmVsZWFzZUluZm8gPyAoXG4gICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5FdVBhdGhEQiByZWxlYXNlICMgLyBkYXRlOjwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD57cmVsZWFzZUluZm99PC90ZD5cbiAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgIDwvdGFibGU+XG5cbiAgICAgICAgICAgIDxoci8+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXVwYXRoZGItRGF0YXNldFJlY29yZC1NYWluXCI+XG4gICAgICAgICAgICAgIDxoMj5EZXRhaWxlZCBEZXNjcmlwdGlvbjwvaDI+XG4gICAgICAgICAgICAgIDxkaXYgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IGRlc2NyaXB0aW9ufX0vPlxuICAgICAgICAgICAgICA8Q29udGFjdHNBbmRQdWJsaWNhdGlvbnMgY29udGFjdHM9e0NvbnRhY3RzfSBwdWJsaWNhdGlvbnM9e1B1YmxpY2F0aW9uc30vPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXVwYXRoZGItRGF0YXNldFJlY29yZC1TaWRlYmFyXCI+XG4gICAgICAgICAgICAgIDxPcmdhbmlzbXMgb3JnYW5pc21zPXtvcmdhbmlzbXN9Lz5cbiAgICAgICAgICAgICAgPFNlYXJjaGVzIHNlYXJjaGVzPXtSZWZlcmVuY2VzfSBxdWVzdGlvbnM9e3F1ZXN0aW9uc30gcmVjb3JkQ2xhc3Nlcz17cmVjb3JkQ2xhc3Nlc30vPlxuICAgICAgICAgICAgICA8TGlua3MgbGlua3M9e0h5cGVyTGlua3N9Lz5cbiAgICAgICAgICAgICAgPFJlbGVhc2VIaXN0b3J5IGhpc3Rvcnk9e0dlbm9tZUhpc3Rvcnl9Lz5cbiAgICAgICAgICAgICAgPFZlcnNpb25zIHZlcnNpb25zPXtWZXJzaW9ufS8+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxHcmFwaHMgZ3JhcGhzPXtFeGFtcGxlR3JhcGhzfS8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBUb29sdGlwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgdGhpcy5fc2V0dXBUb29sdGlwKCk7XG4gICAgfSxcbiAgICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgICB0aGlzLl9kZXN0cm95VG9vbHRpcCgpO1xuICAgICAgdGhpcy5fc2V0dXBUb29sdGlwKCk7XG4gICAgfSxcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgIHRoaXMuX2Rlc3Ryb3lUb29sdGlwKCk7XG4gICAgfSxcbiAgICBfc2V0dXBUb29sdGlwKCkge1xuICAgICAgaWYgKHRoaXMucHJvcHMudGV4dCA9PSBudWxsKSByZXR1cm47XG5cbiAgICAgIHZhciB0ZXh0ID0gYDxkaXYgc3R5bGU9XCJtYXgtaGVpZ2h0OiAyMDBweDsgb3ZlcmZsb3cteTogYXV0bzsgcGFkZGluZzogMnB4O1wiPiR7dGhpcy5wcm9wcy50ZXh0fTwvZGl2PmA7XG4gICAgICB2YXIgd2lkdGggPSB0aGlzLnByb3BzLndpZHRoO1xuXG4gICAgICB0aGlzLiR0YXJnZXQgPSAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5maW5kKCcud2RrLVJlY29yZFRhYmxlLXJlY29yZExpbmsnKVxuICAgICAgICAud2RrVG9vbHRpcCh7XG4gICAgICAgICAgb3ZlcndyaXRlOiB0cnVlLFxuICAgICAgICAgIGNvbnRlbnQ6IHsgdGV4dCB9LFxuICAgICAgICAgIHNob3c6IHsgZGVsYXk6IDEwMDAgfSxcbiAgICAgICAgICBwb3NpdGlvbjogeyBteTogJ3RvcCBsZWZ0JywgYXQ6ICdib3R0b20gbGVmdCcsIGFkanVzdDogeyB5OiAxMiB9IH1cbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBfZGVzdHJveVRvb2x0aXAoKSB7XG4gICAgICAvLyBpZiBfc2V0dXBUb29sdGlwIGRvZXNuJ3QgZG8gYW55dGhpbmcsIHRoaXMgaXMgYSBub29wXG4gICAgICBpZiAodGhpcy4kdGFyZ2V0KSB7XG4gICAgICAgIHRoaXMuJHRhcmdldC5xdGlwKCdkZXN0cm95JywgdHJ1ZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZW5kZXIoKSB7XG4gICAgICAvLyBGSVhNRSAtIEZpZ3VyZSBvdXQgd2h5IHdlIGxvc2UgdGhlIGZpeGVkLWRhdGEtdGFibGUgY2xhc3NOYW1lXG4gICAgICAvLyBMb3NpbmcgdGhlIGZpeGVkLWRhdGEtdGFibGUgY2xhc3NOYW1lIGZvciBzb21lIHJlYXNvbi4uLiBhZGRpbmcgaXQgYmFjay5cbiAgICAgIHZhciBjaGlsZCA9IFJlYWN0LkNoaWxkcmVuLm9ubHkodGhpcy5wcm9wcy5jaGlsZHJlbik7XG4gICAgICBjaGlsZC5wcm9wcy5jbGFzc05hbWUgKz0gXCIgcHVibGljX2ZpeGVkRGF0YVRhYmxlQ2VsbF9jZWxsQ29udGVudFwiO1xuICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgLy9yZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGRhdGFzZXRDZWxsUmVuZGVyZXIoYXR0cmlidXRlLCBhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVzLCBpbmRleCwgY29sdW1uRGF0YSwgd2lkdGgsIGRlZmF1bHRSZW5kZXJlcikge1xuICAgIHZhciByZWFjdEVsZW1lbnQgPSBkZWZhdWx0UmVuZGVyZXIoYXR0cmlidXRlLCBhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVzLCBpbmRleCwgY29sdW1uRGF0YSwgd2lkdGgpO1xuXG4gICAgaWYgKGF0dHJpYnV0ZS5nZXQoJ25hbWUnKSA9PT0gJ3ByaW1hcnlfa2V5Jykge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFRvb2x0aXBcbiAgICAgICAgICB0ZXh0PXthdHRyaWJ1dGVzLmdldCgnZGVzY3JpcHRpb24nKS5nZXQoJ3ZhbHVlJyl9XG4gICAgICAgICAgd2lkdGg9e3dpZHRofVxuICAgICAgICA+e3JlYWN0RWxlbWVudH08L1Rvb2x0aXA+XG4gICAgICApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiByZWFjdEVsZW1lbnQ7XG4gICAgfVxuICB9XG5cbiAgbnMuRGF0YXNldFJlY29yZCA9IERhdGFzZXRSZWNvcmQ7XG4gIG5zLmRhdGFzZXRDZWxsUmVuZGVyZXIgPSBkYXRhc2V0Q2VsbFJlbmRlcmVyO1xufSk7XG4iXX0=
