function datasetSearches($element, $attrs) {
  "use strict";

  var $datasetRecords = $element.find($attrs.table);

  var datasetTabsSource = $element.find($attrs.tabsTemplate).html();
  var datasetTabsTmpl = Handlebars.compile(datasetTabsSource);

  var toggleSource = $element.find("#toggle").html();
  var toggleTmpl = Handlebars.compile(toggleSource);

  var $questionWrapper = $("#question-wrapper");

  var questionTabsCache = {
    cache: {},
    // id: datasetId
    // html: tabs source
    add: function(id, html) {
      return (this.cache[id] = html);
    },
    // id: datasetId
    get: function(id) {
      return this.cache[id];
    }
  };

  var questionCollection = {
    datasetId: null,
    questions: []
  };

  var dataTableOpts = {
    aoColumnDefs: [
      {
        bVisible: false,
        aTargets: [2]
      }
    ],
    bPaginate: false,
    oLanguage: {
      sSearch: "Filter Data sets:",
      sInfo: ""
    }
  };

  var $tableToggle = $element.find($attrs.tableToggle);

  // helper toggle function
  var toggleTable = function(collapse) {
    collapse = typeof collapse !== "undefined" ? collapse : !$datasetRecords.hasClass("collapsed");
    $datasetRecords.toggleClass("collapsed", collapse);
    $tableToggle.html(toggleTmpl({collapsed: collapse}));
  }

  var colors = [
    "blue",
    "red",
    "green",
    "brown"
  ];

  // $datasetRecords.find("tbody tr").each(function() {
  //   $(this).find(".search-mechanism").each(function(idx, td) {
  //     var $div = $(td).find("a");
  //     var color = colors[idx % colors.length];
  //     $div.addClass("btn btn-" + color);
  //   });
  // });

  // $element.find(".legend .search-mechanism").each(function(idx, span) {
  //   var color = colors[idx % colors.length];
  //   $(span).addClass("btn btn-active btn-" + color);
  // });

  var dataTable = $datasetRecords.dataTable(dataTableOpts);
  //new FixedHeader(dataTable);

  // filter
  //   - remove active search page and expand table
  //   - when input has content, display clear button
  $($attrs.table + "_filter input")
    .on("keyup change", function(e) {
      $(this).toggleClass("content", this.value.length > 0);
      toggleTable(false);
      $("#question-wrapper").html("").removeClass("active");
      questionCollection.datasetId = null;
      questionCollection.questions = [];
      $datasetRecords.find(".btn-active").removeClass("btn-active");
      $datasetRecords.find("tbody tr").removeClass("active");
      $tableToggle.hide();
      $questionWrapper.find(".tabs").hide();
    }).after(
      $('<span class="ui-icon ui-icon-circle-close"></span>')
        .addClass("filter-clear")
        .on("click", function(e) {
          e.preventDefault();
          dataTable.fnFilter("");
          $($attrs.table + "_filter input").change().select();
        })
    );

  $($attrs.table + "_filter input").wdkTooltip({
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

    $(this).addClass("btn-active");

    $datasetRecords.find(".btn-active").not(this).removeClass("btn-active");

    tabIdx = $delegate.find(".search-mechanism .question-link").index(this);

    if ($data.datasetId === questionCollection.datasetId) {
      // select appropriate tab
      $("#question-wrapper").find("#question-set-" + questionCollection.datasetId).tabs("option", "selected", tabIdx);
    } else {
      // update active row
      $datasetRecords.find("tbody tr").removeClass("active");
      $delegate.addClass("active");
      toggleTable.call($tableToggle.get(0), true);
      $questionWrapper.find(".tabs").hide();

      questionCollection.datasetId = $data.datasetId;
      questionCollection.questions = [];
      $delegate.find(".question-link").each(function(idx, anchor) {
        var category = $(this).data("category");
        questionCollection.questions.push({
          url: $(this).data("href") + "&partial=true",
          category: category.replace(/((^\w)|_(\w))/g,
              function(s) { return s.replace("_", " ").toUpperCase()})
        });
      });

      if (!$questionWrapper.find("#question-set-" + questionCollection.datasetId).show().tabs("option", "selected", tabIdx).length) {
        $questionWrapper
          .append(datasetTabsTmpl(questionCollection))
          .addClass("active")
          .find(".tabs").tabs({
            cache: true,
            selected: tabIdx
          });
      }
    }
  });

  // bind toggleTable to .table-toggle
  $tableToggle.on("click", function() { toggleTable() });

  // show the page
  $element.css("visibility", "visible");
}
