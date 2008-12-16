

var _action = "";
var original_Query_Form_Text;
var update_hist = false;
var current_Front_Strategy_Id = null;

function showExportLink(stratId){
 	closeModal();
 	var exportLink = $("div#export_link_div_" + stratId);
 	exportLink.show();
}

function showPanel(panel) {
	var hidePanel;
	if (panel == 'strategy_results')
		hidePanel = 'search_history';
	else{
		hidePanel = 'strategy_results';
		updateHistory();
	}
	$("#" + hidePanel + "_tab").parent().attr("id", "");
	$("#" + hidePanel).hide();
	$("#" + panel + "_tab").parent().attr("id", "selected");
	$("#" + panel).show();
}

function updateHistory(){
	if(update_hist){
		$("div#search_history").block();
		$.ajax({
			url: "showQueryHistory.do",
			dataType: "html",
			success: function(data){
				$("#search_history").html(data);
				$("div#search_history").unblock();
				update_hist = false;
			},
			error: function(data, msg, e){
				$("div#search_history").unblock();
				alert("ERROR \n "+ msg + "\n" + e);
			}
		});
	}
}


function showSaveForm(stratId){
	closeModal();
	$("div.save_strat_div").addClass("hidden");
	var saveForm = $("div#save_strat_div_" + stratId);
	saveForm.show();
}

function closeModal(){
	$("div.modal_div").hide();
}

function validateSaveForm(form){
	if (form.name.value == ""){
		var message = "<h1>You must specify a name for saving!</h1><input type='button' value='OK' onclick='$(\"div#diagram_" + form.strategy.value + "\").unblock()'/>";
		$("div#diagram_" + form.strategy.value).block({message: message});
		return false;
	}
	return true;
}

function formatFilterForm(data, edit, reviseStep){
	//edit = 0 ::: adding a new step
	//edit = 1 ::: editing a current step
	var operation = "";
	var stepn = 0;
	var insert = "";
	var proto = "";
/*	if(edit == 0){
		var parts = reviseStep.split(":");
		insert = parts[1];
		proto = parts[0];
	}else{
		var parts = reviseStep.split(":");
		proto = parts[0];
		reviseStep = parseInt(parts[1]);
		isSub = true;
		operation = parts[4];
	}*/
	var stratBackId = getStrategy(current_Front_Strategy_Id).backId;
	var pro_url = "";
	if(edit == 0)
		pro_url = "processFilter.do?strategy=" + stratBackId + "&insert=" +insert;
	else{
		pro_url = "processFilter.do?strategy=" + stratBackId + "&revise=" + reviseStep;
	}
	var historyId = $("#history_id").val();
	
	if(edit == 0){
		var close_link = "<a id='close_filter_query' href='javascript:closeAll()'><img src='/assets/images/Close-X-box.png'/></a>";
		var back_link = "<a id='back_to_selection' href='javascript:close()'><img src='/assets/images/backbox.png'/></a>";
	}else
		var close_link = "<a id='close_filter_query' href='javascript:closeAll()'><img src='/assets/images/Close-X-box.png'/></a>";
		
	var quesTitle = $("h1",data).text().replace(/Identify Genes based on/,"");
	
	var quesForm = $("form#form_question",data);
	$("input[value=Get Answer]",quesForm).val("Run Step");
	$("input[value=Run Step]",quesForm).attr("id","executeStepButton");
	$("div:last",quesForm).attr("align", "");
	$("div:last",quesForm).attr("style", "float:left;margin: 45px 0 0 1%;");
    $("table:first", quesForm).wrap("<div class='filter params'></div>");
	$("table:first", quesForm).attr("style", "margin-top:15px;");
	
	// Bring in the advanced params, if exist, and remove styling
	var advanced = $("#advancedParams_link",quesForm);
	advanced = advanced.parent();
	advanced.remove();
	advanced.attr("style", "");
	$(".filter.params", quesForm).append(advanced);
	
	if(edit == 0)
		$(".filter.params", quesForm).prepend("<span class='form_subtitle'>Add&nbsp;Step&nbsp;: " + quesTitle + "</span></br>");
	else
		$(".filter.params", quesForm).prepend("<span class='form_subtitle'>Edit&nbsp;Step&nbsp;" + (reviseStep + 1) + ": " + quesTitle + "</span></br>");
	if(edit == 0){
		$(".filter.params", quesForm).after("<div class='filter operators'><span class='form_subtitle'>Combine with </span><div id='operations'><table><tr><td class='opcheck' valign='middle'><input type='radio' name='booleanExpression' value='AND' /></td><td class='operation INTERSECT'></td><td valign='middle'>&nbsp;&nbsp;<b>INTERSECT</b>&nbsp;</td></tr><tr><td class='opcheck'><input type='radio' name='booleanExpression' value='OR'></td><td class='operation UNION'></td><td>&nbsp;&nbsp;<b>UNION</b>&nbsp;</td></tr><tr><td class='opcheck'><input type='radio' name='booleanExpression' value='NOT'></td><td class='operation MINUS'></td><td>&nbsp;&nbsp;<b>MINUS</b>&nbsp;</td></tr></table></div></div>");
	} else {
		if(reviseStep != 0){
			if(reviseStep != 1)
				var previous_step_id = $("#step_"+(reviseStep - 1)+"_sub a").attr("id");
			else
				var previous_step_id = $("#step_"+(reviseStep - 1)+" a").attr("id");						
			lastStepId = previous_step_id.substring(7);
			$(".filter.params", quesForm).after("<div class='filter operators'><span class='form_subtitle'>Combine with Step " + (reviseStep) + "</span><div id='operations'><table><tr><td class='opcheck'><input id='INTERSECT' type='radio' name='booleanExpression' value='AND' /></td><td class='operation INTERSECT'></td><td>&nbsp;" + (reviseStep) + "&nbsp;<b>INTERSECT</b>&nbsp;" + (reviseStep + 1) + "</td></tr><tr><td class='opcheck'><input id='UNION' type='radio' name='booleanExpression' value='OR'></td><td class='operation UNION'></td><td>&nbsp;" + (reviseStep) + "&nbsp;<b>UNION</b>&nbsp;" + (reviseStep + 1) + "</td></tr><tr><td class='opcheck'><input id='MINUS' type='radio' name='booleanExpression' value='NOT'></td><td class='operation MINUS'></td><td>&nbsp;" + (reviseStep) + "&nbsp;<b>MINUS</b>&nbsp;" + (reviseStep + 1) + "</td></tr></table></div></div>");
		}else{
			$(".filter.params", quesForm).after("<input type='hidden' name='booleanExpression' value='AND' />");
		}
	}
	if(edit == 0)	
		var action = "javascript:AddStepToStrategy('" + pro_url + "')";
	else
		var action = "javascript:EditStep('" + proto + "', '" + pro_url + "', " + parseInt(reviseStep) + ")";
	var formtitle = "";
	if(edit == 0)
		formtitle = "<h1>Add&nbsp;Step</h1>";
	else
		formtitle = "<h1>Edit&nbsp;Step</h1>";
	quesForm.attr("action",action);
	if(edit == 0)
		var header = "<span class='dragHandle'>" + back_link + " " + formtitle + " " + close_link + "</span>";
	else
		var header = "<span class='dragHandle'>" + formtitle + " " + close_link + "</span>";
		
	$("#query_form").html(header);
	$("#query_form").append(quesForm);
	//$("#filter_link_div_" + proto + " #query_selection").fadeOut("normal");
	if(edit == 1)
		$("#query_form div#operations input#" + operation).attr('checked','checked'); 
	$("#query_form").jqDrag(".dragHandle");
	$("#query_form").fadeIn("normal");
}

function getQueryForm(url){	
		$.ajax({
			url: url,
			dataType:"html",
			success: function(data){
				formatFilterForm(data,0,isInsert);
			},
			error: function(data, msg, e){
				alert("ERROR \n "+ msg + "\n" + e);
			}
		});
}

function OpenOperationBox(stratId) {
	var selectedStrat = $("#query_form select#selected_strategy").val();
	var url = "\"processFilter.do?strategy=" + getStrategy(stratId).backId + "&insert=&insertStrategy=" + selectedStrat +"\"";
	var oform = "<form id='form_question' enctype='multipart/form-data' action='javascript:AddStepToStrategy(" + url + ")' method='post' name='questionForm'>";
	var cform = "</form>";
	var ops = "<div class='filter operators'><span class='form_subtitle'>Combine Strategy " + stratId + " with Strategy " + selectedStrat + "</span><div id='operations'><table><tr><td class='opcheck' valign='middle'><input type='radio' name='booleanExpression' value='AND' /></td><td class='operation INTERSECT'></td><td valign='middle'><b>INTERSECT</b></td></tr><tr><td class='opcheck'><input type='radio' name='booleanExpression' value='OR'></td><td class='operation UNION'></td><td><b>UNION</b></td></tr><tr><td class='opcheck'><input type='radio' name='booleanExpression' value='NOT'></td><td class='operation MINUS'></td><td><b>MINUS</b></td></tr></table></div></div>"
	var button = "<br><br><input type='submit' value='Add Strategy' />";
	ops = oform + ops + button + cform;
	$("#query_form div#query_selection").html(ops);
}

function openFilter(dtype,strat_id){
	current_Front_Strategy_Id = strat_id;
	var url = "filter_page.jsp?dataType=" + dtype;
	$.ajax({
		url: url,
		dataType: "html",
		success: function(data){
			filter = document.createElement('div');
			$(filter).html(data);
			$("#continue_button", filter).click(function(){
				OpenOperationBox(strat_id);
				return false;
			});
			$("div#Strategies").append(filter);
			$("#query_form").jqDrag(".dragHandle");
		},
		error: function(){
			alert("Error getting the needed information from the server \n Please contact the system administrator");
		}
	});
	
	
/*	
	var strat_number = IsIn.split(":");
	strat_number = strat_number[0]; 
	isInsert = IsIn;
	var link = $(".filter_link");
	if($(link).attr("href").indexOf("openFilter") != -1) {   
		original_Query_Form_Text = $("#filter_link_div_" + strat_number + " #query_form").html();
		$("#filter_link_div_" + strat_number + " #query_form").css({
			top: "337px",
			left: "22px"
		});
		$("#filter_link_div_" + strat_number + " #query_form").show("normal");
		$("#filter_link_div_" + strat_number + " #query_form").jqDrag(".dragHandle");
		for(var i=0; i < link.length; i++){
			$(link[i]).css({opacity:0.2});
			$(link[i]).attr("value",$(link[i]).attr("href"));
			$(link[i]).attr("href","javascript:void(0)");
		}
	}else{
		$("#filter_link_div_" + strat_number + " #query_form").html(original_Query_Form_Text);
		$("#filter_link_div_" + strat_number + " #query_form").hide();
		for(var i=0; i < link.length; i++){
			$(link[i]).css({opacity:1.0}); 
			$(link[i]).attr("href",$(link[i]).attr("value"));
		}
	}
*/
}

function close(){
	var strat_number = isInsert.split(":");
	strat_number = strat_number[0]; 
	$("#filter_link_div_" + strat_number + " #query_form").html(original_Query_Form_Text);
	$("#filter_link_div_" + strat_number + " #query_form").jqDrag(".dragHandle");
}

function closeAll(){
	$("#query_form").parent().remove();
}

function parseInputs(){
	var quesForm = $("form[name=questionForm]");
	var inputs = $("input", quesForm);
	var selects = $("select", quesForm);
	var d = "";
	var isFirst = 1;
	for(i=0;i<inputs.length;i++){
	    var name = inputs[i].name;
	    if(inputs[i].type == "checkbox" || inputs[i].type == "radio"){
		var boxType = inputs[i].type;
	    	var tempName = name;
		var tempValue = "";
		while(tempName == name && inputs[i].type == boxType){
		   if(inputs[i].checked == true)
			tempValue = tempValue + "," + inputs[i].value;
		   i++;
		   name = inputs[i].name;
		}
		tempValue = tempValue.substring(1);
		if(d == "")
			d = tempName + "=" + tempValue;
		else
			d = d + "&" + tempName + "=" + tempValue;
		i--;
	    }else{
	      if(inputs[i].type != "submit"){
	    	var value = inputs[i].value;
	    	if(i == 0)
			d = name + "=" + value;
	    	else
			d = d + "&" + name + "=" + value;
	      }
	    }
	    isFirst = 0;
	}
	for(i=0;i<selects.length;i++){
			var sname = selects[i].name;
			var svalue = selects[i].value;
			if(isFirst == 1)
				d = sname + "=" + svalue;
		    else
				d = d + "&" + sname + "=" + svalue;
	}
	return d;
}	
