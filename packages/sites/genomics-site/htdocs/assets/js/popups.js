/*
  popup.js

  Functions for displaying login,register, and unsupported browser popups

*/jQuery
jQuery(document).ready(function() {
	popUnsupported();
});

function popLogin(destination){
	jQuery.blockUI({message : jQuery("#loginForm"), css : {cursor: 'auto',width:'30%',top:'40%',left:'15%' }});
	if (destination) {
		jQuery("#loginForm input:hidden[name=refererUrl]").val(destination);
	}
}

function popRegister(){
	jQuery.blockUI({message : jQuery("#registerForm"), css : {cursor: 'auto',width: '80%',top: '40px',left:'10%' } });
}


//  && !(jQuery.browser.msie && parseInt(jQuery.browser.version) > 6) 
function popUnsupported(){
	var userAgent = navigator.userAgent.toLowerCase();
	if (!jQuery.browser.mozilla && !jQuery.browser.safari  && !jQuery.browser.webkit //In case we upgrade to jQuery 1.4+
            && jQuery.cookie('api-unsupported') == null){
		var message = "<div id='browser-info'><h2>Your browser is not fully supported</h2><p>For the best experience, we recommend that you download one of the browsers listed below.</p><h3>Download a Supported Browser:</h3><ul id='supported-browsers'><li class='browser-link'><a href='http://www.mozilla.com/firefox/'>Firefox</a></li><li class='browser-link'><a href='http://www.apple.com/safari/'>Safari</a></li><li class='browser-link'><a href='http://www.google.com/chrome/'>Chrome</a></li><!--<li class='browser-link win'><a href='http://www.microsoft.com/windows/internet-explorer/default.aspx'>Internet Explorer 8</a></li><li class='browser-link'><a href='http://www.microsoft.com/windows/internet-explorer/ie7/'>Internet Explorer 7</a></li><li class='browser-link'><a href='http://www.opera.com/download/'>Opera</a></li>--></ul><p>IE 7,8,9 work for the most part but you might encounter minor problems.</p><p>If you are unable to upgrade your browser, please <a href='mailto:" + helpEmail + "'>contact us</a>.</p><p>To continue using this site, click 'Ignore.'</p><input type='submit' value='Ignore' onclick=\"jQuery.cookie('api-unsupported',true,{path:'/'});jQuery.unblockUI();\"/></div>"
		jQuery.blockUI({message : message, css : {cursor:'auto',top:'25%'}});
	}	
}
