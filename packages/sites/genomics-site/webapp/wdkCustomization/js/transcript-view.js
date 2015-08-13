function toggleRepresentativeTranscripts(checkboxElem) {
  var stepId = jQuery(checkboxElem).data('stepid');
  var checked = jQuery(checkboxElem).prop('checked');
  // swap value of representative transcript filter flag
  var url = '/service/step/' + stepId + '/transcript-view/config';
  jQuery.blockUI();
  jQuery.ajax({

    // properties defining data sent, how and where
    url: wdk.webappUrl(url),
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({"representativeTranscriptOnly": (checked ? true : false)}),

    // properties defining data expected
    success: function(data) {
      // no actual data should be returned in success case
      // reload the current tab (should still be transcript view)
      var currentIndex = $("#Summary_Views").tabs("option", "active");
      $('#Summary_Views').tabs("load", currentIndex, { skipCache: true });
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
