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
	$("#strategy_tabs li").each(function(){
		var hidePanel = $("a", this).attr("id").substring(4);
		$("#tab_" + hidePanel).parent().removeAttr("id");
		$("#" + hidePanel).css({'position':'absolute','left':'-1000em','width':'100%'});
	});
	$("#tab_" + panel).parent().attr("id", "selected");
	$("#" + panel).css({'position':'relative','left':'auto'});
	if (panel == 'search_history') updateHistory();
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
		var close_link = "<a id='close_filter_query' href='javascript:closeAll(false)'><img src='/assets/images/Close-X-box.png'/></a>";
		var back_link = "<a id='back_to_selection' href='javascript:close()'><img src='/assets/images/backbox.png'/></a>";
	}else
		var close_link = "<a id='close_filter_query' href='javascript:closeAll(false)'><img src='/assets/images/Close-X-box.png'/></a>";

	var quesTitle = $("h1",data).text().replace(/Identify Genes based on/,"");
	
	var quesForm = $("form#form_question",data);
	var tooltips = $("div.htmltooltip",data);
	$("input[value=Get Answer]",quesForm).val("Run Step");
	$("input[value=Run Step]",quesForm).attr("id","executeStepButton");
	$(".params", quesForm).wrap("<div class='filter params'></div>");
	$(".params", quesForm).attr("style", "margin-top:15px;");

        // hide the file upload box
        quesForm.find(".dataset-file").each(function() {
            $(this).css("display", "none");
        });

        // hide the incompatible type from blast query
        var question = quesForm.find("#questionFullName").val();
        quesForm.find(".blast-type").each(function() {
            var type = $(this).val();
            if ((type == 'Transcripts' && question != 'GeneQuestions.GenesBySimilarity')
                || (type == 'Proteins' && question != 'GeneQuestions.GenesBySimilarity')
                || (type == 'Genome' && question != 'GenomicSequenceQuestions.SequencesBySimilarity')
                || (type == 'ORF' && question != 'OrfQuestions.OrfsBySimilarity')
                || (type == 'EST' && question != 'EstQuestions.EstsBySimilarity')
                || (type == 'Assemblies' && question != 'AssemblyQuestions.AssembliesBySimilarity')
                || (type == 'Isolates' && question != 'UniversalQuestions.UnifiedBlast')) {
                this.disabled = true;
                $(this).next().css("color", "gray");
            } else {
               $(this).next().css("font-weight", "bold");
            }
        });
	
	// Bring in the advanced params, if exist, and remove styling
	var advanced = $("#advancedParams_link",quesForm);
	advanced = advanced.parent();
	advanced.remove();
	advanced.attr("style", "");
	$(".filter.params", quesForm).append(advanced);
	
	if(edit == 0)
		$(".filter.params", quesForm).prepend("<span class='form_subtitle'>Add&nbsp;Step&nbsp;" + (parseInt(stepFrontId)+1) + ": " + quesTitle + "</span></br>");
	else
		$(".filter.params", quesForm).prepend("<span class='form_subtitle'>Edit&nbsp;Step&nbsp;" + (stepFrontId) + ": " + quesTitle + "</span></br>");
	if(edit == 0){
		$(".filter.params", quesForm).after("<div class='filter operators'><span class='form_subtitle'>Combine with Step " + (stepFrontId) + "</span><div id='operations'><table><tr><td class='opcheck' valign='middle'><input type='radio' name='booleanExpression' value='AND' /></td><td class='operation INTERSECT'></td><td valign='middle'>&nbsp;" + (stepFrontId) + "&nbsp;<b>INTERSECT</b>&nbsp;" + (parseInt(stepFrontId)+1) + "</td><td class='opcheck'><input type='radio' name='booleanExpression' value='OR'></td><td class='operation UNION'></td><td>&nbsp;" + (stepFrontId) + "&nbsp;<b>UNION</b>&nbsp;" + (parseInt(stepFrontId)+1) + "</td><td class='opcheck'><input type='radio' name='booleanExpression' value='NOT'></td><td class='operation MINUS'></td><td>&nbsp;" + (stepFrontId) + "&nbsp;<b>MINUS</b>&nbsp;" + (parseInt(stepFrontId)+1) + "</td></tr></table></div></div>");
	} else {
		if(stepFrontId != 0){
			if(stepFrontId != 1)
				var previous_step_id = $("#step_"+(stepFrontId)+"_sub a").attr("id");
			else
				var previous_step_id = $("#step_"+(stepFrontId)+" a").attr("id");						
	//		lastStepId = previous_step_id.substring(7);
			$(".filter.params", quesForm).after("<div class='filter operators'><span class='form_subtitle'>Combine with Step " + (parseInt(stepFrontId)-1) + "</span><div id='operations'><table><tr><td class='opcheck'><input id='INTERSECT' type='radio' name='booleanExpression' value='AND' /></td><td class='operation INTERSECT'></td><td>&nbsp;" + (parseInt(stepFrontId)-1) + "&nbsp;<b>INTERSECT</b>&nbsp;" + (stepFrontId) + "</td><td class='opcheck'><input id='UNION' type='radio' name='booleanExpression' value='OR'></td><td class='operation UNION'></td><td>&nbsp;" + (parseInt(stepFrontId)-1) + "&nbsp;<b>UNION</b>&nbsp;" + (stepFrontId) + "</td><td class='opcheck'><input id='MINUS' type='radio' name='booleanExpression' value='NOT'></td><td class='operation MINUS'></td><td>&nbsp;" + (parseInt(stepFrontId)-1) + "&nbsp;<b>MINUS</b>&nbsp;" + (stepFrontId) + "</td></tr></table></div></div>");
		}else{
			$(".filter.params", quesForm).after("<input type='hidden' name='booleanExpression' value='AND' />");
		}
	}
	if(edit == 0)	
		var action = "javascript:validateAndCall('add','" + pro_url + "', '" + stratBackId + "')";//"javascript:AddStepToStrategy('" + pro_url + "')";
	else
		var action = "javascript:validateAndCall('edit', '" + pro_url + "', '" + stratBackId + "', "+ parseInt(reviseStep) + ")";//"javascript:EditStep('" + proto + "', '" + pro_url + "', " + parseInt(reviseStep) + ")";
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
	if (hideQuery){
           $(".filter.params", quesForm).remove();
           $("input[name=questionFullName]", quesForm).remove();
           $(".filter.operators", quesForm).width('auto');
           quesForm.css({'max-width' : '500px','min-width' : '500px'});
           $("#query_form").css("min-width", "500px");
        }
	$("#query_form").append(quesForm);
	$("#query_form").append(tooltips);
	//$("#filter_link_div_" + proto + " #query_selection").fadeOut("normal");
	if(edit == 1)
		$("#query_form div#operations input#" + operation).attr('checked','checked'); 
	$("#query_form").jqDrag(".dragHandle");
	if (hideOp){
           $(".filter.operators").remove();
		   $(".filter.params").after("<input type='hidden' name='booleanExpression' value='AND' />");
           $(".filter.operators").width('auto');
           $("#query_form").css({'max-width' : '61%','min-width' : '729px'});
		   
        }
	$("#query_form").append("<div class='bottom-close'><a href='javascript:closeAll(false)' id='close_filter_query'>Close</a></div>");
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
		alert("Please select Intersect, Union or Minus operator.");
		return;
	}
	window.scrollTo(0,0);
	if(type == 'add'){
		AddStepToStrategy(url, proto, rs);
	}else{
		EditStep(url, proto, rs);
	}
	return;
}

function getQueryForm(url,hideOp){	
	    original_Query_Form_Text = $("#query_form").parent().html();
		$.ajax({
			url: url,
			dataType:"html",
			success: function(data){
				formatFilterForm(data,0,isInsert,false,hideOp);
			},
			error: function(data, msg, e){
				alert("ERROR \n "+ msg + "\n" + e + ". \nPlease double check your parameters, and try again." + 
                                      + "\nReloading this page might also solve the problem. \nOtherwise, please contact site support.");
			}
		});
}

function OpenOperationBox(stratId) {
	var selectedStrat = $("#query_form select#selected_strategy").val();
	var selectedName = $("#query_form select#selected_strategy option[selected]").text();
	var url = "processFilter.do?strategy=" + getStrategy(stratId).backId + "&insert=&insertStrategy=" + selectedStrat +"&checksum=" + getStrategy(stratId).checksum;
	//var oform = "<form id='form_question' enctype='multipart/form-data' action='javascript:AddStepToStrategy(" + url + ")' method='post' name='questionForm'>";
	var oform = "<form id='form_question' enctype='multipart/form-data' action='javascript:validateAndCall(\"add\",\""+ url + "\", " + getStrategy(stratId).backId + ")' method='post' name='questionForm'>";
	var cform = "</form>";
	var ops = "<div class='filter operators' style='width:auto'><span class='form_subtitle' style='padding:0 20px'>Combine " + getStrategy(stratId).name + " with " + selectedName + "</span><div id='operations' style='width:45%'><table><tr><td class='opcheck' valign='middle'><input type='radio' name='booleanExpression' value='AND' /></td><td class='operation INTERSECT'></td><td valign='middle'><b>INTERSECT</b></td></tr><tr><td class='opcheck'><input type='radio' name='booleanExpression' value='OR'></td><td class='operation UNION'></td><td><b>UNION</b></td></tr><tr><td class='opcheck'><input type='radio' name='booleanExpression' value='NOT'></td><td class='operation MINUS'></td><td><b>MINUS</b></td></tr></table></div></div>"
	var button = "<div style='position:absolute;left:200px;top:185px;'><input type='submit' value='Add Strategy' /></div>";
	ops = oform + ops + button + cform;
	$("#query_form div#query_selection").html(ops);
}

function openFilter(dtype,strat_id,step_id){
	var isFirst = false;
	steps = getStrategy(strat_id).Steps;
	if(step_id == undefined){
		isFirst = true;
	}else{
		stp = getStrategy(strat_id).getStep(step_id,false)
		if(stp != null && stp.frontId == 1) isFirst = true;
	}
	current_Front_Strategy_Id = strat_id;
	var url = "filter_page.jsp?dataType=" + dtype + "&prevStepNum=" + step_id;
	$.ajax({
		url: url,
		dataType: "html",
		success: function(data){
			filter = document.createElement('div');
			$(filter).html(data);
			if(isFirst){
				$("#selected_strategy,#continue_button", filter).attr("disabled","disabled");
				$("#transforms,#continue_button_transforms", filter).attr("disabled","disabled");
			}else{
				$("#continue_button", filter).click(function(){
					original_Query_Form_Text = $("#query_form").parent().html();
					OpenOperationBox(strat_id);
					return false;
				});
		
			$("#continue_button_transforms", filter).click(function(){
				original_Query_Form_Text = $("#query_form").parent().html();
				getQueryForm($("#query_form select#transforms").val(),true);
			});
			}
			$("div#strategy_results").append(filter);
			$("#query_form").jqDrag(".dragHandle");
		},
		error: function(){
			alert("Error getting the needed information from the server \n Please contact the system administrator");
		}
	});
}

function close(ele){
	cd = $("#query_form").parent();
	$(cd).html(original_Query_Form_Text);
	$("#query_form").jqDrag(".dragHandle");
}

function closeAll(hide){
	if(hide)
		$("#query_form").parent().hide();
	else
		$("#query_form").parent().remove();
	$(".filter_link").css({opacity:"1.0"}).attr("href");
}


