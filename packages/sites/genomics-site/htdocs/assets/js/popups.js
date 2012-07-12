/*
  popup.js
  
  Functions for displaying login,register, and unsupported browser popups
  
*/

jQuery(document).ready(function(){
  popUnsupported();
});

function popLogin(destination){
  jQuery.blockUI({message : jQuery("#loginForm"), css : {cursor: 'auto',width:'30%',top:'40%',left:'35%' }});
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
    var message = jQuery("#wdk-dialog-IE-warning");
    jQuery.blockUI({message : message, css : {cursor:'auto',top:'5%'}});
  }	
}
