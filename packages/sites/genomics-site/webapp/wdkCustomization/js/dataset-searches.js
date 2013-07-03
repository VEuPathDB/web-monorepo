function datasetSearches($element, $attrs) {
  "use strict";
  //console.log($attrs);

  var $datasetRecords = $element.find($attrs.table);

  var datasetTabsSource = $element.find($attrs.tabsTemplate).html();
  var datasetTabsTmpl = Handlebars.compile(datasetTabsSource);

  var toggleSource = $element.find("#toggle").html();
  var toggleTmpl = Handlebars.compile(toggleSource);

  var questionCollection = {
    datasetId: null,
    questions: []
  };

  // dataTable, but without jQueryUI so we can keep slanted headers
  var dataTableOpts = {
    aoColumns: $datasetRecords.find("th").map(function(idx, th) {
      return $(th).hasClass("skew") ? {bSortable: false} : [null];
    }).toArray(),
    bPaginate: false,
    oLanguage: {
      sSearch: "Filter table:",
      sInfo: ""
    }
  };

  var $tableToggle = $element.find($attrs.tableToggle);

  // helper toggle function
  var toggleTable = function(collapse) {
    collapse = typeof collapse !== "undefined" ? collapse : !$datasetRecords.hasClass("collapsed");
    $datasetRecords.toggleClass("collapsed", collapse);
    $tableToggle.html(toggleTmpl({collapsed: collapse}));
    $($attrs.table + "_filter").toggleClass("disabled", collapse)
      .find("input").prop("disabled", collapse);
  }

  var dataTable = $datasetRecords.dataTable(dataTableOpts);
  //new FixedHeader(dataTable);

  $element.find("th.skew").contents().wrap("<div><span/></div>");
    // redraw table
  dataTable.fnDraw();

  $($attrs.table + "_filter input").qtip({
    content: {
      text: "Type anything to filter this table, " +
            "such as investigator or organism name. "
    },
    position: {
      my: "left center",
      at: "right center"
    }
  });

  // handle search click
  $datasetRecords.find(".dataset").on("click", ".question-link", function(e) {
    var $delegate, $data, tabIdx;
    // allow modifier keys to do their thing
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;

    e.preventDefault();
    $delegate = $(e.delegateTarget);
    $data = $delegate.data();

    $tableToggle.show();

    tabIdx = $delegate.find(".search-mechanism a").index(this);

    if ($data.datasetId === questionCollection.datasetId) {
      // select appropriate tab
      $("#question-wrapper").find(".tabs").tabs("option", "selected", tabIdx);
    } else {
      // update active row
      $datasetRecords.find("tbody tr").removeClass("active");
      $delegate.addClass("active");
      toggleTable.call($tableToggle.get(0), true);

      questionCollection.datasetId = $data.datasetId;
      questionCollection.questions = [];
      $delegate.find(".question-link").each(function(idx, anchor) {
        var category = $(this).data("category");
        questionCollection.questions.push({
          url: this.href + "&partial=true",
          category: category.replace(/((^\w)|_(\w))/g,
              function(s) { return s.replace("_", " ").toUpperCase()})
        });
      });

      $("#question-wrapper")
        .html(datasetTabsTmpl(questionCollection))
        .addClass("active")
        .find(".tabs").tabs({
          selected: tabIdx
        });
    }
  });

  // bind toggleTable to .table-toggle
  $tableToggle.on("click", function() { toggleTable() });

  // show the page
  $element.css("visibility", "visible");
}
