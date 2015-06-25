wdk.util.namespace("eupathdb.datasetSearches", function(ns, $) {
  "use strict";
  ns.init = function($element, $attrs) {

    var $datasetRecords = $element.find($attrs.table);

    var datasetTabsSource = $element.find($attrs.tabsTemplate).html();
    var datasetTabsTmpl = _.template(datasetTabsSource);

    var toggleSource = $element.find("#toggle").html();
    var toggleTmpl = _.template(toggleSource);

    var $questionWrapper = $("#question-wrapper");

    var dataTableOpts = {
      aoColumnDefs: [
        {
          bVisible: false,
          aTargets: [2]
        }
      ],
      bJQueryUI: true,
      bPaginate: false,
      oLanguage: {
        sSearch: "Filter Data Sets:",
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

    var dataTable = $datasetRecords.dataTable(dataTableOpts);

    // show the page
    setTimeout(function() {
      $element.css("visibility", "visible");
    }, 100);

    // watch for hash changes
    $(window).on('hashchange', route);

    // bind toggleTable to .table-toggle
    $tableToggle.on("click", function() { toggleTable() });

    // filter
    //   - remove active search page and expand table
    $($attrs.table + "_filter input")
      .on("keyup change", function(e) {
        toggleTable(false);
        $("#question-wrapper").html("").removeClass("active");
        $datasetRecords.find(".btn-active").removeClass("btn-active");
        $datasetRecords.find("tbody tr").removeClass("active");
        $tableToggle.hide();
        $questionWrapper.find(".tabs").hide();
      })
      .wdkTooltip({
        content: {
          text: "Type anything to filter this table, " +
                "such as investigator or organism name. "
        },
        position: {
          my: "left center",
          at: "right center"
        }
      })
      .attr("placeholder", "Type keyword(s) to filter");

    // handle search click
    $datasetRecords.find(".dataset").on("click", ".question-link", function(e) {
      // allow modifier keys to do their thing
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();

      var fullName = e.currentTarget.getAttribute('data-full-names').trim().split(' ')[0];

      if ($attrs.callWizardUrl) {
        wdk.addStepPopup.callWizard($attrs.callWizardUrl + fullName, null, null, null, "next");
      } else {
        location.hash = fullName;
      }
    });

    function clearSelectedQuestion() {
      $datasetRecords
        // unselect row
        .find("tbody tr")
          .removeClass("active")
          .end()
        // unselect link
        .find(".btn-active")
          .removeClass("btn-active");
      // hide question tabs
      $questionWrapper.find(".tabs").hide();
      // expand table
      toggleTable(false);
    }

    function selectQuestion(fullName) {
      var $link, $row, $data, $questionTabs, tabIdx;

      $link = $element.find('.question-link[data-full-names~="' + fullName + '"]');

      if (!$link.length) return;

      clearSelectedQuestion();

      // get table row
      $row = $element.find('tr').has($link);

      // get data attrs
      $data = $row.data();

      // show table toggle button
      $tableToggle.show();

      // set link to active
      $link.addClass("btn-active");

      // get the index for tab in question tabs (equivalent to link index plus the fullName index)
      tabIdx = $link.data('tabIndex') + $link.data('fullNames').trim().split(' ').indexOf(fullName);

      // update active row
      $row.addClass("active");

      $questionTabs = $questionWrapper.find("#question-set-" + $data.datasetId);

      if ($questionTabs.length) {
        // select appropriate tab
        $questionTabs.tabs("option", "active", tabIdx).show();
      } else {
        // render new tabs and append
        var questions = _($row.find('.question-link').toArray())
          .map(function(link) {
            var href = link.getAttribute('href');
            var fullNames = link.getAttribute('data-full-names').trim().split(' ');
            var nameToReplace = fullNames[0];
            var shouldEnumerate = fullNames.length > 1;

            return fullNames.map(function(fullName, index) {
              return {
                fullName: fullName,
                url: href.replace(nameToReplace, fullName) + '&partial=true',
                category: link.getAttribute('data-category') +
                  (shouldEnumerate ? ' ' + (index + 1) : '')
              };
            });
          })
          .flatten()
          .value();

        var tabsHtml = datasetTabsTmpl({
          datasetId: $data.datasetId,
          questions: questions
        });

        $questionWrapper.append(tabsHtml).addClass('active')
          .find('.tabs:last')
            .tabs({
              active: tabIdx,
              activate: function(event, ui) {
                location.hash = ui.newTab.attr('question-fullname');
              },
              create: function(event, ui) {
                location.hash = ui.tab.attr('question-fullname');
              }
            })
            .show();
      }

      toggleTable.call($tableToggle.get(0), true);
    }

    function route() {
      var fullName = location.hash.slice(1);

      if (fullName) {
        selectQuestion(fullName);
      } else {
        clearSelectedQuestion();
      }
    }

    route();
  }
});
