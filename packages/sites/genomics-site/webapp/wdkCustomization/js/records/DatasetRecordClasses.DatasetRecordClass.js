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
      this._setupTooltip();
    },
    componentDidUpdate:function() {
      this._setupTooltip();
    },
    componentWillUnmount:function() {
      // if _setupTooltip doesn't do anything, this is a noop
      $(this.getDOMNode()).qtip('destroy', true);
    },
    _setupTooltip:function() {
      if (this.props.text == null) return;

      var text = ("<div style=\"max-height: 200px; overflow-y: auto; padding: 2px;\">" + this.props.text + "</div>");
      $(this.getDOMNode()).wdkTooltip({
        overwrite: true,
        content: { text:text },
        position: { viewport: false },
        show: { delay: 1000 }
      });
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
        React.createElement(Tooltip, {text: attributes.get('description').get('value')}, reactElement)
      );
    }
    else {
      return reactElement;
    }
  }

  ns.DatasetRecord = DatasetRecord;
  ns.datasetCellRenderer = datasetCellRenderer;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWQuanMiLCJzb3VyY2VzIjpbbnVsbF0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHdCQUF3QjtBQUN4Qiw4Q0FBOEM7O0FBRTlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsR0FBRzs7QUFFSCxHQUFHLENBQUMsU0FBUyxDQUFDLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUM7QUFDaEQsRUFBRSxZQUFZLENBQUM7O0FBRWYsRUFBRSxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO0FBQ3hCOztFQUVFLElBQUksVUFBVSxHQUFHLFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUNoRCxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNsQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUNqQyxJQUFJLEtBQUssR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDMUQsT0FBTyxLQUFLLEtBQUssb0JBQUEsR0FBRSxFQUFBLENBQUEsQ0FBQyxNQUFBLEVBQU0sQ0FBRSxTQUFTLEdBQUcsUUFBUSxHQUFHLE9BQU8sRUFBQyxDQUFDLElBQUEsRUFBSSxDQUFFLEtBQUssQ0FBQyxDQUFDLENBQUcsQ0FBQSxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQU0sQ0FBQSxLQUFLLElBQUksQ0FBQztBQUN4RyxHQUFHLENBQUM7O0VBRUYsSUFBSSx3QkFBd0IsR0FBRyxTQUFTLHdCQUF3QixDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzdFLElBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztNQUMvQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksYUFBYSxDQUFDO0tBQ3pD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Q0FBQyxDQUFDOztJQUVuRyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssYUFBYSxFQUFFO01BQzNDO1FBQ0Usb0JBQUMsT0FBTyxFQUFBLENBQUEsQ0FBQyxJQUFBLEVBQUksQ0FBRSxVQUFVLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUcsQ0FBQSxFQUFDLFlBQXVCLENBQUE7UUFDbkY7S0FDSDtTQUNJO01BQ0gsT0FBTyxZQUFZLENBQUM7S0FDckI7QUFDTCxHQUFHOztFQUVELEVBQUUsQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0VBQ2pDLEVBQUUsQ0FBQyxtQkFBbUIsR0FBRyxtQkFBbUIsQ0FBQztDQUM5QyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBnbG9iYWwgXywgV2RrLCB3ZGsgKi9cbi8qIGpzaGludCBlc25leHQ6IHRydWUsIGVxbnVsbDogdHJ1ZSwgLVcwMTQgKi9cblxuLyoqXG4gKiBUaGlzIGZpbGUgcHJvdmlkZXMgYSBjdXN0b20gUmVjb3JkIENvbXBvbmVudCB3aGljaCBpcyB1c2VkIGJ5IHRoZSBuZXcgV2RrXG4gKiBGbHV4IGFyY2hpdGVjdHVyZS5cbiAqXG4gKiBUaGUgc2libGluZyBmaWxlIERhdGFzZXRSZWNvcmRDbGFzc2VzLkRhdGFzZXRSZWNvcmRDbGFzcy5qcyBpcyBnZW5lcmF0ZWRcbiAqIGZyb20gdGhpcyBmaWxlIHVzaW5nIHRoZSBqc3ggY29tcGlsZXIuIEV2ZW50dWFsbHksIHRoaXMgZmlsZSB3aWxsIGJlXG4gKiBjb21waWxlZCBkdXJpbmcgYnVpbGQgdGltZS0tdGhpcyBpcyBhIHNob3J0LXRlcm0gc29sdXRpb24uXG4gKlxuICogYHdka2AgaXMgdGhlIGxlZ2FjeSBnbG9iYWwgb2JqZWN0LCBhbmQgYFdka2AgaXMgdGhlIG5ldyBnbG9iYWwgb2JqZWN0XG4gKi9cblxud2RrLm5hbWVzcGFjZSgnZXVwYXRoZGIucmVjb3JkcycsIGZ1bmN0aW9uKG5zKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBSZWFjdCA9IFdkay5SZWFjdDtcblxuICAvLyBmb3JtYXQgaXMge3RleHR9KHtsaW5rfSlcbiAgdmFyIGZvcm1hdExpbmsgPSBmdW5jdGlvbiBmb3JtYXRMaW5rKGxpbmssIG9wdHMpIHtcbiAgICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgICB2YXIgbmV3V2luZG93ID0gISFvcHRzLm5ld1dpbmRvdztcbiAgICB2YXIgbWF0Y2ggPSAvKC4qKVxcKCguKilcXCkvLmV4ZWMobGluay5yZXBsYWNlKC9cXG4vZywgJyAnKSk7XG4gICAgcmV0dXJuIG1hdGNoID8gKCA8YSB0YXJnZXQ9e25ld1dpbmRvdyA/ICdfYmxhbmsnIDogJ19zZWxmJ30gaHJlZj17bWF0Y2hbMl19PnttYXRjaFsxXX08L2E+ICkgOiBudWxsO1xuICB9O1xuXG4gIHZhciByZW5kZXJQcmltYXJ5UHVibGljYXRpb24gPSBmdW5jdGlvbiByZW5kZXJQcmltYXJ5UHVibGljYXRpb24ocHVibGljYXRpb24pIHtcbiAgICB2YXIgcHVibWVkTGluayA9IHB1YmxpY2F0aW9uLmZpbmQoZnVuY3Rpb24ocHViKSB7XG4gICAgICByZXR1cm4gcHViLmdldCgnbmFtZScpID09ICdwdWJtZWRfbGluayc7XG4gICAgfSk7XG4gICAgcmV0dXJuIGZvcm1hdExpbmsocHVibWVkTGluay5nZXQoJ3ZhbHVlJyksIHsgbmV3V2luZG93OiB0cnVlIH0pO1xuICB9O1xuXG4gIHZhciByZW5kZXJQcmltYXJ5Q29udGFjdCA9IGZ1bmN0aW9uIHJlbmRlclByaW1hcnlDb250YWN0KGNvbnRhY3QsIGluc3RpdHV0aW9uKSB7XG4gICAgcmV0dXJuIGNvbnRhY3QgKyAnLCAnICsgaW5zdGl0dXRpb247XG4gIH07XG5cbiAgdmFyIHJlbmRlclNvdXJjZVZlcnNpb24gPSBmdW5jdGlvbih2ZXJzaW9uKSB7XG4gICAgdmFyIG5hbWUgPSB2ZXJzaW9uLmZpbmQodiA9PiB2LmdldCgnbmFtZScpID09PSAndmVyc2lvbicpO1xuICAgIHJldHVybiAoXG4gICAgICBuYW1lLmdldCgndmFsdWUnKSArICcgKFRoZSBkYXRhIHByb3ZpZGVyXFwncyB2ZXJzaW9uIG51bWJlciBvciBwdWJsaWNhdGlvbiBkYXRlLCBmcm9tJyArXG4gICAgICAnIHRoZSBzaXRlIHRoZSBkYXRhIHdhcyBhY3F1aXJlZC4gSW4gdGhlIHJhcmUgY2FzZSBuZWl0aGVyIGlzIGF2YWlsYWJsZSwnICtcbiAgICAgICcgdGhlIGRvd25sb2FkIGRhdGUuKSdcbiAgICApO1xuICB9O1xuXG4gIHZhciBPcmdhbmlzbXMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyKCkge1xuICAgICAgdmFyIHsgb3JnYW5pc21zIH0gPSB0aGlzLnByb3BzO1xuICAgICAgaWYgKCFvcmdhbmlzbXMpIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aDM+T3JnYW5pc21zIHRoaXMgZGF0YSBzZXQgaXMgbWFwcGVkIHRvIGluIFBsYXNtb0RCPC9oMz5cbiAgICAgICAgICA8dWw+e29yZ2FuaXNtcy5zcGxpdCgvLFxccyovKS5tYXAodGhpcy5fcmVuZGVyT3JnYW5pc20pLnRvQXJyYXkoKX08L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSxcblxuICAgIF9yZW5kZXJPcmdhbmlzbShvcmdhbmlzbSwgaW5kZXgpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaSBrZXk9e2luZGV4fT48aT57b3JnYW5pc219PC9pPjwvbGk+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIFNlYXJjaGVzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciBsaW5rcyA9IHRoaXMucHJvcHMubGlua3M7XG4gICAgICB2YXIgc2VhcmNoZXMgPSB0aGlzLnByb3BzLnNlYXJjaGVzLmdldCgncm93cycpLmZpbHRlcih0aGlzLl9yb3dJc1F1ZXN0aW9uKTtcblxuICAgICAgaWYgKHNlYXJjaGVzLnNpemUgPT09IDAgJiYgbGlua3MuZ2V0KCdyb3dzJykuc2l6ZSA9PT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGgzPlNlYXJjaCBvciB2aWV3IHRoaXMgZGF0YSBzZXQgaW4gUGxhc21vREI8L2gzPlxuICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgIHtzZWFyY2hlcy5tYXAodGhpcy5fcmVuZGVyU2VhcmNoKS50b0FycmF5KCl9XG4gICAgICAgICAgICB7bGlua3MuZ2V0KCdyb3dzJykubWFwKHRoaXMuX3JlbmRlckxpbmspLnRvQXJyYXkoKX1cbiAgICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSxcblxuICAgIF9yb3dJc1F1ZXN0aW9uKHJvdykge1xuICAgICAgdmFyIHR5cGUgPSByb3cuZmluZChhdHRyID0+IGF0dHIuZ2V0KCduYW1lJykgPT0gJ3RhcmdldF90eXBlJyk7XG4gICAgICByZXR1cm4gdHlwZSAmJiB0eXBlLmdldCgndmFsdWUnKSA9PSAncXVlc3Rpb24nO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyU2VhcmNoKHNlYXJjaCwgaW5kZXgpIHtcbiAgICAgIHZhciBuYW1lID0gc2VhcmNoLmZpbmQoYXR0ciA9PiBhdHRyLmdldCgnbmFtZScpID09ICd0YXJnZXRfbmFtZScpLmdldCgndmFsdWUnKTtcbiAgICAgIHZhciBxdWVzdGlvbiA9IHRoaXMucHJvcHMucXVlc3Rpb25zLmZpbmQocSA9PiBxLmdldCgnbmFtZScpID09PSBuYW1lKTtcblxuICAgICAgaWYgKHF1ZXN0aW9uID09IG51bGwpIHJldHVybiBudWxsO1xuXG4gICAgICB2YXIgcmVjb3JkQ2xhc3MgPSB0aGlzLnByb3BzLnJlY29yZENsYXNzZXMuZmluZChyID0+IHIuZ2V0KCdmdWxsTmFtZScpID09PSBxdWVzdGlvbi5nZXQoJ2NsYXNzJykpO1xuICAgICAgdmFyIHNlYXJjaE5hbWUgPSBgSWRlbnRpZnkgJHtyZWNvcmRDbGFzcy5nZXQoJ2Rpc3BsYXlOYW1lUGx1cmFsJyl9IGJ5ICR7cXVlc3Rpb24uZ2V0KCdkaXNwbGF5TmFtZScpfWA7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGkga2V5PXtpbmRleH0+XG4gICAgICAgICAgPGEgaHJlZj17Jy9hL3Nob3dRdWVzdGlvbi5kbz9xdWVzdGlvbkZ1bGxOYW1lPScgKyBuYW1lfT57c2VhcmNoTmFtZX08L2E+XG4gICAgICAgIDwvbGk+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyTGluayhsaW5rLCBpbmRleCkge1xuICAgICAgdmFyIGh5cGVyTGluayA9IGxpbmsuZmluZChhdHRyID0+IGF0dHIuZ2V0KCduYW1lJykgPT0gJ2h5cGVyX2xpbmsnKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaSBrZXk9e2luZGV4fT57Zm9ybWF0TGluayhoeXBlckxpbmsuZ2V0KCd2YWx1ZScpKX08L2xpPlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBMaW5rcyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyBsaW5rcyB9ID0gdGhpcy5wcm9wcztcblxuICAgICAgaWYgKGxpbmtzLmdldCgncm93cycpLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoMz5FeHRlcm5hbCBMaW5rczwvaDM+XG4gICAgICAgICAgPHVsPiB7bGlua3MuZ2V0KCdyb3dzJykubWFwKHRoaXMuX3JlbmRlckxpbmspLnRvQXJyYXkoKX0gPC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyTGluayhsaW5rLCBpbmRleCkge1xuICAgICAgdmFyIGh5cGVyTGluayA9IGxpbmsuZmluZChhdHRyID0+IGF0dHIuZ2V0KCduYW1lJykgPT0gJ2h5cGVyX2xpbmsnKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaSBrZXk9e2luZGV4fT57Zm9ybWF0TGluayhoeXBlckxpbmsuZ2V0KCd2YWx1ZScpKX08L2xpPlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBDb250YWN0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyBjb250YWN0cyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGlmIChjb250YWN0cy5nZXQoJ3Jvd3MnKS5zaXplID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGg0PkNvbnRhY3RzPC9oND5cbiAgICAgICAgICA8dWw+XG4gICAgICAgICAgICB7Y29udGFjdHMuZ2V0KCdyb3dzJykubWFwKHRoaXMuX3JlbmRlckNvbnRhY3QpLnRvQXJyYXkoKX1cbiAgICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSxcblxuICAgIF9yZW5kZXJDb250YWN0KGNvbnRhY3QsIGluZGV4KSB7XG4gICAgICB2YXIgY29udGFjdF9uYW1lID0gY29udGFjdC5maW5kKGMgPT4gYy5nZXQoJ25hbWUnKSA9PSAnY29udGFjdF9uYW1lJyk7XG4gICAgICB2YXIgYWZmaWxpYXRpb24gPSBjb250YWN0LmZpbmQoYyA9PiBjLmdldCgnbmFtZScpID09ICdhZmZpbGlhdGlvbicpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGxpIGtleT17aW5kZXh9Pntjb250YWN0X25hbWUuZ2V0KCd2YWx1ZScpfSwge2FmZmlsaWF0aW9uLmdldCgndmFsdWUnKX08L2xpPlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBQdWJsaWNhdGlvbnMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyKCkge1xuICAgICAgdmFyIHsgcHVibGljYXRpb25zIH0gPSB0aGlzLnByb3BzO1xuICAgICAgdmFyIHJvd3MgPSBwdWJsaWNhdGlvbnMuZ2V0KCdyb3dzJyk7XG4gICAgICBpZiAocm93cy5zaXplID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGg0PlB1YmxpY2F0aW9uczwvaDQ+XG4gICAgICAgICAgPHVsPntyb3dzLm1hcCh0aGlzLl9yZW5kZXJQdWJsaWNhdGlvbikudG9BcnJheSgpfTwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3JlbmRlclB1YmxpY2F0aW9uKHB1YmxpY2F0aW9uLCBpbmRleCkge1xuICAgICAgdmFyIHB1Ym1lZF9saW5rID0gcHVibGljYXRpb24uZmluZChwID0+IHAuZ2V0KCduYW1lJykgPT0gJ3B1Ym1lZF9saW5rJyk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGkga2V5PXtpbmRleH0+e2Zvcm1hdExpbmsocHVibWVkX2xpbmsuZ2V0KCd2YWx1ZScpKX08L2xpPlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBDb250YWN0c0FuZFB1YmxpY2F0aW9ucyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyBjb250YWN0cywgcHVibGljYXRpb25zIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgICBpZiAoY29udGFjdHMuZ2V0KCdyb3dzJykuc2l6ZSA9PT0gMCAmJiBwdWJsaWNhdGlvbnMuZ2V0KCdyb3dzJykuc2l6ZSA9PT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGgzPkFkZGl0aW9uYWwgQ29udGFjdHMgYW5kIFB1YmxpY2F0aW9uczwvaDM+XG4gICAgICAgICAgPENvbnRhY3RzIGNvbnRhY3RzPXtjb250YWN0c30vPlxuICAgICAgICAgIDxQdWJsaWNhdGlvbnMgcHVibGljYXRpb25zPXtwdWJsaWNhdGlvbnN9Lz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIFJlbGVhc2VIaXN0b3J5ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IGhpc3RvcnkgfSA9IHRoaXMucHJvcHM7XG4gICAgICBpZiAoaGlzdG9yeS5nZXQoJ3Jvd3MnKS5zaXplID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGgzPkRhdGEgU2V0IFJlbGVhc2UgSGlzdG9yeTwvaDM+XG4gICAgICAgICAgPHRhYmxlPlxuICAgICAgICAgICAgPHRoZWFkPlxuICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgPHRoPkV1UGF0aERCIFJlbGVhc2U8L3RoPlxuICAgICAgICAgICAgICAgIDx0aD5HZW5vbWUgU291cmNlPC90aD5cbiAgICAgICAgICAgICAgICA8dGg+QW5ub3RhdGlvbiBTb3VyY2U8L3RoPlxuICAgICAgICAgICAgICAgIDx0aD5Ob3RlczwvdGg+XG4gICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICB7aGlzdG9yeS5nZXQoJ3Jvd3MnKS5tYXAodGhpcy5fcmVuZGVyUm93KS50b0FycmF5KCl9XG4gICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3JlbmRlclJvdyhhdHRyaWJ1dGVzKSB7XG4gICAgICB2YXIgYXR0cnMgPSBfLmluZGV4QnkoYXR0cmlidXRlcy50b0pTKCksICduYW1lJyk7XG5cbiAgICAgIHZhciByZWxlYXNlID0gYXR0cnMuYnVpbGQudmFsdWUgPyAnUmVsZWFzZSAnICsgYXR0cnMuYnVpbGQudmFsdWVcbiAgICAgICAgOiAnSW5pdGlhbCByZWxlYXNlJztcblxuICAgICAgdmFyIHJlbGVhc2VEYXRlID0gbmV3IERhdGUoYXR0cnMucmVsZWFzZV9kYXRlLnZhbHVlKVxuICAgICAgICAudG9EYXRlU3RyaW5nKClcbiAgICAgICAgLnNwbGl0KCcgJylcbiAgICAgICAgLnNsaWNlKDEpXG4gICAgICAgIC5qb2luKCcgJyk7XG5cbiAgICAgIHZhciBnZW5vbWVTb3VyY2UgPSBhdHRycy5nZW5vbWVfc291cmNlLnZhbHVlXG4gICAgICAgID8gYXR0cnMuZ2Vub21lX3NvdXJjZS52YWx1ZSArICcgKCcgKyBhdHRycy5nZW5vbWVfdmVyc2lvbi52YWx1ZSArICcpJ1xuICAgICAgICA6ICcnO1xuXG4gICAgICB2YXIgYW5ub3RhdGlvblNvdXJjZSA9IGF0dHJzLmFubm90YXRpb25fc291cmNlLnZhbHVlXG4gICAgICAgID8gYXR0cnMuYW5ub3RhdGlvbl9zb3VyY2UudmFsdWUgKyAnICgnICsgYXR0cnMuYW5ub3RhdGlvbl92ZXJzaW9uLnZhbHVlICsgJyknXG4gICAgICAgIDogJyc7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQ+e3JlbGVhc2V9ICh7cmVsZWFzZURhdGV9LCB7YXR0cnMucHJvamVjdC52YWx1ZX0ge2F0dHJzLnJlbGVhc2VfbnVtYmVyLnZhbHVlfSk8L3RkPlxuICAgICAgICAgIDx0ZD57Z2Vub21lU291cmNlfTwvdGQ+XG4gICAgICAgICAgPHRkPnthbm5vdGF0aW9uU291cmNlfTwvdGQ+XG4gICAgICAgICAgPHRkPnthdHRycy5ub3RlLnZhbHVlfTwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIFZlcnNpb25zID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IHZlcnNpb25zIH0gPSB0aGlzLnByb3BzO1xuICAgICAgdmFyIHJvd3MgPSB2ZXJzaW9ucy5nZXQoJ3Jvd3MnKTtcblxuICAgICAgaWYgKHJvd3Muc2l6ZSA9PT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGgzPlZlcnNpb248L2gzPlxuICAgICAgICAgIDxwPlxuICAgICAgICAgICAgVGhlIGRhdGEgc2V0IHZlcnNpb24gc2hvd24gaGVyZSBpcyB0aGUgZGF0YSBwcm92aWRlcidzIHZlcnNpb25cbiAgICAgICAgICAgIG51bWJlciBvciBwdWJsaWNhdGlvbiBkYXRlIGluZGljYXRlZCBvbiB0aGUgc2l0ZSBmcm9tIHdoaWNoIHdlXG4gICAgICAgICAgICBkb3dubG9hZGVkIHRoZSBkYXRhLiBJbiB0aGUgcmFyZSBjYXNlIHRoYXQgdGhlc2UgYXJlIG5vdCBhdmFpbGFibGUsXG4gICAgICAgICAgICB0aGUgdmVyc2lvbiBpcyB0aGUgZGF0ZSB0aGF0IHRoZSBkYXRhIHNldCB3YXMgZG93bmxvYWRlZC5cbiAgICAgICAgICA8L3A+XG4gICAgICAgICAgPHRhYmxlPlxuICAgICAgICAgICAgPHRoZWFkPlxuICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgPHRoPk9yZ2FuaXNtPC90aD5cbiAgICAgICAgICAgICAgICA8dGg+UHJvdmlkZXIncyBWZXJzaW9uPC90aD5cbiAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgIHtyb3dzLm1hcCh0aGlzLl9yZW5kZXJSb3cpLnRvQXJyYXkoKX1cbiAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyUm93KGF0dHJpYnV0ZXMpIHtcbiAgICAgIHZhciBhdHRycyA9IF8uaW5kZXhCeShhdHRyaWJ1dGVzLnRvSlMoKSwgJ25hbWUnKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQ+e2F0dHJzLm9yZ2FuaXNtLnZhbHVlfTwvdGQ+XG4gICAgICAgICAgPHRkPnthdHRycy52ZXJzaW9uLnZhbHVlfTwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIEdyYXBocyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyBncmFwaHMgfSA9IHRoaXMucHJvcHM7XG4gICAgICB2YXIgcm93cyA9IGdyYXBocy5nZXQoJ3Jvd3MnKTtcbiAgICAgIGlmIChyb3dzLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aDM+RXhhbXBsZSBHcmFwaHM8L2gzPlxuICAgICAgICAgIDx1bD57cm93cy5tYXAodGhpcy5fcmVuZGVyR3JhcGgpLnRvQXJyYXkoKX08L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSxcblxuICAgIF9yZW5kZXJHcmFwaChncmFwaCwgaW5kZXgpIHtcbiAgICAgIHZhciBnID0gXy5pbmRleEJ5KGdyYXBoLnRvSlMoKSwgJ25hbWUnKTtcbiAgICAgIHZhciB1cmwgPSAnL2NnaS1iaW4vZGF0YVBsb3R0ZXIucGwnICtcbiAgICAgICAgJz90eXBlPScgKyBnLm1vZHVsZS52YWx1ZSArXG4gICAgICAgICcmcHJvamVjdF9pZD0nICsgZy5wcm9qZWN0X2lkLnZhbHVlICtcbiAgICAgICAgJyZkYXRhc2V0PScgKyBnLmRhdGFzZXRfbmFtZS52YWx1ZSArXG4gICAgICAgICcmdGVtcGxhdGU9MSZmbXQ9cG5nJmlkPScgKyBnLmdyYXBoX2lkcy52YWx1ZTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaSBrZXk9e2luZGV4fT48aW1nIHNyYz17dXJsfS8+PC9saT5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgRGF0YXNldFJlY29yZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyByZWNvcmQsIHF1ZXN0aW9ucywgcmVjb3JkQ2xhc3NlcyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIHZhciBhdHRyaWJ1dGVzID0gcmVjb3JkLmdldCgnYXR0cmlidXRlcycpO1xuICAgICAgdmFyIHRhYmxlcyA9IHJlY29yZC5nZXQoJ3RhYmxlcycpO1xuICAgICAgdmFyIHRpdGxlQ2xhc3MgPSAnZXVwYXRoZGItRGF0YXNldFJlY29yZC10aXRsZSc7XG5cbiAgICAgIHZhciBpZCA9IHJlY29yZC5nZXQoJ2lkJyk7XG4gICAgICB2YXIgc3VtbWFyeSA9IGF0dHJpYnV0ZXMuZ2V0SW4oWydzdW1tYXJ5JywgJ3ZhbHVlJ10pO1xuICAgICAgdmFyIHJlbGVhc2VJbmZvID0gYXR0cmlidXRlcy5nZXRJbihbJ2J1aWxkX251bWJlcl9pbnRyb2R1Y2VkJywgJ3ZhbHVlJ10pO1xuICAgICAgdmFyIHByaW1hcnlQdWJsaWNhdGlvbiA9IHRhYmxlcy5nZXRJbihbJ1B1YmxpY2F0aW9ucycsICdyb3dzJywgMF0pO1xuICAgICAgdmFyIGNvbnRhY3QgPSBhdHRyaWJ1dGVzLmdldEluKFsnY29udGFjdCcsICd2YWx1ZSddKTtcbiAgICAgIHZhciBpbnN0aXR1dGlvbiA9IGF0dHJpYnV0ZXMuZ2V0SW4oWydpbnN0aXR1dGlvbicsICd2YWx1ZSddKTtcbiAgICAgIHZhciB2ZXJzaW9uID0gYXR0cmlidXRlcy5nZXRJbihbJ1ZlcnNpb24nLCAncm93cycsIDBdKTtcbiAgICAgIHZhciBvcmdhbmlzbXMgPSBhdHRyaWJ1dGVzLmdldEluKFsnb3JnYW5pc21zJywgJ3ZhbHVlJ10pO1xuICAgICAgdmFyIFJlZmVyZW5jZXMgPSB0YWJsZXMuZ2V0KCdSZWZlcmVuY2VzJyk7XG4gICAgICB2YXIgSHlwZXJMaW5rcyA9IHRhYmxlcy5nZXQoJ0h5cGVyTGlua3MnKTtcbiAgICAgIHZhciBDb250YWN0cyA9IHRhYmxlcy5nZXQoJ0NvbnRhY3RzJyk7XG4gICAgICB2YXIgUHVibGljYXRpb25zID0gdGFibGVzLmdldCgnUHVibGljYXRpb25zJyk7XG4gICAgICB2YXIgZGVzY3JpcHRpb24gPSBhdHRyaWJ1dGVzLmdldEluKFsnZGVzY3JpcHRpb24nLCAndmFsdWUnXSk7XG4gICAgICB2YXIgR2Vub21lSGlzdG9yeSA9IHRhYmxlcy5nZXQoJ0dlbm9tZUhpc3RvcnknKTtcbiAgICAgIHZhciBWZXJzaW9uID0gdGFibGVzLmdldCgnVmVyc2lvbicpO1xuICAgICAgdmFyIEV4YW1wbGVHcmFwaHMgPSB0YWJsZXMuZ2V0KCdFeGFtcGxlR3JhcGhzJyk7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXVwYXRoZGItRGF0YXNldFJlY29yZFwiPlxuICAgICAgICAgIDxoMSBkYW5nZXJvdXNseVNldElubmVySFRNTD17e1xuICAgICAgICAgICAgX19odG1sOiAnRGF0YSBTZXQ6IDxzcGFuIGNsYXNzPVwiJyArIHRpdGxlQ2xhc3MgKyAnXCI+JyArIGlkICsgJzwvc3Bhbj4nXG4gICAgICAgICAgfX0vPlxuXG4gICAgICAgICAgPGhyLz5cblxuICAgICAgICAgIDx0YWJsZSBjbGFzc05hbWU9XCJldXBhdGhkYi1EYXRhc2V0UmVjb3JkLWhlYWRlclRhYmxlXCI+XG4gICAgICAgICAgICA8dGJvZHk+XG5cbiAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgIDx0aD5TdW1tYXJ5OjwvdGg+XG4gICAgICAgICAgICAgICAgPHRkIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBzdW1tYXJ5fX0vPlxuICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICB7cHJpbWFyeVB1YmxpY2F0aW9uID8gKFxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgIDx0aD5QcmltYXJ5IHB1YmxpY2F0aW9uOjwvdGg+XG4gICAgICAgICAgICAgICAgICA8dGQ+e3JlbmRlclByaW1hcnlQdWJsaWNhdGlvbihwcmltYXJ5UHVibGljYXRpb24pfTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICAgICAge2NvbnRhY3QgJiYgaW5zdGl0dXRpb24gPyAoXG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgPHRoPlByaW1hcnkgY29udGFjdDo8L3RoPlxuICAgICAgICAgICAgICAgICAgPHRkPntyZW5kZXJQcmltYXJ5Q29udGFjdChjb250YWN0LCBpbnN0aXR1dGlvbil9PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgICAgICB7dmVyc2lvbiA/IChcbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICA8dGg+U291cmNlIHZlcnNpb246PC90aD5cbiAgICAgICAgICAgICAgICAgIDx0ZD57cmVuZGVyU291cmNlVmVyc2lvbih2ZXJzaW9uKX08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAgICAgIHtyZWxlYXNlSW5mbyA/IChcbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICA8dGg+RXVQYXRoREIgcmVsZWFzZTo8L3RoPlxuICAgICAgICAgICAgICAgICAgPHRkPntyZWxlYXNlSW5mb308L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgIDwvdGFibGU+XG5cbiAgICAgICAgICA8aHIvPlxuXG4gICAgICAgICAgPE9yZ2FuaXNtcyBvcmdhbmlzbXM9e29yZ2FuaXNtc30vPlxuXG4gICAgICAgICAgPFNlYXJjaGVzIHNlYXJjaGVzPXtSZWZlcmVuY2VzfSBsaW5rcz17SHlwZXJMaW5rc30gcXVlc3Rpb25zPXtxdWVzdGlvbnN9IHJlY29yZENsYXNzZXM9e3JlY29yZENsYXNzZXN9Lz5cblxuICAgICAgICAgIDxMaW5rcyBsaW5rcz17SHlwZXJMaW5rc30vPlxuXG4gICAgICAgICAgPGgzPkRldGFpbGVkIERlc2NyaXB0aW9uPC9oMz5cbiAgICAgICAgICA8ZGl2IGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBkZXNjcmlwdGlvbn19Lz5cblxuICAgICAgICAgIDxDb250YWN0c0FuZFB1YmxpY2F0aW9ucyBjb250YWN0cz17Q29udGFjdHN9IHB1YmxpY2F0aW9ucz17UHVibGljYXRpb25zfS8+XG5cbiAgICAgICAgICA8UmVsZWFzZUhpc3RvcnkgaGlzdG9yeT17R2Vub21lSGlzdG9yeX0vPlxuXG4gICAgICAgICAgPFZlcnNpb25zIHZlcnNpb25zPXtWZXJzaW9ufS8+XG5cbiAgICAgICAgICA8R3JhcGhzIGdyYXBocz17RXhhbXBsZUdyYXBoc30vPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgVG9vbHRpcCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgIHRoaXMuX3NldHVwVG9vbHRpcCgpO1xuICAgIH0sXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgICAgdGhpcy5fc2V0dXBUb29sdGlwKCk7XG4gICAgfSxcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgIC8vIGlmIF9zZXR1cFRvb2x0aXAgZG9lc24ndCBkbyBhbnl0aGluZywgdGhpcyBpcyBhIG5vb3BcbiAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLnF0aXAoJ2Rlc3Ryb3knLCB0cnVlKTtcbiAgICB9LFxuICAgIF9zZXR1cFRvb2x0aXAoKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy50ZXh0ID09IG51bGwpIHJldHVybjtcblxuICAgICAgdmFyIHRleHQgPSBgPGRpdiBzdHlsZT1cIm1heC1oZWlnaHQ6IDIwMHB4OyBvdmVyZmxvdy15OiBhdXRvOyBwYWRkaW5nOiAycHg7XCI+JHt0aGlzLnByb3BzLnRleHR9PC9kaXY+YDtcbiAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLndka1Rvb2x0aXAoe1xuICAgICAgICBvdmVyd3JpdGU6IHRydWUsXG4gICAgICAgIGNvbnRlbnQ6IHsgdGV4dCB9LFxuICAgICAgICBwb3NpdGlvbjogeyB2aWV3cG9ydDogZmFsc2UgfSxcbiAgICAgICAgc2hvdzogeyBkZWxheTogMTAwMCB9XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHJlbmRlcigpIHtcbiAgICAgIC8vIEZJWE1FIC0gRmlndXJlIG91dCB3aHkgd2UgbG9zZSB0aGUgZml4ZWQtZGF0YS10YWJsZSBjbGFzc05hbWVcbiAgICAgIC8vIExvc2luZyB0aGUgZml4ZWQtZGF0YS10YWJsZSBjbGFzc05hbWUgZm9yIHNvbWUgcmVhc29uLi4uIGFkZGluZyBpdCBiYWNrLlxuICAgICAgdmFyIGNoaWxkID0gUmVhY3QuQ2hpbGRyZW4ub25seSh0aGlzLnByb3BzLmNoaWxkcmVuKTtcbiAgICAgIGNoaWxkLnByb3BzLmNsYXNzTmFtZSArPSBcIiBwdWJsaWNfZml4ZWREYXRhVGFibGVDZWxsX2NlbGxDb250ZW50XCI7XG4gICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICAvL3JldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gZGF0YXNldENlbGxSZW5kZXJlcihhdHRyaWJ1dGUsIGF0dHJpYnV0ZU5hbWUsIGF0dHJpYnV0ZXMsIGluZGV4LCBjb2x1bW5EYXRhLCB3aWR0aCwgZGVmYXVsdFJlbmRlcmVyKSB7XG4gICAgdmFyIHJlYWN0RWxlbWVudCA9IGRlZmF1bHRSZW5kZXJlcihhdHRyaWJ1dGUsIGF0dHJpYnV0ZU5hbWUsIGF0dHJpYnV0ZXMsIGluZGV4LCBjb2x1bW5EYXRhLCB3aWR0aCk7XG5cbiAgICBpZiAoYXR0cmlidXRlLmdldCgnbmFtZScpID09PSAncHJpbWFyeV9rZXknKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8VG9vbHRpcCB0ZXh0PXthdHRyaWJ1dGVzLmdldCgnZGVzY3JpcHRpb24nKS5nZXQoJ3ZhbHVlJyl9PntyZWFjdEVsZW1lbnR9PC9Ub29sdGlwPlxuICAgICAgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gcmVhY3RFbGVtZW50O1xuICAgIH1cbiAgfVxuXG4gIG5zLkRhdGFzZXRSZWNvcmQgPSBEYXRhc2V0UmVjb3JkO1xuICBucy5kYXRhc2V0Q2VsbFJlbmRlcmVyID0gZGF0YXNldENlbGxSZW5kZXJlcjtcbn0pO1xuIl19
