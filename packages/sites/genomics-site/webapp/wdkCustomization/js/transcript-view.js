function toggleRepresentativeTranscripts(checkboxElem) {
  var stepId = jQuery(checkboxElem).data('stepid');
  var checked = jQuery(checkboxElem).prop('checked');

  // swap value of representative transcript filter flag
  var url = '/service/user/current/preference';
  jQuery.blockUI();
  jQuery.ajax({

    // properties defining data sent, how and where
    url: wdk.webappUrl(url),
    method: 'PATCH',
    contentType: 'application/json',
    data: JSON.stringify({"representativeTranscriptOnly": (checked ? "true" : "false")}),

    // properties defining data expected
    success: function(data) {
      // no actual data should be returned in success case
      // reload the current tab (should still be transcript view)
      var currentIndex = $("#Summary_Views").tabs("option", "active");

      // need to ensure this element corresponds to the right #Summary_Views (basket OR strategy step)
      $(checkboxElem).closest("#Summary_Views").tabs("load", currentIndex, { skipCache: true });
    },
    error: function(jqXHR, textStatus, errorThrown) {
      jQuery(checkboxElem).prop('checked', !checked);
      alert("Error: Could not complete this action.  Please try again later.\n" + textStatus + "\n" + errorThrown);
    },
    complete: function () {
      // regardless of result, unblock UI
      jQuery.unblockUI();
    }
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

  // is filter setup?
  var checked =  $( 'div#oneTr-filter input' ).prop('checked');

  if ( tCount === gCount) { // in case we show the filter when checked
    $oneTrFilter.prop('title','Your result has one transcript per gene; the filter is applied but has no effect. ');
  }
  else if ( checked === true ) {
    $oneTrFilter.prop('title','Your result is filtered, showing only one transcript per gene. The transcript returned is the longest in the result.');
    $prompt.html('Showing Only One Transcript Per Gene');
    $filterIcon.css('visibility','visible'); 
    $trCount.text('showing ' + gCount + ' of ' + tCount); 
  }
  //  being the default situation this is/could be in the files coming from server,
  //    it is left here to coordinate verbiage here between the checked and unchecked options
  else {
    $oneTrFilter.prop('title','Some genes have more than one transcript in your result. Click to select one transcript per gene in your result. We will return the longest in the result. This filter will not affect the strategy.');
    //$prompt.html('Show Only One Transcript Per Gene');
    $filterIcon.css('visibility','hidden');
  }

});
