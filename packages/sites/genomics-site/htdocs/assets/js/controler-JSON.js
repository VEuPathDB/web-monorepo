var strats = new Array();
var xmldoc = null;
var init_strat_ids = new Array();
var init_strat_order = new Array();
var init_view_strat = null;
var init_view_step = null;
var exportBaseURL;
var sidIndex = 0;
var recordType= new Array();   //stratid, recordType which is the type of the last step




$(document).ready(function(){
	if(init_strat_ids.length == 0){
		showInstructions();
	}else{
		initDisplay(0);
	}
});

function initDisplay(index){
	$.ajax({
		url: "showStrategy.do?strategy=" + init_strat_ids[index],
		type: "POST",
                data: '',
		dataType: "JSON",
		success: function(data){
			data = eval("(" + data + ")");
			//id = loadModel(data);
			//$("div#Strategies").append(displayModel(id));
			id = updateStrategies(data, "Open", null);
			var strat = getStrategy(id);
			if (init_view_strat == null && id == 0)
				$("#diagram_0 div.venn:last .resultCount a").click();
			else if (init_view_strat == strat.backId) {
				var step = getStepFromBackId(strat.backId, init_view_step);
				var stepBox = $("#diagram_" + strat.frontId + " div#step_" + step.frontId);
				if (stepBox.length == 0) stepBox = $("#diagram_" + strat.frontId + " div#step_" + step.frontId + "_sub");
				$(".resultCount a", stepBox).click();
			}
			if(index+1 < init_strat_ids.length)
				initDisplay(index+1);
		}
	});
}

function showInstructions(){
	$("#strat-instructions").remove();
	$("#strat-instructions-2").remove();
	var instr = document.createElement('div');
	id = "strat-instructions";
	instr_text = "<br>Click '<a href='queries_tools.jsp'>New Search</a>' <br/> to start a strategy";
	instr_text2 = "Or Click on '<a href='javascript:showPanel('search_history')'>Browse Strategies</a>' to view your available strategies.";
	arrow_image = "<img id='ns-arrow' alt='Arrow pointing to New Search Button' src='/assets/images/lookUp.png' width='45px'/>"; 
	arrow_image2 = "<img id='bs-arrow' alt='Arrow pointing to Browse Strategy Tab' src='/assets/images/lookUp2.png' width='45px'/>"; 
	as = $("#mysearch").text();
	as = as.substring(as.indexOf(":") + 2);
	if(as != "0"){
		instr_text = instr_text + "<br>" + instr_text2;
		id = id + "-2";
		arrow_image = arrow_image + arrow_image2;
	}
	$(instr).attr("id",id).html(arrow_image + instr_text);
	$("#Strategies").append(instr);
}

function loadModel(json){
	var value = -1;
	var strategy = json.strategy;
	//$("root",data).children("strategy").each(function(){
		var newId = isLoaded(strategy.id);//parseInt(strategy.id));
		if(newId == -1){
			newId = sidIndex;
			sidIndex++;
		}
		var strat = new Strategy(newId, strategy.id, false);
		if(strategy.importId != ""){
			strat.isDisplay = true;
			strat.checksum = json.strategies[strat.backId];
		}else{
			prts = strat.backId.split("_");
			strat.subStratOf = getStrategyFromBackId(prts[0]).frontId;
			if(strategy.order > 0){
				strat.isDisplay = true;
			}
		}
		strat.JSON = strategy;
		strat.isSaved = strategy.saved;
		strat.name = strategy.name;
             //   strat.savedName = $(this).attr("savedName");
                strat.importId = strategy.importId;
		steps = strategy.steps;
		var pos = strats.push(strat);
		strat.initSteps(steps);
		strats.splice(pos-1, 1);
		//lstp = strat.getStep(strategy.steps.length);
		strat.dataType = strategy.steps[strategy.steps.length].dataType;
		id = strategy.id;
		if(isLoaded(id) != -1){
			strats[findStrategy(newId)] = strat;
		}else{
			strats.push(strat);
		}
		value = strat.frontId;
	//});
	return value;
}

function unloadStrategy(id){
	for(s in strats){
		s = parseInt(s);
		if(strats[s].frontId == id){//if(strats[s].backId.indexOf(id + "_") != -1)
			strats.splice(s,1);
			return;
		}
	}
}

function isLoaded(id){
	for(i=0;i<strats.length;i++){
		if(strats[i].backId == id)
			return strats[i].frontId;
	} 
	return -1;
}

function NewResults(f_strategyId, f_stepId, bool){//(ele,url){
	if(f_strategyId == -1){
		$("div#Workspace").html("");
		return;
	}
	var strategy = getStrategy(f_strategyId);
	var step = getStep(f_strategyId, f_stepId);
	if(bool){
		url = "showSummary.do?strategy=" + strategy.backId + "&step=" + step.back_boolean_Id + "&resultsOnly=true";
	}else{
		url = "showSummary.do?strategy=" + strategy.backId + "&step=" + step.back_step_Id + "&resultsOnly=true";
	}
        url += "&noskip=1";
	$.ajax({
		url: url,
		dataType: "html",
		beforeSend: function(){
			showLoading(f_strategyId);
		},
		success: function(data){
			step.isSelected = true;
			$("#Strategies div").removeClass("selected").removeClass("selectedarrow").removeClass("selectedtransform");
			if(bool){
				$("#diagram_" + strategy.frontId + " #step_" + step.frontId).addClass("selected");
			}else if (step.isTransform){
				$("#diagram_" + strategy.frontId + " #step_" + step.frontId + "_sub").addClass("selectedtransform");
			}else{
				$("#diagram_" + strategy.frontId + " #step_" + step.frontId + "_sub").addClass("selectedarrow");
			}
			removeLoading(f_strategyId);
			ResultsToGrid(data);
		},
		error : function(data, msg, e){
			  alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReload this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
}


function AddStepToStrategy(url, proto, stpId){	
	//b_strategyId = parseUrl("strategy",url)[0];
	//strategy = getStrategyFromBackId(b_strategyId);
	//f_strategyId = strategy.frontId;
	var strategy = getStrategyFromBackId(proto);
	var b_strategyId = strategy.backId;
	var f_strategyId = strategy.frontId;
	var cs = strategy.checksum;
	if(strategy.subStratOf != null)
		cs = getStrategy(strategy.subStratOf).checksum;
	url = url + "&strategy_checksum="+cs;//"processFilter.do?strategy="+b_strategyId+"&insert=&strategy_checksum="+strategy.checksum;
	var d = parseInputs();
	$.ajax({
		url: url,
		type: "POST",
		dataType:"JSON",
		data: d,
		beforeSend: function(){
			showLoading(f_strategyId);
		},
		success: function(data){
			data = eval("(" + data + ")");
			if(ErrorHandler("AddStep", data, strategy, $("div#query_form"))){
				$("div#query_form").parent().remove();
				removeStrategyDivs(b_strategyId);
				f_id = updateStrategies(data,"AddStep", strategy);
				removeLoading(f_id);
				$("#diagram_" + f_id + " div.venn:last .resultCount a").click();
				isInsert = "";
			}else{
				removeLoading(f_strategyId);
			}
		},
		error: function(data, msg, e){
			//$("#Strategies").append(currentDiv);
			removeLoading(f_strategyId);
			alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReload this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
	update_hist = true;
	closeAll(true);
}

function EditStep(url, proto, step_number){
	$("#query_form").hide("fast");
//	var s = parseUrl('strategy',url)[0];
	var ss = getStrategyFromBackId(proto);
	var s = proto;
	var d = parseInputs();
	var cs = ss.checksum;
	if(ss.subStratOf != null)
		cs = getStrategy(ss.subStratOf).checksum;
	url = url+"&strategy_checksum="+cs;
		$.ajax({
		url: url,
		type: "POST",
		dataType:"JSON",
		data: d,
		beforeSend: function(obj){
				showLoading(proto.split("_")[0]);
				//$("div#step_" + step.frontId + " h3 div.crumb_details").hide();
			},
		success: function(data){
			data = eval("(" + data + ")");
			if(ErrorHandler("EditStep", data, ss, $("div#query_form"))){
				var selectedBox = $("#Strategies div.selected");
				if (selectedBox.length == 0) selectedBox = $("#Strategies div.selectedarrow");
				if (selectedBox.length == 0) selectedBox = $("#Strategies div.selectedtransform");
				var selectedStrat = selectedBox.parent().attr("id");
				selectedBox = selectedBox.attr("id");
				removeStrategyDivs(s);
				fsid = updateStrategies(data, "EditStep", getStrategyFromBackId(s));
				var selectedLink = $("#" + selectedStrat + " #" + selectedBox + " .resultCount a");
				if (selectedLink.length != 0) selectedLink.click();
				else NewResults(-1);
			}else{
				removeLoading(ss.frontId);
			}
		},
		error: function(data, msg, e){
			alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReload this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
	closeAll(true);
	update_hist = true;
}



function DeleteStep(f_strategyId,f_stepId){
	var strategy = getStrategy(f_strategyId);
	var step = getStep(f_strategyId, f_stepId);
	// Get the front id of the currently selected step & strategy
	var displayStep = $("div[id^='diagram_'] div.selectedarrow");
	if (displayStep.length == 0) displayStep = $("div[id^='diagram_'] div.selected");
	if (displayStep.length == 0) displayStep = $("div[id^='diagram_'] div.selectedtransform");
	if (displayStep.length != 0) {
		var d_stepId = displayStep.attr("id").split('_')[1];
		var d_sub = displayStep.attr("id").split('_')[2];
		if (d_sub) d_sub = "_" + d_sub;
		else d_sub = "";
		var d_strategyId = displayStep.parent().attr("id").split('_')[1];
	}
	var cs = strategy.checksum;
	if(strategy.subStratOf != null)
		cs = getStrategy(strategy.subStratOf).checksum;
	if (step.back_boolean_Id == "")
		url = "deleteStep.do?strategy=" + strategy.backId + "&step=" + step.back_step_Id+"&strategy_checksum="+cs;
	else
		url = "deleteStep.do?strategy=" + strategy.backId + "&step=" + step.back_boolean_Id+"&strategy_checksum="+cs;
		
	$.ajax({
		url: url,
		type: "post",
		dataType:"JSON",
		data:"",
		beforeSend: function(obj){
				showLoading(f_strategyId);
				//$("div#step_" + step.frontId + " h3 div.crumb_details").hide();
			},
		success: function(data){
				data = eval("(" + data + ")");
				if(ErrorHandler("DeleteStep", data, strategy, null)){
					if(step.child_Strat_Id != null){
						if(findStrategy(step.child_Strat_Id) != -1 && getStrategy(step.child_Strat_Id).isDisplay)
							hideStrat(step.child_Strat_Id);
					}
					if(data.strategy != undefined){
						removeStrategyDivs(strategy.backId);
						var new_f_strategyId = updateStrategies(data, "DeleteStep", strategy);
						if (d_strategyId && f_strategyId == d_strategyId) {
							var target;
							if (f_stepId == d_stepId) {
								$("#diagram_" + new_f_strategyId + " div.row2:last .resultCount a").click();
							}
							else if (f_stepId > d_stepId) {
								$("#diagram_" + new_f_strategyId + " div#step_" + d_stepId + d_sub + " .resultCount a").click();
							}
							else {
								if(d_sub == "" && d_stepId == 1) d_sub = "_sub";
								$("#diagram_" + new_f_strategyId + " div#step_" + (d_stepId-1) + d_sub + " .resultCount a").click();
							}
						}
					}else{
						removeStrategyDivs(strategy.backId);
						$("div#diagram_"+strategy.frontId).remove();
						if($("#Strategies div").length == 0){
							showInstructions();
							NewResults(-1);
						}
					}
				}else{
					removeLoading(strategy.frontId);
				}	
			},
		error: function(data, msg, e){
				//alert("ERROR \n "+ msg + "\n" + e);
				removeStrategyDivs(strategy.backId);
				if($("#Strategies div").length == 0){
					showInstructions();
				}
			}
	});
	update_hist = true;
}

function ExpandStep(e, f_strategyId, f_stepId, collapsedName){
	var strategy = getStrategy(f_strategyId);
	var step = getStep(f_strategyId, f_stepId);
	un = (collapsedName.length > 15)?collapsedName.substring(0,12) + "...":collapsedName;
	var cs = strategy.checksum;
	if(strategy.subStratOf != null)
		cs = getStrategy(strategy.subStratOf).checksum;
	url = "expandStep.do?strategy=" + strategy.backId + "&step=" + step.back_step_Id + "&collapsedName=" + collapsedName+"&strategy_checksum="+cs;
	$.ajax({
		url: url,
		type: "post",
		dataType: "JSON",
		data: "",
		beforeSend: function(){
			showLoading(f_strategyId);
			//$("div#step_" + step.frontId + "_sub h3 div.crumb_details").hide();
		},
		success: function(data){
			data = eval("(" + data + ")");
			if(ErrorHandler("EditStep", data, strategy, $("div#query_form"))){
				f_id = updateStrategies(data, "Expand", strategy);
			}
		},
		error: function(data, msg, e){
			alert("ERROR \n " + msg + "\n" + e
                                      + ". \nReload this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
	update_hist = true;
}

function updateStrategies(data,evnt,strategy){	
	stratId = loadModel(data);
	var strat = getStrategy(stratId);
	valid = ValidateView(data.strategies);
	if(valid){
		if( strategy != null && strategy.subStratOf != null)
			unloadStrategy(strategy.frontId);
		if(strategy == null){
			$("div#Strategies").prepend(displayModel(stratId));
		}else if(evnt == "Save" || (strategy.isSaved && evnt != "Open")){
			$("div#Strategies div#diagram_" + strategy.frontId).replaceWith(displayModel(stratId));
		}
		else if(isLoaded(getStrategy(stratId).backId) != -1 && evnt != "Open"){
			$("div#Strategies div#diagram_" + stratId).replaceWith(displayModel(stratId));
		}else{
			$("div#Strategies").prepend(displayModel(stratId));
		}	
		displayOpenSubStrategies(strat);
		return stratId;
	}else{
		message = "There are inconsistancies in strategies:\n";
		for(v in valid){
			message += valid[v] + " \n";
		}
		alert(message + "Click 'OK' and page will be reloaded to fixed this condition");
		$("div#Strategies div").remove();
		initDisplay(0);
	}
}

function displayOpenSubStrategies(s){
	var sCount = 0;
	for(j in s.subStratOrder)
		sCount++;
	//for(var j=sCount;j>0;j--){
	for(var j=1;j<=sCount;j++){
		subs = displayModel(s.subStratOrder[j]);
		if($("#Strategies div#diagram_" + s.subStratOrder[j]).length == 0)
			$("div#Strategies div#diagram_" + s.frontId).after(subs);
		else
			$("div#Strategies div#diagram_" + s.subStratOrder[j]).replaceWith(subs);
		if(getSubStrategies(s.subStratOrder[j]).length > 0){
			displayOpenSubStrategies(getStrategy(s.subStratOrder[j]));
		}
	}
}

function openStrategy(stratId){
	var url = "showStrategy.do?strategy=" + stratId;
	strat = getStrategyFromBackId(stratId);
	$.ajax({
		url: url,
		datatype:"JSON",
		success: function(data){
			data = eval("(" + data + ")");
			if(ErrorHandler("Open", data, null, null)){
				if(strat.subStratOf != null){
					ps = getStrategy(strat.subStratOf);
					ps.checksum = data.strategies[ps.backId];
				}
				updateStrategies(data, "Open", getStrategyFromBackId(stratId));
			}
		},
		error: function(data, msg, e){
			alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReload this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
	$("#eye_" + stratId).removeClass("strat_inactive").addClass("strat_active");
}

function closeStrategy(stratId){
	var strat = getStrategy(stratId);
	var cs = strat.checksum;
	if(strat.subStratOf != null)
		cs = getStrategy(strat.subStratOf).checksum;
	var url = "closeStrategy.do?strategy=" + strat.backId+"&strategy_checksum="+cs;
	$.ajax({
		url: url,
		dataType:"JSON",
		success: function(data){
			data = eval("(" + data + ")");			
			if(ErrorHandler("CloseStrategy", data, strat, null)){
				if(strat.subStratOf != null){
					ps = getStrategy(strat.subStratOf);
					ps.checksum = data.strategies[ps.backId];
				}
				hideStrat(stratId);
			}
		},
		error: function(data, msg, e){
			alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReload this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
	$("#eye_" + strat.backId).removeClass("strat_active").addClass("strat_inactive");
}

function hideStrat(id){
	var strat = getStrategy(id);
	unloadStrategy(id);
	strat.isDisplay = false;
	for(var i=0;i<strat.Steps.length;i++){
		if(strat.Steps[i].child_Strat_Id != null){
			hideStrat(strat.Steps[i].child_Strat_Id);
		}
	}
	if($("#diagram_" + id + " div.selected,#diagram_" + id + " div.selectedarrow").length > 0){
		NewResults(-1);
	}
	$("#diagram_" + id).hide("slow").remove();
	if($("#Strategies div[id^='diagram']").length == 0){
		showInstructions();
		NewResults(-1);
	}
}

function saveStrategy(stratId, checkName, fromHist){
	var ss = getStrategyFromBackId(stratId);
	var saveForm = $("div#save_strat_div_" + stratId);
	if (fromHist) saveForm = $("#hist_save_" + stratId);
	var name = $("input[name='name']",saveForm).attr("value");
	var strategy = $("input[name='strategy']",saveForm).attr("value");
	var url="renameStrategy.do?strategy=";
	url = url + strategy + "&save=true&name=" + name + "&checkName=" + checkName+"&strategy_checksum="+ss.checksum;
	if (fromHist) url = url + "&showHistory=true";
	$.ajax({
		url: url,
		dataType: "JSON",
		success: function(data){
					data = eval("(" + data + ")");
					if(ErrorHandler("SaveStrategy", data, ss, null)){
							var selectedBox = $("#Strategies div.selected");
	                        if (selectedBox.length == 0) selectedBox = $("#Strategies div.selectedarrow");
	                        if (selectedBox.length == 0) selectedBox = $("#Strategies div.selectedtransform");
							var selectedStrat = selectedBox.parent().attr("id");
							selectedBox = selectedBox.attr("id");
							if (!fromHist) saveForm.hide();
							removeStrategyDivs(stratId);
							updateStrategies(data, "Save", getStrategyFromBackId(stratId));
							var selectedLink = $("#" + selectedStrat + " #" + selectedBox + " .resultCount a");
							if (selectedLink.length != 0) selectedLink.click();
							else NewResults(-1);
							update_hist = true;
							if (fromHist) updateHistory();
					}
		},
		error: function(data, msg, e){
			alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReload this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
}

function renameStrategy(stratId, checkName, fromHist){
	var strat = getStrategyFromBackId(stratId);
	var renameForm = $("div#diagram_" + strat.frontId + " #rename");
	if (fromHist) renameForm = $("#browse_rename");
	var name = $("input[name='name']",renameForm).attr("value");
	var strategy = $("input[name='strategy']",renameForm).attr("value");
	var url="renameStrategy.do?strategy=";
	var cs = strat.checksum;
	if(strat.subStratOf != null)
		cs = getStrategy(strat.subStratOf).checksum;
	url = url + strategy + "&name=" + name + "&checkName=" + checkName+"&strategy_checksum="+cs;
	if (fromHist) url = url + "&showHistory=true";
	$.ajax({
		url: url,
		dataType: "JSON",
		success: function(data){
					data = eval("(" + data + ")");
					if(ErrorHandler("RenameStrategy", data, strat, renameForm)){
						// reload strategy panel
							var selectedBox = $("#Strategies div.selected");
	                        if (selectedBox.length == 0) selectedBox = $("#Strategies div.selectedarrow");
	                        if (selectedBox.length == 0) selectedBox = $("#Strategies div.selectedtransform");
							var selectedStrat = selectedBox.parent().attr("id");
							selectedBox = selectedBox.attr("id");
							disableRename(stratId, fromHist);
							removeStrategyDivs(stratId);
							updateStrategies(data, "Rename", strat);
							var selectedLink = $("#" + selectedStrat + " #" + selectedBox + " .resultCount a");
							if (selectedLink.length != 0) selectedLink.click();
							else NewResults(-1);
							update_hist = true;
							if (fromHist) updateHistory();
					}
		},
		error: function(data, msg, e){
			alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReload this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
}

function ChangeFilter(strategyId, stepId, url) {
        b_strategyId = strategyId;
        strategy = getStrategyFromBackId(b_strategyId); 
        f_strategyId = strategy.frontId;
        //var currentDiv = $("#Strategies div#diagram_" + f_strategyId);
        if(strategy.subStratOf != null){
                strats.splice(findStrategy(f_strategyId));
        }
		var cs = strategy.checksum;
		if(strategy.subStratOf != null)
			cs = getStrategy(strategy.subStratOf).checksum;
        url += "&strategy_checksum="+cs;
        $.ajax({
                url: url,
                type: "GET",
                dataType:"JSON",
                data: '',
                beforeSend: function(){
                        showLoading(f_strategyId);
                },
                success: function(data){
                        data = eval("(" + data + ")");
                        if(ErrorHandler("ChangeFilter", data, strategy, null)){
							var selectedBox = $("#Strategies div.selected");
                        	if (selectedBox.length == 0) 
								selectedBox = $("#Strategies div.selectedarrow");
                        	if (selectedBox.length == 0) 
								selectedBox = $("#Strategies div.selectedtransform");
							var selectedStrat = selectedBox.parent().attr("id");
							selectedBox = selectedBox.attr("id");
 							removeStrategyDivs(strategy.backId);
                        	updateStrategies(data, 'ChangeFilter', strategy);
							var selectedLink = $("#" + selectedStrat + " #" + selectedBox + " .resultCount a");
							if (selectedLink.length != 0) 
								selectedLink.click();
							else 
								NewResults(-1);
						}
                },
                error: function(data, msg, e){
                        //$("#Strategies").append(currentDiv);
                        removeLoading(f_strategyId);
                        alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReload this page might solve the problem. \nOtherwise, please contact site support.");
                }
        });
        update_hist = true;
      //  closeAll();

}


