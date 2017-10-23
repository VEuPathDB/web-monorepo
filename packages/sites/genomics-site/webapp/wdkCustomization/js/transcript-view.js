/**
 * Toggles the value (and user preference on the server) of the representative
 * transcript checkbox, then refreshes the results pane to display updated
 * results.
 * 
 * @param {any} checkboxElem
 */
function toggleRepresentativeTranscripts(checkboxElem) {
  var stepId = jQuery(checkboxElem).data('stepid');
  var checked = jQuery(checkboxElem).prop('checked');

  // swap value of representative transcript filter flag
  jQuery.blockUI();
  wdk.getWdkService().updateCurrentUserPreference("project","representativeTranscriptOnly",(checked ? "true" : "false"))
    .then(function(data) {

      // no actual data should be returned in success case
      // reload the current tab (should still be transcript view)
      var currentIndex = $("#Summary_Views").tabs("option", "active");

      // need to ensure this element corresponds to the right #Summary_Views (basket OR strategy step)
      $(checkboxElem).closest("#Summary_Views").tabs("load", currentIndex, { skipCache: true });

      jQuery.unblockUI();
    })
    .catch(function(error) {
      jQuery(checkboxElem).prop('checked', !checked);
      alert("Error: Could not complete this action.  Please try again later.\n" + error);
      jQuery.unblockUI();
    });
}

$(document).on('wdk-results-loaded', function() {

  // set icon visible or not, change tooltip and verbiage accordingly
  var $oneTrFilter = $( 'div#oneTr-filter');
  var $prompt = $( 'div#oneTr-filter span#prompt');
  var $filterIcon = $( 'div#oneTr-filter span#filter-icon' );
  var $trCountSpan = $( 'div#oneTr-filter span#transcript-count' );
  var $trCount = $( 'div#oneTr-filter span#transcript-count span' );

  // compare counts, if equal we will grey out the whole sentence
  var $geneCountSpan = $( 'div#oneTr-filter span#gene-count' );
  var $geneCount = $( 'div#oneTr-filter span#gene-count span' );
  var gCount = $geneCount.text();
  var tCount = $trCount.text();
  var hidingtCount = tCount - gCount;

  // is filter setup?
  var checked =  $( 'div#oneTr-filter input' ).prop('checked');

  if ( tCount === gCount) { // in case we show the filter when checked
    $oneTrFilter.prop('title','Your result has one transcript per gene; the filter is applied but has no effect. ');
  }
  else if ( checked === true ) {
    //$oneTrFilter.prop('title','Your result is filtered, showing only one transcript per gene. The transcript returned is the longest in the result.');
    $filterIcon.css('visibility','visible'); 
    //$trCount.text('showing ' + gCount + ' of ' + tCount); 
    $trCount.text(tCount + ' (hiding ' + hidingtCount + ')'); 
  }
  //  being the default situation this is/could be in the files coming from server,
  //    it is left here to coordinate verbiage here between the checked and unchecked options
  else {
    //$oneTrFilter.prop('title','Some genes have more than one transcript in your result. Click to select one transcript per gene in your result. We will return the longest in the result. This filter will not affect the strategy.');
    $filterIcon.css('visibility','hidden');
  }

});
