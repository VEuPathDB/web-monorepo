(function($) {
  'use strict';

  var preventEvent = wdk.fn.preventEvent;

  wdk.on({
    'analysis:formload:go-enrichment': formload,
    'analysis:resultsload:go-enrichment': resultsload
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
    var $table = analysis.$el.find('.go-table');

    $table.find('tbody tr > td:nth-child(8)').each(toTwoDecimals);
    $table.find('tbody tr > td:nth-child(9)').each(toTwoDecimals);
    $table.find('tbody tr > td:nth-child(10)').each(toTwoDecimals);

    $table.find('th, td').wdkTooltip({
      hide: 'click mouseleave'
    });

    $table.wdkDataTable({
      aoColumnDefs: [{
        sType: 'numeric',
        aTargets: [7, 8, 9]
      }]
    });
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
