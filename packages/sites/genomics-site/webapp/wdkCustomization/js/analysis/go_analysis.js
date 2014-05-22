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
    analysis.$el.find('.go-table').wdkDataTable();
    analysis.$el.find('thead th').wdkTooltip({
      hide: 'click mouseleave'
    });
  }

}(jQuery));
