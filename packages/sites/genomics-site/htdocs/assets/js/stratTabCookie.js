//CONSTANTS
var currentTabCookie = "current_application_tab";
var currentHistTabCookie = "current_history_tab";

function getCurrentTabCookie(isHist){
	if (isHist)
		return $.cookie(currentHistTabCookie);
	else
		return $.cookie(currentTabCookie);
}

function setCurrentTabCookie(value, isHist){
	if (isHist)
		$.cookie(currentHistTabCookie, value, { path : '/' });
	else
		$.cookie(currentTabCookie, value, { path : '/' });
	return true; //so that href will be followed when setting cookie in a link's onclick attr
}
