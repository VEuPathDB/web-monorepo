var strats = new Array();
var xmldoc = null;
var init_strat_ids = new Array();
var init_strat_order = new Array();
var exportBaseURL;
var index = 0;

$(document).ready(function(){
	jQuery.each(init_strat_ids, function(){
		$.ajax({
			url: "showStrategy.do?strategy=" + this,
			type: "POST",
			dataType: "xml",
			success: function(data){
				id = loadModel(data);
				$("div#Strategies").append(displayModel(id));
				if (id == 0) {
					$("#diagram_0 div.venn:last .resultCount a").click();
				}
			}
		});
	});
});

function loadModel(data){
	var value = 0;
	$("root",data).children("strategy").each(function(){
		xmldoc = data;
		var newId = isLoaded(parseInt($(this).attr("id")));
		if(newId == -1)
			newId = index;
		strat = new Strategy(newId, $(this).attr("id"), true);
		steps = $(this).children("step");
		strat.initSteps(steps);
		id = parseInt($(this).attr("id"));
		if(isLoaded(id) != -1)
			strats[findStrategy(newId)] = strat;
		else
			strats.push(strat);
		index++;
		value = strat.frontId;
	});
	return value;
}

function isLoaded(id){
	for(i=0;i<strats.length;i++){
		if(strats[i].backId == id)
			return strats[i].frontId;
	} 
	return -1;
}

function findStrategy(fId){
	for(i=0;i<strats.length;i++){
		if(strats[i].frontId == fId)
			return i;
	}
	return -1;
}

function findStep(stratId, fId){
	steps = getStrategy(stratId).Steps;
	for(i=0;i<steps.length;i++){
		if(steps[i].frontId == fId)
			return i;
	}
	return -1;
}


function displayModel(strat_id){
	if(strats){
	  var strat = null;
	  strat = getStrategy(strat_id);
	  if(strat.isDisplay == true){
		var div_strat = document.createElement("div");
		$(div_strat).attr("id","diagram_" + strat.frontId).addClass("diagram");
		if(strat.subStratOf != null)
			$(div_strat).addClass("sub_diagram").css({"margin-left":"40px"});
		var close_span = document.createElement('span');
		$(close_span).addClass("closeStrategy").html(""+
		"	<a onclick='closeStrategy(" + strat.frontId + ")' href='javascript:void(0)'>"+
		"		<img alt='click here to remove strategy from the list' src='/assets/images/Close-X.png'/>"+
		"	</a>");
		$(div_strat).append(close_span);
		$(div_strat).append(createStrategyName($("strategy#" + strat.backId,xmldoc), strat));
		for(var j=0;j<strat.Steps.length;j++){
			last = false;
			if(j == strat.Steps.length - 1) 
				last = true;
			if(strat.Steps[j].back_boolean_Id == ""){
				var xml_step = $("strategy#" + strat.backId + " step#" + strat.Steps[j].back_step_Id, xmldoc);
				st = createStep(xml_step, strat.Steps[j], last);
				$(div_strat).append(st[0]);
				$(div_strat).append(st[1]);
			}else {
				var xml_step_boolean = $("strategy#" + strat.backId + " step#" + strat.Steps[j].back_boolean_Id, xmldoc);
				var xml_step_operand = $("strategy#" + strat.backId + " step#" + strat.Steps[j].back_step_Id, xmldoc);
				$(div_strat).append(createStep(xml_step_operand, strat.Steps[j], last)[0]);
				strat.Steps[j].isboolean = true;
				st = createStep(xml_step_boolean, strat.Steps[j], last);
				$(div_strat).append(st[0]);
				$(div_strat).append(st[1]);
				strat.Steps[j].isboolean = false;
			}
		}
		
		buttonleft = offset(strat.Steps.length);
		button = document.createElement('a');
		dType = $("step#" + strat.Steps[strat.Steps.length - 1].back_step_Id, xmldoc).attr("dataType");
		$(button).attr("id","filter_link").attr("href","javascript:openFilter('" + dType + "'," + strat.frontId + ")").attr("onclick","this.blur()").addClass("filter_link redbutton");
		$(button).html("<span>Add Step</span>");
		$(button).css({ position: "absolute",
						left: buttonleft + "px",
						top: "4.5em"});
		$(div_strat).append(button);
	    return div_strat;
	  }
    }
	return null;
}

function offset(index){
	//	return (index * 137) - (index - 1);
		return (index * 127) - (index - 1);
}

function createStep(ele, step, isLast){
	var strategyId = "";
	if(ele[0].parentNode.nodeName == "strategy")
		strategyId = isLoaded($(ele).parent().attr("id"));
	else
		strategyId = isLoaded($(ele).parent().parent().attr("id"));
	var name = $(ele).attr("name");
	var customName = $(ele).attr("customName");
	var shortName = $(ele).attr("shortName");
	if(customName != undefined){
		var usedName = customName;  //(customName.length > 15)?customName.substring(0,12) + "...":customName;
		if(name == customName)
			usedName = shortName;
	}else{
		usedName = name;
	}
	var collapsible = $(ele).attr("isCollapsed");
	if(collapsible == "true"){ 
		var collapsedName = $(ele).children("strategy:first").attr("name");
		if(collapsedName)
			usedName = collapsedName;   //(collapsedName.length > 15)?collapsedName.substring(0,12) + "...":collapsedName;
	}
	var fullName = usedName;
	usedName = (usedName.length > 15)?usedName.substring(0,12) + "...":usedName;
	var resultSize = $(ele).attr("results");
	var operation = $(ele).attr("operation");
	var dataType = getDataType(ele);
	var id = step.frontId;
	var cl ="";
	var inner = "";
	if(step.back_boolean_Id == ""){
		div_id = "step_" + id + "_sub";
		left = -1;
		cl = "box venn row2 col1 size1 arrowgrey";
		inner = ""+
			"		<h3>"+
			"			<a id='stepId_" + id + "' class='crumb_name' onclick='showDetails(this)' href='javascript:void(0)'>"+
							usedName +
			"				<span class='collapsible' style='display: none;'>" + collapsible + "</span>"+
			"			</a>"+
			"			<span id='fullStepName' style='display: none;'>" + fullName + "</span>"+
			"			<div class='crumb_details'></div>"+
			"		</h3>"+
			"		<h6 class='resultCount'><a class='results_link' href='javascript:void(0)' onclick='NewResults(" + strategyId + "," + id + ", false)'> " + resultSize + "&nbsp;" + dataType + "</a></h6>";
		if(!isLast){
			inner = inner + 
			"		<ul>"+
			"			<li><img class='rightarrow1' src='/assets/images/arrow_chain_right3.png' alt='input into'></li>"+
			"		</ul>";
		}
		stepNumber = document.createElement('span');
		$(stepNumber).addClass('stepNumber').css({ left: "3.7em"}).text("Step " + (id + 1));
	}else if(step.isboolean){
		div_id = "step_" + id;
		left = offset(id);	
		cl = "venn row2 size2 operation " + operation;
		inner = ""+
			"			<a class='operation' onclick='NewResults(" + strategyId + "," + id + ", true)' href='javascript:void(0)'>"+
			"				<img src='/assets/images/transparent1.gif'>"+
			"			</a>"+
			"			<h6 class='resultCount'>"+
			"				<a class='operation' onclick='NewResults(" + strategyId + "," + id + ", true)' href='javascript:void(0)'>" + resultSize + "&nbsp;" + dataType + "</a>"+
			"			</h6>";
		if(!isLast){
			inner = inner + 
			"			<ul>"+
			"				<li><img class='rightarrow2' src='/assets/images/arrow_chain_right4.png' alt='input into'></li>"+
			"			</ul>";
		}
		stepNumber = document.createElement('span');
		$(stepNumber).addClass('stepNumber').css({ left: (left + 30) + "px"}).text("Step " + (id + 1));
	}else{
		div_id = "step_" + id + "_sub";
		left = offset(id);
		cl = "box row1 size1 arrowgrey";
		inner = ""+
			"		<h3>"+
			"			<a id='stepId_" + id + "' class='crumb_name' onclick='showDetails(this)' href='javascript:void(0)'>"+
							usedName +
			"				<span class='collapsible' style='display: none;'>" + collapsible + "</span>"+
			"			</a>"+
			"			<span id='fullStepName' style='display: none;'>" + fullName + "</span>"+
			"			<div class='crumb_details'></div>"+
			"		</h3>"+
			"		<h6 class='resultCount'><a class='results_link' href='javascript:void(0)' onclick='NewResults(" + strategyId + "," + id + ", false)'> " + resultSize + "&nbsp;" + dataType + "</a></h6>"+
			"		<ul>"+
			"			<li><img class='downarrow' src='/assets/images/arrow_chain_down2.png' alt='equals'></li>"+
			"		</ul>";
		stepNumber = null;
	}
	var divs = new Array();
	var div_s = document.createElement("div");
	if(left != -1){
		$(div_s).attr("id", div_id).addClass(cl).html(inner);
		$(div_s).css({ left: left + "px"});
	}else{
		$(div_s).attr("id", div_id).addClass(cl).html(inner);
	}
	$(".crumb_details", div_s).replaceWith(createDetails(ele, strategyId, step));
	divs.push(div_s);
	divs.push(stepNumber);
	return divs;
}

function createDetails(ele, strat, step){
	var detail_div = document.createElement('div');
	$(detail_div).addClass("crumb_details").attr("disp","0").css({ display: "none" });
	var name = $(ele).attr("name");
	var shortName = $(ele).attr("shortName");
	var collapsible = $(ele).attr("isCollapsed");
	if(collapsible == "true"){ 
		var collapsedName = $(ele).children("strategy:first").attr("name");
		if(collapsedName)
			name = collapsedName;   //(collapsedName.length > 15)?collapsedName.substring(0,12) + "...":collapsedName;
	}
	var resultSize = $(ele).attr("results");
	var operation = $(ele).parent().attr("operation");
	var dType = $(ele).attr("dataType");
	var dataType = getDataType(ele);
	var urlParams = $("params urlParams", ele).text();
	var questionFullName = $(ele).attr("questionName");
	var collapsedName = "Expanded " + name;
	var id = step.frontId;
	var parentid = "";
	if(ele[0].parentNode.nodeName != 'strategy')
		parentid = $(ele).parent().attr("id");
	else
		parentid = step.back_step_Id;
	var params_table = createParameters($("params", ele));
	inner = ""+	
	    "		<div class='crumb_menu'>"+
		"			<a class='rename_step_link' href='javascript:void(0)' onclick='Rename_Step(this, " + strat + "," + id + ");hideDetails(this)'>Rename</a>&nbsp;|&nbsp;"+
		"			<a class='view_step_link' onclick='NewResults(" + strat + "," + id + ");hideDetails(this)' href='javascript:void(0)'>View</a>&nbsp;|&nbsp;"+
		"			<a class='edit_step_link' href='javascript:void(0)' onclick='Edit_Step(this,\"" + questionFullName + "\",\"" + urlParams + "\");hideDetails(this)' id='" + strat + "|" + parentid + "|" + operation + "'>Edit</a>&nbsp;|&nbsp;"+
		"			<a class='expand_step_link' href='javascript:void(0)' onclick='ExpandStep(" + strat + "," + id + ",\"" + collapsedName + "\");hideDetails(this)'>Expand</a>&nbsp;|&nbsp;"+
		"			<a class='insert_step_link' id='" + strat + "|" + parentid + "' href='javascript:void(0)' onclick='Insert_Step(this,\"" + dType + "\");hideDetails(this)'>Insert Before</a>"+
		"			&nbsp;|&nbsp;"+
		"			<a class='delete_step_link' href='javascript:void(0)' onclick='DeleteStep(" + strat + "," + id + ");hideDetails(this)'>Delete</a>"+
		"			<span style='float: right; position: absolute; right: 6px;'>"+
		"				<a href='javascript:void(0)' onclick='hideDetails(this)'>[x]</a>"+
		"			</span>"+
		"		</div>"+
		"		<p class='question_name'><span>" + name + "</span></p>"+
		"		<table></table>"+
		"		<p><b>Results:&nbsp;</b>" + resultSize + "&nbsp;" + dataType + "&nbsp;|&nbsp;<a href='downloadStep.do?step_id=" + id + "'>Download</a></p>";
		
	$(detail_div).html(inner);
	$("table", detail_div).replaceWith(params_table);
	return detail_div;       
}

function createParameters(params){
	var table = document.createElement('table');
	$(params).children("param").each(function(){
		var tr = document.createElement('tr');
		var prompt = document.createElement('td');
		var space = document.createElement('td');
		var value = document.createElement('td');
		$(prompt).addClass("medium").attr("align","right").attr("nowrap","nowrap").attr("valign","top");
		$(prompt).html("<b><i>" + $(this).attr("prompt") + "</i></b>");
		$(space).addClass("medium").attr("valign","top");
		$(space).html("&nbsp;:&nbsp;");
		$(value).addClass("medium").attr("align","left").attr("nowrap","nowrap");
		$(value).html( $(this).attr("value") );
		$(tr).append(prompt);
		$(tr).append(space);
		$(tr).append(value);
		$(table).append(tr);
	});
	return table;
}

function createStrategyName(ele, strat){
	var id = strat.backId;
	var name = $(ele).attr("name");
	var exportURL = exportBaseURL + getStep(strat.frontId, 0).answerId;	

	var div_sn = document.createElement("div");
	$(div_sn).attr("id","strategy_name");
	if (strat.subStratOf == null){
		$(div_sn).html(name + "<span id='strategy_id_span' style='display: none;'>" + id + "</span>" +
	"<span class='strategy_small_text'>" +
	"<br/>" +
	"<a class='save_strat_link' href='javascript:void(0)' onclick=\"showSaveForm('" + id + "')\">save as</a>" +
	"<div id='save_strat_div_" + id + "' class='modal_div save_strat'>" +
	"<span class='dragHandle'>" +
	"<div class='modal_name'>"+
	"<h1>Save As</h1>" + 
	"</div>"+
	"<a class='close_window' href='javascript:closeModal()'>"+
	"<img alt='Close' src='/assets/images/Close-X-box.png'/>" +
	"</a>"+
	"</span>"+
	"<form onsubmit='return validateSaveForm(this);' action=\"javascript:saveStrategy('" + id + "', true)\">"+
	"<input type='hidden' value='" + id + "' name='strategy'/>"+
	"<input type='text' value='' name='name'/>"+
	"<input type='submit' value='Save'/>"+
	"</form>"+
	"</div>"+
	"<br/>"+
	"<a href=\"javascript:showExportLink('" + id + "')\">export</a>"+
	"<div class='modal_div export_link' id='export_link_div_" + id + "'>" +
        "<span class='dragHandle'>" +
        "<a class='close_window' href='javascript:closeModal()'>" +
	"<img alt='Close' src='/assets/images/Close-X-box.png'/>" +
	"</a>" +
        "</span>" +
	"<p>Paste link in email:</p>" +
	"<input type='text' size=" + exportURL.length + " value=" + exportURL + " />" +
	"</div>"+
	"</span>");
	}else{
		$(div_sn).html(name + "<span id='strategy_id_span' style='display: none;'>" + id + "</span>"); 
	}
	return div_sn;
}

function NewResults(f_strategyId, f_stepId, bool){//(ele,url){
	var strategy = getStrategy(f_strategyId);
	var step = getStep(f_strategyId, f_stepId);
	if(bool){
		url = "showSummary.do?strategy=" + strategy.backId + "&step=" + step.back_boolean_Id + "&resultsOnly=true";
	}else{
		url = "showSummary.do?strategy=" + strategy.backId + "&step=" + step.back_step_Id + "&resultsOnly=true";
	}
	$.ajax({
		url: url,
		dataType: "html",
		success: function(data){
			step.isSelected = true;
			$("#Strategies div").removeClass("selected").removeClass("selectedarrow");
			if(bool){
				$("#diagram_" + strategy.frontId + " #step_" + step.frontId).addClass("selected");
			}else{
				$("#diagram_" + strategy.frontId + " #step_" + step.frontId + "_sub").addClass("selectedarrow");
			}
			ResultsToGrid(data);
		},
		error : function(data, msg, e){
			  alert("ERROR \n "+ msg + "\n" + e);
		}
	});
}

function removeStrategyDivs(stratId){
	strategy = getStrategyFromBackId(stratId);
	if(stratId.indexOf("_") > 0){
		var currentDiv = $("#Strategies div#diagram_" + strategy.frontId).remove();
		//sub = getStrategyFromBackId(stratId.substring(0,stratId.indexOf("_")));
		$("#Strategies div#diagram_" + sub.frontId).remove();
		subs = getSubStrategies(sub.frontId);
		for(i=0;i<subs.length;i++){
			$("#Strategies div#diagram_" + subs[i].frontId).remove();
		}
	}
	if(strategy.subStratOf != null){
		strats.splice(findStrategy(strategy.frontId));
	}
}

function AddStepToStrategy(url){	
	b_strategyId = parseUrl('strategy',url)[0];
	strategy = getStrategyFromBackId(b_strategyId);
	f_strategyId = strategy.frontId;
	var d = parseInputs();
	$.ajax({
		url: url,
		type: "POST",
		dataType:"xml",
		data: d,
		beforeSend: function(){
			showLoading(f_strategyId);
		},
		success: function(data){
			removeStrategyDivs(b_strategyId);
			updateStrategies(data);
			//removeLoading(f_strategyId);
			$("#diagram_" + f_strategyId + " div.venn:last .resultCount a").click();
			isInsert = "";
		},
		error: function(data, msg, e){
			//$("#Strategies").append(currentDiv);
			removeLoading(f_strategyId);
			alert("ERROR \n "+ msg + "\n" + e);
		}
	});
	update_hist = true;
	closeAll();
}

function EditStep(proto, url, step_number){
	$("#query_form").hide("fast");
	var s = parseUrl('strategy',url)[0];
	var d = parseInputs();
		$.ajax({
		url: url,
		type: "POST",
		dataType:"xml",
		data: d,
		beforeSend: function(obj){
				showLoading(proto.split("_")[0]);
				//$("div#step_" + step.frontId + " h3 div.crumb_details").hide();
			},
		success: function(data){
			var selectedBox = $("#Strategies div.selected");
            if (selectedBox.length == 0) selectedBox = $("#Strategies div.selectedarrow");
			removeStrategyDivs(s);
			updateStrategies(data);
		    selectedBox.find(".resultCount a").click();
		},
		error: function(data, msg, e){
			alert("ERROR \n "+ msg + "\n" + e);
		}
	});
	closeAll();
	update_hist = true;
}



function DeleteStep(f_strategyId,f_stepId){
	var strategy = getStrategy(f_strategyId);
	var step = getStep(f_strategyId, f_stepId);
	// Get the front id of the currently selected step & strategy
	var displayStep = $("div[id^='diagram_'] div.selectedarrow");
	if (displayStep.length == 0) displayStep = $("div[id^='diagram_'] div.selected");
	if (displayStep.length != 0) {
		var d_stepId = displayStep.attr("id").split('_')[1];
		var d_sub = displayStep.attr("id").split('_')[2];
		if (d_sub) d_sub = "_" + d_sub;
		else d_sub = "";
		var d_strategyId = displayStep.parent().attr("id").split('_')[1];
	}
	if (step.back_boolean_Id == "")
		url = "deleteStep.do?strategy=" + strategy.backId + "&step=" + step.back_step_Id;
	else
		url = "deleteStep.do?strategy=" + strategy.backId + "&step=" + step.back_boolean_Id;
		
	$.ajax({
		url: url,
		type: "post",
		dataType:"xml",
		beforeSend: function(obj){
				showLoading(f_strategyId);
				//$("div#step_" + step.frontId + " h3 div.crumb_details").hide();
			},
		success: function(data){
				removeStrategyDivs(strategy.backId);
				updateStrategies(data);
				if (d_strategyId && f_strategyId == d_strategyId) {
					var target;
					if (f_stepId == d_stepId) {
						$("#diagram_" + f_strategyId + " div.venn:last .resultCount a").click();
					}
					else if (f_stepId > d_stepId) {
						$("#diagram_" + f_strategyId + " div#step_" + d_stepId + d_sub + " .resultCount a").click();
					}
					else {
						$("#diagram_" + f_strategyId + " div#step_" + (d_stepId-1) + d_sub + " .resultCount a").click();
					}
				}	
			},
		error: function(data, msg, e){
			alert("ERROR \n "+ msg + "\n" + e);
			}
	});
	update_hist = true;
}

function ExpandStep(f_strategyId, f_stepId, collapsedName){
	var strategy = getStrategy(f_strategyId);
	var step = getStep(f_strategyId, f_stepId);
	un = (collapsedName.length > 15)?collapsedName.substring(0,12) + "...":collapsedName;
	url = "expandStep.do?strategy=" + strategy.backId + "&step=" + step.back_step_Id + "&collapsedName=" + collapsedName;
	$.ajax({
		url: url,
		type: "post",
		dataType: "xml",
		beforeSend: function(){
			showLoading(f_strategyId);
			//$("div#step_" + step.frontId + "_sub h3 div.crumb_details").hide();
		},
		success: function(data){
			x = loadModel(data);
			if(collapsedName.indexOf("UNION") == -1 && collapsedName.indexOf("MINUS") == -1 && collapsedName.indexOf("INTERSECT") == -1 )
				$("#step_" + f_stepId + "_sub h3 a:first").text(un);
			st = getStep(strategy.frontId, f_stepId);
			if(st.child_Strat_Id == null)
				alert("There was an error in the Expand Operation for this step.  Please contact administrator.");
			strats[findStrategy(st.child_Strat_Id)].isDisplay = true;
			subDiv = displayModel(st.child_Strat_Id);
			$("div#Strategies div#diagram_" + f_strategyId).after(subDiv);
			removeLoading(f_strategyId);
		},
		error: function(data, msg, e){
			alert("ERROR \n " + msg + "\n" + e);
		}
	});
	update_hist = true;
}

function updateStrategies(data){	
	stratId = loadModel(data);
//	$("div#Strategies div#diagram_" + stratId).remove();
//	subs = getSubStrategies(stratId);
//	for(i=0;i<subs.length;i++){
//		$("div#Strategies div#diagram_" + subs[i].frontId).remove();
		//closeStrategy(subs[i].frontId);
//	}
	if(isLoaded(stratId)){
		$("div#Strategies div#diagram_" + stratId).replaceWith(displayModel(stratId));
	}else{
		$("div#Strategies").append(displayModel(stratId));
	}
}

function openStrategy(stratId){
	var url = "showStrategy.do?strategy=" + stratId;
	$.ajax({
		url: url,
		datatype:"html",
		success: function(data){
			updateStrategies(data);
		},
		error: function(data, msg, e){
			alert("ERROR \n "+ msg + "\n" + e);
		}
	});
	$("#eye_" + stratId).removeClass("strat_inactive").addClass("strat_active");
}

function closeStrategy(stratId){
	strat = getStrategy(stratId);
	strat.isDisplay = false;
	var url = "closeStrategy.do?strategy=" + strat.backId;
	$.ajax({
		url: url,
		dataType:"html",
		success: function(data){
			hideStrat(stratId);
			update_hist = true;
		},
		error: function(data, msg, e){
			alert("ERROR \n "+ msg + "\n" + e);
		}
	});
	$("#eye_" + strat.backId).removeClass("strat_active").addClass("strat_inactive");
}

function hideStrat(id){
	var strat = getStrategy(id);
	for(var i=0;i<strat.Steps.length;i++){
		if(strat.Steps[i].child_Strat_Id != null){
			hideStrat(strat.Steps[i].child_Strat_Id);
		}
	}
	$("#diagram_" + id).hide("slow").remove();
}

function saveStrategy(stratId, checkName, fromHist){
//	s = getStrategyFromBackID(stratId);
	var saveForm = $("div#save_strat_div_" + stratId);
	if (fromHist) saveForm = $("#browse_rename");
	var name = $("input[name='name']",saveForm).attr("value");
	var strategy = $("input[name='strategy']",saveForm).attr("value");
	var url="renameStrategy.do?strategy=";
	url = url + strategy + "&name=" + name + "&checkName=" + checkName;
	if (fromHist) url = url + "&showHistory=true";
	$.ajax({
		url: url,
		dataType: "xml",
		success: function(data){
			// reload strategy panel
			if (data) {
				if (!fromHist) saveForm.hide();
				removeStrategyDivs(stratId);
				updateStrategies(data);
				update_hist = true;
				if (fromHist) updateHistory();
				displayHist(currentPanel);
			}
			else{
				// data == "" -> save unsuccessful -> name collision
				var overwrite = confirm("A strategy already exists with the name '" + name + ".' Do you want to overwrite the existing strategy?");
				if (overwrite) {
					saveStrategy(stratId, false);
				}
				else {
					saveForm.hide();
				}
			}
		},
		error: function(data, msg, e){
			alert("ERROR \n "+ msg + "\n" + e);
		}
	});
}

function showLoading(divId){
	var d = $("#diagram_" + divId);
	var l = document.createElement('span');
	$(l).attr("id","loadingGIF");
	var i = document.createElement('img');
	$(i).attr("src","/assets/images/loading2.gif");
	$(i).attr("height","23");
	//$(l).html("<p style='position:relative;top:-17px;z-index:300'>Loading...</p>");
	$(l).prepend(i);
	$(l).css({
		"text-align": "center",
		position: "absolute",
		left: "10px",
		top: "10px"
	});
	$(d).append(l);
}
function removeLoading(divId){
	$("#diagram_" + divId + " span#loadingGIF").remove();
}

function ChangeFilter(strategyId, stepId, url) {
        b_strategyId = strategyId;
        strategy = getStrategyFromBackId(b_strategyId); 
        f_strategyId = strategy.frontId;
        //var currentDiv = $("#Strategies div#diagram_" + f_strategyId);
        if(strategy.subStratOf != null){
                strats.splice(findStrategy(f_strategyId));
        }
        
        $.ajax({
                url: url,
                type: "GET",
                dataType:"xml",
                data: '',
                beforeSend: function(){
                        showLoading(f_strategyId);
                },
                success: function(data){
                        var selectedBox = $("#Strategies div.selected");
                        if (selectedBox.length == 0) selectedBox = $("#Strategies div.selectedarrow");
						removeStrategyDivs(strategy.backId);
                        updateStrategies(data);
                        //removeLoading(f_strategyId);
                        // $("#diagram_" + f_strategyId + " div.venn:last span.resultCount a").click();

                        selectedBox.find(".resultCount a").click();
                },
                error: function(data, msg, e){
                        //$("#Strategies").append(currentDiv);
                        removeLoading(f_strategyId);
                        alert("ERROR \n "+ msg + "\n" + e);
                }
        });
        update_hist = true;
        closeAll();

}

