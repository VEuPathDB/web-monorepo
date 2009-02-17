

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
	$("#" + hidePanel).css({'position' : 'absolute', 'left' : '-1000em'});
	$("#" + panel + "_tab").parent().attr("id", "selected");
	$("#" + panel).css({'position' : 'relative', 'left' : 'auto'});
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

function formatFilterForm(data, edit, reviseStep, hideQuery, hideOp){
	//edit = 0 ::: adding a new step
	//edit = 1 ::: editing a current step
	var operation = "";
	var stepn = 0;
	var insert = "";
	var proto = "";
	if(edit == 0){
//		var parts = reviseStep.split(":");
		insert = reviseStep;
//		proto = parts[0];
	}else{
		var parts = reviseStep.split(":");
		proto = parts[0];
		reviseStep = parseInt(parts[1]);
		isSub = true;
		operation = parts[4];
	}
	var stratBackId = getStrategy(current_Front_Strategy_Id).backId;
	var stepBackId = reviseStep;//getStep(current_Front_Strategy_Id, reviseStep).back_step_Id;
	var stepFrontId = getStepFromBackId(stratBackId, stepBackId).frontId;
	var pro_url = "";
	if(edit == 0)
		pro_url = "processFilter.do?strategy=" + stratBackId + "&insert=" +insert;
	else{
		pro_url = "processFilter.do?strategy=" + stratBackId + "&revise=" + stepBackId;   //reviseStep;
	}
	var historyId = $("#history_id").val();
	
	if(edit == 0){
		var close_link = "<a id='close_filter_query' href='javascript:closeAll()'><img src='/assets/images/Close-X-box.png'/></a>";
		var back_link = "<a id='back_to_selection' href='javascript:close()'><img src='/assets/images/backbox.png'/></a>";
	}else
		var close_link = "<a id='close_filter_query' href='javascript:closeAll()'><img src='/assets/images/Close-X-box.png'/></a>";

	var quesTitle = $("h1",data).text().replace(/Identify Genes based on/,"");
	
	var quesForm = $("form#form_question",data);
	var tooltips = $("div.htmltooltip",data);
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
		$(".filter.params", quesForm).prepend("<span class='form_subtitle'>Add&nbsp;Step&nbsp;" + (stepFrontId+2) + ": " + quesTitle + "</span></br>");
	else
		$(".filter.params", quesForm).prepend("<span class='form_subtitle'>Edit&nbsp;Step&nbsp;" + (stepFrontId+1) + ": " + quesTitle + "</span></br>");
	if(edit == 0){
		$(".filter.params", quesForm).after("<div class='filter operators'><span class='form_subtitle'>Combine with Step " + (stepFrontId+1) + "</span><div id='operations'><table><tr><td class='opcheck' valign='middle'><input type='radio' name='booleanExpression' value='AND' /></td><td class='operation INTERSECT'></td><td valign='middle'>&nbsp;" + (stepFrontId+1) + "&nbsp;<b>INTERSECT</b>&nbsp;" + (stepFrontId+2) + "</td></tr><tr><td class='opcheck'><input type='radio' name='booleanExpression' value='OR'></td><td class='operation UNION'></td><td>&nbsp;" + (stepFrontId+1) + "&nbsp;<b>UNION</b>&nbsp;" + (stepFrontId+2) + "</td></tr><tr><td class='opcheck'><input type='radio' name='booleanExpression' value='NOT'></td><td class='operation MINUS'></td><td>&nbsp;" + (stepFrontId+1) + "&nbsp;<b>MINUS</b>&nbsp;" + (stepFrontId+2) + "</td></tr></table></div></div>");
	} else {
		if(stepFrontId != 0){
			if(stepFrontId != 1)
				var previous_step_id = $("#step_"+(stepFrontId)+"_sub a").attr("id");
			else
				var previous_step_id = $("#step_"+(stepFrontId)+" a").attr("id");						
	//		lastStepId = previous_step_id.substring(7);
			$(".filter.params", quesForm).after("<div class='filter operators'><span class='form_subtitle'>Combine with Step " + (stepFrontId) + "</span><div id='operations'><table><tr><td class='opcheck'><input id='INTERSECT' type='radio' name='booleanExpression' value='AND' /></td><td class='operation INTERSECT'></td><td>&nbsp;" + (stepFrontId) + "&nbsp;<b>INTERSECT</b>&nbsp;" + (stepFrontId+1) + "</td></tr><tr><td class='opcheck'><input id='UNION' type='radio' name='booleanExpression' value='OR'></td><td class='operation UNION'></td><td>&nbsp;" + (stepFrontId) + "&nbsp;<b>UNION</b>&nbsp;" + (stepFrontId+1) + "</td></tr><tr><td class='opcheck'><input id='MINUS' type='radio' name='booleanExpression' value='NOT'></td><td class='operation MINUS'></td><td>&nbsp;" + (stepFrontId) + "&nbsp;<b>MINUS</b>&nbsp;" + (stepFrontId+1) + "</td></tr></table></div></div>");
		}else{
			$(".filter.params", quesForm).after("<input type='hidden' name='booleanExpression' value='AND' />");
		}
	}
	if(edit == 0)	
		var action = "javascript:validateAndCall('add','" + pro_url + "')";//"javascript:AddStepToStrategy('" + pro_url + "')";
	else
		var action = "javascript:validateAndCall('edit', '" + pro_url + "', '" + proto + "', "+ parseInt(reviseStep) + ")";//"javascript:EditStep('" + proto + "', '" + pro_url + "', " + parseInt(reviseStep) + ")";
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
	$("#query_form").append(tooltips);
	//$("#filter_link_div_" + proto + " #query_selection").fadeOut("normal");
	if(edit == 1)
		$("#query_form div#operations input#" + operation).attr('checked','checked'); 
	$("#query_form").jqDrag(".dragHandle");
	if (hideQuery){
           $(".filter.params").remove();
           $("input[name=questionFullName]").remove();
           $(".filter.operators").width('auto');
           $("#query_form").css({'max-width' : '315px','min-width' : '315px'});
        }
	if (hideOp){
           $(".filter.operators").remove();
           $(".filter.operators").width('auto');
           $("#query_form").css({'max-width' : '61%','min-width' : '729px'});
        }
	htmltooltip.render();
	$("#query_form").fadeIn("normal");
}

function validateAndCall(type, url, proto, rs){
	var valid = false;
	if($("input[name='booleanExpression']").attr("type") == "hidden"){
		valid = true;
	}else{
		if($(".filter.operators")){
			$(".filter.operators div#operations input[name='booleanExpression']").each(function(){
				if($(this)[0].checked) valid = true;
			});
		}
	}
	if(!valid){
		alert("Please select a booean operator.");
		return;
	}
	if(type == 'add'){
		AddStepToStrategy(url);
	}else{
		EditStep(url, proto, rs);
	}
	return;
}

function getQueryForm(url){	
	    original_Query_Form_Text = $("#query_form").parent().html();
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
	var selectedName = $("#query_form select#selected_strategy option[selected]").text();
	var url = "\"processFilter.do?strategy=" + getStrategy(stratId).backId + "&insert=&insertStrategy=" + selectedStrat +"\"";
	var oform = "<form id='form_question' enctype='multipart/form-data' action='javascript:AddStepToStrategy(" + url + ")' method='post' name='questionForm'>";
	var cform = "</form>";
	var ops = "<div class='filter operators' style='width:auto'><span class='form_subtitle' style='padding:0 20px'>Combine " + getStrategy(stratId).name + " with " + selectedName + "</span><div id='operations' style='width:38%'><table><tr><td class='opcheck' valign='middle'><input type='radio' name='booleanExpression' value='AND' /></td><td class='operation INTERSECT'></td><td valign='middle'><b>INTERSECT</b></td></tr><tr><td class='opcheck'><input type='radio' name='booleanExpression' value='OR'></td><td class='operation UNION'></td><td><b>UNION</b></td></tr><tr><td class='opcheck'><input type='radio' name='booleanExpression' value='NOT'></td><td class='operation MINUS'></td><td><b>MINUS</b></td></tr></table></div></div>"
	var button = "<br><br><input type='submit' value='Add Strategy' />";
	ops = oform + ops + button + cform;
	$("#query_form div#query_selection").html(ops);
}

function openFilter(dtype,strat_id,step_id){
	current_Front_Strategy_Id = strat_id;
	var url = "filter_page.jsp?dataType=" + dtype + "&prevStepNum=" + step_id;
	$.ajax({
		url: url,
		dataType: "html",
		success: function(data){
			filter = document.createElement('div');
			$(filter).html(data);
			$("#continue_button", filter).click(function(){
				original_Query_Form_Text = $("#query_form").parent().html();
				OpenOperationBox(strat_id);
				return false;
			});
			$("#continue_button_transforms", filter).click(function(){
				original_Query_Form_Text = $("#query_form").parent().html();
				getQueryForm($("#query_form select#transforms").val());
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

function close(ele){
	cd = $("#query_form").parent();
	$(cd).html(original_Query_Form_Text);
	$("#query_form").jqDrag(".dragHandle");
}

function closeAll(){
	$("#query_form").parent().remove();
	$(".filter_link").css({opacity:"1.0",}).attr("href")
}

function parseInputs(){
	var quesForm = $("form[name=questionForm]");
	var inputs = $("input, textarea", quesForm);
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
