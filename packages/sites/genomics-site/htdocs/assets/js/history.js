var selected = new Array();
var currentPanel;

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

function selectAllHist() {
	$("div.history_panel.enabled input:checkbox").attr("checked", "yes");
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
			if (!currentPanel || currentPanel != type) currentPanel = type;
			$(this).attr("id", "selected_type");
		}
	});
	$("div.panel_" + type).show();
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
		url = url + selected.join("&strategy=");
		$.ajax({
			url: url,
			dataType: "html",
			success: function(data) {
				$("#search_history").html($("#search_history", data).html());
				$("#mysearch").html($("#mysearch", data).html());
				for (i = 0; i < selected.length; i++){
					var strat = getStrategyFromBackId(selected[i]);
					hideStrat(strat.frontId);
				}
				selectNoneHist();
			},
			error: function(data, msg, e) {
				selectNoneHist();
				alert("ERROR \n " + msg + "\n" + e);
			}
		});
	}	
}


//FOLLOWING TAKEN FROM OLD CUSTOMQUERYHISTORY

var currentStrategyId = 0;

function enableRename(stratId, name) {
   // close the previous one
   disableRename();
   
   currentStrategyId = stratId;
   var form = document.getElementById('browse_rename');
   form.action = "javascript:saveStrategy('" + stratId + "', true, true)";
   var button = document.getElementById('activate_' + stratId);
   button.style.display = 'none';
   var text = document.getElementById('text_' + stratId);
   text.style.display = 'none';
   var nameBox = document.getElementById('name_' + stratId);
   nameBox.innerHTML = "<input name='strategy' type='hidden' value='" + stratId + "' />"
                  + "<input id='name' name='name' type='text' maxLength='2000' value='" + name + "' style='margin-right:4px;width:100%' />" 
   nameBox.style.display='block';
   var input = document.getElementById('input_' + stratId);
   input.innerHTML = "<input type='submit' value='Save' />"
                   + "<input type='reset' value='Cancel' onclick='disableRename()' />";
   input.style.display='block';
   nameBox = document.getElementById('name');
   nameBox.select();
   nameBox.focus();
}

function disableRename() {
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
