/*
  popup.js

  Functions for displaying login,register, and unsupported browser popups

*/
$(document).ready(function() {
	popUnsupported();
});

function popLogin(){
	$.blockUI({message : $("#loginForm"), css : {cursor: 'auto',width:'30%',top:'40%',left:'35%' }});
}

function popRegister(){
	$.blockUI({message : $("#registerForm"), css : {cursor: 'auto',width: '80%',top:'10%',left:'10%' } });
}

function popUnsupported(){
	var userAgent = navigator.userAgent.toLowerCase();
	if (!$.browser.mozilla && (!$.browser.safari || /chrome/.test(userAgent))
	    && !($.browser.msie && parseInt($.browser.version) > 6) && $.cookie('api-unsupported') == null){
		var message = "<div id='browser-info'><h2>Your browser is not supported</h2><p>For the best experience using our website, we recommend that you download one of the supported browsers listed below.</p><h3>Download a Supported Browser:</h3><ul id='supported-browsers'><li class='browser-link'><a href='http://www.mozilla.com/firefox/'>Firefox</a></li><li class='browser-link'><a href='http://www.apple.com/safari/'>Safari</a></li><li class='browser-link win'><a href='http://www.microsoft.com/windows/internet-explorer/default.aspx'>Internet Explorer 8</a></li><li class='browser-link'><a href='http://www.microsoft.com/windows/internet-explorer/ie7/'>Internet Explorer 7</a></li><!--<li class='browser-link'><a href='http://www.opera.com/download/'>Opera</a></li>--></ul><p>If you are unable to install a supported browser, you may want to use the older version of this site, available <a href='" + oldSiteUrl + "'>here</a>.</p><p>If you would like to continue using this site without upgrading your browser, simply click 'Ignore' below.</p><input type='submit' value='Ignore' onclick=\"$.cookie('api-unsupported',true,{path:'/'});$.unblockUI();\"/></div>"
		$.blockUI({message : message, css : {cursor:'auto',top:'25%'}});
	}
}
