var strats = new Array();
var xmldoc = null;
var init_strat_ids = new Array();
var init_strat_order = new Array();
var exportBaseURL;
var index = 0;
var recordType= new Array();   //stratid, recordType which is the type of the last step


//DISTANCE FIGURES FOR STRATEGY LAYOUT
var f2b = 114;
var f2t = 147;
var b2b = 125;
var b2t = 114;
var t2b = 113;
var t2t = 147;
// END DISTANCE FIGURES

$(document).ready(function(){
	if(init_strat_ids.length == 0){
		showInstructions();
	}else{
		initDisplay(0);
/*		jQuery.each(init_strat_ids, function(){
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
*/
	}
});

function initDisplay(index){
	$.ajax({
		url: "showStrategy.do?strategy=" + init_strat_ids[index],
		type: "POST",
                data: '',
		dataType: "xml",
		success: function(data){
			id = loadModel(data);
			$("div#Strategies").append(displayModel(id));
			if (id == 0) {
				$("#diagram_0 div.venn:last .resultCount a").click();
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

function loadModel(data){
	var value = -1;
	$("root",data).children("strategy").each(function(){
		xmldoc = data;
		var newId = isLoaded(parseInt($(this).attr("id")));
		if(newId == -1)
			newId = index;
		strat = new Strategy(newId, $(this).attr("id"), true);
		strat.isSaved = $(this).attr("saved");
		strat.name = $(this).attr("name");
                strat.savedName = $(this).attr("savedName");
                strat.importId = $(this).attr("importId");
		steps = $(this).children("step");
		strat.initSteps(steps);
		id = parseInt($(this).attr("id"));
		if(isLoaded(id) != -1){
			strats[findStrategy(newId)] = strat;
		}else{
			strats.push(strat);
		}
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

var div_strat = null;
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

		$(div_strat).append(createStrategyName($("strategy#" + strat.backId,xmldoc), strat));

		for(var j=0;j<strat.Steps.length;j++){
			last = false;
			if(j == strat.Steps.length - 1) 
				last = true;
			if(strat.Steps[j].back_boolean_Id == ""){
				var xml_step = $("strategy#" + strat.backId + " step#" + strat.Steps[j].back_step_Id, xmldoc);
				st = createStep(xml_step, strat.Steps[j], last);
				if(st.length > 2)
				$(div_strat).append(st[2]);
				$(div_strat).append(st[0]);
				$(div_strat).append(st[1]);
			}else {
				var xml_step_boolean = $("strategy#" + strat.backId + " step#" + strat.Steps[j].back_boolean_Id, xmldoc);
				var xml_step_operand = $("strategy#" + strat.backId + " step#" + strat.Steps[j].back_step_Id, xmldoc);
				opstep = createStep(xml_step_operand, strat.Steps[j], last);
				if(opstep.length > 2)
					$(div_strat).append(opstep[2]);
				$(div_strat).append(opstep[0]);
				strat.Steps[j].isboolean = true;
				st = createStep(xml_step_boolean, strat.Steps[j], last, xml_step_operand);
				$(div_strat).append(st[0]);
				$(div_strat).append(st[1]);
					
				strat.Steps[j].isboolean = false;
			}
		} 

// sent: ele and strat, it writes recordtype (Genes) in top-left corner in strat display
$(div_strat).append(createRecordTypeName($("strategy#" + strat.backId,xmldoc), strat));

/*
var myrecordname = createRecordTypeName($("strategy#" + strat.backId,xmldoc), strat);
alert("displayModel(): Adding recordname to grey background in display: " + myrecordname);
var myrecordname2 = getRecordName(myrecordname);
alert("displayModel(): Adding recordname to grey background in display: " + myrecordname2);
$(div_strat).append(myrecordname2);
*/
		
		buttonleft = offset(null,strat.Steps.length,strat.frontId);
		button = document.createElement('a');
		lsn = strat.Steps[strat.Steps.length-1].back_boolean_Id;
		if(lsn == "")
			lsn = strat.Steps[strat.Steps.length-1].back_step_Id;	
		dType = $("step#" + strat.Steps[strat.Steps.length - 1].back_step_Id, xmldoc).attr("dataType");
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


var transCount = 0;
function offset(ele,index, m){
	if(ele == null){
		lb = $("div.box:last", div_strat);
		le = lb.css("left");
		le = parseInt(le.substring(0,le.indexOf("px")));
		return le + 123;
	}
	if(ele[0].parentNode.nodeName == "step")
		ele = $(ele).parent();
	stepid = $(ele).prev().attr("id");
	s = getStrategy(m);
	psfid = getStepFromBackId(s.backId, stepid).frontId;
	stepdiv = $("div[id^='step_"+psfid+"_sub']", div_strat);
	cL = stepdiv.css("left");
	cL = parseInt(cL.substring(0, cL.indexOf("px")));
	
	if($(ele).attr("istransform") == "true"){
		if($(ele).prev().attr("istransform") == "true"){
			cL = cL + t2t; // TRANSFORM TO TRANSFORM
		}else if($(ele).prev().attr("isboolean") == "true"){
				cL = cL + b2t; //BOOLEAN TO TRANSFORM
		}else{
				cL = cL + f2t //FIRST TO TRANSFORM
		}
	}else if($(ele).attr("isboolean") == "true"){
		if($(ele).prev().attr("istransform") == "true"){
			cL = cL + t2b; //TRANSFORM TO BOOLEAN
		}else if($(ele).prev().attr("isboolean") == "true"){
			cL = cL + b2b; //BOOLEAN TO BOOLEAN
		}else{
			cL = cL + f2b // FIRST TO BOOLEAN
		}
	}
	return cL;
//	m = 127;
//	return (index * m);// - (index - 1);
}


function createStep(ele, step, isLast, child){
	var strategyId = "";
	var name = $(ele).attr("name");

	if(ele[0].parentNode.nodeName == "strategy") {
		strategyId = isLoaded($(ele).parent().attr("id"));
		n = $(ele).parent().attr("id");
//		alert('createStep(): parentNode.nodeName is strategy, this is a step in a strategy id: ' + n + ', step: ' + name);
             }
	else {
		strategyId = isLoaded($(ele).parent().parent().attr("id"));
		n = $(ele).parent().parent().attr("id");
//		alert('createStep(): parentNode.nodeName is NOT strategy, this is a step in a *' + ele[0].parentNode.nodeName + '* - id: ' + n + ', step: ' + name);
             }

	m = strategyId;


 var recordClass = $(ele).attr("dataType");
 if(isLast) { 
	recordType[n] = recordClass; 
//	 alert('createStep(): This is the last step in strategy' + n + ' ---  recordtype is '+ recordType[n] + ' --- name is: ' + name);
} //if this is the last step, it defines the type of the strategy, recordType global variable
else {
	//alert('createStep(): This is NOT the last step in strategy' + n);
}

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
	var isfiltered = $(ele).attr("filtered");
	var filterImg = "";
	if(isfiltered == "true")
		filterImg = "<span class='filterImg'><img src='/assets/images/filter.gif' height='10px' width='10px'/></span>";
	var cl ="";
	var inner = "";
	if(step.back_boolean_Id == ""){
	  if(!step.isTransform){  // CREATES THE FIRST STEP IN THE STRATEGY
		div_id = "step_" + id + "_sub";
		left = -1;
		cl = "box venn row2 size1 arrowgrey";
		inner = ""+
			"		<h3>"+
			"			<a title='Make changes to this step.' id='stepId_" + id + "' class='crumb_name' onclick='showDetails(this)' href='javascript:void(0)'>"+
							usedName +
			"				<span class='collapsible' style='display: none;'>" + collapsible + "</span>"+
			"			</a>"+ 
			"			<span id='fullStepName' style='display: none;'>" + fullName + "</span>"+
			"			<div class='crumb_details'></div>"+
			"		</h3>"+
			"		<h6 class='resultCount'><a title='Show these results in the area below.' class='results_link' href='javascript:void(0)' onclick='NewResults(" + strategyId + "," + id + ", false)'> " + resultSize + "&nbsp;" + dataType + "</a></h6>"+
			 filterImg;
		if(!isLast){
			inner = inner + 
			"		<ul>"+
			"			<li><img class='rightarrow1' src='/assets/images/arrow_chain_right3.png' alt='input into'></li>"+
			"		</ul>";
		}
		stepNumber = document.createElement('span');
		$(stepNumber).addClass('stepNumber').css({ left: "44px"}).text("Step " + (id + 1));
	  }else{  // CREATES STEP BOXES FOR TRANSFORM STEPS
		transCount++;
		div_id = "step_" + id + "_sub";
		left = offset(ele,index,m) - 7;
		cl = "box venn row2 size1 transform";
		inner = ""+
			"		<h3>"+
			"			<a title='Make changes to this step.' id='stepId_" + id + "' class='crumb_name' onclick='showDetails(this)' href='javascript:void(0)'>"+
							usedName +
			"				<span class='collapsible' style='display: none;'>" + collapsible + "</span>"+
			"			</a>"+ 
			"			<span id='fullStepName' style='display: none;'>" + fullName + "</span>"+
			"			<div class='crumb_details'></div>"+
			"		</h3>"+
			"		<h6 class='resultCount'><a title='Show these results in the area below.' class='results_link' href='javascript:void(0)' onclick='NewResults(" + strategyId + "," + id + ", false)'> " + resultSize + "&nbsp;" + dataType + "</a></h6>"+
			 filterImg;
		if(!isLast){
			inner = inner + 
			"		<ul>"+
			"			<li><img class='rightarrow1' src='/assets/images/arrow_chain_right3.png' alt='input into'></li>"+
			"		</ul>";
		}
		stepNumber = document.createElement('span');
		$(stepNumber).addClass('stepNumber').css({ left: (left + 30) + "px"}).text("Step " + (id + 1));
	  }
	}else if(step.isboolean){ // CREATE THE BOOLEAN STEP BOX
		div_id = "step_" + id;
		left = offset(ele,index,m);
		cl = "venn row2 size2 arrowgrey operation " + operation;
		var urlParams = $("params urlParams", child).text();
		var questionFullName = $(child).attr("questionName");
		inner = ""+
			"			<a id='" + strategyId + "|" + step.back_boolean_Id + "|" + operation + "' title='Click on this icon or on the step name above to modify this boolean operation.' class='operation' href='javascript:void(0)' onclick='Edit_Step(this,\"" + questionFullName + "\",\"" + urlParams + "\",\"true\")'>"+
			"				<img src='/assets/images/transparent1.gif'>"+
			"			</a>"+
			"			<h6 class='resultCount'>"+
			"				<a title='Show these results in the area below.' class='operation' onclick='NewResults(" + strategyId + "," + id + ", true)' href='javascript:void(0)'>" + resultSize + "&nbsp;" + dataType + "</a>"+
			"			</h6>" + filterImg;
		if(!isLast){
			if($(ele).next().attr("istransform") == "true"){
				inner = inner + 
				"			<ul>"+
				"				<li><img class='rightarrow3' src='/assets/images/arrow_chain_right3.png' alt='input into'></li>"+
				"			</ul>";
			}else{
				inner = inner + 
				"			<ul>"+
				"				<li><img class='rightarrow2' src='/assets/images/arrow_chain_right4.png' alt='input into'></li>"+
				"			</ul>";
			}
		}
		stepNumber = document.createElement('span');
		$(stepNumber).addClass('stepNumber').css({ left: (left + 30) + "px"}).text("Step " + (id + 1));
	}else{ // CREATE THE CHILD STEP OF THE BOOLEAN ... THE TOP ROW BOX FOR THIS STEP
		div_id = "step_" + id + "_sub";
		left = offset(ele,index,m);
		cl = "box row1 size1 arrowgrey";
		inner = ""+
			"		<h3>"+
			"			<a title='Make changes to this step and/or the boolean operation.' id='stepId_" + id + "' class='crumb_name' onclick='showDetails(this)' href='javascript:void(0)'>"+
							usedName +
			"				<span class='collapsible' style='display: none;'>" + collapsible + "</span>"+
			"			</a>"+
			"			<span id='fullStepName' style='display: none;'>" + fullName + "</span>"+
			"			<div class='crumb_details'></div>"+
			"		</h3>"+
			"		<h6 class='resultCount'><a title='Show these results in the area below.' class='results_link' href='javascript:void(0)' onclick='NewResults(" + strategyId + "," + id + ", false)'> " + resultSize + "&nbsp;" + dataType + "</a></h6>"+
			filterImg +
			"		<ul>"+
			"			<li><img class='downarrow' src='/assets/images/arrow_chain_down2.png' alt='equals'></li>"+
			"		</ul>";
		var bkgdDiv = null;
		if(collapsible == "true"){
			bkgdDiv = document.createElement("div");
			$(bkgdDiv).addClass("expandedStep");
			$(bkgdDiv).css({ left: (left-2) + "px"});
		}
		stepNumber = null;
	}
	var divs = new Array();
	var div_s = document.createElement("div");
	if(left != -1){
		$(div_s).attr("id", div_id).addClass(cl).html(inner);
		$(div_s).css({ left: left + "px"});
	}else{
		$(div_s).attr("id", div_id).addClass(cl).html(inner);
		$(div_s).css({ left: "12px"});
	}
	$(".crumb_details", div_s).replaceWith(createDetails(ele, strategyId, step));
	divs.push(div_s);
	divs.push(stepNumber);
	if(bkgdDiv != null)
		divs.push(bkgdDiv);
	return divs;
}

function createDetails(ele, strat, step){
	var f = false;
	if(ele[0].parentNode.nodeName == "strategy")
		f = true;
	var detail_div = document.createElement('div');
	$(detail_div).addClass("crumb_details").attr("disp","0").css({ display: "none", "max-width":"650px", "min-width":"350px" });
	var name = $(ele).attr("name");
	var shortName = $(ele).attr("shortName");
	var collapsible = $(ele).attr("isCollapsed");
	var filtered = $(ele).attr("filtered");
	var filteredName = "";
	if(filtered == 'true'){
		filteredName = "<span class='medium'><b>Applied Filter:&nbsp;</b>" + $(ele).children("filterName").text() + "</span><hr>";
	}
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
	var collapsedName = name;
	if(collapsible == "false")
		collapsedName = "Expanded " + name;
	var id = step.frontId;
	var parentid = "";
	if(ele[0].parentNode.nodeName != 'strategy')
		parentid = $(ele).parent().attr("id");
	else
		parentid = step.back_step_Id;
	var params = $(ele).children("params");
	var params_table = "";
	if(params.length != 0)
		params_table = createParameters(params);
	
	rename_step = 	"			<a title='Click to rename the step' class='rename_step_link' href='javascript:void(0)' onclick='Rename_Step(this, " + strat + "," + id + ");hideDetails(this)'>Rename</a>&nbsp;|&nbsp;";
	view_step = 	"			<a title='Click to view the results of this query (or substrategy) in the Resuts area below' class='view_step_link' onclick='NewResults(" + strat + "," + id + ");hideDetails(this)' href='javascript:void(0)'>View</a>&nbsp;|&nbsp;";
	edit_step =		"			<a title='Click to edit the query and/or the operation'  class='edit_step_link' href='javascript:void(0)' onclick='Edit_Step(this,\"" + questionFullName + "\",\"" + urlParams + "\"," + collapsible + ");hideDetails(this)' id='" + strat + "|" + parentid + "|" + operation + "'>Edit</a>&nbsp;|&nbsp;";
	if(f){
		expand_step = 	"			<span class='expand_step_link' style='color:grey'>Expand</span>&nbsp;|&nbsp;";
	}else{
		expand_step = 	"			<a title='If this step is not a subsrategy, click to begin one; if this step is already a substrategy, click to open it and continue working on it' class='expand_step_link' href='javascript:void(0)' onclick='ExpandStep(this," + strat + "," + id + ",\"" + collapsedName + "\");hideDetails(this)'>Expand</a>&nbsp;|&nbsp;";
	}
	insert_step = 	"			<a title='Click to insert a step befpre this one, by either running a new query or choosing an existing strategy'  class='insert_step_link' id='" + strat + "|" + parentid + "' href='javascript:void(0)' onclick='Insert_Step(this,\"" + dType + "\");hideDetails(this)'>Insert Before</a>&nbsp;|&nbsp;";
	delete_step = 	"			<a title='This will remove the step from the strategy; if this step is the only step in this strategy, this will remove the strategy also' class='delete_step_link' href='javascript:void(0)' onclick='DeleteStep(" + strat + "," + id + ");hideDetails(this)'>Delete</a>";
	close_button = 	"			<span style='float: right; position: absolute; right: 6px;'>"+
					"				<a href='javascript:void(0)' onclick='hideDetails(this)'>[x]</a>"+
					"			</span>";
	
	
	
	inner = ""+	
	    "		<div class='crumb_menu'>"+ rename_step + view_step + edit_step + expand_step + insert_step + delete_step + close_button +
		"		</div>"+
		"		<p class='question_name'><span>" + name + "</span></p>"+
		"		<table></table><hr>" + filteredName +
		"		<p><b>Results:&nbsp;</b>" + resultSize + "&nbsp;" + dataType + "&nbsp;&nbsp;|&nbsp;&nbsp;<a href='downloadStep.do?step_id=" + step.back_step_Id + "'>Download</a>";
		
	$(detail_div).html(inner);
	$("table", detail_div).replaceWith(params_table);
	return detail_div;       
}

function createParameters(params){
	var table = document.createElement('table');
	$(params).children("param").each(function(){
            var visible  = $(this).attr("visible");
            if (visible != 'false') {
		var tr = document.createElement('tr');
		var prompt = document.createElement('td');
		var space = document.createElement('td');
		var value = document.createElement('td');
		//$(prompt).addClass("medium").attr("align","right").attr("nowrap","wrap").attr("valign","top");
		$(prompt).addClass("medium").css({
			"text-align":"right",
			"vertical-align":"top"
		});
		$(prompt).html("<b><i>" + $(this).attr("prompt") + "</i></b>");
		$(space).addClass("medium").attr("valign","top");
		$(space).html("&nbsp;:&nbsp;");
		//$(value).addClass("medium").attr("align","left").attr("nowrap","nowrap");
			$(value).addClass("medium").css({
				"text-align":"left",
				"vertical-align":"top"
			});
		$(value).html( $(this).attr("value") );
		$(tr).append(prompt);
		$(tr).append(space);
		$(tr).append(value);
		$(table).append(tr);
            }
	});
	return table;
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


function createRecordTypeName(ele, strat){
        var id = (ele).attr("id");
//     	alert("createRecordTypeName(): STRAT id is " + id);
	if (strat.subStratOf == null){
	var recordName = getRecordName(recordType[id]);

//		alert("createRecordTypeName(): (only if we are in a main strat) Record for this strat is:" + recordName);

        	var div_sn = document.createElement("div");
        	$(div_sn).attr("id","record_name");

        	$(div_sn).html(
        	"<span class='strategy_small_text'>" +
        	recordName +
        	"</span>");

        	return div_sn;
        	}
	else {
//		alert("createRecordTypeName():this was not a main strat");
		return "";
	}
}


function createStrategyName(ele, strat){
	var id = strat.backId;
	var name = $(ele).attr("name");
	var append = '';
	if ($(ele).attr("saved") == 'false') append = "<span id='append'>*</span>";
	var exportURL = exportBaseURL + strat.importId;

	var share = "";
	if($(ele).attr("saved") == 'true'){
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
		"<input type='text' value='" + strat.savedName + "' name='name'/>"+
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
			f_strategyId = updateStrategies(data,"AddStep", strategy);
			removeLoading(f_strategyId);
			$("#diagram_" + f_strategyId + " div.venn:last .resultCount a").click();
			isInsert = "";
		},
		error: function(data, msg, e){
			//$("#Strategies").append(currentDiv);
			removeLoading(f_strategyId);
			alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReload this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
	update_hist = true;
	closeAll();
}

function EditStep(url, proto, step_number){
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
			if (selectedBox.length == 0) selectedBox = $("#Strategies div.selectedtransform");
			var selectedStrat = selectedBox.parent().attr("id");
			selectedBox = selectedBox.attr("id");
			removeStrategyDivs(s);
			fsid = updateStrategies(data, "EditStep", getStrategyFromBackId(s));
			var selectedLink = $("#" + selectedStrat + " #" + selectedBox + " span.resultCount a");
			if (selectedLink.length() != 0) selectedLink.click();
			else NewResults(-1);
                },
		error: function(data, msg, e){
			alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReload this page might solve the problem. \nOtherwise, please contact site support.");
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
	if (displayStep.length == 0) displayStep = $("div[id^='diagram_'] div.selectedtransform");
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
		data:"",
		beforeSend: function(obj){
				showLoading(f_strategyId);
				//$("div#step_" + step.frontId + " h3 div.crumb_details").hide();
			},
		success: function(data){
				if($("root", data).children("strategy").length > 0){
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
	url = "expandStep.do?strategy=" + strategy.backId + "&step=" + step.back_step_Id + "&collapsedName=" + collapsedName;
	$.ajax({
		url: url,
		type: "post",
		dataType: "xml",
		data: "",
		beforeSend: function(){
			showLoading(f_strategyId);
			//$("div#step_" + step.frontId + "_sub h3 div.crumb_details").hide();
		},
		success: function(data){
			x = loadModel(data);
			if(collapsedName.indexOf("UNION") == -1 && collapsedName.indexOf("MINUS") == -1 && collapsedName.indexOf("INTERSECT") == -1 )
				$("#diagram_" + f_strategyId + " #step_" + f_stepId + "_sub h3 a:first").text(un);
			l = $("#diagram_" + f_strategyId + " #step_" + f_stepId + "_sub").css("left");
			l = parseInt(l.substring(0,l.indexOf("px")));
			gsd = document.createElement('div');
			$(gsd).addClass("expandedStep").css({ left: (l-2) + "px"});
			$("#diagram_" + f_strategyId + " #step_" + f_stepId + "_sub").before(gsd);
			st = getStep(strategy.frontId, f_stepId);
			if(st.child_Strat_Id == null)
				alert("There was an error in the Expand Operation for this step.  Please contact administrator.");
			if($("#diagram_"+st.child_Strat_Id).length == 0){
				strats[findStrategy(st.child_Strat_Id)].isDisplay = true;
				subDiv = displayModel(st.child_Strat_Id);
				$("div#Strategies div#diagram_" + f_strategyId).after(subDiv);
			}
			removeLoading(f_strategyId);
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
//	$("div#Strategies div#diagram_" + stratId).remove();
//	subs = getSubStrategies(stratId);
//	for(i=0;i<subs.length;i++){
//		$("div#Strategies div#diagram_" + subs[i].frontId).remove();
		//closeStrategy(subs[i].frontId);
//	}
	
	if(evnt == "Save" || (strategy.isSaved == "true" && evnt != "Open")){
		$("div#Strategies div#diagram_" + strategy.frontId).replaceWith(displayModel(stratId));
	}
	else if(isLoaded(getStrategy(stratId).backId) != -1 && evnt != "Open"){
		$("div#Strategies div#diagram_" + stratId).replaceWith(displayModel(stratId));
	}else{
		$("div#Strategies").prepend(displayModel(stratId));
	}
	return stratId;
}

function openStrategy(stratId){
	var url = "showStrategy.do?strategy=" + stratId;
	$.ajax({
		url: url,
		datatype:"html",
		success: function(data){
			updateStrategies(data, "Open", getStrategyFromBackId(stratId));
		},
		error: function(data, msg, e){
			alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReload this page might solve the problem. \nOtherwise, please contact site support.");
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
	var saveForm = $("div#save_strat_div_" + stratId);
	if (fromHist) saveForm = $("#hist_save_" + stratId);
	var name = $("input[name='name']",saveForm).attr("value");
	var strategy = $("input[name='strategy']",saveForm).attr("value");
	var url="renameStrategy.do?strategy=";
	url = url + strategy + "&save=true&name=" + name + "&checkName=" + checkName;
	if (fromHist) url = url + "&showHistory=true";
	$.ajax({
		url: url,
		dataType: "xml",
		success: function(data){
			// reload strategy panel
			var kids = $("root", data).children("strategy");
			if (kids.length > 0) {
				var selectedBox = $("#Strategies div.selected");
	                        if (selectedBox.length == 0) selectedBox = $("#Strategies div.selectedarrow");
	                        if (selectedBox.length == 0) selectedBox = $("#Strategies div.selectedtransform");
				var selectedStrat = selectedBox.parent().attr("id");
				selectedBox = selectedBox.attr("id");
				if (!fromHist) saveForm.hide();
				removeStrategyDivs(stratId);
				updateStrategies(data, "Save", getStrategyFromBackId(stratId));
				var selectedLink = $("#" + selectedStrat + " #" + selectedBox + " span.resultCount a");
				if (selectedLink.length() != 0) selectedLink.click();
				else NewResults(-1);
				update_hist = true;
				if (fromHist) updateHistory();
			}
			else{
				// root element in data had no strategy children -> there was a name conflict.
				var overwrite = confirm("A strategy already exists with the name '" + name + ".' Do you want to overwrite the existing strategy?");
				if (overwrite) {
					saveStrategy(stratId, false);
				}
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
	url = url + strategy + "&name=" + name + "&checkName=" + checkName;
	if (fromHist) url = url + "&showHistory=true";
	$.ajax({
		url: url,
		dataType: "xml",
		success: function(data){
			// reload strategy panel
			var kids = $("root", data).children("strategy");
			if (kids.length > 0) {
				var selectedBox = $("#Strategies div.selected");
	                        if (selectedBox.length == 0) selectedBox = $("#Strategies div.selectedarrow");
	                        if (selectedBox.length == 0) selectedBox = $("#Strategies div.selectedtransform");
				var selectedStrat = selectedBox.parent().attr("id");
				selectedBox = selectedBox.attr("id");
				disableRename(stratId, fromHist);
				removeStrategyDivs(stratId);
				updateStrategies(data, "Save", strat);
				var selectedLink = $("#" + selectedStrat + " #" + selectedBox + " span.resultCount a");
				if (selectedLink.length() != 0) selectedLink.click();
				else NewResults(-1);
				update_hist = true;
				if (fromHist) updateHistory();
			}
			else{
				alert("An unsaved strategy already exists with the name '" + name + ".'");
				disableRename(stratId, fromHist);	
				if (strat.isSaved)  $("input[name='name']",renameForm).attr("value", strat.savedName);
			}
		},
		error: function(data, msg, e){
			alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReload this page might solve the problem. \nOtherwise, please contact site support.");
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
                        if (selectedBox.length == 0) selectedBox = $("#Strategies div.selectedtransform");
			var selectedStrat = selectedBox.parent().attr("id");
			selectedBox = selectedBox.attr("id");
 			removeStrategyDivs(strategy.backId);
                        updateStrategies(data, '', strategy);
			var selectedLink = $("#" + selectedStrat + " #" + selectedBox + " span.resultCount a");
			if (selectedLink.length() != 0) selectedLink.click();
			else NewResults(-1);
                },
                error: function(data, msg, e){
                        //$("#Strategies").append(currentDiv);
                        removeLoading(f_strategyId);
                        alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReload this page might solve the problem. \nOtherwise, please contact site support.");
                }
        });
        update_hist = true;
        closeAll();

}

