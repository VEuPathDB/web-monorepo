(function($) {
  'use strict';

  var preventEvent = wdk.fn.preventEvent;

  // Subscribe to events published by the analysis framework.
  //
  // Each callback function is called with an analysis object.
  //
  // An analysis object has the following properties:
  //  - name: The name of the analysis instance, as defined in the model
  //  - id:   The analysis ID
  $(document).on('analysis:formload:go-enrichment', formload);
  $(document).on('analysis:resultsload:go-enrichment', resultsload);
  $(document).on('analysis:remove:go-enrichment', removeEvents);

  $(document).on('analysis:formload:pathway-enrichment', formload);
  $(document).on('analysis:resultsload:pathway-enrichment', resultsload);
  $(document).on('analysis:remove:pathway-enrichment', removeEvents);

  $(document).on('analysis:formload:word-enrichment', formload);
  $(document).on('analysis:resultsload:word-enrichment', resultsload);
  $(document).on('analysis:remove:word-enrichment', removeEvents);


  $(document).on('analysis:resultsload:hpiGeneList', hpiresultsload);
  $(document).on('analysis:resultsload:datasetGeneList', hpiresultsload);

  // handle select all and clear all links on form
  function formload(event) {
    $(event.target)
      .on('click', '[href="#select-all"]', preventEvent(function() {
        $(this).closest('td').find(':input').prop('checked', true);
      }))
      .on('click', '[href="#clear-all"]',preventEvent(function() {
        $(this).closest('td').find(':input').prop('checked', false);
      }));
  }


  function hpiresultsload(event) {
    var $table = $(event.target).find('.step-analysis-results-pane table');

    $table.wdkDataTable({
        // order by significance descending
        order: [ 4, 'desc' ],
	// positions total (i) and filter (f) before he table
	dom: 'lipft',
  	// instead of defaults: "Showing x to y of z entries", "Search"
        // overrides values defined in WDK datatables.js
        oLanguage: {
	    sInfo: 'Got a total of _TOTAL_ results',
            sSearch: 'Filter : '
        },
    });


  }

  // use datatable for results and add fancy tooltips
  function resultsload(event) {
    var $table = $(event.target).find('.step-analysis-results-pane table');

    $table.find('tbody tr > td:nth-child(8)').each(toTwoDecimals);
    $table.find('tbody tr > td:nth-child(9)').each(toTwoDecimals);
    $table.find('tbody tr > td:nth-child(10)').each(toTwoDecimals);

    $table.find('th, td').wdkTooltip({
      hide: 'click mouseleave'
    });

    $table.wdkDataTable({
      // sort by p-value
      order: [ 7, 'asc' ],
			// positions total (i) and filter (f) before he table
			dom: 'lipft',
  		// instead of defaults: "Showing x to y of z entries", "Search"
      // overrides values defined in WDK datatables.js
      oLanguage: {
					sInfo: 'Got a total of _TOTAL_ results',
          sSearch: 'Filter : '
      },
      // order p-value cols numerically
      columnDefs: [{
        type: 'scientific',
        targets: [7, 8, 9]
      }]
    });
  }

  function removeEvents(event, analysis) {
    $(window).off('resize.enrichment' + analysis.id);
  }

  // Convert scipy's scientific notation to what we want.
  // Only show two decimal places.
  function toTwoDecimals() {
    var $el = $(this),
        number = Number($el.text());
    $el.text(number.toExponential(2));
    $el.attr('title', number);
  }

}(jQuery));
