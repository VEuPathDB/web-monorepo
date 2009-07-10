var selected = new Array();
var overStepId = 0;
var currentStepId = 0;
var update_hist = true;
var queryhistloaded = false;

function updateQueryHistory(){
	$.ajax({
		url: "showQueryHistory.do?type=step",
		dataType: "html",
		beforeSend:function(){
			$("body").block();
		},
		success: function(data){
			$("div.loading").html(data);
			$("body").unblock();
		}
	});
}

function updateHistory(){
	if(update_hist){
		update_hist = false;
		queryhistloaded = false;
		$("body").block();//$("div#search_history").block();
		$.ajax({
			url: "showQueryHistory.do",
			dataType: "html",
			success: function(data){
				$("#search_history").html(data);
				initDisplayType();
				$("body").unblock();//$("div#search_history").unblock();

			//	update_hist = false;
			},
			error: function(data, msg, e){
				$("body").unblock();//$("div#search_history").unblock();
				alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReloading this page might solve the problem. \nOtherwise, please contact site support.");
			}
		});
	}
	else{
		initDisplayType();
	}
}

function initDisplayType() {
	var currentPanel = getCurrentTabCookie(true);
	if($("#history_tabs").length > 0){
		if ($("#tab_" + currentPanel).length == 0) {
			var type = $("#history_tabs a:first").attr("id").substr(4);
			displayHist(type);
		} else
			displayHist(currentPanel);
	}
}

function toggleSteps(strat) {
	var img = $("img#img_" + strat);
	if (img.hasClass("plus")) {
		$("tbody#steps_" + strat + " tr").each(function() {
							this.style.display = "";
							});
	        img[0].src = "/assets/images/sqr_bullet_minus.png";
		img.removeClass("plus");
		img.addClass("minus");
	}
	else {
		$("tbody#steps_" + strat + " tr").each(function() {
							this.style.display = "none"
							});
	        img[0].src = "/assets/images/sqr_bullet_plus.png";
		img.removeClass("minus");
		img.addClass("plus");
	}
}

function toggleSteps2(strat) {
	var img = $("img#img_" + strat);
	if (img.hasClass("plus")) {
		$("tr#desc_" + strat + " tr").each(function() {	this.style.display = ""; });
		$("tr#desc_" + strat).each(function() {	this.style.display = ""; });
	        img[0].src = "/assets/images/sqr_bullet_minus.png";
		img.removeClass("plus");
		img.addClass("minus");
	}
	else {
		$("tr#desc_" + strat + " tr").each(function() {	this.style.display = "none" });
		$("tr#desc_" + strat).each(function() {	this.style.display = "none" });
	        img[0].src = "/assets/images/sqr_bullet_plus.png";
		img.removeClass("minus");
		img.addClass("plus");
	}
}

function showHistSave(ele, stratId, save,share) {
	   $(".viewed-popup-box").remove();
	   var perm_popup = $("div#hist_save_rename");
       var stratName = $("div#text_" + stratId + " span").text();
       var popup = perm_popup.clone();
	   popup.addClass('viewed-popup-box');
	   $("input[name='name']", popup).attr("value",stratName);
	   $("input[name='strategy']",popup).attr("value",stratId);
       if (save){
         $("form", popup).attr("action", "javascript:saveOrRenameStrategy(" + stratId + ", true, true, true)");
         $("span.h3left", popup).text("Save As");
         $("input[type=submit]", popup).attr("value", "Save");
 	 if (share) {
		  $("span.h3left", popup).text("First you need to Save it!");
         }
       }
       else{
         $("form", popup).attr("action", "javascript:saveOrRenameStrategy(" + stratId + ", true, false, true)");
         $("span.h3left", popup).text("Rename");
         $("input[type=submit]", popup).attr("value", "Rename");
       }
       var btnOffset = $(ele).offset();
       var prntOffset = $("div#search_history").offset();
       popup.css("top", (btnOffset.top - prntOffset.top - 40) + "px");
       popup.css("right", "292px");
       popup.appendTo(perm_popup.parent()).show();
	$("input[name='name']", popup).focus().select();
}

function showHistShare(ele, stratId, url) {
	$(".viewed-popup-box").remove();
	var perm_popup = $("div#hist_save_rename");
    var popup = perm_popup.clone();
	popup.addClass('viewed-popup-box');
	$("span.h3left", popup).text("Copy and paste URL below to email or bookmark");
	$("input[name='name']", popup).attr("value",url).attr("readonly",true).attr("size",url.length - 12);
	$("input[type=submit]", popup).attr("value", "Ok").click(function(){
		closeModal();
		return false;
	});
	var btnOffset = $(ele).offset();
    var prntOffset = $("div#search_history").offset();
    popup.css("top", (btnOffset.top - prntOffset.top - 40) + "px");
    popup.css("right", "292px");
    popup.css("width", "62.5em");
    popup.appendTo(perm_popup.parent()).show();
}

function selectAllHist(type) {
	var currentPanel = getCurrentTabCookie(true);
	selectNoneHist();
	if (type == 'saved'){
		$("div.history_panel.saved-strategies.panel_" + currentPanel + " input:checkbox").attr("checked", "yes");
	}
	else if (type == 'unsaved'){
		$("div.history_panel.unsaved-strategies.panel_" + currentPanel + " input:checkbox").attr("checked", "yes");
	}
	else{
		$("div.history_panel.panel_" + currentPanel + " input:checkbox").attr("checked", "yes");
	}
	updateSelectedList();
}

function selectNoneHist() {
	$("div.history_panel input:checkbox").removeAttr("checked");
	selected = new Array();
}

function displayHist(type) {
	$("#selected_type").removeAttr("id");
	$(".history_panel").hide();
	selectNoneHist();
	$("#history_tabs li").each(function() {
		var id = $("a", this).attr("id");
		if (id == 'tab_' + type) {
			$(this).attr("id", "selected_type");
		}
	});
	if (type == 'cmplt'){
		if(!queryhistloaded){
			updateQueryHistory();
			queryhistloaded = true;
		}
		 $(".history_controls").hide();
	}
	else $(".history_controls").show();
	$("div.panel_" + type).show();
	if ($("div.panel_" + type + " .unsaved-strategies-body").height() > 250) $("div.panel_" + type + " .unsaved-strategies-body").addClass('tbody-overflow');
	setCurrentTabCookie('search_history');
	setCurrentTabCookie(type, true);
}

function updateSelectedList() {
	selected = new Array();
	$("div.history_panel input:checkbox").each(function (i) {
		if ($(this).attr("checked")) {
			selected.push($(this).attr("id"));
		}
	});
}
		
function downloadStep(stepId) {
	var url = "downloadStep.do?step_id=" + stepId;
	window.location = url;
}

function handleBulkStrategies(type) {
	var agree;
	var url;
	if (type == 'delete') url = "deleteStrategy.do?strategy=";
	else if (type == 'open') url = "showStrategy.do?strategy=";
	else url = "closeStrategy.do?strategy=";
	// make sure something is selected.
	if (selected.length == 0) {
		alert("No strategies were selected!");
		return false;
	}
	if (type == 'delete'){
		// else delete and replace page sections that have changed
		agree=confirm("Are you sure you want to delete the selected strategies?");
	}
	if (type != 'delete' || agree) {
	// Alrady being done by the UpdateHistory function	$("div#search_history").block();
		url = url + selected.join(",");
		$.ajax({
			url: url,
			dataType: "json",
			data:"state=" + p_state,
			success: function(data) {
				selectNoneHist();
				updateStrategies(data);
				if (type == 'open') showPanel('strategy_results');
				else{
					update_hist = true;
					updateHistory(); // update history immediately, since we're already on the history page
				}
			},
			error: function(data, msg, e) {
				selectNoneHist();
				$("div#search_history").unblock();
				alert("ERROR \n " + msg + "\n" + e
                                     + ". \nReloading this page might solve the problem. \nOtherwise, please contact site support.");
			}
		});
	}
}

function displayName(histId) {
   if (overStepId != histId) hideAnyName();
   overStepId = histId;
   display = $('#div_' + histId);
   display.css({ 'top' : (display.parent().position().top + 20)});
   $('#div_' + histId).show();
}

function hideName(histId) {
   if (overStepId == 0) return;
   
   $('#div_' + histId).hide();
}

function hideAnyName() {
    hideName(overStepId);
}
