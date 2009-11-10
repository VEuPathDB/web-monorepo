var strats = new Object();
var xmldoc = null;
var exportBaseURL;
var sidIndex = 0;
var recordType= new Array();   //stratid, recordType which is the type of the last step
var state = null;
var p_state = null;
$(document).ready(function(){
	initDisplay();
});

function initDisplay(){
	var url = "showStrategy.do";
	$.ajax({
		url: url,
		type: "POST",
		dataType: "json",
		data:"state=",
		beforeSend: function(){
			showLoading();
		},
		success: function(data){
		//	data = eval("(" + data + ")");
			updateStrategies(data);
		}
	});
}

function highlightStep(str, stp, v, pagerOffset, ignoreFilters){
	if(!str || stp == null){
		NewResults(-1);
	}else{
		NewResults(str.frontId, stp.frontId, v, pagerOffset, ignoreFilters);
		//var stepBox = null;
		//if(!v || stp.isTransform)
		//	stepBox = $("#diagram_" + str.frontId + " div[id='step_" + stp.frontId + "_sub']");
		//else 
		//	stepBox = $("#diagram_" + str.frontId + " div[id='step_" + stp.frontId + "']");
		//$(".resultCount a", stepBox).click();
	}
}

function updateStrategies(data, ignoreFilters){	
	state = data.state;
	p_state = $.json.serialize(state);
	removeClosedStrategies();
	for(st in state){
          if(st == "count")
                $("#mysearch").text("My Searches: " + state[st]);
	  else if(st != "length"){
		var str = state[st].id;
		if(isLoaded(str)){
			if(getStrategyFromBackId(state[st].id).checksum != state[st].checksum){
				loadModel(data.strategies[state[st].checksum], st);
			}
	  	}else{
			loadModel(data.strategies[state[st].checksum], st);
		}
	  }
	}
	showStrategies(data.currentView, ignoreFilters);
}

function removeClosedStrategies(){
	for(s in strats){
		if(s.indexOf(".") == -1){
			var x = true;
			for(t in state){
				if(t != "length"){
					if(strats[s].checksum == state[t].checksum){
						x = false;
						if(t != s){
							strats[t] = strats[s];
							removeSubStrategies(s, t);
							delete strats[s];
							break;
						}
					}else if(strats[s].backId == state[t].id){
						x = false;
						removeSubStrategies(s, t);
						if(t != s){
							strats[t] = strats[s];
							break;
						}
					}
				}
			}
			if(x){
				removeSubStrategies(s);
				delete strats[s];
				update_hist = true; //set update flag for history if anything was closed.
			}
		}
	}
}

function removeSubStrategies(ord1, ord2){
	for(var f in strats){
		if(f.split(".").length > 1 && f.split(".")[0] == ord1){
			if(ord2 == undefined){
				delete strats[f];
			}else{
				var n_ord = f.split(".");
				n_ord[0] = ord2;
				n_ord = n_ord.join(".");
				strats[n_ord] = strats[f];
				delete strats[f];
			}
		}
	}
}

function showStrategies(view, ignoreFilters){
	var sC = 0;
	for(s in strats){
		if(s.indexOf(".") == -1)
			sC++;
	}
	var s2 = document.createElement('div');
	for(var t=1; t<=sC; t++){
		$(s2).prepend(strats[t].DIV);
		displayOpenSubStrategies(strats[t], s2);
	}
	$("#Strategies").html($(s2).html());
	if(view.strategy != undefined || view.step != undefined){
		var initStr = getStrategyFromBackId(view.strategy);
		var initStp = initStr.getStep(view.step, false);
		if(initStr == false || initStp == null){
			NewResults(-1);
		}else{
			var isVenn = (initStp.back_boolean_Id == view.step);
			var pagerOffset = view.pagerOffset;
			highlightStep(initStr, initStp, isVenn, pagerOffset, ignoreFilters);
		}
	}else{
		NewResults(-1);
	}
	if(sC == 0) showInstructions();
}

function displayOpenSubStrategies(s, d){
	var sCount = 0;
	for(j in s.subStratOrder)
		sCount++;
	//for(var j=sCount;j>0;j--){
	for(var j=1;j<=sCount;j++){
//		subs = displayModel(getStrategy(s.subStratOrder[j]));
		subs = getStrategy(s.subStratOrder[j]);
		subs.color = parseInt(s.getStep(getStrategy(s.subStratOrder[j]).backId.split("_")[1],false).frontId) % colors.length;
		$(subs.DIV).addClass("sub_diagram").css({"margin-left": (subs.depth(null) * indent) + "px",
												 "border-color": colors[subs.color].top+" "+colors[subs.color].right+" "+colors[subs.color].bottom+" "+colors[subs.color].left
												});
		$("div#diagram_" + s.frontId + " div#step_" + s.getStep(getStrategy(s.subStratOrder[j]).backId.split("_")[1],false).frontId + "_sub", d).css({"border-color":colors[subs.color].step});
		$("div#diagram_" + s.frontId, d).after(subs.DIV);
		if(getSubStrategies(s.subStratOrder[j]).length > 0){
			displayOpenSubStrategies(getStrategy(s.subStratOrder[j]),d);
		}
	}
}

function showInstructions(){
	$("#strat-instructions").remove();
	$("#strat-instructions-2").remove();
	$("#Strategies").removeAttr("style"); // DO NOT DELETE.  This is for IE.
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
	$("#Strategies").css({'overflow' : 'visible'}); // DO NOT DELETE.  This is for IE to display instructions correctly.
	$("#Strategies").append(instr);
}

function loadModel(json, ord){
	update_hist = true; //set update flag for history if anything was opened/changed.
	var strategy = json;
	var strat = null;
	if(!isLoaded(strategy.id)){
		var strat = new Strategy(sidIndex, strategy.id, true);
		sidIndex++;
	}else{
		var strat = getStrategyFromBackId(strategy.id);
		strat.subStratOrder = new Object();
	}		
	if(strategy.importId != ""){
		strat.isDisplay = true;
		strat.checksum = state[ord].checksum;
	}else{
		var prts = strat.backId.split("_");
		strat.subStratOf = getStrategyFromBackId(prts[0]).frontId;
		if(strategy.order > 0){
			strat.isDisplay = true;
		}
	}
	strat.JSON = strategy;
	strat.isSaved = strategy.saved;
	strat.name = strategy.name;
    strat.importId = strategy.importId;
	var steps = strategy.steps;
	strats[ord] = strat;
	strat.initSteps(steps, ord);
	strat.dataType = strategy.steps[strategy.steps.length].dataType;
	strat.nonTransformLength = strategy.steps.nonTransformLength;
	strat.DIV = displayModel(strat);
	return strat.frontId;
}

function unloadStrategy(id){
	for(s in strats){
		s = parseInt(s);
		if(strats[s].frontId == id){
			delete strats[s];
			return;
		}
	}
}


function NewResults(f_strategyId, f_stepId, bool, pagerOffset, ignoreFilters){
	if(f_strategyId == -1){
		$("div#Workspace").html("");
		return;
	}
	var strategy = getStrategy(f_strategyId);
	var step = strategy.getStep(f_stepId,true);
	if(bool){
		url = "showSummary.do?strategy=" + strategy.backId + "&step=" + step.back_boolean_Id + "&resultsOnly=true";
	}else{
		url = "showSummary.do?strategy=" + strategy.backId + "&step=" + step.back_step_Id + "&resultsOnly=true";
	}
        if (!pagerOffset) url += "&noskip=1";
	else url += "&pager.offset=" + pagerOffset;
	$.ajax({
		url: url,
		dataType: "html",
		beforeSend: function(){
			showLoading(f_strategyId);
		},
		success: function(data){
			step.isSelected = true;
			if(ErrorHandler("Results", data, strategy, $("#diagram_" + strategy.frontId + " step_" + step.frontId + "_sub div.crumb_details div.crumb_menu a.edit_step_link"))){
				$("#Strategies div").removeClass("selected").removeClass("selectedarrow").removeClass("selectedtransform");
				init_view_strat = strategy.backId
				if(bool){
					$("#Strategies div#diagram_" + strategy.frontId + " div[id='step_" + step.frontId + "']").addClass("selected");
					init_view_step = step.back_step_Id + ".v";
				}else if (step.isTransform){
					$("#Strategies div#diagram_" + strategy.frontId + " div[id='step_" + step.frontId + "_sub']").addClass("selectedtransform");
					init_view_step = step.back_step_Id;
				}else{
					$("#Strategies div#diagram_" + strategy.frontId + " div[id='step_" + step.frontId + "_sub']").addClass("selectedarrow");
					init_view_step = step.back_step_Id;
				}
			    ResultsToGrid(data, ignoreFilters);
			    $("span#text_strategy_number").html(strategy.JSON.name);
			    $("span#text_step_number").html(step.frontId);
			    $("span#text_strategy_number").parent().show();
                        } 
                        removeLoading(f_strategyId);
		},
		error : function(data, msg, e){
			  alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReloading this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
}

function RenameStep(ele, s, stp){
//	var a = $(ele).parent();
	var new_name = $(ele).val();
	step = getStep(s, stp);
	var url = "renameStep.do?strategy=" + getStrategy(s).backId + "&stepId=" + step.back_step_Id + "&customName=" + escape(new_name);	
	$.ajax({
			url: url,
			dataType: "html",
			data: "state=" + p_state,
			beforeSend: function(){
				showLoading(s);
			},
			success: function(data){
				data = eval("(" + data + ")");
				if(ErrorHandler("RenameStep", data, getStrategy(s), null)){
					updateStrategies(data);
				}else{
					removeLoading(f_strategyId);
				}
			},
			error: function(data, msg, e){
				alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReloading this page might solve the problem. \nOtherwise, please contact site support.");
			}
		});
}

function AddStepToStrategy(url, proto, stpId){	
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
		dataType:"json",
		data: d + "&state=" + p_state,
		beforeSend: function(){
			showLoading(f_strategyId);
		},
		success: function(data){
			//data = eval("(" + data + ")");
			if(ErrorHandler("AddStep", data, strategy, $("div#query_form"))){
				$("div#query_form").remove();
				updateStrategies(data);
			}else{
				removeLoading(f_strategyId);
			}
		},
		error: function(data, msg, e){
			//$("#Strategies").append(currentDiv);
			removeLoading(f_strategyId);
			alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReloading this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
	isInsert = "";
	closeAll(true);
}

function EditStep(url, proto, step_number){
	$("#query_form").hide("fast");
	var ss = getStrategyFromBackId(proto);
	var sss = ss.getStep(step_number, false);
	var d = parseInputs();
	var cs = ss.checksum;
	if(ss.subStratOf != null)
		cs = getStrategy(ss.subStratOf).checksum;
	url = url+"&strategy_checksum="+cs;
		$.ajax({
		url: url,
		type: "POST",
		dataType:"json",
		data: d + "&state=" + p_state,
		beforeSend: function(obj){
				showLoading(ss.frontId);
			},
		success: function(data){
			//data = eval("(" + data + ")");
			if(ErrorHandler("EditStep", data, ss, $("div#query_form"))){
				$("div#query_form").remove();
				hideDetails();
				updateStrategies(data);
			}else{
				removeLoading(ss.frontId);
			}
		},
		error: function(data, msg, e){
			alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReloading this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
	closeAll(true);
}



function DeleteStep(f_strategyId,f_stepId){
	var strategy = getStrategy(f_strategyId);
	var step = strategy.getStep(f_stepId, true);
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
		dataType:"json",
		data:"state=" + p_state,
		beforeSend: function(obj){
				showLoading(f_strategyId);
			},
		success: function(data){
				//data = eval("(" + data + ")");
				if(ErrorHandler("DeleteStep", data, strategy, null)){
					updateStrategies(data);
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
}

function ExpandStep(e, f_strategyId, f_stepId, collapsedName){
	var strategy = getStrategy(f_strategyId);
	var step = strategy.getStep(f_stepId, true);
//	un = (collapsedName.length > 15)?collapsedName.substring(0,12) + "...":collapsedName;
	var cs = strategy.checksum;
	if(strategy.subStratOf != null)
		cs = getStrategy(strategy.subStratOf).checksum;
	url = "expandStep.do?strategy=" + strategy.backId + "&step=" + step.back_step_Id + "&collapsedName=" + collapsedName+"&strategy_checksum="+cs;
	$.ajax({
		url: url,
		type: "post",
		dataType: "json",
		data: "state=" + p_state,
		beforeSend: function(){
			showLoading(f_strategyId);
			//$("div#step_" + step.frontId + "_sub h3 div.crumb_details").hide();
		},
		success: function(data){
			//data = eval("(" + data + ")");
			if(ErrorHandler("EditStep", data, strategy, $("div#query_form"))){
				updateStrategies(data);
			}else{
				removeLoading(f_strategyId);
			}
		},
		error: function(data, msg, e){
			alert("ERROR \n " + msg + "\n" + e
                                      + ". \nReloading this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
}

function openStrategy(stratId){
	var url = "showStrategy.do?strategy=" + stratId;
	strat = getStrategyFromBackId(stratId);
	$.ajax({
		url: url,
		dataType:"json",
		data:"state=" + p_state,
		success: function(data){
			//data = eval("(" + data + ")");
			if(ErrorHandler("Open", data, null, null)){
				updateStrategies(data);
				if (getCurrentTabCookie(false) != 'strategy_results') showPanel('strategy_results');
			}
		},
		error: function(data, msg, e){
			alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReloading this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
	$("#eye_" + stratId).removeClass("strat_inactive").addClass("strat_active");
}

function deleteStrategy(stratId, fromHist){
	var url = "deleteStrategy.do?strategy=" + stratId;
	var stratName;
	var message = "Are you sure you want to delete the strategy '";
	if (fromHist) stratName = $.trim($("div#text_" + stratId).text());
	else {
		strat = getStrategyFromBackId(stratId);
		stratName = strat.name;
		if (strat.subStratOf != null) {
			var parent = getStrategy(strat.subStratOf);
			var cs = parent.checksum;
			url = "deleteStep.do?strategy="+strat.backId+"&step="+stratId.split('_')[1]+"&strategy_checksum="+cs;
			message = "Are you sure you want to delete the substrategy '";
			stratName = strat.name + "' from the strategy '" + parent.name;
		}
	}
	message = message + stratName + "'?";
	var agree = confirm(message);
	if (agree){
	$.ajax({
		url: url,
		dataType: "json",
		data:"state=" + p_state,
		beforeSend: function(){
			if (!fromHist) showLoading(stratId);
		},
		success: function(data){
			if (ErrorHandler("DeleteStrategy", data, null, null)){
				updateStrategies(data);
				updateHist = true;
				if (getCurrentTabCookie(false) == 'search_history'){
					updateHistory();
				}
			}
		},
		error: function(data, msg, e){
			alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReloading this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
	}
}

function closeStrategy(stratId, isBackId){
	var strat = getStrategy(stratId);
	if (isBackId) strat = getStrategyFromBackId(stratId);
	var cs = strat.checksum;
	if(strat.subStratOf != null)
		cs = getStrategy(strat.subStratOf).checksum;
	var url = "closeStrategy.do?strategy=" + strat.backId+"&strategy_checksum="+cs;
	$.ajax({
		url: url,
		dataType:"json",
		data:"state=" + p_state,
		beforeSend: function(){
			showLoading(stratId);
		},
		success: function(data){
			//data = eval("(" + data + ")");			
			if(ErrorHandler("CloseStrategy", data, strat, null)){
				updateStrategies(data);
				if (getCurrentTabCookie(false) == 'search_history'){
					update_hist = true;
					updateHistory();
				}
			}
		},
		error: function(data, msg, e){
			alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReloading this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
	$("#eye_" + strat.backId).removeClass("strat_active").addClass("strat_inactive");
}

function hideStrat(id){
	var strat = getStrategy(id);
	if(!strat) return;
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

function copyStrategy(stratId, fromHist){
        var ss = getStrategyOBJ(stratId);//getStrategyFromBackId(stratId);
        var result = confirm("Do you want to make a copy of strategy '" + ss.name + "'?");
        if (result == false) return;
        var url="copyStrategy.do?strategy=" + stratId + "&strategy_checksum="+ss.checksum;
        $.ajax({        
                url: url,
                dataType: "json", 
                data:"state=" + p_state,
				beforeSend: function(){
					if(!fromHist)
						showLoading(ss.frontId);
				},
                success: function(data){
                                        //data = eval("(" + data + ")");
                                        if(ErrorHandler("Copystrategy", data, ss, null)){
                                            updateStrategies(data);
                                            if (fromHist) {
                                                update_hist = true;
                                                updateHistory();
                                            }
                                        }
                },
                error: function(data, msg, e){
                        alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReloading this page might solve the problem. \nOtherwise, please contact site support.");
                }
        });     
}

function saveOrRenameStrategy(stratId, checkName, save, fromHist){
	var strat = getStrategyOBJ(stratId);//getStrategyFromBackId(stratId);
	var form = $("#save_strat_div_" + stratId);
	if (fromHist) form = $(".viewed-popup-box form");// + stratId);
	var name = $("input[name='name']",form).attr("value");
	var strategy = $("input[name='strategy']",form).attr("value");
	var url="renameStrategy.do?strategy=";
	var cs = strat.checksum;
	if(strat.subStratOf != null)
		cs = getStrategy(strat.subStratOf).checksum;
	url = url + strategy + "&name=" + escape(name) + "&checkName=" + checkName+"&save=" + save + "&strategy_checksum="+cs;
	if (fromHist) url = url + "&showHistory=true";
	$.ajax({
		url: url,
		dataType: "json",
		data:"state=" + p_state,
		beforeSend: function(){
			if(!fromHist)
				showLoading(strat.frontId);
		},
		success: function(data){
					var type = save ? "SaveStrategy" : "RenameStrategy";
					if(ErrorHandler(type, data, strat, form, name, fromHist)){
							updateStrategies(data);
							if (fromHist) {
								update_hist = true;
								updateHistory();
							}
					}
					if(!fromHist)
						removeLoading(strat.frontId);
		},
		error: function(data, msg, e){
			alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReloading this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
}

function ChangeFilter(strategyId, stepId, url, filter) {
	var filterElt = filter;
        b_strategyId = strategyId;
        strategy = getStrategyFromBackId(b_strategyId); 
        f_strategyId = strategy.frontId;
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
                dataType:"json",
				data:"state=" + p_state,
                beforeSend: function(){
			$("body").block();
                        showLoading(f_strategyId);
                },
                success: function(data){
                        if(ErrorHandler("ChangeFilter", data, strategy, null)){
                        	updateStrategies(data, true);
				$("div.layout-detail td div.filter-instance div.current").removeClass('current');
				$(filterElt).parent('div').addClass('current');
				$("body").unblock();
			}
                },
                error: function(data, msg, e){
                        //$("#Strategies").append(currentDiv);
                        removeLoading(f_strategyId);
                        alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReloading this page might solve the problem. \nOtherwise, please contact site support.");
                }
        });
}

function reviseInvalidSteps(ele){
	var iv_id = $(ele).parent().attr("id").split("_");
//	$("div#diagram_" + iv_id[0] + " div#step_" + iv_id[1] + "_sub div.crumb_menu a.edit_step_link").click();
	$("div#diagram_" + iv_id[0] + " div#step_" + iv_id[1] + "_sub h3 a#stepId_" + iv_id[1]).click();
}

