var selected = new Array();

function updateHistory(){
	if(update_hist){
		$("div#search_history").block();
		$.ajax({
			url: "showQueryHistory.do",
			dataType: "html",
			success: function(data){
				$("#search_history").html(data);
				initDisplayType();
				$("div#search_history").unblock();

				update_hist = false;
			},
			error: function(data, msg, e){
				$("div#search_history").unblock();
				alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReload this page might solve the problem. \nOtherwise, please contact site support.");
			}
		});
	}
	else{
		initDisplayType();
	}
}

function initDisplayType() {
	var currentPanel = getCurrentTabCookie(true);
	if ($("#tab_" + currentPanel).length == 0) {
		var type = $("#history_tabs a:first").attr("id").substr(4);
		displayHist(type);
	} else
		displayHist(currentPanel);
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

function showHistSave(ele, stratId) {
       var btnOffset = $(ele).offset();
       var prntOffset = $("div#search_history").offset();
       $("div#hist_save_" + stratId).css("top", btnOffset.top - prntOffset.top + "px");
       $("div#hist_save_" + stratId).show();
}

function showHistShare(ele, stratId) {
       var btnOffset = $(ele).offset();
       var prntOffset = $("div#search_history").offset();
       $("div#hist_share_" + stratId).css("top", btnOffset.top - prntOffset.top + "px");
       $("div#hist_share_" + stratId).show();
}

function selectAllHist() {
	var currentPanel = getCurrentTabCookie(true);
	$("div.history_panel.panel_" + currentPanel + " input:checkbox").attr("checked", "yes");
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
	$("div.panel_" + type).show();
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

function deleteStrategies(url) {
	// make sure something is selected.
	if (selected.length == 0) {
		return false;
	}
	// else delete and replace page sections that have changed
	var agree=confirm("Are you sure you want to delete the selected strategies?");
 	if (agree) {
		$("div#search_history").block();
		url = url + selected.join("&strategy=");
		$.ajax({
			url: url,
			dataType: "json",
			data:"state=" + p_state,
			success: function(data) {
				selectNoneHist();
				updateStrategies(data);
				update_hist = true;
				updateHistory(); // update history immediately, since we're already on the history page
			},
			error: function(data, msg, e) {
				selectNoneHist();
				$("div#search_history").unblock();
				alert("ERROR \n " + msg + "\n" + e
                                      + ". \nReload this page might solve the problem. \nOtherwise, please contact site support.");
			}
		});
	}	
}


//FOLLOWING TAKEN FROM OLD CUSTOMQUERYHISTORY

var currentStrategyId = 0;

function enableRename(stratId, name, fromHist) {
	if (fromHist) {
		// close the previous one
		disableRename();
		currentStrategyId = stratId;
		var form = document.getElementById('browse_rename');
		form.action = "javascript:renameStrategy('" + stratId + "', true, true)";
		var button = document.getElementById('activate_' + stratId);
		button.style.display = 'none';
		var text = document.getElementById('text_' + stratId);
		text.style.display = 'none';
		var nameBox = document.getElementById('name_' + stratId);
		nameBox.innerHTML = "<input name='strategy' type='hidden' value='" + stratId + "' />"
		+ "<input id='name' name='name' type='text' maxLength='2000' value='" + name + "' style='margin-right:4px;width:100%' />" 
		nameBox.style.display='block';
		var input = document.getElementById('input_' + stratId);
		input.innerHTML = "<input type='submit' value='Rename' />"
		+ "<input type='reset' value='Cancel' onclick='disableRename(null, true)' />";
		input.style.display='block';
		nameBox = document.getElementById('name');
		nameBox.select();
		nameBox.focus();
	}
	else {
		var strat = getStrategyFromBackId(stratId);
		var stratName = $("#diagram_" + strat.frontId + " #strategy_name > span").eq(0);
		var append = $("#diagram_" + strat.frontId + " #append");
		stratName.hide();
		append.hide();
		$("#diagram_" + strat.frontId + " #rename").show();
	}
}

function disableRename(stratId, fromHist) {
	if (fromHist) {
		if (currentStrategyId && currentStrategyId != '0') {
			var form = document.getElementById('browse_rename');
			form.action = "javascript:return false;";
			var button = document.getElementById('activate_' + currentStrategyId);
			button.style.display = 'block';
			var name = document.getElementById('name_' + currentStrategyId);
			name.innerText = '';
			name.style.display = 'none';
			var input = document.getElementById('input_' + currentStrategyId);
			input.innerText = '';
			input.style.display = 'none';
			var text = document.getElementById('text_' + currentStrategyId);
			text.style.display = 'block';
			currentStrategyId = 0;
		}
	}
	else {
		var strat = getStrategyFromBackId(stratId);
		var stratName = $("#diagram_" + strat.frontId + " #strategy_name > span").eq(0);
		var append = $("#diagram_" + strat.frontId + " #append");
		var nameDiv = $("#diagram_" + strat.frontId + " #rename > #name");
		var onblur = nameDiv.attr("onblur");
		nameDiv.removeAttr("onblur");
		$("#diagram_" + strat.frontId + " #rename").hide();
		//nameDiv.attr("onblur",onblur);
		stratName.show();
		append.show();
	}
}

function toggleEye(ele, stratId) {
	s = getStrategyFromBackId(stratId);
	var url = "";
	var td = $(ele).parent();
	if (td.hasClass("strat_inactive")){
		openStrategy(stratId);
	}else{
		closeStrategy(s.frontId);//stratId);
	}
}
