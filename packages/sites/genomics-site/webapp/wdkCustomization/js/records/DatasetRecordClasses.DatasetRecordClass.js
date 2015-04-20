"use strict";

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

wdk.namespace("eupathdb.records", function (ns) {
  "use strict";

  var React = Wdk.React;

  // Use Element.innerText to strip XML
  function stripXML(str) {
    var div = document.createElement("div");
    div.innerHTML = str;
    return div.textContent;
  }

  // format is {text}({link})
  var formatLink = function formatLink(link, opts) {
    opts = opts || {};
    var newWindow = !!opts.newWindow;
    return React.createElement(
      "a",
      { href: link.url, target: newWindow ? "_blank" : "_self" },
      stripXML(link.displayText)
    );
  };

  var renderPrimaryPublication = function renderPrimaryPublication(publication) {
    var pubmedLink = publication.find(function (pub) {
      return pub.name == "pubmed_link";
    });
    return formatLink(pubmedLink.value, { newWindow: true });
  };

  var renderPrimaryContact = function renderPrimaryContact(contact, institution) {
    return contact + ", " + institution;
  };

  var renderSourceVersion = function renderSourceVersion(version) {
    var name = version.find(function (v) {
      return v.name === "version";
    });
    return name.value + " (The data provider's version number or publication date, from" + " the site the data was acquired. In the rare case neither is available," + " the download date.)";
  };

  var Organisms = React.createClass({
    displayName: "Organisms",

    render: function render() {
      var organisms = this.props.organisms;

      if (!organisms) {
        return null;
      }return React.createElement(
        "div",
        null,
        React.createElement(
          "h2",
          null,
          "Organisms this data set is mapped to in PlasmoDB"
        ),
        React.createElement(
          "ul",
          null,
          organisms.split(/,\s*/).map(this._renderOrganism)
        )
      );
    },

    _renderOrganism: function _renderOrganism(organism, index) {
      return React.createElement(
        "li",
        { key: index },
        React.createElement(
          "i",
          null,
          organism
        )
      );
    }
  });

  var Searches = React.createClass({
    displayName: "Searches",

    render: function render() {
      var rows = this.props.searches.rows;
      rows.map(function (row) {
        return _.indexBy(row, "name");
      }).filter(this._rowIsQuestion);

      if (rows.length === 0) {
        return null;
      }return React.createElement(
        "div",
        null,
        React.createElement(
          "h2",
          null,
          "Search or view this data set in PlasmoDB"
        ),
        React.createElement(
          "ul",
          null,
          rows.map(this._renderSearch)
        )
      );
    },

    _rowIsQuestion: function _rowIsQuestion(row) {
      var target_type = row.target_type;
      return target_type && target_type.value == "question";
    },

    _renderSearch: function _renderSearch(row, index) {
      var name = row.find(function (attr) {
        return attr.name == "target_name";
      }).value;
      var question = this.props.questions.find(function (q) {
        return q.name === name;
      });

      if (question == null) {
        return null;
      }var recordClass = this.props.recordClasses.find(function (r) {
        return r.fullName === question["class"];
      });
      var searchName = "Identify " + recordClass.displayNamePlural + " by " + question.displayName;
      return React.createElement(
        "li",
        { key: index },
        React.createElement(
          "a",
          { href: "/a/showQuestion.do?questionFullName=" + name },
          searchName
        )
      );
    }
  });

  var Links = React.createClass({
    displayName: "Links",

    render: function render() {
      var links = this.props.links;

      if (links.rows.length === 0) {
        return null;
      }return React.createElement(
        "div",
        null,
        React.createElement(
          "h2",
          null,
          "Links"
        ),
        React.createElement(
          "ul",
          null,
          " ",
          links.rows.map(this._renderLink),
          " "
        )
      );
    },

    _renderLink: function _renderLink(link, index) {
      var hyperLink = link.find(function (attr) {
        return attr.name == "hyper_link";
      });
      return React.createElement(
        "li",
        { key: index },
        formatLink(hyperLink.value)
      );
    }
  });

  var Contacts = React.createClass({
    displayName: "Contacts",

    render: function render() {
      var contacts = this.props.contacts;

      if (contacts.rows.length === 0) {
        return null;
      }return React.createElement(
        "div",
        null,
        React.createElement(
          "h4",
          null,
          "Contacts"
        ),
        React.createElement(
          "ul",
          null,
          contacts.rows.map(this._renderContact)
        )
      );
    },

    _renderContact: function _renderContact(contact, index) {
      var contact_name = contact.find(function (c) {
        return c.name == "contact_name";
      });
      var affiliation = contact.find(function (c) {
        return c.name == "affiliation";
      });
      return React.createElement(
        "li",
        { key: index },
        contact_name.value,
        ", ",
        affiliation.value
      );
    }
  });

  var Publications = React.createClass({
    displayName: "Publications",

    render: function render() {
      var publications = this.props.publications;

      var rows = publications.rows;
      if (rows.length === 0) {
        return null;
      }return React.createElement(
        "div",
        null,
        React.createElement(
          "h4",
          null,
          "Publications"
        ),
        React.createElement(
          "ul",
          null,
          rows.map(this._renderPublication)
        )
      );
    },

    _renderPublication: function _renderPublication(publication, index) {
      var pubmed_link = publication.find(function (p) {
        return p.name == "pubmed_link";
      });
      return React.createElement(
        "li",
        { key: index },
        formatLink(pubmed_link.value)
      );
    }
  });

  var ContactsAndPublications = React.createClass({
    displayName: "ContactsAndPublications",

    render: function render() {
      var _props = this.props;
      var contacts = _props.contacts;
      var publications = _props.publications;

      if (contacts.rows.length === 0 && publications.rows.length === 0) {
        return null;
      }return React.createElement(
        "div",
        null,
        React.createElement(
          "h2",
          null,
          "Additional Contacts and Publications"
        ),
        React.createElement(Contacts, { contacts: contacts }),
        React.createElement(Publications, { publications: publications })
      );
    }
  });

  var ReleaseHistory = React.createClass({
    displayName: "ReleaseHistory",

    render: function render() {
      var history = this.props.history;

      if (history.rows.length === 0) {
        return null;
      }return React.createElement(
        "div",
        null,
        React.createElement(
          "h2",
          null,
          "Data Set Release History"
        ),
        React.createElement(
          "table",
          null,
          React.createElement(
            "thead",
            null,
            React.createElement(
              "tr",
              null,
              React.createElement(
                "th",
                null,
                "EuPathDB Release"
              ),
              React.createElement(
                "th",
                null,
                "Genome Source"
              ),
              React.createElement(
                "th",
                null,
                "Annotation Source"
              ),
              React.createElement(
                "th",
                null,
                "Notes"
              )
            )
          ),
          React.createElement(
            "tbody",
            null,
            history.rows.map(this._renderRow)
          )
        )
      );
    },

    _renderRow: function _renderRow(attributes) {
      var attrs = _.indexBy(attributes, "name");

      var releaseDate = attrs.release_date.value.split(/\s+/)[0];

      var release = attrs.build.value == 0 ? "Initial release" : "" + attrs.project.value + " " + attrs.release_number.value + " " + releaseDate;

      var genomeSource = attrs.genome_source.value ? attrs.genome_source.value + " (" + attrs.genome_version.value + ")" : "";

      var annotationSource = attrs.annotation_source.value ? attrs.annotation_source.value + " (" + attrs.annotation_version.value + ")" : "";

      return React.createElement(
        "tr",
        null,
        React.createElement(
          "td",
          null,
          release
        ),
        React.createElement(
          "td",
          null,
          genomeSource
        ),
        React.createElement(
          "td",
          null,
          annotationSource
        ),
        React.createElement(
          "td",
          null,
          attrs.note.value
        )
      );
    }
  });

  var Versions = React.createClass({
    displayName: "Versions",

    render: function render() {
      var versions = this.props.versions;

      var rows = versions.rows;

      if (rows.length === 0) {
        return null;
      }return React.createElement(
        "div",
        null,
        React.createElement(
          "h2",
          null,
          "Provider's Version"
        ),
        React.createElement(
          "p",
          null,
          "The data set version shown here is the data provider's version number or publication date indicated on the site from which we downloaded the data. In the rare case that these are not available, the version is the date that the data set was downloaded."
        ),
        React.createElement(
          "table",
          null,
          React.createElement(
            "thead",
            null,
            React.createElement(
              "tr",
              null,
              React.createElement(
                "th",
                null,
                "Organism"
              ),
              React.createElement(
                "th",
                null,
                "Provider's Version"
              )
            )
          ),
          React.createElement(
            "tbody",
            null,
            rows.map(this._renderRow)
          )
        )
      );
    },

    _renderRow: function _renderRow(attributes) {
      var attrs = _.indexBy(attributes, "name");
      return React.createElement(
        "tr",
        null,
        React.createElement(
          "td",
          null,
          attrs.organism.value
        ),
        React.createElement(
          "td",
          null,
          attrs.version.value
        )
      );
    }
  });

  var Graphs = React.createClass({
    displayName: "Graphs",

    render: function render() {
      var graphs = this.props.graphs;

      var rows = graphs.rows;
      if (rows.length === 0) {
        return null;
      }return React.createElement(
        "div",
        null,
        React.createElement(
          "h2",
          null,
          "Example Graphs"
        ),
        React.createElement(
          "ul",
          null,
          rows.map(this._renderGraph)
        )
      );
    },

    _renderGraph: function _renderGraph(graph, index) {
      var g = _.indexBy(graph, "name");

      var displayName = g.display_name.value;

      var baseUrl = "/cgi-bin/dataPlotter.pl" + "?type=" + g.module.value + "&project_id=" + g.project_id.value + "&dataset=" + g.dataset_name.value + "&template=" + (g.is_graph_custom.value === "false" ? 1 : "") + "&id=" + g.graph_ids.value;

      var imgUrl = baseUrl + "&fmt=png";
      var tableUrl = baseUrl + "&fmt=table";

      return React.createElement(
        "li",
        { key: index },
        React.createElement(
          "h3",
          null,
          displayName
        ),
        React.createElement(
          "div",
          { className: "eupathdb-DatasetRecord-GraphMeta" },
          React.createElement(
            "h3",
            null,
            "Description"
          ),
          React.createElement("p", { dangerouslySetInnerHTML: { __html: g.description.value } }),
          React.createElement(
            "h3",
            null,
            "X-axis"
          ),
          React.createElement(
            "p",
            null,
            g.x_axis.value
          ),
          React.createElement(
            "h3",
            null,
            "Y-axis"
          ),
          React.createElement(
            "p",
            null,
            g.y_axis.value
          )
        ),
        React.createElement(
          "div",
          { className: "eupathdb-DatasetRecord-GraphData" },
          React.createElement("img", { className: "eupathdb-DatasetRecord-GraphImg", src: imgUrl })
        )
      );
    }
  });

  var IsolatesList = React.createClass({
    displayName: "IsolatesList",

    render: function render() {
      var rows = this.props.isolates.rows;

      if (rows.length === 0) {
        return null;
      }return React.createElement(
        "div",
        null,
        React.createElement(
          "h2",
          null,
          "Isolates / Samples"
        ),
        React.createElement(
          "ul",
          null,
          rows.map(this._renderRow)
        )
      );
    },

    _renderRow: function _renderRow(attributes) {
      var isolate_link = attributes.find(function (attr) {
        return attr.name === "isolate_link";
      });
      return React.createElement(
        "li",
        null,
        formatLink(isolate_link.value)
      );
    }
  });

  var DatasetRecord = React.createClass({
    displayName: "DatasetRecord",

    render: function render() {
      var titleClass = "eupathdb-DatasetRecord-title";

      var _props = this.props;
      var record = _props.record;
      var questions = _props.questions;
      var recordClasses = _props.recordClasses;
      var id = record.id;
      var attributes = record.attributes;
      var tables = record.tables;
      var summary = attributes.summary;
      var eupath_release = attributes.eupath_release;
      var contact = attributes.contact;
      var institution = attributes.institution;
      var organism_prefix = attributes.organism_prefix;
      var organisms = attributes.organisms;
      var description = attributes.description;

      var version = tables.Version.rows[0];
      var primaryPublication = tables.Publications.rows[0];

      var References = tables.References;
      var HyperLinks = tables.HyperLinks;
      var Contacts = tables.Contacts;
      var Publications = tables.Publications;
      var GenomeHistory = tables.GenomeHistory;
      var Version = tables.Version;
      var ExampleGraphs = tables.ExampleGraphs;
      var Isolates = tables.Isolates;

      return React.createElement(
        "div",
        { className: "eupathdb-DatasetRecord ui-helper-clearfix" },
        React.createElement("h1", { dangerouslySetInnerHTML: {
            __html: "Data Set: <span class=\"" + titleClass + "\">" + id + "</span>"
          } }),
        React.createElement(
          "div",
          { className: "eupathdb-DatasetRecord-Container ui-helper-clearfix" },
          React.createElement("hr", null),
          React.createElement(
            "table",
            { className: "eupathdb-DatasetRecord-headerTable" },
            React.createElement(
              "tbody",
              null,
              React.createElement(
                "tr",
                null,
                React.createElement(
                  "th",
                  null,
                  "Summary:"
                ),
                React.createElement("td", { dangerouslySetInnerHTML: { __html: summary.value } })
              ),
              organism_prefix.value ? React.createElement(
                "tr",
                null,
                React.createElement(
                  "th",
                  null,
                  "Organism (source or reference):"
                ),
                React.createElement("td", { dangerouslySetInnerHTML: { __html: organism_prefix.value } })
              ) : null,
              primaryPublication ? React.createElement(
                "tr",
                null,
                React.createElement(
                  "th",
                  null,
                  "Primary publication:"
                ),
                React.createElement(
                  "td",
                  null,
                  renderPrimaryPublication(primaryPublication)
                )
              ) : null,
              contact.value && institution.value ? React.createElement(
                "tr",
                null,
                React.createElement(
                  "th",
                  null,
                  "Primary contact:"
                ),
                React.createElement(
                  "td",
                  null,
                  renderPrimaryContact(contact.value, institution.value)
                )
              ) : null,
              version ? React.createElement(
                "tr",
                null,
                React.createElement(
                  "th",
                  null,
                  "Source version:"
                ),
                React.createElement(
                  "td",
                  null,
                  renderSourceVersion(version)
                )
              ) : null,
              eupath_release.value ? React.createElement(
                "tr",
                null,
                React.createElement(
                  "th",
                  null,
                  "EuPathDB release # / date:"
                ),
                React.createElement(
                  "td",
                  null,
                  eupath_release.value
                )
              ) : null
            )
          ),
          React.createElement("hr", null),
          React.createElement(
            "div",
            { className: "eupathdb-DatasetRecord-Main" },
            React.createElement(
              "h2",
              null,
              "Detailed Description"
            ),
            React.createElement("div", { dangerouslySetInnerHTML: { __html: description.value } }),
            React.createElement(ContactsAndPublications, { contacts: Contacts, publications: Publications })
          ),
          React.createElement(
            "div",
            { className: "eupathdb-DatasetRecord-Sidebar" },
            React.createElement(Organisms, { organisms: organisms }),
            React.createElement(Searches, { searches: References, questions: questions, recordClasses: recordClasses }),
            React.createElement(Links, { links: HyperLinks }),
            React.createElement(IsolatesList, { isolates: Isolates }),
            React.createElement(ReleaseHistory, { history: GenomeHistory }),
            React.createElement(Versions, { versions: Version })
          )
        ),
        React.createElement(Graphs, { graphs: ExampleGraphs })
      );
    }
  });

  var Tooltip = React.createClass({
    displayName: "Tooltip",

    componentDidMount: function componentDidMount() {
      //this._setupTooltip();
      this.$target = $(this.getDOMNode()).find(".wdk-RecordTable-recordLink");
    },
    componentDidUpdate: function componentDidUpdate() {
      this._destroyTooltip();
      //this._setupTooltip();
    },
    componentWillUnmount: function componentWillUnmount() {
      this._destroyTooltip();
    },
    _setupTooltip: function _setupTooltip() {
      if (this.props.text == null || this.$target.data("hasqtip") != null) {
        return;
      }var text = "<div style=\"max-height: 200px; overflow-y: auto; padding: 2px;\">" + this.props.text + "</div>";
      var width = this.props.width;

      this.$target.wdkTooltip({
        overwrite: true,
        content: { text: text },
        show: { delay: 1000 },
        position: { my: "top left", at: "bottom left", adjust: { y: 12 } }
      });
    },
    _destroyTooltip: function _destroyTooltip() {
      // if _setupTooltip doesn't do anything, this is a noop
      if (this.$target) {
        this.$target.qtip("destroy", true);
      }
    },
    render: function render() {
      // FIXME - Figure out why we lose the fixed-data-table className
      // Losing the fixed-data-table className for some reason... adding it back.
      var child = React.Children.only(this.props.children);
      return React.addons.cloneWithProps(child, {
        className: child.props.className + " public_fixedDataTableCell_cellContent",
        onMouseOver: this._setupTooltip
      });
    }
  });

  function datasetCellRenderer(attribute, attributeName, attributes, index, columnData, width, defaultRenderer) {
    var reactElement = defaultRenderer(attribute, attributeName, attributes, index, columnData, width);

    if (attribute.name === "primary_key") {
      return React.createElement(
        Tooltip,
        {
          text: attributes.description.value,
          width: width
        },
        reactElement
      );
    } else {
      return reactElement;
    }
  }

  ns.DatasetRecord = DatasetRecord;
  ns.datasetCellRenderer = datasetCellRenderer;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRhdGFzZXRSZWNvcmRDbGFzc2VzLkRhdGFzZXRSZWNvcmRDbGFzcy5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQWNBLEdBQUcsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLEVBQUUsVUFBUyxFQUFFLEVBQUU7QUFDN0MsY0FBWSxDQUFDOztBQUViLE1BQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7OztBQUd0QixXQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUU7QUFDckIsUUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN4QyxPQUFHLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQztBQUNwQixXQUFPLEdBQUcsQ0FBQyxXQUFXLENBQUM7R0FDeEI7OztBQUdELE1BQUksVUFBVSxHQUFHLFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDL0MsUUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDbEIsUUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDakMsV0FDRTs7UUFBRyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQUFBQyxFQUFDLE1BQU0sRUFBRSxTQUFTLEdBQUcsUUFBUSxHQUFHLE9BQU8sQUFBQztNQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO0tBQUssQ0FDM0Y7R0FDSCxDQUFDOztBQUVGLE1BQUksd0JBQXdCLEdBQUcsU0FBUyx3QkFBd0IsQ0FBQyxXQUFXLEVBQUU7QUFDNUUsUUFBSSxVQUFVLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFTLEdBQUcsRUFBRTtBQUM5QyxhQUFPLEdBQUcsQ0FBQyxJQUFJLElBQUksYUFBYSxDQUFDO0tBQ2xDLENBQUMsQ0FBQztBQUNILFdBQU8sVUFBVSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFF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RGF0YXNldFJlY29yZENsYXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZ2xvYmFsIF8sIFdkaywgd2RrICovXG4vKiBqc2hpbnQgZXNuZXh0OiB0cnVlLCBlcW51bGw6IHRydWUsIC1XMDE0ICovXG5cbi8qKlxuICogVGhpcyBmaWxlIHByb3ZpZGVzIGEgY3VzdG9tIFJlY29yZCBDb21wb25lbnQgd2hpY2ggaXMgdXNlZCBieSB0aGUgbmV3IFdka1xuICogRmx1eCBhcmNoaXRlY3R1cmUuXG4gKlxuICogVGhlIHNpYmxpbmcgZmlsZSBEYXRhc2V0UmVjb3JkQ2xhc3Nlcy5EYXRhc2V0UmVjb3JkQ2xhc3MuanMgaXMgZ2VuZXJhdGVkXG4gKiBmcm9tIHRoaXMgZmlsZSB1c2luZyB0aGUganN4IGNvbXBpbGVyLiBFdmVudHVhbGx5LCB0aGlzIGZpbGUgd2lsbCBiZVxuICogY29tcGlsZWQgZHVyaW5nIGJ1aWxkIHRpbWUtLXRoaXMgaXMgYSBzaG9ydC10ZXJtIHNvbHV0aW9uLlxuICpcbiAqIGB3ZGtgIGlzIHRoZSBsZWdhY3kgZ2xvYmFsIG9iamVjdCwgYW5kIGBXZGtgIGlzIHRoZSBuZXcgZ2xvYmFsIG9iamVjdFxuICovXG5cbndkay5uYW1lc3BhY2UoJ2V1cGF0aGRiLnJlY29yZHMnLCBmdW5jdGlvbihucykge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgUmVhY3QgPSBXZGsuUmVhY3Q7XG5cbiAgLy8gVXNlIEVsZW1lbnQuaW5uZXJUZXh0IHRvIHN0cmlwIFhNTFxuICBmdW5jdGlvbiBzdHJpcFhNTChzdHIpIHtcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGl2LmlubmVySFRNTCA9IHN0cjtcbiAgICByZXR1cm4gZGl2LnRleHRDb250ZW50O1xuICB9XG5cbiAgLy8gZm9ybWF0IGlzIHt0ZXh0fSh7bGlua30pXG4gIHZhciBmb3JtYXRMaW5rID0gZnVuY3Rpb24gZm9ybWF0TGluayhsaW5rLCBvcHRzKSB7XG4gICAgb3B0cyA9IG9wdHMgfHwge307XG4gICAgdmFyIG5ld1dpbmRvdyA9ICEhb3B0cy5uZXdXaW5kb3c7XG4gICAgcmV0dXJuIChcbiAgICAgIDxhIGhyZWY9e2xpbmsudXJsfSB0YXJnZXQ9e25ld1dpbmRvdyA/ICdfYmxhbmsnIDogJ19zZWxmJ30+e3N0cmlwWE1MKGxpbmsuZGlzcGxheVRleHQpfTwvYT5cbiAgICApO1xuICB9O1xuXG4gIHZhciByZW5kZXJQcmltYXJ5UHVibGljYXRpb24gPSBmdW5jdGlvbiByZW5kZXJQcmltYXJ5UHVibGljYXRpb24ocHVibGljYXRpb24pIHtcbiAgICB2YXIgcHVibWVkTGluayA9IHB1YmxpY2F0aW9uLmZpbmQoZnVuY3Rpb24ocHViKSB7XG4gICAgICByZXR1cm4gcHViLm5hbWUgPT0gJ3B1Ym1lZF9saW5rJztcbiAgICB9KTtcbiAgICByZXR1cm4gZm9ybWF0TGluayhwdWJtZWRMaW5rLnZhbHVlLCB7IG5ld1dpbmRvdzogdHJ1ZSB9KTtcbiAgfTtcblxuICB2YXIgcmVuZGVyUHJpbWFyeUNvbnRhY3QgPSBmdW5jdGlvbiByZW5kZXJQcmltYXJ5Q29udGFjdChjb250YWN0LCBpbnN0aXR1dGlvbikge1xuICAgIHJldHVybiBjb250YWN0ICsgJywgJyArIGluc3RpdHV0aW9uO1xuICB9O1xuXG4gIHZhciByZW5kZXJTb3VyY2VWZXJzaW9uID0gZnVuY3Rpb24odmVyc2lvbikge1xuICAgIHZhciBuYW1lID0gdmVyc2lvbi5maW5kKHYgPT4gdi5uYW1lID09PSAndmVyc2lvbicpO1xuICAgIHJldHVybiAoXG4gICAgICBuYW1lLnZhbHVlICsgJyAoVGhlIGRhdGEgcHJvdmlkZXJcXCdzIHZlcnNpb24gbnVtYmVyIG9yIHB1YmxpY2F0aW9uIGRhdGUsIGZyb20nICtcbiAgICAgICcgdGhlIHNpdGUgdGhlIGRhdGEgd2FzIGFjcXVpcmVkLiBJbiB0aGUgcmFyZSBjYXNlIG5laXRoZXIgaXMgYXZhaWxhYmxlLCcgK1xuICAgICAgJyB0aGUgZG93bmxvYWQgZGF0ZS4pJ1xuICAgICk7XG4gIH07XG5cbiAgdmFyIE9yZ2FuaXNtcyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyBvcmdhbmlzbXMgfSA9IHRoaXMucHJvcHM7XG4gICAgICBpZiAoIW9yZ2FuaXNtcykgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoMj5PcmdhbmlzbXMgdGhpcyBkYXRhIHNldCBpcyBtYXBwZWQgdG8gaW4gUGxhc21vREI8L2gyPlxuICAgICAgICAgIDx1bD57b3JnYW5pc21zLnNwbGl0KC8sXFxzKi8pLm1hcCh0aGlzLl9yZW5kZXJPcmdhbmlzbSl9PC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyT3JnYW5pc20ob3JnYW5pc20sIGluZGV4KSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGkga2V5PXtpbmRleH0+PGk+e29yZ2FuaXNtfTwvaT48L2xpPlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBTZWFyY2hlcyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgcm93cyA9IHRoaXMucHJvcHMuc2VhcmNoZXMucm93cztcbiAgICAgIHJvd3MubWFwKHJvdyA9PiBfLmluZGV4Qnkocm93LCAnbmFtZScpKS5maWx0ZXIodGhpcy5fcm93SXNRdWVzdGlvbik7XG5cbiAgICAgIGlmIChyb3dzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGgyPlNlYXJjaCBvciB2aWV3IHRoaXMgZGF0YSBzZXQgaW4gUGxhc21vREI8L2gyPlxuICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgIHtyb3dzLm1hcCh0aGlzLl9yZW5kZXJTZWFyY2gpfVxuICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3Jvd0lzUXVlc3Rpb24ocm93KSB7XG4gICAgICB2YXIgdGFyZ2V0X3R5cGUgPSByb3cudGFyZ2V0X3R5cGU7XG4gICAgICByZXR1cm4gdGFyZ2V0X3R5cGUgJiYgdGFyZ2V0X3R5cGUudmFsdWUgPT0gJ3F1ZXN0aW9uJztcbiAgICB9LFxuXG4gICAgX3JlbmRlclNlYXJjaChyb3csIGluZGV4KSB7XG4gICAgICB2YXIgbmFtZSA9IHJvdy5maW5kKGF0dHIgPT4gYXR0ci5uYW1lID09ICd0YXJnZXRfbmFtZScpLnZhbHVlO1xuICAgICAgdmFyIHF1ZXN0aW9uID0gdGhpcy5wcm9wcy5xdWVzdGlvbnMuZmluZChxID0+IHEubmFtZSA9PT0gbmFtZSk7XG5cbiAgICAgIGlmIChxdWVzdGlvbiA9PSBudWxsKSByZXR1cm4gbnVsbDtcblxuICAgICAgdmFyIHJlY29yZENsYXNzID0gdGhpcy5wcm9wcy5yZWNvcmRDbGFzc2VzLmZpbmQociA9PiByLmZ1bGxOYW1lID09PSBxdWVzdGlvbi5jbGFzcyk7XG4gICAgICB2YXIgc2VhcmNoTmFtZSA9IGBJZGVudGlmeSAke3JlY29yZENsYXNzLmRpc3BsYXlOYW1lUGx1cmFsfSBieSAke3F1ZXN0aW9uLmRpc3BsYXlOYW1lfWA7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGkga2V5PXtpbmRleH0+XG4gICAgICAgICAgPGEgaHJlZj17Jy9hL3Nob3dRdWVzdGlvbi5kbz9xdWVzdGlvbkZ1bGxOYW1lPScgKyBuYW1lfT57c2VhcmNoTmFtZX08L2E+XG4gICAgICAgIDwvbGk+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIExpbmtzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IGxpbmtzIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgICBpZiAobGlua3Mucm93cy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoMj5MaW5rczwvaDI+XG4gICAgICAgICAgPHVsPiB7bGlua3Mucm93cy5tYXAodGhpcy5fcmVuZGVyTGluayl9IDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3JlbmRlckxpbmsobGluaywgaW5kZXgpIHtcbiAgICAgIHZhciBoeXBlckxpbmsgPSBsaW5rLmZpbmQoYXR0ciA9PiBhdHRyLm5hbWUgPT0gJ2h5cGVyX2xpbmsnKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaSBrZXk9e2luZGV4fT57Zm9ybWF0TGluayhoeXBlckxpbmsudmFsdWUpfTwvbGk+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIENvbnRhY3RzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IGNvbnRhY3RzIH0gPSB0aGlzLnByb3BzO1xuICAgICAgaWYgKGNvbnRhY3RzLnJvd3MubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGg0PkNvbnRhY3RzPC9oND5cbiAgICAgICAgICA8dWw+XG4gICAgICAgICAgICB7Y29udGFjdHMucm93cy5tYXAodGhpcy5fcmVuZGVyQ29udGFjdCl9XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyQ29udGFjdChjb250YWN0LCBpbmRleCkge1xuICAgICAgdmFyIGNvbnRhY3RfbmFtZSA9IGNvbnRhY3QuZmluZChjID0+IGMubmFtZSA9PSAnY29udGFjdF9uYW1lJyk7XG4gICAgICB2YXIgYWZmaWxpYXRpb24gPSBjb250YWN0LmZpbmQoYyA9PiBjLm5hbWUgPT0gJ2FmZmlsaWF0aW9uJyk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGkga2V5PXtpbmRleH0+e2NvbnRhY3RfbmFtZS52YWx1ZX0sIHthZmZpbGlhdGlvbi52YWx1ZX08L2xpPlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBQdWJsaWNhdGlvbnMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyKCkge1xuICAgICAgdmFyIHsgcHVibGljYXRpb25zIH0gPSB0aGlzLnByb3BzO1xuICAgICAgdmFyIHJvd3MgPSBwdWJsaWNhdGlvbnMucm93cztcbiAgICAgIGlmIChyb3dzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoND5QdWJsaWNhdGlvbnM8L2g0PlxuICAgICAgICAgIDx1bD57cm93cy5tYXAodGhpcy5fcmVuZGVyUHVibGljYXRpb24pfTwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3JlbmRlclB1YmxpY2F0aW9uKHB1YmxpY2F0aW9uLCBpbmRleCkge1xuICAgICAgdmFyIHB1Ym1lZF9saW5rID0gcHVibGljYXRpb24uZmluZChwID0+IHAubmFtZSA9PSAncHVibWVkX2xpbmsnKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaSBrZXk9e2luZGV4fT57Zm9ybWF0TGluayhwdWJtZWRfbGluay52YWx1ZSl9PC9saT5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgQ29udGFjdHNBbmRQdWJsaWNhdGlvbnMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyKCkge1xuICAgICAgdmFyIHsgY29udGFjdHMsIHB1YmxpY2F0aW9ucyB9ID0gdGhpcy5wcm9wcztcblxuICAgICAgaWYgKGNvbnRhY3RzLnJvd3MubGVuZ3RoID09PSAwICYmIHB1YmxpY2F0aW9ucy5yb3dzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGgyPkFkZGl0aW9uYWwgQ29udGFjdHMgYW5kIFB1YmxpY2F0aW9uczwvaDI+XG4gICAgICAgICAgPENvbnRhY3RzIGNvbnRhY3RzPXtjb250YWN0c30vPlxuICAgICAgICAgIDxQdWJsaWNhdGlvbnMgcHVibGljYXRpb25zPXtwdWJsaWNhdGlvbnN9Lz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIFJlbGVhc2VIaXN0b3J5ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IGhpc3RvcnkgfSA9IHRoaXMucHJvcHM7XG4gICAgICBpZiAoaGlzdG9yeS5yb3dzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoMj5EYXRhIFNldCBSZWxlYXNlIEhpc3Rvcnk8L2gyPlxuICAgICAgICAgIDx0YWJsZT5cbiAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgIDx0aD5FdVBhdGhEQiBSZWxlYXNlPC90aD5cbiAgICAgICAgICAgICAgICA8dGg+R2Vub21lIFNvdXJjZTwvdGg+XG4gICAgICAgICAgICAgICAgPHRoPkFubm90YXRpb24gU291cmNlPC90aD5cbiAgICAgICAgICAgICAgICA8dGg+Tm90ZXM8L3RoPlxuICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAge2hpc3Rvcnkucm93cy5tYXAodGhpcy5fcmVuZGVyUm93KX1cbiAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyUm93KGF0dHJpYnV0ZXMpIHtcbiAgICAgIHZhciBhdHRycyA9IF8uaW5kZXhCeShhdHRyaWJ1dGVzLCAnbmFtZScpO1xuXG4gICAgICB2YXIgcmVsZWFzZURhdGUgPSBhdHRycy5yZWxlYXNlX2RhdGUudmFsdWUuc3BsaXQoL1xccysvKVswXTtcblxuICAgICAgdmFyIHJlbGVhc2UgPSBhdHRycy5idWlsZC52YWx1ZSA9PSAwXG4gICAgICAgID8gJ0luaXRpYWwgcmVsZWFzZSdcbiAgICAgICAgOiBgJHthdHRycy5wcm9qZWN0LnZhbHVlfSAke2F0dHJzLnJlbGVhc2VfbnVtYmVyLnZhbHVlfSAke3JlbGVhc2VEYXRlfWA7XG5cbiAgICAgIHZhciBnZW5vbWVTb3VyY2UgPSBhdHRycy5nZW5vbWVfc291cmNlLnZhbHVlXG4gICAgICAgID8gYXR0cnMuZ2Vub21lX3NvdXJjZS52YWx1ZSArICcgKCcgKyBhdHRycy5nZW5vbWVfdmVyc2lvbi52YWx1ZSArICcpJ1xuICAgICAgICA6ICcnO1xuXG4gICAgICB2YXIgYW5ub3RhdGlvblNvdXJjZSA9IGF0dHJzLmFubm90YXRpb25fc291cmNlLnZhbHVlXG4gICAgICAgID8gYXR0cnMuYW5ub3RhdGlvbl9zb3VyY2UudmFsdWUgKyAnICgnICsgYXR0cnMuYW5ub3RhdGlvbl92ZXJzaW9uLnZhbHVlICsgJyknXG4gICAgICAgIDogJyc7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQ+e3JlbGVhc2V9PC90ZD5cbiAgICAgICAgICA8dGQ+e2dlbm9tZVNvdXJjZX08L3RkPlxuICAgICAgICAgIDx0ZD57YW5ub3RhdGlvblNvdXJjZX08L3RkPlxuICAgICAgICAgIDx0ZD57YXR0cnMubm90ZS52YWx1ZX08L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBWZXJzaW9ucyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyB2ZXJzaW9ucyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIHZhciByb3dzID0gdmVyc2lvbnMucm93cztcblxuICAgICAgaWYgKHJvd3MubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aDI+UHJvdmlkZXIncyBWZXJzaW9uPC9oMj5cbiAgICAgICAgICA8cD5cbiAgICAgICAgICAgIFRoZSBkYXRhIHNldCB2ZXJzaW9uIHNob3duIGhlcmUgaXMgdGhlIGRhdGEgcHJvdmlkZXIncyB2ZXJzaW9uXG4gICAgICAgICAgICBudW1iZXIgb3IgcHVibGljYXRpb24gZGF0ZSBpbmRpY2F0ZWQgb24gdGhlIHNpdGUgZnJvbSB3aGljaCB3ZVxuICAgICAgICAgICAgZG93bmxvYWRlZCB0aGUgZGF0YS4gSW4gdGhlIHJhcmUgY2FzZSB0aGF0IHRoZXNlIGFyZSBub3QgYXZhaWxhYmxlLFxuICAgICAgICAgICAgdGhlIHZlcnNpb24gaXMgdGhlIGRhdGUgdGhhdCB0aGUgZGF0YSBzZXQgd2FzIGRvd25sb2FkZWQuXG4gICAgICAgICAgPC9wPlxuICAgICAgICAgIDx0YWJsZT5cbiAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgIDx0aD5PcmdhbmlzbTwvdGg+XG4gICAgICAgICAgICAgICAgPHRoPlByb3ZpZGVyJ3MgVmVyc2lvbjwvdGg+XG4gICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICB7cm93cy5tYXAodGhpcy5fcmVuZGVyUm93KX1cbiAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyUm93KGF0dHJpYnV0ZXMpIHtcbiAgICAgIHZhciBhdHRycyA9IF8uaW5kZXhCeShhdHRyaWJ1dGVzLCAnbmFtZScpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0ZD57YXR0cnMub3JnYW5pc20udmFsdWV9PC90ZD5cbiAgICAgICAgICA8dGQ+e2F0dHJzLnZlcnNpb24udmFsdWV9PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgR3JhcGhzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB7IGdyYXBocyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIHZhciByb3dzID0gZ3JhcGhzLnJvd3M7XG4gICAgICBpZiAocm93cy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aDI+RXhhbXBsZSBHcmFwaHM8L2gyPlxuICAgICAgICAgIDx1bD57cm93cy5tYXAodGhpcy5fcmVuZGVyR3JhcGgpfTwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3JlbmRlckdyYXBoKGdyYXBoLCBpbmRleCkge1xuICAgICAgdmFyIGcgPSBfLmluZGV4QnkoZ3JhcGgsICduYW1lJyk7XG5cbiAgICAgIHZhciBkaXNwbGF5TmFtZSA9IGcuZGlzcGxheV9uYW1lLnZhbHVlO1xuXG4gICAgICB2YXIgYmFzZVVybCA9ICcvY2dpLWJpbi9kYXRhUGxvdHRlci5wbCcgK1xuICAgICAgICAnP3R5cGU9JyArIGcubW9kdWxlLnZhbHVlICtcbiAgICAgICAgJyZwcm9qZWN0X2lkPScgKyBnLnByb2plY3RfaWQudmFsdWUgK1xuICAgICAgICAnJmRhdGFzZXQ9JyArIGcuZGF0YXNldF9uYW1lLnZhbHVlICtcbiAgICAgICAgJyZ0ZW1wbGF0ZT0nICsgKGcuaXNfZ3JhcGhfY3VzdG9tLnZhbHVlID09PSAnZmFsc2UnID8gMSA6ICcnKSArXG4gICAgICAgICcmaWQ9JyArIGcuZ3JhcGhfaWRzLnZhbHVlO1xuXG4gICAgICB2YXIgaW1nVXJsID0gYmFzZVVybCArICcmZm10PXBuZyc7XG4gICAgICB2YXIgdGFibGVVcmwgPSBiYXNlVXJsICsgJyZmbXQ9dGFibGUnO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGkga2V5PXtpbmRleH0+XG4gICAgICAgICAgPGgzPntkaXNwbGF5TmFtZX08L2gzPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXVwYXRoZGItRGF0YXNldFJlY29yZC1HcmFwaE1ldGFcIj5cbiAgICAgICAgICAgIDxoMz5EZXNjcmlwdGlvbjwvaDM+XG4gICAgICAgICAgICA8cCBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogZy5kZXNjcmlwdGlvbi52YWx1ZX19Lz5cbiAgICAgICAgICAgIDxoMz5YLWF4aXM8L2gzPlxuICAgICAgICAgICAgPHA+e2cueF9heGlzLnZhbHVlfTwvcD5cbiAgICAgICAgICAgIDxoMz5ZLWF4aXM8L2gzPlxuICAgICAgICAgICAgPHA+e2cueV9heGlzLnZhbHVlfTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImV1cGF0aGRiLURhdGFzZXRSZWNvcmQtR3JhcGhEYXRhXCI+XG4gICAgICAgICAgICA8aW1nIGNsYXNzTmFtZT1cImV1cGF0aGRiLURhdGFzZXRSZWNvcmQtR3JhcGhJbWdcIiBzcmM9e2ltZ1VybH0vPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2xpPlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBJc29sYXRlc0xpc3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICB2YXIgeyByb3dzIH0gPSB0aGlzLnByb3BzLmlzb2xhdGVzO1xuICAgICAgaWYgKHJvd3MubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGgyPklzb2xhdGVzIC8gU2FtcGxlczwvaDI+XG4gICAgICAgICAgPHVsPntyb3dzLm1hcCh0aGlzLl9yZW5kZXJSb3cpfTwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX3JlbmRlclJvdyhhdHRyaWJ1dGVzKSB7XG4gICAgICB2YXIgaXNvbGF0ZV9saW5rID0gYXR0cmlidXRlcy5maW5kKGF0dHIgPT4gYXR0ci5uYW1lID09PSAnaXNvbGF0ZV9saW5rJyk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGk+e2Zvcm1hdExpbmsoaXNvbGF0ZV9saW5rLnZhbHVlKX08L2xpPlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBEYXRhc2V0UmVjb3JkID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHZhciB0aXRsZUNsYXNzID0gJ2V1cGF0aGRiLURhdGFzZXRSZWNvcmQtdGl0bGUnO1xuXG4gICAgICB2YXIgeyByZWNvcmQsIHF1ZXN0aW9ucywgcmVjb3JkQ2xhc3NlcyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIHZhciB7IGlkLCBhdHRyaWJ1dGVzLCB0YWJsZXMgfSA9IHJlY29yZDtcblxuICAgICAgdmFyIHtcbiAgICAgICAgc3VtbWFyeSxcbiAgICAgICAgZXVwYXRoX3JlbGVhc2UsXG4gICAgICAgIGNvbnRhY3QsXG4gICAgICAgIGluc3RpdHV0aW9uLFxuICAgICAgICBvcmdhbmlzbV9wcmVmaXgsXG4gICAgICAgIG9yZ2FuaXNtcyxcbiAgICAgICAgZGVzY3JpcHRpb25cbiAgICAgIH0gPSBhdHRyaWJ1dGVzO1xuXG4gICAgICB2YXIgdmVyc2lvbiA9IHRhYmxlcy5WZXJzaW9uLnJvd3NbMF07XG4gICAgICB2YXIgcHJpbWFyeVB1YmxpY2F0aW9uID0gdGFibGVzLlB1YmxpY2F0aW9ucy5yb3dzWzBdO1xuXG4gICAgICB2YXIge1xuICAgICAgICBSZWZlcmVuY2VzLFxuICAgICAgICBIeXBlckxpbmtzLFxuICAgICAgICBDb250YWN0cyxcbiAgICAgICAgUHVibGljYXRpb25zLFxuICAgICAgICBHZW5vbWVIaXN0b3J5LFxuICAgICAgICBWZXJzaW9uLFxuICAgICAgICBFeGFtcGxlR3JhcGhzLFxuICAgICAgICBJc29sYXRlc1xuICAgICAgfSA9IHRhYmxlcztcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJldXBhdGhkYi1EYXRhc2V0UmVjb3JkIHVpLWhlbHBlci1jbGVhcmZpeFwiPlxuICAgICAgICAgIDxoMSBkYW5nZXJvdXNseVNldElubmVySFRNTD17e1xuICAgICAgICAgICAgX19odG1sOiAnRGF0YSBTZXQ6IDxzcGFuIGNsYXNzPVwiJyArIHRpdGxlQ2xhc3MgKyAnXCI+JyArIGlkICsgJzwvc3Bhbj4nXG4gICAgICAgICAgfX0vPlxuXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJldXBhdGhkYi1EYXRhc2V0UmVjb3JkLUNvbnRhaW5lciB1aS1oZWxwZXItY2xlYXJmaXhcIj5cblxuICAgICAgICAgICAgPGhyLz5cblxuICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cImV1cGF0aGRiLURhdGFzZXRSZWNvcmQtaGVhZGVyVGFibGVcIj5cbiAgICAgICAgICAgICAgPHRib2R5PlxuXG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgPHRoPlN1bW1hcnk6PC90aD5cbiAgICAgICAgICAgICAgICAgIDx0ZCBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogc3VtbWFyeS52YWx1ZX19Lz5cbiAgICAgICAgICAgICAgICA8L3RyPlxuXG4gICAgICAgICAgICAgICAge29yZ2FuaXNtX3ByZWZpeC52YWx1ZSA/IChcbiAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRoPk9yZ2FuaXNtIChzb3VyY2Ugb3IgcmVmZXJlbmNlKTo8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGQgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IG9yZ2FuaXNtX3ByZWZpeC52YWx1ZX19Lz5cbiAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICAgICAgICB7cHJpbWFyeVB1YmxpY2F0aW9uID8gKFxuICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGg+UHJpbWFyeSBwdWJsaWNhdGlvbjo8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+e3JlbmRlclByaW1hcnlQdWJsaWNhdGlvbihwcmltYXJ5UHVibGljYXRpb24pfTwvdGQ+XG4gICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAgICAgICAge2NvbnRhY3QudmFsdWUgJiYgaW5zdGl0dXRpb24udmFsdWUgPyAoXG4gICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5QcmltYXJ5IGNvbnRhY3Q6PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPntyZW5kZXJQcmltYXJ5Q29udGFjdChjb250YWN0LnZhbHVlLCBpbnN0aXR1dGlvbi52YWx1ZSl9PC90ZD5cbiAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICAgICAgICB7dmVyc2lvbiA/IChcbiAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRoPlNvdXJjZSB2ZXJzaW9uOjwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD57cmVuZGVyU291cmNlVmVyc2lvbih2ZXJzaW9uKX08L3RkPlxuICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgICAgICAgIHtldXBhdGhfcmVsZWFzZS52YWx1ZSA/IChcbiAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRoPkV1UGF0aERCIHJlbGVhc2UgIyAvIGRhdGU6PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPntldXBhdGhfcmVsZWFzZS52YWx1ZX08L3RkPlxuICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgPC90YWJsZT5cblxuICAgICAgICAgICAgPGhyLz5cblxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJldXBhdGhkYi1EYXRhc2V0UmVjb3JkLU1haW5cIj5cbiAgICAgICAgICAgICAgPGgyPkRldGFpbGVkIERlc2NyaXB0aW9uPC9oMj5cbiAgICAgICAgICAgICAgPGRpdiBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogZGVzY3JpcHRpb24udmFsdWV9fS8+XG4gICAgICAgICAgICAgIDxDb250YWN0c0FuZFB1YmxpY2F0aW9ucyBjb250YWN0cz17Q29udGFjdHN9IHB1YmxpY2F0aW9ucz17UHVibGljYXRpb25zfS8+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJldXBhdGhkYi1EYXRhc2V0UmVjb3JkLVNpZGViYXJcIj5cbiAgICAgICAgICAgICAgPE9yZ2FuaXNtcyBvcmdhbmlzbXM9e29yZ2FuaXNtc30vPlxuICAgICAgICAgICAgICA8U2VhcmNoZXMgc2VhcmNoZXM9e1JlZmVyZW5jZXN9IHF1ZXN0aW9ucz17cXVlc3Rpb25zfSByZWNvcmRDbGFzc2VzPXtyZWNvcmRDbGFzc2VzfS8+XG4gICAgICAgICAgICAgIDxMaW5rcyBsaW5rcz17SHlwZXJMaW5rc30vPlxuICAgICAgICAgICAgICA8SXNvbGF0ZXNMaXN0IGlzb2xhdGVzPXtJc29sYXRlc30vPlxuICAgICAgICAgICAgICA8UmVsZWFzZUhpc3RvcnkgaGlzdG9yeT17R2Vub21lSGlzdG9yeX0vPlxuICAgICAgICAgICAgICA8VmVyc2lvbnMgdmVyc2lvbnM9e1ZlcnNpb259Lz5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPEdyYXBocyBncmFwaHM9e0V4YW1wbGVHcmFwaHN9Lz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIFRvb2x0aXAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAvL3RoaXMuX3NldHVwVG9vbHRpcCgpO1xuICAgICAgdGhpcy4kdGFyZ2V0ID0gJCh0aGlzLmdldERPTU5vZGUoKSkuZmluZCgnLndkay1SZWNvcmRUYWJsZS1yZWNvcmRMaW5rJyk7XG4gICAgfSxcbiAgICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgICB0aGlzLl9kZXN0cm95VG9vbHRpcCgpO1xuICAgICAgLy90aGlzLl9zZXR1cFRvb2x0aXAoKTtcbiAgICB9LFxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgdGhpcy5fZGVzdHJveVRvb2x0aXAoKTtcbiAgICB9LFxuICAgIF9zZXR1cFRvb2x0aXAoKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy50ZXh0ID09IG51bGwgfHwgdGhpcy4kdGFyZ2V0LmRhdGEoJ2hhc3F0aXAnKSAhPSBudWxsKSByZXR1cm47XG5cbiAgICAgIHZhciB0ZXh0ID0gYDxkaXYgc3R5bGU9XCJtYXgtaGVpZ2h0OiAyMDBweDsgb3ZlcmZsb3cteTogYXV0bzsgcGFkZGluZzogMnB4O1wiPiR7dGhpcy5wcm9wcy50ZXh0fTwvZGl2PmA7XG4gICAgICB2YXIgd2lkdGggPSB0aGlzLnByb3BzLndpZHRoO1xuXG4gICAgICB0aGlzLiR0YXJnZXRcbiAgICAgICAgLndka1Rvb2x0aXAoe1xuICAgICAgICAgIG92ZXJ3cml0ZTogdHJ1ZSxcbiAgICAgICAgICBjb250ZW50OiB7IHRleHQgfSxcbiAgICAgICAgICBzaG93OiB7IGRlbGF5OiAxMDAwIH0sXG4gICAgICAgICAgcG9zaXRpb246IHsgbXk6ICd0b3AgbGVmdCcsIGF0OiAnYm90dG9tIGxlZnQnLCBhZGp1c3Q6IHsgeTogMTIgfSB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgX2Rlc3Ryb3lUb29sdGlwKCkge1xuICAgICAgLy8gaWYgX3NldHVwVG9vbHRpcCBkb2Vzbid0IGRvIGFueXRoaW5nLCB0aGlzIGlzIGEgbm9vcFxuICAgICAgaWYgKHRoaXMuJHRhcmdldCkge1xuICAgICAgICB0aGlzLiR0YXJnZXQucXRpcCgnZGVzdHJveScsIHRydWUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVuZGVyKCkge1xuICAgICAgLy8gRklYTUUgLSBGaWd1cmUgb3V0IHdoeSB3ZSBsb3NlIHRoZSBmaXhlZC1kYXRhLXRhYmxlIGNsYXNzTmFtZVxuICAgICAgLy8gTG9zaW5nIHRoZSBmaXhlZC1kYXRhLXRhYmxlIGNsYXNzTmFtZSBmb3Igc29tZSByZWFzb24uLi4gYWRkaW5nIGl0IGJhY2suXG4gICAgICB2YXIgY2hpbGQgPSBSZWFjdC5DaGlsZHJlbi5vbmx5KHRoaXMucHJvcHMuY2hpbGRyZW4pO1xuICAgICAgcmV0dXJuIFJlYWN0LmFkZG9ucy5jbG9uZVdpdGhQcm9wcyhjaGlsZCwge1xuICAgICAgICBjbGFzc05hbWU6IGNoaWxkLnByb3BzLmNsYXNzTmFtZSArIFwiIHB1YmxpY19maXhlZERhdGFUYWJsZUNlbGxfY2VsbENvbnRlbnRcIixcbiAgICAgICAgb25Nb3VzZU92ZXI6IHRoaXMuX3NldHVwVG9vbHRpcFxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiBkYXRhc2V0Q2VsbFJlbmRlcmVyKGF0dHJpYnV0ZSwgYXR0cmlidXRlTmFtZSwgYXR0cmlidXRlcywgaW5kZXgsIGNvbHVtbkRhdGEsIHdpZHRoLCBkZWZhdWx0UmVuZGVyZXIpIHtcbiAgICB2YXIgcmVhY3RFbGVtZW50ID0gZGVmYXVsdFJlbmRlcmVyKGF0dHJpYnV0ZSwgYXR0cmlidXRlTmFtZSwgYXR0cmlidXRlcywgaW5kZXgsIGNvbHVtbkRhdGEsIHdpZHRoKTtcblxuICAgIGlmIChhdHRyaWJ1dGUubmFtZSA9PT0gJ3ByaW1hcnlfa2V5Jykge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFRvb2x0aXBcbiAgICAgICAgICB0ZXh0PXthdHRyaWJ1dGVzLmRlc2NyaXB0aW9uLnZhbHVlfVxuICAgICAgICAgIHdpZHRoPXt3aWR0aH1cbiAgICAgICAgPntyZWFjdEVsZW1lbnR9PC9Ub29sdGlwPlxuICAgICAgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gcmVhY3RFbGVtZW50O1xuICAgIH1cbiAgfVxuXG4gIG5zLkRhdGFzZXRSZWNvcmQgPSBEYXRhc2V0UmVjb3JkO1xuICBucy5kYXRhc2V0Q2VsbFJlbmRlcmVyID0gZGF0YXNldENlbGxSZW5kZXJlcjtcbn0pO1xuIl19