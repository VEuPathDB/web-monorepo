
function gotoFacebook() {
	document.location = $('#facebook-link').html();
}

function gotoTwitter() {
	document.location = $('#twitter-link').html();
}

// initialize superfish menu
jQuery(function($) {
  $(".sf-menu").supersubs({
    minWidth: 17,
    maxWidth: 25,
    extraWidth: 3
  }).superfish();
});
