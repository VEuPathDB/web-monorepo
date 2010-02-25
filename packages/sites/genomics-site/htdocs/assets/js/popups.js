/*
  popup.js

  Functions for displaying login,register, and unsupported browser popups

*/jQuery
jQuery(document).ready(function() {
	popUnsupported();
});

function popLogin(){
	jQuery.blockUI({message : jQuery("#loginForm"), css : {cursor: 'auto',width:'30%',top:'40%',left:'35%' }});
}

function popRegister(){
	jQuery.blockUI({message : jQuery("#registerForm"), css : {cursor: 'auto',width: '80%',top:'10%',left:'10%' } });
}

function popUnsupported(){
	var userAgent = navigator.userAgent.toLowerCase();
	if (!jQuery.browser.mozilla && (!jQuery.browser.safari || /chrome/.test(userAgent))
	    && !(jQuery.browser.msie && parseInt(jQuery.browser.version) > 6) && jQuery.cookie('api-unsupported') == null){
		var message = "<div id='browser-info'><h2>Your browser is not supported</h2><p>For the best experience, we recommend that you download one of the supported browsers listed below.</p><h3>Download a Supported Browser:</h3><ul id='supported-browsers'><li class='browser-link'><a href='http://www.mozilla.com/firefox/'>Firefox</a></li><li class='browser-link'><a href='http://www.apple.com/safari/'>Safari</a></li><li class='browser-link win'><a href='http://www.microsoft.com/windows/internet-explorer/default.aspx'>Internet Explorer 8</a></li><li class='browser-link'><a href='http://www.microsoft.com/windows/internet-explorer/ie7/'>Internet Explorer 7</a></li><!--<li class='browser-link'><a href='http://www.opera.com/download/'>Opera</a></li>--></ul><p>If you are unable to upgrade your browser, please <a href='mailto:" + helpEmail + "'>email us</a>.</p><p>To continue using this site without upgrading your browser, click 'Ignore.'</p><input type='submit' value='Ignore' onclick=\"jQuery.cookie('api-unsupported',true,{path:'/'});jQuery.unblockUI();\"/></div>"
		jQuery.blockUI({message : message, css : {cursor:'auto',top:'25%'}});
	}
}
