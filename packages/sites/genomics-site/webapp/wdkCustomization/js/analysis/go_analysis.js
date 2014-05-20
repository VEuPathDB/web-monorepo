wdk.on('analysis:formload', function(analysisId, element) {
  'use strict';

  var $ = wdk.$,
      preventEvent = wdk.fn.preventEvent;

  // handle select all and clear all links on form
  $(element)
    .on('click', '[href="#select-all"]', preventEvent(function() {
      $(this).closest('td').find(':input').prop('checked', true);
    }))
    .on('click', '[href="#clear-all"]',preventEvent(function() {
      $(this).closest('td').find(':input').prop('checked', false);
    }));
});

wdk.on('analysis:resultsload', function(analysisId, element) {
  // use datatable for results
  $(element).find('.go-table').wdkDataTable();
  $(element).find('thead th').wdkTooltip({
      hide: 'click mouseleave'
    });


});
