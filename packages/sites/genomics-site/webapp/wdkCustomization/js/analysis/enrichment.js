(function($) {
  'use strict';

  var preventEvent = wdk.fn.preventEvent;

  // Subscribe to events published by the analysis framework.
  //
  // Each callback function is called with an analysis object.
  //
  // An analysis object has the following properties:
  //  - $el:  Reference to the jQuery-wrapped tab pane element
  //  - name: The name of the analysis instance, as defined in the model
  //  - id:   The analysis ID
  wdk.on({
    'analysis:formload:go-enrichment': formload,
    'analysis:resultsload:go-enrichment': resultsload,
    'analysis:remove:go-enrichment': removeEvents,

    'analysis:formload:pathway-enrichment': formload,
    'analysis:resultsload:pathway-enrichment': resultsload,
    'analysis:remove:pathway-enrichment': removeEvents
  });

  // handle select all and clear all links on form
  function formload(analysis) {
    analysis.$el
      .on('click', '[href="#select-all"]', preventEvent(function() {
        $(this).closest('td').find(':input').prop('checked', true);
      }))
      .on('click', '[href="#clear-all"]',preventEvent(function() {
        $(this).closest('td').find(':input').prop('checked', false);
      }));
  }

  // use datatable for results and add fancy tooltips
  function resultsload(analysis) {
    var $table = analysis.$el.find('.step-analysis-results-pane table');

    $table.find('tbody tr > td:nth-child(8)').each(toTwoDecimals);
    $table.find('tbody tr > td:nth-child(9)').each(toTwoDecimals);
    $table.find('tbody tr > td:nth-child(10)').each(toTwoDecimals);

    $table.find('th, td').wdkTooltip({
      hide: 'click mouseleave'
    });

    $table.wdkDataTable({
      // sort by p-value
      aaSorting: [[ 7, 'asc' ]],
      // order p-value cols numerically
      aoColumnDefs: [{
        sType: 'numeric',
        aTargets: [7, 8, 9]
      }]
    });

    $(window)
      .off('resize.enrichment' + analysis.id)
      .on('resize.enrichment' + analysis.id, _.debounce(function() {
        $table.dataTable().fnDraw();
      }, 300));
  }

  function removeEvents(analysis) {
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
