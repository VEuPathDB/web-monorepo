//CONSTANTS
var booleanClasses = "venn row2 size2 arrowgrey operation ";
var firstClasses = "box venn row2 size1 arrowgrey";
var transformClasses = "box venn row2 size1 transform"; 
var operandClasses = "box row1 size1 arrowgrey";
var indent = 20;

//distances for the step layout
var f2b = 114; // first step to boolean step
var f2t = 147; // first step to transform step
var b2b = 125; // boolean step to boolean step
var b2t = 114; // boolean step to transform step
var t2b = 113; // transform step to boolean step
var t2t = 147; // transform step to transform step

//Colors for explanded substrategies
var colors = new Array();
//colors[0] = {step:"#000000", top:"#FFFFFF", right:"#CCCCCC", bottom:"#666677", left:"#A0A0A0"};
colors[0] = {step:"#A00000", top:"#A00000", right:"#A00000", bottom:"#A00000", left:"#A00000"};
colors[1] = {step:"#A0A000", top:"#A0A000", right:"#A0A000", bottom:"#A0A000", left:"#A0A000"};
colors[2] = {step:"#A000A0", top:"#A000A0", right:"#A000A0", bottom:"#A000A0", left:"#A000A0"};
colors[3] = {step:"#00A0A0", top:"#00A0A0", right:"#00A0A0", bottom:"#00A0A0", left:"#00A0A0"};
colors[4] = {step:"#0000A0", top:"#0000A0", right:"#0000A0", bottom:"#0000A0", left:"#0000A0"};
var currentColor = 0;
//Popup messages
var insert_popup = "Insert a new step to the left of this one, by either running a new query or choosing an existing strategy";
var delete_popup = "Delete this step from the strategy; if this step is the only step in this strategy, this will delete the strategy also";

	//Simple Steps
var ss_rename_popup = "Rename this search";
var ss_view_popup = "View the results of this search in the Results area below";
var ss_edit_popup = "Revise the parameters of this search and/or its combine operation";
var ss_expand_popup = "Expand this step in a new panel to add nested steps. (Use this to build a non-linear strategy)";							
	//Substrategies
var sub_edit_expand_openned = "Revise the nested strategy in the open panel below";	
var sub_rename_popup = "Rename this nested strategy";             
var sub_view_popup = "View the results of this nested strategy in the Results area below";
var sub_edit_popup = "Open this nested step to revise";
var sub_expand_popup = "Open into a new panel to add or edit nested steps";

//VARIABLES
//var div_strat = null;
var stepDivs = null;
var leftOffset = 0;
// MANAGE THE DISPLAY OF THE STRATEGY BASED ON THE ID PASSED IN
// This function is bracketed in a try/catch block.  On an error thrown by this javascript, we will simply reload teh Strategy section of the page.
// This is a fairly fast operation in most cases and shouldl put the site in the state that the user expected... but insome cases it could be slow,
// thus it is only used in an error condition
// if there is strange behavior in the Strategy display, first step should be to comment out the try/catch blocks in order to see the errors more clearly.
function displayModel(strat){
//  try{
	if(strats){
	  $("#strat-instructions").remove();
	  $("#strat-instructions-2").remove();
	  // For IE : when instructions are shown, need to specify 'overflow : visible'
	  // Need to remove this inline style when instructions are removed
	  $("#Strategies").removeAttr("style");
	  //var strat = null;
	  //strat = getStrategy(strat_id);
	  if(strat.isDisplay){
		var div_strat = document.createElement("div");
		$(div_strat).attr("id","diagram_" + strat.frontId).addClass("diagram");
		//if(strat.subStratOf != null){
			//psml = $("#Strategies div#diagram_"+strat.subStratOf).css("margin-left");
			//psml = parseInt(psml.substring(0,psml.indexOf("px")));
			//$(div_strat).addClass("sub_diagram").css({"margin-left": (strat.depth(null) * indent) + "px"});
		//}
		var close_span = document.createElement('span');
		$(close_span).addClass("closeStrategy").html(""+
		"	<a onclick='closeStrategy(" + strat.frontId + ")' href='javascript:void(0)'>"+
		"		<img alt='Click here to close the strategy (it will only be removed from the display)' src='/assets/images/Close-X.png' title='Click here to close the strategy (it will only be removed from the display)' height='15' width='15' src='/assets/images/Close-X.png'/>"+
		"	</a>");
		$(div_strat).append(close_span);
		$(div_strat).append(createStrategyName(strat));
		$(div_strat).append(createParentStep(strat));
		//$(div_strat).css({"border-width":"4px", "border-style":"ridge", "border-color": colors[currentColor].top+" "+colors[currentColor].right+" "+colors[currentColor].bottom+" "+colors[currentColor].left});
		displaySteps = createSteps(strat,div_strat);
		$(div_strat).append(createRecordTypeName(strat));
		buttonleft = offset(null);
		button = document.createElement('a');
		lsn = strat.getStep(strat.Steps.length,true).back_boolean_Id;
		if(lsn == "" || lsn == null)
			lsn = strat.getStep(strat.Steps.length, true).back_step_Id;	
		dType = strat.dataType;
		$(button).attr("id","filter_link").attr("href","javascript:openFilter('" + dType + "'," + strat.frontId + "," + lsn + ",true)").attr("onclick","this.blur()").addClass("filter_link redbutton");
		$(button).html("<span title='CLICK to run a new query and combine its result with your current result.     Alternatively, you could obtain the orthologs to your current result or run another available transform.'>Add Step</span>");
		$(button).css({ position: "absolute",
						left: buttonleft + "px",
						top: "56px"});
		$(div_strat).append(button);
		var diagram_width = buttonleft + 200;
		$(div_strat).css("min-width",diagram_width + "px");
	    return div_strat;
	  }
    }
 // }catch(e){
//	alert(e);
//	initDisplay(0);
//  }
	return null;
}


// HANDLES THE CREATION OF THE STEP BOX -- This function could be broken down to smaller bites based on the type of step -- future work
function createSteps(strat,div_strat){
	stepdivs = new Array();
	leftOffset = 12;
	var zIndex = 80;
	for(var ind=0; ind < strat.Steps.length; ind++){  //cStp in strat.Steps){
		//cStp = getStep(strat.frontId, ind+1);
		cStp = strat.getStep(ind+1,true);
		jsonStep = strat.JSON.steps[cStp.frontId];
		if(cStp.isboolean){
			booleanStep(cStp, jsonStep, strat.frontId, zIndex);
		}else{
			singleStep(cStp, jsonStep,strat.frontId, zIndex);
		}
		zIndex--; // DO NOT DELETE, needed for correct display in IE7.
	}
	for(var id in stepdivs){
		$(div_strat).append(stepdivs[id]);
	}
}

//Creates the boolean Step and the operand step displayed above it
function booleanStep(modelstep, jsonstep, sid, zIndex){
	// Create the boolean venn diagram box
	var filterImg = "";
	var bool_link = "";
	if(jsonstep.isValid) bool_link = "NewResults(" + sid + "," + modelstep.frontId + ", true)";
	if(jsonstep.filtered) filterImg = "<span class='filterImg'><img src='/assets/images/filter.gif' height='10px' width='10px'/></span>";
	boolinner = ""+
		"			<a id='" + sid + "|" + modelstep.back_boolean_Id + "|" + jsonstep.operation + "' title='CLICK to modify this boolean operation.' class='operation' href='javascript:void(0)' onclick='showDetails(this)'>"+
		"				<img src='/assets/images/transparent1.gif'>"+
		"			</a>"+
		"			<div class='crumb_details'></div>"+
		"			<h6 class='resultCount'>"+
		"				<a title='CLICK to show these results in the area below.' class='operation' onclick='" + bool_link + "' href='javascript:void(0)'>" + jsonstep.results + "&nbsp;" + getDataType(jsonstep.dataType, jsonstep.results) + "</a>"+
		"			</h6>" + filterImg;
		if(!modelstep.isLast){
			if(modelstep.nextStepType == "transform"){
				boolinner = boolinner + 
				"			<ul>"+
				"				<li><img class='rightarrow3' src='/assets/images/arrow_chain_right3.png' alt='input into'></li>"+
				"			</ul>";
			}else{
				boolinner = boolinner + 
				"			<ul>"+
				"				<li><img class='rightarrow2' src='/assets/images/arrow_chain_right4.png' alt='input into'></li>"+
				"			</ul>";
			}
		}
	boolDiv = document.createElement('div');
	$(boolDiv).attr("id","step_" + modelstep.frontId).addClass(booleanClasses + jsonstep.operation).html(boolinner).css({left: offset(modelstep) + "px", 'z-index' : zIndex});
	$(".crumb_details", boolDiv).replaceWith(createDetails(modelstep, jsonstep, sid));
	zIndex++; // DO NOT DELETE this or previous line, needed for correct display in IE7.
	stepNumber = document.createElement('span');
	$(stepNumber).addClass('stepNumber').css({ left: (leftOffset + 30) + "px"}).text("Step " + modelstep.frontId);
//	var boolean_invalid = null;
//	if(!jsonstep.isValid){
//		boolean_invalid = createInvalidDiv();
//		$(boolean_invalid).addClass(booleanClasses).css({left: leftOffset + "px"});
//	}
	//Create the operand Step Box
	childStp = jsonstep.step;	
	uname = "";
	fullName = "";
	if(childStp.name == childStp.customName){
		uname = childStp.shortName;
		fullName = childStp.name;
	}else{
		uname = (childStp.customName.length > 15)?childStp.customName.substring(0,12) + "...":childStp.customName; 
		fullName = childStp.customName;
	}
	var childfilterImg = "";
	if(childStp.filtered)
		childfilterImg = "<span class='filterImg'><img src='/assets/images/filter.gif' height='10px' width='10px'/></span>";
	childinner = ""+
		"		<h3>"+
		"			<a style='text-decoration:underline' title='CLICK to make changes to this step and/or how it is combined with the previous step' id='stepId_" + modelstep.frontId + "' class='crumb_name' onclick='showDetails(this)' href='javascript:void(0)'>"+
		"				<span id='name'>"+uname+"</span>"+
		"				<img src='/assets/images/plus.gif' width='13' height='13'/>"+
		"				<span class='collapsible' style='display: none;'>false</span>"+
		"			</a>"+
		"			<span id='fullStepName' style='display: none;'>" + fullName + "</span>"+
		"			<div class='crumb_details'></div>"+
		"		</h3>"+
		"		<h6 class='resultCount'><a title='CLICK to show these results in the area below.' class='results_link' href='javascript:void(0)' onclick='NewResults(" + sid + "," + modelstep.frontId + ", false)'> " + childStp.results + "&nbsp;" + getDataType(childStp.dataType, childStp.results) + "</a></h6>"+
		childfilterImg +
		"		<ul>"+
		"			<li><img class='downarrow' src='/assets/images/arrow_chain_down2.png' alt='equals'></li>"+
		"		</ul>";	
	childDiv = document.createElement('div');
	$(childDiv).attr("id","step_" + modelstep.frontId + "_sub").addClass(operandClasses).html(childinner).css({left: leftOffset + "px", 'z-index' : zIndex});
	zIndex--; // DO NOT DELETE this or previous line, needed for correct display in IE7.
	$(".crumb_details", childDiv).replaceWith(createDetails(modelstep, childStp, sid));
	var child_invalid = null;
	if(!childStp.isValid){
		child_invalid = createInvalidDiv();
		$(child_invalid).attr("id",sid+"_"+modelstep.frontId).addClass(operandClasses).css({left: leftOffset + "px"});
		$("img", child_invalid).click(function(){
			var iv_id = $(this).parent().attr("id").split("_");
			$("div#diagram_" + iv_id[0] + " div#step_" + iv_id[1] + "_sub div.crumb_menu a.edit_step_link").click();
		});
	}
	
	// Create the background div for a collapsed step if step is expanded
	var bkgdDiv = null;
	if(childStp.isCollapsed){
		var ss_name = childStp.strategy.name.length > 15 ? childStp.strategy.name.substring(0,12) + "...":childStp.strategy.name; 
		$(".crumb_name span#name", childDiv).text(ss_name);
		$("span#fullStepName", childDiv).text(childStp.strategy.name);
		bkgdDiv = document.createElement("div");
		$(bkgdDiv).addClass("expandedStep");
		$(bkgdDiv).css({ left: (leftOffset-2) + "px"});
//		if(modelstep.child_Strat_Id != null && getStrategy(modelstep.child_Strat_Id).isDisplay == true){
//			ExpandStep(null, sid, modelstep.frontId,childStp.strategy.name);
//		}
	}
	if(bkgdDiv != null)
		stepdivs.push(bkgdDiv);
	stepdivs.push(boolDiv);
	stepdivs.push(stepNumber);
	stepdivs.push(childDiv);
//	if(boolean_invalid != null)
//		stepdivs.push(boolean_invalid);
	if(child_invalid != null)
		stepdivs.push(child_invalid);
}

//Creates all steps that are on the bottom line only ie. this first step and transform steps
function singleStep(modelstep, jsonstep, sid, zIndex){
	uname = "";
	fullName = "";
	if(jsonstep.name == jsonstep.customName){
		uname = jsonstep.shortName;
		fullName = jsonstep.name;
	}else{
		uname = (jsonstep.customName.length > 15)?jsonstep.customName.substring(0,12) + "...":jsonstep.customName; 
		fullName = jsonstep.customName;
	}
	var filterImg = "";
	if(jsonstep.filtered)
		filterImg = "<span class='filterImg'><img src='/assets/images/filter.gif' height='10px' width='10px'/></span>";
	inner = ""+
		"		<h3>"+
		"			<a style='text-decoration:underline' title='CLICK to make changes to this step.' id='stepId_" + modelstep.frontId + "' class='crumb_name' onclick='showDetails(this)' href='javascript:void(0)'>"+
		"				<span id='name'>"+uname+"</span>"+
		"				<img src='/assets/images/plus.gif' width='13' height='13'/>"+
		"				<span class='collapsible' style='display: none;'>false</span>"+
		"			</a>"+ 
		"			<span id='fullStepName' style='display: none;'>" + fullName + "</span>"+
		"			<div class='crumb_details'></div>"+
		"		</h3>"+
		"		<h6 class='resultCount'><a title='CLICK to show these results in the area below.' class='results_link' href='javascript:void(0)' onclick='NewResults(" + sid + "," + modelstep.frontId + ", false)'> " + jsonstep.results + "&nbsp;" + getDataType(jsonstep.dataType,jsonstep.results) + "</a></h6>"+
		 filterImg;
	if(!modelstep.isLast){
		inner = inner + 
			"		<ul>"+
			"			<li><img class='rightarrow1' src='/assets/images/arrow_chain_right3.png' alt='input into'></li>"+
			"		</ul>";
	}
	
	singleDiv = document.createElement('div');
	$(singleDiv).attr("id","step_" + modelstep.frontId + "_sub").html(inner);
	stepNumber = document.createElement('span');
	$(stepNumber).addClass('stepNumber').text("Step " + modelstep.frontId);
	if(modelstep.isTransform){
		$(singleDiv).addClass(transformClasses).css({ left: offset(modelstep) + "px" });
		$(stepNumber).css({ left: (leftOffset + 30) + "px"});
		$("ul li img", singleDiv).css({left: "7.6em", top: "-3.1em"});
	}else{
		$(singleDiv).addClass(firstClasses).css({ left: leftOffset + "px" });
		$(stepNumber).css({ left: "44px"});
		if(modelstep.nextStepType == "transform")
			$("ul li img",singleDiv).css({width: "54px"});
	}
	$(singleDiv).css({'z-index' : zIndex}); // DO NOT DELETE, needed for correct display in IE7.
	$(".crumb_details", singleDiv).replaceWith(createDetails(modelstep,jsonstep, sid));
	var step_invalid = null;
	if(!modelstep.isTransform && !jsonstep.isValid){
		step_invalid = createInvalidDiv();
		//if(modelstep.isTransform)
		//	$(step_invalid).attr("id",sid+"_"+modelstep.frontId).addClass(transformClasses).css({left: leftOffset + "px"});
		//else
		$(step_invalid).attr("id",sid+"_"+modelstep.frontId).addClass(firstClasses).css({left: leftOffset + "px"});
	}
	stepdivs.push(singleDiv);
	if(step_invalid != null)
		stepdivs.push(step_invalid);
	stepdivs.push(stepNumber);
	
}

//HANDLE THE CREATION OF TEH STEP DETAILS BOX
function createDetails(modelstep, jsonstep, sid){
	strat = getStrategy(sid);
	var detail_div = document.createElement('div');
	$(detail_div).addClass("crumb_details").attr("disp","0");
	if (jsonstep.isboolean && !jsonstep.isCollapsed) $(detail_div).css({ display: "none", "width":"680px"});
	else $(detail_div).css({ display: "none", "max-width":"650px", "min-width":"55%" });
	var name = jsonstep.displayName;
	var questionName = jsonstep.questionName;
	
	var filteredName = "";
	if(jsonstep.filtered){
		filteredName = "<span class='medium'><b>Applied Filter:&nbsp;</b>" + jsonstep.filterName + "</span><hr>";
	}
	if(jsonstep.isCollapsed){
		name = jsonstep.strategy.name;
	} else if (jsonstep.isboolean){
		if (jsonstep.step.isCollapsed) {
			name = jsonstep.step.strategy.name;
		} else {
			name = jsonstep.step.customName;
		}
	}
	var collapsedName = name;//"Nested " + name;

	if (jsonstep.isboolean && !jsonstep.isCollapsed){
		name = "<ul class='question_name'><li>STEP " + modelstep.frontId + " : Step " + (modelstep.frontId - 1) + "</li><li class='operation " + jsonstep.operation + "'></li><li>" + name + "</li></ul>";
	} else {
		name = "<p class='question_name'><span>STEP " + modelstep.frontId + " : " + name + "</span></p>";
	}

	var parentid = modelstep.back_step_Id;
	if(modelstep.back_boolean_Id != null && modelstep.back_boolean_Id.length != 0){
		parentid = modelstep.back_boolean_Id;
	}
	
	var params = jsonstep.params;
	var params_table = "";
	if(jsonstep.isboolean && !jsonstep.isCollapsed){
		var url = "processFilter.do?strategy=" + strat.backId + "&revise=" + modelstep.back_boolean_Id + "&checksum=" + strat.checksum;
		var oform = "<form id='form_question' class='clear_all' enctype='multipart/form-data' action='javascript:validateAndCall(\"edit\",\""+ url + "\", \"" + strat.backId + "\");' method='post' name='questionForm'>";
		var cform = "</form>";
		var params_table = "<div class='filter operators'><span class='form_subtitle' style='padding-right:20px'>Revise Operation</span><div id='operations'><table style='margin-left:auto; margin-right:auto;'><tr><td class='opcheck' valign='middle'><input type='radio' name='booleanExpression' value='INTERSECT' /></td><td class='operation INTERSECT'></td><td valign='middle'>&nbsp;" + (parseInt(modelstep.frontId)-1) + "&nbsp;<b>INTERSECT</b>&nbsp;" + (modelstep.frontId) + "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td class='opcheck'><input type='radio' name='booleanExpression' value='UNION'></td><td class='operation UNION'></td><td>&nbsp;" + (parseInt(modelstep.frontId)-1) + "&nbsp;<b>UNION</b>&nbsp;" + (modelstep.frontId) + "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td class='opcheck'><input type='radio' name='booleanExpression' value='MINUS'></td><td class='operation MINUS'></td><td>&nbsp;" + (parseInt(modelstep.frontId)-1) + "&nbsp;<b>MINUS</b>&nbsp;" + (modelstep.frontId) + "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td class='opcheck'><input type='radio' name='booleanExpression' value='RMINUS'></td><td class='operation RMINUS'></td><td>&nbsp;" + (modelstep.frontId) + "&nbsp;<b>MINUS</b>&nbsp;" + (parseInt(modelstep.frontId)-1) + "</td></tr></table></div></div>"
		var button = "<div style='text-align:center'><input type='submit' value='Revise' /></div>";
		params_table = oform + params_table + button + cform;
	}else if(params != undefined && params.length != 0)
		params_table = createParameters(params);
	var hideOp = false;
	var hideQu = false;
	if(jsonstep.isCollapsed){                              /* substrategy */

		rename_step = 	"<a title='" + sub_rename_popup + "' class='rename_step_link' href='javascript:void(0)' onclick='Rename_Step(this, " + sid + "," + modelstep.frontId + ");hideDetails(this)'>Rename</a>&nbsp;|&nbsp;";

		view_step = 	"<a title='" + sub_view_popup + "' class='view_step_link' onclick='NewResults(" + sid + "," + modelstep.frontId + ");hideDetails(this)' href='javascript:void(0)'>View</a>&nbsp;|&nbsp;";

	    disab = "";
		ocExp = "onclick='ExpandStep(this," + sid + "," + modelstep.frontId + ",\"" + collapsedName + "\");hideDetails(this)'";
		oM = "Open Nested Strategy";
		moExp = sub_expand_popup;
		moEdit = sub_edit_popup;
		if(jsonstep.strategy.order > 0){
			disab = "disabled";
			ocExp = "";
			oM = "Already Open Below...";
			moExp = sub_edit_expand_openned;
			moEdit = sub_edit_expand_openned;
		}
		
		edit_step = 	"<a title='" + moEdit + "' class='edit_step_link " + disab + "' href='javascript:void(0)' " + ocExp + ">Revise</a>&nbsp;|&nbsp;";
		
		expand_step = 	"<a title='" + moExp + "' class='expand_step_link " + disab + "' href='javascript:void(0)' " + ocExp + ">" + oM + "</a>&nbsp;|&nbsp;";

	}else{   							/* simple step */
		disab = "";
		if (jsonstep.isboolean){
			rename_step = 	"<a title='" + ss_rename_popup + "' class='rename_step_link disabled' href='javascript:void(0)'>Rename</a>&nbsp;|&nbsp;";
		} else{
			rename_step = 	"<a title='" + ss_rename_popup + "' class='rename_step_link' href='javascript:void(0)' onclick='Rename_Step(this, " + sid + "," + modelstep.frontId + ");hideDetails(this)'>Rename</a>&nbsp;|&nbsp;";
		}

		view_step = 	"<a title='" + ss_view_popup + "' class='view_step_link' onclick='NewResults(" + sid + "," + modelstep.frontId + "," + jsonstep.isboolean + ");hideDetails(this)' href='javascript:void(0)'>View</a>&nbsp;|&nbsp;";

		if(modelstep.isTransform || modelstep.frontId == 1){
			hideOp = true;
		}
		if(jsonstep.isboolean) {
			hideQu = true;
			disab = "disabled";
		}
		parms = jsonstep.urlParams;
		t = "";
		if(questionName.indexOf("BySimilarity") != -1) {
			if(questionName.indexOf("GeneQuestions") != -1) t = "GENE";
			if(questionName.indexOf("OrfQuestions") != -1) t = "ORF";
			if(questionName.indexOf("GenomicSequenceQuestions") != -1) t = "SEQ";
			if(questionName.indexOf("IsolateQuestions") != -1) t = "ISOLATE";
			if(questionName.indexOf("AssemblyQuestions") != -1) t = "ASSEMBLIES";
			if(questionName.indexOf("EstQuestions") != -1) t = "EST";
			parms = parms + "&target="+ t;
		} 
		edit_step =	"<a title='" + ss_edit_popup + "'  class='edit_step_link " + disab + "' href='javascript:void(0)' onclick='Edit_Step(this,\"" + questionName + "\",\"" + parms + "\"," + hideQu + "," + hideOp + ");hideDetails(this)' id='" + sid + "|" + parentid + "|" + modelstep.operation + "'>Revise</a>&nbsp;|&nbsp;";

		if(modelstep.frontId == 1 || modelstep.isTransform || jsonstep.isboolean){
			expand_step = 	"<a title='" + ss_expand_popup + "' class='expand_step_link disabled' href='javascript:void(0)'>Make Nested Strategy</a>&nbsp;|&nbsp;";
		}else{
			expand_step = 	"<a title='" + ss_expand_popup + "' class='expand_step_link' href='javascript:void(0)' onclick='ExpandStep(this," + sid + "," + modelstep.frontId + ",\"" + collapsedName + "\");hideDetails(this)'>Make Nested Strategy</a>&nbsp;|&nbsp;";
		}
	}
						
	insert_step = 	"<a title='" + insert_popup + "'  class='insert_step_link' id='" + sid + "|" + parentid + "' href='javascript:void(0)' onclick='Insert_Step(this,\"" + jsonstep.dataType + "\");hideDetails(this)'>Insert Step Before</a>&nbsp;|&nbsp;";

	orthologs = "";
	if(jsonstep.dataType == "GeneRecordClasses.GeneRecordClass"){
		var orthologTgt;
		if (jsonstep.isboolean){
			orthologTgt = modelstep.back_boolean_Id;
		}else{
			orthologTgt = modelstep.back_step_Id;
		}
		orthologs = "<a title='Add an ortholog transform to this step: obtain the ortholog genes to the genes in this result' class='orthologs_link' href='javascript:void(0)' onclick='openOrthologFilter(\"" + strat.backId + "\"," + orthologTgt + ");hideDetails(this)'>Orthologs</a>&nbsp;|&nbsp;";
	}
	var delete_strat = '';
	if(modelstep.frontId == 1 && strat.nonTransformLength == 1){
		delete_step = "<a title='" + delete_popup + "' class='delete_step_link' href='javascript:void(0)' onclick=\"deleteStrategy('" + strat.backId + "',false);hideDetails(this)\">Delete</a>";
	} else {
		delete_step = "<a title='" + delete_popup + "' class='delete_step_link' href='javascript:void(0)' onclick='DeleteStep(" + sid + "," + modelstep.frontId + ");hideDetails(this)'>Delete</a>";
	}

	close_button = 	"<a href='javascript:void(0)' style='float: none; position: absolute; right: 6px;' onclick='hideDetails(this)'>[x]</a>";

	inner = ""+	
	    "		<div class='crumb_menu'>"+ rename_step + view_step + edit_step + expand_step + insert_step + orthologs + delete_step + close_button +
		"		</div>"+ name +
		"		<table></table><hr class='clear_all' />" + filteredName +
		"		<p><b>Results:&nbsp;</b>" + jsonstep.results + "&nbsp;" + getDataType(jsonstep.dataType,jsonstep.results);// + "&nbsp;&nbsp;|&nbsp;&nbsp;<a href='downloadStep.do?step_id=" + modelstep.back_step_Id + "'>Download</a>";

	$(detail_div).html(inner);
	$("table", detail_div).replaceWith(params_table);
	return detail_div;       
}

// HANDLE THE DISPLAY OF THE PARAMETERS IN THE STEP DETAILS BOX
function createParameters(params){
	var table = document.createElement('table');
	$(params).each(function(){
 		//var visible  = this.visible;
        if (this.visible) {
			var tr = document.createElement('tr');
			var prompt = document.createElement('td');
			var space = document.createElement('td');
			var value = document.createElement('td');
			$(prompt).addClass("medium").css({
				"text-align":"right",
				"vertical-align":"top"
			});
			$(prompt).html("<b><i>" + this.prompt + "</i></b>");
			$(space).addClass("medium").attr("valign","top");
			$(space).html("&nbsp;:&nbsp;");
			$(value).addClass("medium").css({
				"text-align":"left",
				"vertical-align":"top"
			});
			$(value).html( this.value );
			$(tr).append(prompt);
			$(tr).append(space);
			$(tr).append(value);
			$(table).append(tr);
        }
	});
	return table;
}

// HANDLE THE DISPLAY OF THE STRATEGY RECORD TYPE DIV
function createRecordTypeName(strat){
	if (strat.subStratOf == null){
		var div_sn = document.createElement("div");
	//	$(div_sn).attr("id","record_name").addClass("strategy_small_text").text(getDataType(strat.dataType, 1) + "Strategy");
		$(div_sn).attr("id","record_name").addClass("strategy_small_text").text("(Genomic " + getDataType(strat.dataType) + ")"   );
		return div_sn;
   	}
}

function createParentStep(strat){
	var parentStep = null;
	var pstp = document.createElement('div');
	if(strat.subStratOf != null)
		parentStep = strat.findParentStep(strat.backId.split("_")[1],false);
	if(parentStep == null){
//		currentColor = 0;
//		strat.color = 0;
		return;
	}else{
//		currentColor = (currentColor + 1) > colors.length ? 1 : currentColor + 1;
//		strat.color = currentColor;
		$(pstp).attr("id","record_name").css("width","85px");
		$(pstp).append("Expanded View of Step " + parentStep.stp.frontId);
		return pstp;
	}
}

// HANDLE THE DISPLAY OF THE STRATEGY NAME DIV
function createStrategyName(strat){
	var json = strat.JSON;
	var id = strat.backId;
	var name = json.name;
	var append = '';
	if (!json.saved) append = "<span class='append'>*</span>";
	var exportURL = exportBaseURL + json.importId;
	var share = "";

	if(json.saved){
		share = "<a title='Email this URL to your best friend.' href=\"javascript:showExportLink('" + id + "')\"><b>SHARE</b></a>"+
		"<div class='modal_div export_link' id='export_link_div_" + id + "'>" +
	        "<div class='dragHandle'>" +
		"<div class='modal_name'>"+
		"<span class='h3left'>Copy and paste URL below to email</span>" + 
		"</div>"+ 
		"<a class='close_window' href='javascript:closeModal()'>"+
		"<img alt='Close' src='/assets/images/Close-X.png' height='16' />" +
		"</a>"+
		"</div>"+
		"<input type='text' size=" + (exportURL.length-6) + " value=" + exportURL + " readonly='true' />" +
		"</div>";
	}else if(guestUser == 'true'){
		share = "<a title='Please LOGIN so you can SAVE and then SHARE (email) your strategy.' href='javascript:void(0)' onclick='popLogin()'><b>SHARE</b></a>";
	}else{
		share = "<a title='SAVE this strategy so you can SHARE it (email its URL).' href='javascript:void(0)' onclick=\"showSaveForm('" + id + "', true,true)\"><b>SHARE</b></a>";
	}



	var save = "";
	var sTitle = "SAVE AS";
	// if(json.saved) sTitle = "COPY AS";
	if (guestUser == 'true') {
		save = "<a title='Please LOGIN so you can SAVE (make a snapshot) your strategy.' class='save_strat_link' href='javascript:void(0)' onclick='popLogin()'><b>" + sTitle + "</b></a>";
	}
	else {
		save = "<a title='A saved strategy is like a snapshot, it cannot be changed.' class='save_strat_link' href='javascript:void(0)' onclick=\"showSaveForm('" + id + "', true)\"><b>" + sTitle + "</b></a>";
	}
	save += "<div id='save_strat_div_" + id + "' class='modal_div save_strat'>" +
		"<div class='dragHandle'>" +
		"<div class='modal_name'>"+
		"<span class='h3left'>" + sTitle + "</span>" + 
		"</div>"+ 
		"<a class='close_window' href='javascript:closeModal()'>"+
		"<img alt='Close' src='/assets/images/Close-X.png' height='16' />" +
		"</a>"+
		"</div>"+
		"<form onsubmit='return validateSaveForm(this);' action=\"javascript:saveStrategy('" + id + "', true)\">"+
		"<input type='hidden' value='" + id + "' name='strategy'/>"+
		"<input type='text' value='' name='name'/>"+
		"<input style='margin-left:5px;' type='submit' value='Save'/>"+
		"</form>"+
		"</div>";
        var copy = "<a title='Create a copy of the strategy.' class='copy_strat_link'" +
                   " href='javascript:void(0)' onclick=\"copyStrategy('" + id + "')\">" +
                   "<b>COPY</b></a>";

var rename = "<a id='rename_" + strat.frontId + "' href='javascript:void(0)' title='Click to rename.'  onclick=\"showSaveForm('" + id + "', false)\"><b>RENAME</b></a>";

var deleteStrat = "<a id='delete_" + strat.frontId + "' href='javascript:void(0)' title='Click to delete.'  onclick=\"deleteStrategy('" + id + "', false)\"><b>DELETE</b></a>";

	var div_sn = document.createElement("div");
	$(div_sn).attr("id","strategy_name");
	if (strat.subStratOf == null){
		$(div_sn).html("<span style='font-size:14px;font-weight:bold' title='Name of this strategy. The (*) indicates this strategy is NOT saved.'>" + name + "</span>" + append + "<span id='strategy_id_span' style='display: none;'>" + id + "</span>" +
	"<span class='strategy_small_text'>" +
	"<br/>" + 
	rename +
	"<br/>" +
        copy + 
        "<br/>" +
	save +
	"<br/>"+
	share +
	"<br/>"+
	deleteStrat +
	"</span>");
	}else{
		$(div_sn).html("<span style='font-size:14px;font-weight:bold' title='Name of this substrategy. To rename, click on the corresponding step name in the parent strategy'>" + name + "</span>" + "<span id='strategy_id_span' style='display: none;'>" + id + "</span>"); 
	}
	$(div_sn).css({'z-index' : 90}); // DO NOT DELETE, needed for IE7
	$(div_sn).css("top","0px");     // to have the strategy name closer to the top
	return div_sn;
}

//REMOVE ALL OF THE SUBSTRATEGIES OF A GIVEN STRATEGY FROM THE DISPLAY
function removeStrategyDivs(stratId){
	strategy = getStrategyFromBackId(stratId);
	if(strategy != null && strategy.subStratOf != null){  //stratId.indexOf("_") > 0){
		var currentDiv = $("#Strategies div#diagram_" + strategy.frontId).remove();
		sub = getStrategyFromBackId(stratId.split("_")[0]);  //substring(0,stratId.indexOf("_")));
		//$("#Strategies div#diagram_" + sub.frontId).remove();
		subs = getSubStrategies(sub.frontId);
		for(i=0;i<subs.length;i++){
			$("#Strategies div#diagram_" + subs[i].frontId).remove();
		}
	}
//	if(strategy.subStratOf != null){
//		strats.splice(findStrategy(strategy.frontId));
//	}
}


// DISPLAY UTILITY FUNCTIONS

offset = function(modelstep){
	if(modelstep == null){
		return leftOffset + 123;
	}
	if(modelstep.isboolean && modelstep.prevStepType == "boolean"){
		leftOffset += b2b;
	}else if(modelstep.isboolean && modelstep.prevStepType == "transform"){
		leftOffset += b2t;
	}else if(modelstep.isTransform && modelstep.prevStepType == "boolean"){
		leftOffset += t2b;
	}else if(modelstep.isTransform && modelstep.prevStepType == "transform"){
		leftOffset += t2t;
	}else if(modelstep.isboolean){
		leftOffset += f2b;
	}else if(modelstep.isTransform){
		leftOffset += f2t;
	}
	return leftOffset;
}


function getRecordName(cl){

	if(cl == "GeneRecordClasses.GeneRecordClass")
		return "Genes";
	if(cl == "SequenceRecordClasses.SequenceRecordClass")
		return "Genomic Sequences";
	if(cl == "EstRecordClasses.EstRecordClass")
		return "ESTs";
	if(cl == "OrfRecordClasses.OrfRecordClass")
		return "ORFs";
	if(cl == "IsolateRecordClasses.IsolateRecordClass")
		return "Isolates";
	if(cl == "SnpRecordClasses.SnpRecordClass")
		return "SNPs";
	if(cl == "AssemblyRecordClasses.AssemblyRecordClass")
		return "Assemblies";
	if(cl == "SageTagRecordClasses.SageTagRecordClass")
		return "Sage Tags";
	if(cl == "UserFileRecords.UserFile")
		return "Files";
}

function createInvalidDiv(){
	var inval = document.createElement('div');
	var i = document.createElement('img');
	$(i).attr("src","/assets/images/InvalidStep.png").
	     attr("height","36").
		 attr("width","98").
		 attr("onclick","reviseInvalidSteps(this)");
	$(inval).css({
				background: "none",
				position: "absolute",
				"z-index": 999,
				opacity: 0.6,
				border: "none",
				"padding-top":"2px"
	 	 	 }).append(i);
	return inval;
}

function reviseInvalidSteps(ele){
	var iv_id = $(ele).parent().attr("id").split("_");
//	$("div#diagram_" + iv_id[0] + " div#step_" + iv_id[1] + "_sub div.crumb_menu a.edit_step_link").click();
	$("div#diagram_" + iv_id[0] + " div#step_" + iv_id[1] + "_sub h3 a#stepId_" + iv_id[1]).click();
}
