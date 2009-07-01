var _action = "";
var original_Query_Form_Text;
var original_Query_Form_CSS = new Object();
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
		$("#" + hidePanel).css({'position':'absolute','left':'-1000em','width':'100%','display':'none'});
	});
	$("#tab_" + panel).parent().attr("id", "selected");
	$("#" + panel).css({'position':'relative','left':'auto','display':'block'});
	if (panel == 'strategy_results') {
		$("body > #query_form").show();
		$("body > .crumb_details").show();
	}
	else {
		if (panel == 'search_history') updateHistory();
		$("body > #query_form").hide();
		$("body > .crumb_details").hide();
	}
	setCurrentTabCookie(panel, false);
}

function showSaveForm(stratId, save, share){
	closeModal();
	$("div.save_strat_div").addClass("hidden");
	var saveForm = $("div#save_strat_div_" + stratId);
	var stratName = saveForm.parent().parent().find("span:first").text();
	$("input[type=text]", saveForm).attr("value", stratName);
       if (save){
         $("form", saveForm).attr("action", "javascript:saveOrRenameStrategy(" + stratId + ", true, true, false)");
         $("span.h3left", saveForm).text("Save As");
         $("input[type=submit]", saveForm).attr("value", "Save");
         if (share) {
		  $("span.h3left", saveForm).text("First you need to Save it!");
         }
       }
       else{
         $("form", saveForm).attr("action", "javascript:saveOrRenameStrategy(" + stratId + ", true, false, false)");
         $("span.h3left", saveForm).text("Rename");
         $("input[type=submit]", saveForm).attr("value", "Rename");
       }
	saveForm.show();
         $("input[name='name']", saveForm).focus().select();
}

function closeModal(){
	$("div.modal_div").hide();
}

function validateSaveForm(form){
        if (form.name.value == ""){
                var message = "<h1>You must specify a name for saving!</h1><input type='button' value='OK' onclick='$(\"div#diagram_" + form.strategy.
value + "\").unblock()'/>";
                $("div#diagram_" + form.strategy.value).block({message: message});
                return false;
        }
        return true;
}

function formatFilterForm(params, data, edit, reviseStep, hideQuery, hideOp, isOrtholog){
	//edit = 0 ::: adding a new step
	//edit = 1 ::: editing a current step
	var ps = document.createElement('div');
	ps.innerHTML = params.substring(params.indexOf("<form"),params.indexOf("</form>") + 6);
	
	var operation = "";
	var stepn = 0;
	var insert = "";
	var proto = "";
	var currStrategy = getStrategy(current_Front_Strategy_Id);
	var stratBackId = currStrategy.backId;
	var stp = null;
	var stepBackId = null;
	if(edit == 0){
		insert = reviseStep;
		if (insert == ""){
			stp = currStrategy.getLastStep();
			stepBackId = (stp.back_boolean_Id == "") ? stp.back_step_Id : stp.back_boolean_id;
		}else{
			stp = currStrategy.getStep(insert,false);
			stepBackId = insert;
		}
	}else{
		var parts = reviseStep.split(":");
		proto = parts[0];
		reviseStep = parseInt(parts[1]);
		stp = currStrategy.getStep(reviseStep,false);
		stepBackId = reviseStep;
		isSub = true;
		operation = parts[4];
	}
	var pro_url = "";
	if(edit == 0)
		pro_url = "processFilter.do?strategy=" + stratBackId + "&insert=" +insert + "&ortholog=" + isOrtholog;
	else{
		pro_url = "processFilter.do?strategy=" + stratBackId + "&revise=" + stepBackId;   //reviseStep;
	}
	var historyId = $("#history_id").val();
	
	if(edit == 0){
		var close_link = "<a class='close_window' href='javascript:closeAll(false)'><img src='/assets/images/Close-X-box.png'/></a>";
		var back_link = "<a id='back_to_selection' href='javascript:close()'><img src='/assets/images/backbox.png'/></a>";
	}else
		var close_link = "<a class='close_window' href='javascript:closeAll(false)'><img src='/assets/images/Close-X-box.png'/></a>";

	var quesTitle = $("h1",data).text().replace(/Identify Genes based on/,"");
	
	var quesForm = $("form#form_question",data);
	var quesDescription = $("#query-description-section",data);
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
                || (type == 'Isolates' && question != 'IsolateQuestions.IsolatesBySimilarity')) {
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
	
	if(edit == 0){
		if(insert == "" || (stp.isLast && isOrtholog)){
			$(".filter.params", quesForm).prepend("<span class='form_subtitle'>Add&nbsp;Step&nbsp;" + (parseInt(stp.frontId)+1) + ": " + quesTitle + "</span></br>");		
		}else if (stp.frontId == 1 && !isOrtholog){
			$(".filter.params", quesForm).prepend("<span class='form_subtitle'>Insert&nbsp;Step&nbsp;Before&nbsp;" + (stp.frontId) + ": " + quesTitle + "</span></br>");
		}else if (isOrtholog){
			$(".filter.params", quesForm).prepend("<span class='form_subtitle'>Insert&nbsp;Step&nbsp;Between&nbsp;" + (stp.frontId) + "&nbsp;And&nbsp;" + (parseInt(stp.frontId)+1) + ": " + quesTitle + "</span></br>");		
		}else{
			$(".filter.params", quesForm).prepend("<span class='form_subtitle'>Insert&nbsp;Step&nbsp;Between&nbsp;" + (parseInt(stp.frontId)-1) + "&nbsp;And&nbsp;" + (stp.frontId) + ": " + quesTitle + "</span></br>");		
		}
	}else{
		$(".filter.params", quesForm).prepend("<span class='form_subtitle'>Revise&nbsp;Step&nbsp;" + (stp.frontId) + ": " + quesTitle + "</span></br>");
	}
	if(edit == 0){
		if(insert == ""){
			$(".filter.params", quesForm).after("<div class='filter operators'><span class='form_subtitle'>Combine with Step " + (stp.frontId) + "</span><div id='operations'><table style='margin-left:auto; margin-right:auto;'><tr><td class='opcheck' valign='middle'><input type='radio' name='booleanExpression' value='INTERSECT' /></td><td class='operation INTERSECT'></td><td valign='middle'>&nbsp;" + (stp.frontId) + "&nbsp;<b>INTERSECT</b>&nbsp;" + (parseInt(stp.frontId)+1) + "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td class='opcheck'><input type='radio' name='booleanExpression' value='UNION'></td><td class='operation UNION'></td><td>&nbsp;" + (stp.frontId) + "&nbsp;<b>UNION</b>&nbsp;" + (parseInt(stp.frontId)+1) + "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td class='opcheck'><input type='radio' name='booleanExpression' value='NOT'></td><td class='operation MINUS'></td><td>&nbsp;" + (stp.frontId) + "&nbsp;<b>MINUS</b>&nbsp;" + (parseInt(stp.frontId)+1) + "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td class='opcheck'><input type='radio' name='booleanExpression' value='RMINUS'></td><td class='operation RMINUS'></td><td>&nbsp;" + (parseInt(stp.frontId)+1) + "&nbsp;<b>MINUS</b>&nbsp;" + (stp.frontId) + "</td></tr></table></div></div>");
		}else{
			$(".filter.params", quesForm).after("<div class='filter operators'><span class='form_subtitle'>Combine with Step " + (parseInt(stp.frontId)-1) + "</span><div id='operations'><table style='margin-left:auto; margin-right:auto;'><tr><td class='opcheck' valign='middle'><input type='radio' name='booleanExpression' value='INTERSECT' /></td><td class='operation INTERSECT'></td><td valign='middle'>&nbsp;" + (parseInt(stp.frontId)-1) + "&nbsp;<b>INTERSECT</b>&nbsp;" + (stp.frontId) + "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td class='opcheck'><input type='radio' name='booleanExpression' value='UNION'></td><td class='operation UNION'></td><td>&nbsp;" + (parseInt(stp.frontId)-1) + "&nbsp;<b>UNION</b>&nbsp;" + (stp.frontId) + "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td class='opcheck'><input type='radio' name='booleanExpression' value='NOT'></td><td class='operation MINUS'></td><td>&nbsp;" + (parseInt(stp.frontId)-1) + "&nbsp;<b>MINUS</b>&nbsp;" + (stp.frontId) + "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td class='opcheck'><input type='radio' name='booleanExpression' value='RMINUS'></td><td class='operation RMINUS'></td><td>&nbsp;" + (stp.frontId) + "&nbsp;<b>MINUS</b>&nbsp;" + (parseInt(stp.frontId)-1) + "</td></tr></table></div></div>");
		}
	} else {
		if(stp.frontId != 1){
			$(".filter.params", quesForm).after("<div class='filter operators'><span class='form_subtitle'>Combine with Step " + (parseInt(stp.frontId)-1) + "</span><div id='operations'><table style='margin-left:auto; margin-right:auto;'><tr><td class='opcheck'><input id='INTERSECT' type='radio' name='booleanExpression' value='INTERSECT' /></td><td class='operation INTERSECT'></td><td>&nbsp;" + (parseInt(stp.frontId)-1) + "&nbsp;<b>INTERSECT</b>&nbsp;" + (stp.frontId) + "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td class='opcheck'><input id='UNION' type='radio' name='booleanExpression' value='UNION'></td><td class='operation UNION'></td><td>&nbsp;" + (parseInt(stp.frontId)-1) + "&nbsp;<b>UNION</b>&nbsp;" + (stp.frontId) + "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td class='opcheck'><input id='MINUS' type='radio' name='booleanExpression' value='NOT'></td><td class='operation MINUS'></td><td>&nbsp;" + (parseInt(stp.frontId)-1) + "&nbsp;<b>MINUS</b>&nbsp;" + (stp.frontId) + "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td class='opcheck'><input type='radio' name='booleanExpression' value='RMINUS'></td><td class='operation RMINUS'></td><td>&nbsp;" + (stp.frontId) + "&nbsp;<b>MINUS</b>&nbsp;" + (parseInt(stp.frontId)-1) + "</td></tr></table></div></div>");
		}else{
			$(".filter.params", quesForm).after("<input type='hidden' name='booleanExpression' value='AND' />");
		}
	}
	if(edit == 0)	
		var action = "javascript:validateAndCall('add','" + pro_url + "', '" + stratBackId + "')";//"javascript:AddStepToStrategy('" + pro_url + "')";
	else
		var action = "javascript:validateAndCall('edit', '" + pro_url + "', '" + stratBackId + "', "+ parseInt(reviseStep) + ")";//"javascript:EditStep('" + proto + "', '" + pro_url + "', " + parseInt(reviseStep) + ")";
	var formtitle = "";
	if(edit == 0){
		if(insert == "")
			formtitle = "<h1>Add&nbsp;Step</h1>";
		else
			formtitle = "<h1>Insert&nbsp;Step</h1>";
	}else{
		formtitle = "<h1>Revise&nbsp;Step</h1>";
	}
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
	//	$("#query_form").css("min-width", "500px");
	}else{
		$("div.filter div.params", quesForm).html(ps.getElementsByTagName('form')[0].innerHTML);
	}
	if (hideOp){
		$(".filter.operators", quesForm).remove();
		$(".filter.params", quesForm).after("<input type='hidden' name='booleanExpression' value='AND' />");
		//$(".filter.operators").width('auto');
	//	$("#query_form").css({'max-width' : '61%','min-width' : '729px'});
	}
	
	$("#query_form").append(quesForm);
	$("#query_form").append(tooltips);
	//$("#filter_link_div_" + proto + " #query_selection").fadeOut("normal");
	if(edit == 1)
		$("#query_form div#operations input#" + operation).attr('checked','checked'); 
	
	if(quesDescription.length > 0)
		$("#query_form").append("<div style='padding:5px;margin:5px 15px 5px 15px;border-top:1px solid grey;border-bottom:1px solid grey'>" + quesDescription.html() + "</div>");
		//$("#query_form .filter.params").append("<div style='padding:5px;margin:5px 15px 5px 15px;border-top:1px solid grey;border-bottom:1px solid grey'>" + quesDescription.html() + "</div>");
	$("#query_form").append("<div class='bottom-close'><a href='javascript:closeAll(false)' class='close_window'>Close</a></div>");
	htmltooltip.render();
	setDraggable($("#query_form"), ".dragHandle");
	$("#query_form").fadeIn("normal");
}

function validateAndCall(type, url, proto, rs){
	var valid = false;
	if($("div#query_form div.filter.operators").length == 0){//if($("input[name='booleanExpression']").attr("type") == "hidden"){
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

function getQueryForm(url,hideOp,isOrtholog, loadingParent){
    // retrieve the question form, but leave out all params
    	var questionUrl = url + "&showParams=false";
		var paramsUrl = url + "&showParams=true";
	    original_Query_Form_Text = $("#query_form").html();
		if(loadingParent == undefined) loadingParent = "query_form";
		$.ajax({
			url: questionUrl,
			dataType:"html",
			beforeSend: function(){
				showLoading(loadingParent);//"query_form");
			},
			success: function(data){
				$.ajax({
					url:paramsUrl,
					dataType: "html",
					success: function(params){
						formatFilterForm(params,data,0,isInsert,false,hideOp,isOrtholog);
						removeLoading(loadingParent);
					}
				});
			},
			error: function(data, msg, e){
				alert("ERROR \n "+ msg + "\n" + e + ". \nPlease double check your parameters, and try again." + 
                                      + "\nReloading this page might also solve the problem. \nOtherwise, please contact site support.");
			}
		});
}

function OpenOperationBox(stratId, insertId) {
//	var header = $("#query_form span.dragHandle");
	var selectedStrat = $("#query_form select#selected_strategy").val();
	var selectedName = $("#query_form select#selected_strategy option[selected]").text();
        if (insertId == undefined) insertId = "";
	var url = "processFilter.do?strategy=" + getStrategy(stratId).backId + "&insert=" + insertId + "&insertStrategy=" + selectedStrat +"&checksum=" + getStrategy(stratId).checksum;
	//var oform = "<form id='form_question' enctype='multipart/form-data' action='javascript:AddStepToStrategy(" + url + ")' method='post' name='questionForm'>";
	var oform = "<form id='form_question' enctype='multipart/form-data' action='javascript:validateAndCall(\"add\",\""+ url + "\", \"" + getStrategy(stratId).backId + "\")' method='post' name='questionForm'>";
	var cform = "</form>";
	var ops = "<div class='filter operators'><span class='form_subtitle' style='padding:0 20px'>Combine <b><i>" + getStrategy(stratId).name + "</i></b> with <b><i>" + selectedName + "</i></b></span><div id='operations'><table style='margin-left:auto; margin-right:auto;'><tr><td class='opcheck' valign='middle'><input type='radio' name='booleanExpression' value='INTERSECT' /></td><td class='operation INTERSECT'></td><td valign='middle'>&nbsp;" + (stp.frontId) + "&nbsp;<b>INTERSECT</b>&nbsp;" + (parseInt(stp.frontId)+1) + "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td class='opcheck'><input type='radio' name='booleanExpression' value='UNION'></td><td class='operation UNION'></td><td>&nbsp;" + (stp.frontId) + "&nbsp;<b>UNION</b>&nbsp;" + (parseInt(stp.frontId)+1) + "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td class='opcheck'><input type='radio' name='booleanExpression' value='NOT'></td><td class='operation MINUS'></td><td>&nbsp;" + (stp.frontId) + "&nbsp;<b>MINUS</b>&nbsp;" + (parseInt(stp.frontId)+1) + "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td class='opcheck'><input type='radio' name='booleanExpression' value='RMINUS'></td><td class='operation RMINUS'></td><td>&nbsp;" + (parseInt(stp.frontId)+1) + "&nbsp;<b>MINUS</b>&nbsp;" + (stp.frontId) + "</td></tr></table></div></div>"
	var button = "<div style='text-align:center'><input type='submit' value='Add Strategy' /></div>";
	ops = oform + ops + button + cform;
	$("#query_form div#query_selection").replaceWith(ops);
}

function openFilter(dtype,strat_id,step_id,isAdd){
	if(openDetail != null) hideDetails();
	var isFirst = false;
	steps = getStrategy(strat_id).Steps;
	if(step_id == undefined){
		isFirst = true;
	}else{
		stp = getStrategy(strat_id).getStep(step_id,false)
		if(stp != null && stp.frontId == 1 && !isAdd) isFirst = true;
	}
	current_Front_Strategy_Id = strat_id;
	var url = "filter_page.jsp?dataType=" + dtype + "&prevStepNum=" + step_id;
	$.ajax({
		url: url,
		dataType: "html",
		beforeSend: function(){
			$("#query_form").remove();
			$("#Strategies div a#filter_link span").css({opacity: 1.0});
			$("#Strategies div#diagram_" + current_Front_Strategy_Id + " a#filter_link span").css({opacity: 0.4});
		},
		success: function(data){
			//filter = document.createElement('div');
			$("body").append(data);
			original_Query_Form_CSS.maxW = $("#query_form").css("max-width");
			original_Query_Form_CSS.minW = $("#query_form").css("min-width");
			$("#query_form select#selected_strategy option[value='" + getStrategy(strat_id).backId + "']").remove();
			if(isAdd)
				$("#query_form h1#query_form_title").html("Add&nbsp;Step");
			else
				$("#query_form h1#query_form_title").html("Insert&nbsp;Step");
			if(isFirst){
				$("#query_form #selected_strategy,#continue_button").attr("disabled","disabled");
				$("#query_form #transforms,#continue_button_transforms").attr("disabled","disabled");
			}else{
				$("#query_form #continue_button").click(function(){
				original_Query_Form_Text = $("#query_form").html();
				if($("#query_form select#selected_strategy").val() == "--")
						alert("Please select a strategy from the list.");
					else
						OpenOperationBox(strat_id, (isAdd ? undefined : step_id));
					return false;
				});
		
				$("#query_form #continue_button_transforms").click(function(){
					original_Query_Form_Text = $("#query_form").html();
					getQueryForm($("#query_form select#transforms").val(),true);
				});
			}
			if(!isAdd){
			$("#query_form select#transforms option").each(function(){
				stp = getStrategy(strat_id).getStep(step_id,false);
				fid = parseInt(stp.frontId);
				if(fid > 1){
					value = $(this).val();
					stpId = value.split("gene_result=");
					prevStp = getStrategy(strat_id).getStep(fid-1,true);
					if(prevStp.back_boolean_Id != null && prevStp.back_boolean_Id != "")
						stpId[1] = prevStp.back_boolean_Id;
					else
						stpId[1] = prevStp.back_step_Id;
						value = stpId.join("gene_result=") + "&partial=true";
					$(this).val(value);
				}
			});
			}
			setDraggable($("#query_form"), ".handle");
		},
		error: function(){
			alert("Error getting the needed information from the server \n Please contact the system administrator");
		}
	});
}

function openOrthologFilter(strat_id, step_id){
	var strat = getStrategyFromBackId(strat_id);
	isInsert = step_id;
	current_Front_Strategy_Id = strat.frontId;
	var url = 'showQuestion.do?questionFullName=InternalQuestions.GenesByOrthologs&gene_result=' + step_id + '&partial=true';
	$("#query_form").remove();
	$("#Strategies div a#filter_link span").css({opacity: 1.0});
	$("#Strategies div#diagram_" + current_Front_Strategy_Id + " a#filter_link span").css({opacity: 0.4});
	$("body").append("<div id='query_form' class='jqDnR' style='min-height:140px; display:none'><span class='dragHandle'><div class='modal_name'><h1 id='query_form_title'></h1></div><a id='close_filter_query' href='javascript:closeAll()'><img src='/assets/images/Close-X-box.png' alt='Close'/></a></span></div>");
//	setDraggable($("#query_form"), ".handle");
	getQueryForm(url, true, true, strat.frontId);
}

function close(ele){
	cd = $("#query_form");
	$(cd).html(original_Query_Form_Text);
	$("#query_form").css("max-width",original_Query_Form_CSS.maxW);
	$("#query_form").css("min-width",original_Query_Form_CSS.minW);
	setDraggable($("#query_form"), ".dragHandle");
	
	$("#query_form #continue_button").click(function(){
		original_Query_Form_Text = $("#query_form").html();
		OpenOperationBox(strat_id, undefined);
		return false;
	});

	$("#query_form #continue_button_transforms").click(function(){
		original_Query_Form_Text = $("#query_form").html();
		getQueryForm($("#query_form select#transforms").val(),true);
	});
}

function closeAll(hide){
	if(hide)
		$("#query_form").hide();
	else
		$("#query_form").remove();
		isInsert = "";
	$("#Strategies div a#filter_link span").css({opacity: 1.0});
}

function setDraggable(e, handle){
	var rlimit = $("div#contentwrapper").width() - e.width() - 18;
	if(rlimit < 0) rlimit = 525;
	var blimit = $("body").height();
	$(e).draggable({
		handle: handle,
		containment: [0,0,rlimit,blimit]
	});
}

