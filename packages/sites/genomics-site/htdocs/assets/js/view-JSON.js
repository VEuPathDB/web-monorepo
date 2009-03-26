//CONSTANTS
var booleanClasses = "venn row2 size2 arrowgrey operation ";
var firstClasses = "box venn row2 size1 arrowgrey";
var transformClasses = "box venn row2 size1 transform"; 
var operandClasses = "box row1 size1 arrowgrey";
//distances for the step layout
var f2b = 114; // first step to boolean step
var f2t = 147; // first step to transform step
var b2b = 125; // boolean step to boolean step
var b2t = 114; // boolean step to transform step
var t2b = 113; // transform step to boolean step
var t2t = 147; // transform step to transform step

//VARIABLES
var div_strat = null;
var stepDivs = null;
var leftOffset = 0;

// MANAGE THE DISPLAY OF THE STRATEGY BASED ON THE ID PASSED IN
function displayModel(strat_id){
	if(strats){
	  $("#strat-instructions").remove();
	  $("#strat-instructions-2").remove();
	  var strat = null;
	  strat = getStrategy(strat_id);
	  if(strat.isDisplay == true){
		 div_strat = document.createElement("div");
		$(div_strat).attr("id","diagram_" + strat.frontId).addClass("diagram");
		if(strat.subStratOf != null)
			$(div_strat).addClass("sub_diagram").css({"margin-left":"40px"});
		var close_span = document.createElement('span');
		$(close_span).addClass("closeStrategy").html(""+
		"	<a onclick='closeStrategy(" + strat.frontId + ")' href='javascript:void(0)'>"+
		"		<img alt='Click here to close the strategy (it will only be removed from the display)' src='/assets/images/Close-X.png' title='Click here to close the strategy (it will only be removed from the display)' src='/assets/images/Close-X.png'/>"+
		"	</a>");
		$(div_strat).append(close_span);
		$(div_strat).append(createStrategyName(strat));
		displaySteps = createSteps(strat);
		$(div_strat).append(createRecordTypeName(strat));
		buttonleft = offset(null);
		button = document.createElement('a');
		lsn = strat.getStep(strat.Steps.length).back_boolean_Id;
		if(lsn == "" || lsn == null)
			lsn = strat.getStep(strat.Steps.length).back_step_Id;	
		dType = strat.dataType;
		$(button).attr("id","filter_link").attr("href","javascript:openFilter('" + dType + "'," + strat.frontId + "," + lsn + ")").attr("onclick","this.blur()").addClass("filter_link redbutton");
		$(button).html("<span title='Run a new query and combine its result with your current result.     Alternatively, you could obtain the orthologs to your current result or run another available transform.'>Add Step</span>");
		$(button).css({ position: "absolute",
						left: buttonleft + "px",
						top: "56px"});
		$(div_strat).append(button);
	    return div_strat;
	  }
    }
	return null;
}


// HANDLES THE CREATION OF THE STEP BOX -- This function could be broken down to smaller bites based on the type of step -- future work
function createSteps(strat){
	stepdivs = new Array();
	leftOffset = 12;
	for(var ind=0; ind < strat.Steps.length; ind++){  //cStp in strat.Steps){
		cStp = getStep(strat.frontId, ind+1);
		jsonStep = strat.JSON.steps[cStp.frontId];
		if(cStp.isboolean){
			booleanStep(cStp, jsonStep, strat.frontId);
		}else{
			singleStep(cStp, jsonStep,strat.frontId);
		}
	}
	for(var id in stepdivs){
		$(div_strat).append(stepdivs[id]);
	}
}

//Creates the boolean Step and the operand step displayed above it
function booleanStep(modelstep, jsonstep, sid){
	// Create the boolean venn diagram box
	var filterImg = "";
	if(jsonstep.filtered)
		filterImg = "<span class='filterImg'><img src='/assets/images/filter.gif' height='10px' width='10px'/></span>";
	boolinner = ""+
		"			<a id='" + sid + "|" + modelstep.back_boolean_Id + "|" + jsonstep.operation + "' title='Click on this icon or on the step name above to modify this boolean operation.' class='operation' href='javascript:void(0)' onclick='Edit_Step(this,\"" + jsonstep.questionName + "\",\"" + jsonstep.urlParams + "\",\"true\")'>"+
		"				<img src='/assets/images/transparent1.gif'>"+
		"			</a>"+
		"			<h6 class='resultCount'>"+
		"				<a title='Show these results in the area below.' class='operation' onclick='NewResults(" + sid + "," + modelstep.frontId + ", true)' href='javascript:void(0)'>" + jsonstep.results + "&nbsp;" + getDataType(jsonstep.dataType, jsonstep.results) + "</a>"+
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
	$(boolDiv).attr("id","step_" + modelstep.frontId).addClass(booleanClasses + jsonstep.operation).html(boolinner).css({left: offset(modelstep) + "px"});
	$(".crumb_details", boolDiv).replaceWith(createDetails(modelstep, jsonstep, sid));
	
	stepNumber = document.createElement('span');
	$(stepNumber).addClass('stepNumber').css({ left: (leftOffset + 30) + "px"}).text("Step " + modelstep.frontId);
	
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
		"			<a title='Make changes to this step and/or the boolean operation.' id='stepId_" + modelstep.frontId + "' class='crumb_name' onclick='showDetails(this)' href='javascript:void(0)'>"+
						uname +
		"				<span class='collapsible' style='display: none;'>false</span>"+
		"			</a>"+
		"			<span id='fullStepName' style='display: none;'>" + fullName + "</span>"+
		"			<div class='crumb_details'></div>"+
		"		</h3>"+
		"		<h6 class='resultCount'><a title='Show these results in the area below.' class='results_link' href='javascript:void(0)' onclick='NewResults(" + sid + "," + modelstep.frontId + ", false)'> " + childStp.results + "&nbsp;" + getDataType(childStp.dataType, childStp.results) + "</a></h6>"+
		childfilterImg +
		"		<ul>"+
		"			<li><img class='downarrow' src='/assets/images/arrow_chain_down2.png' alt='equals'></li>"+
		"		</ul>";	
	childDiv = document.createElement('div');
	$(childDiv).attr("id","step_" + modelstep.frontId + "_sub").addClass(operandClasses).html(childinner).css({left: leftOffset + "px"});
	$(".crumb_details", childDiv).replaceWith(createDetails(modelstep, jsonstep, sid));
	
	// Create the background div for a collapsed step if step is expanded
	var bkgdDiv = null;
	if(childStp.isCollapsed){
		bkgdDiv = document.createElement("div");
		$(bkgdDiv).addClass("expandedStep");
		$(bkgdDiv).css({ left: (leftOffset-2) + "px"});
	}
	if(bkgdDiv != null)
		stepdivs.push(bkgdDiv);
	stepdivs.push(boolDiv);
	stepdivs.push(stepNumber);
	stepdivs.push(childDiv);
	
}

//Creates all steps that are on the bottom line only ie. this first step and transform steps
function singleStep(modelstep, jsonstep, sid){
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
		"			<a title='Make changes to this step.' id='stepId_" + modelstep.frontId + "' class='crumb_name' onclick='showDetails(this)' href='javascript:void(0)'>"+
						uname +
		"				<span class='collapsible' style='display: none;'>false</span>"+
		"			</a>"+ 
		"			<span id='fullStepName' style='display: none;'>" + fullName + "</span>"+
		"			<div class='crumb_details'></div>"+
		"		</h3>"+
		"		<h6 class='resultCount'><a title='Show these results in the area below.' class='results_link' href='javascript:void(0)' onclick='NewResults(" + sid + "," + modelstep.frontId + ", false)'> " + jsonstep.results + "&nbsp;" + getDataType(jsonstep.dataType,jsonstep.results) + "</a></h6>"+
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
	}else{
		$(singleDiv).addClass(firstClasses).css({ left: leftOffset + "px" });
		$(stepNumber).css({ left: "44px"});
	}
	$(".crumb_details", singleDiv).replaceWith(createDetails(modelstep,jsonstep, sid));
	stepdivs.push(singleDiv);
	stepdivs.push(stepNumber);
	
}

//HANDLE THE CREATION OF TEH STEP DETAILS BOX
function createDetails(modelstep, jsonstep, sid){
	strat = getStrategy(sid);
	var detail_div = document.createElement('div');
	$(detail_div).addClass("crumb_details").attr("disp","0").css({ display: "none", "max-width":"650px", "min-width":"350px" });
	var name = jsonstep.displayName;
	if(modelstep.isboolean)
		name = jsonstep.step.displayName;
	var filteredName = "";
	if(jsonstep.filtered){
		filteredName = "<span class='medium'><b>Applied Filter:&nbsp;</b>" + jsonstep.filterName + "</span><hr>";
	}
	var collapsedName = name;
	if(jsonstep.isCollapsed){
		name = jsonstep.strategy.name;
	}else{
		collapsedName = "Expanded " + name;
	}
	var parentid = modelstep.back_step_Id;
	if(modelstep.back_boolean_Id != null){
		parentid = modelstep.back_boolean_Id;
	}
	var params = jsonstep.params;
	var params_table = "";
	if(params != undefined && params.length != 0)
		params_table = createParameters(params);
	
	rename_step = 	"			<a title='Click to rename the step' class='rename_step_link' href='javascript:void(0)' onclick='Rename_Step(this, " + sid + "," + modelstep.frontId + ");hideDetails(this)'>Rename</a>&nbsp;|&nbsp;";
	view_step = 	"			<a title='Click to view the results of this query (or substrategy) in the Resuts area below' class='view_step_link' onclick='NewResults(" + sid + "," + modelstep.frontId + ");hideDetails(this)' href='javascript:void(0)'>View</a>&nbsp;|&nbsp;";
	edit_step =		"			<a title='Click to edit the query and/or the operation'  class='edit_step_link' href='javascript:void(0)' onclick='Edit_Step(this,\"" + jsonstep.questionName + "\",\"" + jsonstep.urlParams + "\"," + jsonstep.isCollapsed + ");hideDetails(this)' id='" + sid + "|" + parentid + "|" + jsonstep.operation + "'>Revise</a>&nbsp;|&nbsp;";
	if(modelstep.frontId == 1){
		expand_step = 	"			<span class='expand_step_link' style='color:grey'>Expand</span>&nbsp;|&nbsp;";
	}else{
		expand_step = 	"			<a title='If this step is not a subsrategy, click to begin one; if this step is already a substrategy, click to open it and continue working on it' class='expand_step_link' href='javascript:void(0)' onclick='ExpandStep(this," + sid + "," + modelstep.frontId + ",\"" + collapsedName + "\");hideDetails(this)'>Expand</a>&nbsp;|&nbsp;";
	}
	insert_step = 	"			<a title='Click to insert a step befpre this one, by either running a new query or choosing an existing strategy'  class='insert_step_link' id='" + sid + "|" + parentid + "' href='javascript:void(0)' onclick='Insert_Step(this,\"" + getDataType(jsonstep.dataType,jsonstep.results) + "\");hideDetails(this)'>Insert Before</a>&nbsp;|&nbsp;";
	delete_step = 	"			<a title='This will remove the step from the strategy; if this step is the only step in this strategy, this will remove the strategy also' class='delete_step_link' href='javascript:void(0)' onclick='DeleteStep(" + sid + "," + modelstep.frontId + ");hideDetails(this)'>Delete</a>";
	close_button = 	"			<span style='float: right; position: absolute; right: 6px;'>"+
					"				<a href='javascript:void(0)' onclick='hideDetails(this)'>[x]</a>"+
					"			</span>";
	
	
	
	inner = ""+	
	    "		<div class='crumb_menu'>"+ rename_step + view_step + edit_step + expand_step + insert_step + delete_step + close_button +
		"		</div>"+
		"		<p class='question_name'><span>" + name + "</span></p>"+
		"		<table></table><hr>" + filteredName +
		"		<p><b>Results:&nbsp;</b>" + jsonstep.results + "&nbsp;" + getDataType(jsonstep.dataType,jsonstep.results) + "&nbsp;&nbsp;|&nbsp;&nbsp;<a href='downloadStep.do?step_id=" + modelstep.back_step_Id + "'>Download</a>";
		
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
		$(div_sn).attr("id","record_name").addClass("strategy_small_text").text(getDataType(strat.dataType, 1) + "Strategy");
		return div_sn;
   	}
}

// HANDLE THE DISPLAY OF THE STRATEGY NAME DIV
function createStrategyName(strat){
	var json = strat.JSON;
	var id = strat.backId;
	var name = json.name;
	var append = '';
	if (!json.saved) append = "<span id='append'>*</span>";
	var exportURL = exportBaseURL + json.importId;
	var share = "";
	if(json.saved){
		share = "<a title='Email this URL to your best friend.' href=\"javascript:showExportLink('" + id + "')\"><b>SHARE</b></a>"+
		"<div class='modal_div export_link' id='export_link_div_" + id + "'>" +
	        "<span class='dragHandle'>" +
	        "<a class='close_window' href='javascript:closeModal()'>" +
		"<img alt='Close' src='/assets/images/Close-X-box.png'/>" +
		"</a>"+
	        "</span>" +
		"<p>Paste link in email:</p>" +
		"<input type='text' size=" + exportURL.length + " value=" + exportURL + " />" +
		"</div>";
	}else if(guestUser == 'true'){
		share = "<a title='Please LOGIN so you can SAVE and then SHARE (email) your strategy.' href='login.jsp?refererUrl=login.jsp&originUrl=" + window.location + "'><b>SHARE</b></a>";
	}else{
		share = "<a title='SAVE this strategy so you can SHARE it (email its URL).' href='javascript:void(0)' onclick=\"showSaveForm('" + id + "')\"><b>SHARE</b></a>";
	}

	var save = "";
	if (guestUser == 'true') {
		save = "<a title='Please LOGIN so you can SAVE (make a snapshot) your strategy.' class='save_strat_link' href='login.jsp?refererUrl=login.jsp&originUrl=" + window.location + "'><b>SAVE AS</b></a>";
	}
	else {
		save = "<a title='A saved strategy is like a snapshot, it cannot be changed.' class='save_strat_link' href='javascript:void(0)' onclick=\"showSaveForm('" + id + "')\"><b>SAVE AS</b></a>" +
		"<div id='save_strat_div_" + id + "' class='modal_div save_strat'>" +
		"<span class='dragHandle'>" +
		"<div class='modal_name'>"+
		"<h2>Save As</h2>" + 
		"</div>"+ 
		"<a class='close_window' href='javascript:closeModal()'>"+
		"<img alt='Close' src='/assets/images/Close-X-box.png'/>" +
		"</a>"+
		"</span>"+
		"<form onsubmit='return validateSaveForm(this);' action=\"javascript:saveStrategy('" + id + "', true)\">"+
		"<input type='hidden' value='" + id + "' name='strategy'/>"+
		"<input type='text' value='" + name + "' name='name'/>"+
		"<input type='submit' value='Save'/>"+
		"</form>"+
		"</div>";
	}

var rename = "<a style='color: #0b4796' title='Click to rename.'  onclick=\"enableRename('" + id + "', '" + name + "')\"><b>RENAME</b></a>";

	var div_sn = document.createElement("div");
	$(div_sn).attr("id","strategy_name");
	if (strat.subStratOf == null){
		$(div_sn).html("<span onclick=\"enableRename('" + id + "', '" + name + "')\" title='Name of this strategy. Click to RENAME. The (*) indicates this strategy is NOT saved.'>" + name + "</span>" + append + "<span id='strategy_id_span' style='display: none;'>" + id + "</span>" +
        "<form id='rename' style='display: none;' action=\"javascript:renameStrategy('" + id  + "', true, false)\">" +
        "<input type='hidden' value='" + id + "' name='strategy'/>" +
        "<input id='name' onblur='this.form.submit();' type='text' style='margin-right: 4px; width: 100%;' value='" + name + "' maxlength='2000' name='name'/>" +
        "</form>" +
	"<span class='strategy_small_text'>" +
	"<br/>" + 
	rename +
	"<br/>" + 
	save +
	"<br/>"+
	share +
	"</span>");
	}else{
		$(div_sn).html(name + "<span id='strategy_id_span' style='display: none;'>" + id + "</span>"); 
	}
	return div_sn;
}

//REMOVE ALL OF THE SUBSTRATEGIES OF A GIVEN STRATEGY FROM THE DISPLAY
function removeStrategyDivs(stratId){
	strategy = getStrategyFromBackId(stratId);
	if(stratId.indexOf("_") > 0){
		var currentDiv = $("#Strategies div#diagram_" + strategy.frontId).remove();
		sub = getStrategyFromBackId(stratId.substring(0,stratId.indexOf("_")));
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
	}else if(modelstep.prevStepType == "boolean"){
		leftOffset += f2b;
	}else if(modelstep.prevStepType == "transform"){
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
}
