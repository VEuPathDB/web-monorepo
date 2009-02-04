/**************************************************
Strategy Object and Functions
****************************************************/

function Strategy(frontId, backId, isDisplay){
	this.frontId = frontId;
	this.backId = backId;
	this.isDisplay = isDisplay;
}
Strategy.prototype.subStratOf = null;
Strategy.prototype.Steps = new Array();
Strategy.prototype.isSaved = false;
Strategy.prototype.initSteps = function(steps){
	var f_index = 0;
	var cStrat = this;
	var arr = new Array();
	var st = null;
	$(steps).each(function(){
		if($(this).attr("isboolean") == "false"){
			var bbid = "";
			if(this.parentNode.nodeName == "step")
				bbid = $(this).parent().attr("id");
			st = new Step(f_index, $(this).attr("id"), bbid, "", $(this).attr("answerId"));
		}else{
			s = $(this).children("step");
			if(s.length > 0){
				s = s[0];
				var bbid = "";
				if(s.parentNode.nodeName == "step")
					bbid = $(s).parent().attr("id");
				st = new Step(f_index, $(s).attr("id"), bbid, "", $(this).attr("answerId"));
			}
		}
		if($("strategy", this).length > 0){
			var subStrat = $(this).children("strategy");
			if(subStrat.length == 0)
				subStrat = $(this).children("step").children("strategy");
			var newId = isLoaded($(subStrat).attr("id"));
			if(newId == -1){
				index++;
				newId = index;
			}
			var sStrat = new Strategy(newId,$(subStrat).attr("id"),false);
			st.child_Strat_Id = sStrat.frontId;
			subSteps = $(subStrat).children("step");
			sStrat.initSteps(subSteps);
			sStrat.subStratOf = cStrat.frontId;
			if(isLoaded(sStrat.backId) != -1)
				strats[findStrategy(sStrat.frontId)] = sStrat;
			else
				strats.push(sStrat);
		}
		arr.push(st);
		f_index++;
	});
	this.Steps = arr;
}

/****************************************************
Step Object and Functions
****************************************************/

function Step(frontId, back_step_Id, back_boolean_Id, child_Strat_Id, answerId){
	this.frontId = frontId;
	this.back_step_Id = back_step_Id;
	this.back_boolean_Id = back_boolean_Id;
	this.child_Strat_Id = null;
	this.answerId = answerId;
}
Step.prototype.isboolean = false;
Step.prototype.isSelected = false;
Step.prototype.isFiltered = false;

/****************************************************
Utility Functions
*****************************************************/
	
function getStep(strat,id){
	for(i=0;i<strats.length;i++){
		if(strats[i].frontId == strat){
			for(j=0;j<strats[i].Steps.length;j++){
				if(strats[i].Steps[j].frontId == id)
					return strats[i].Steps[j];
			}
		}
	}
	return false;
}
	
function getStrategy(id){
	for(i=0;i<strats.length;i++){
		if(strats[i].frontId == id)
			return strats[i];
	}
	return false;
}

function getSubStrategies(id){
	var arr = new Array();
	var pStrat = getStrategy(id);
	arr.push(pStrat);
	for(i=0;i<strats.length;i++){
		if(strats[i].backId.indexOf(pStrat.backId + "_") != -1)
			arr.push(strats[i]);
	}
	return arr;
}

function getStrategyFromBackId(id){
	for(i=0;i<strats.length;i++){
		if(strats[i].backId == id)
			return strats[i];
	}
	return false;
}

function getStepFromBackId(strat,id){
	strategy = getStrategyFromBackId(strat);
	for(j=0;j<strategy.Steps.length;j++){
		if(strategy.Steps[j].back_step_Id == id
		   || strategy.Steps[j].back_boolean_Id == id)
			return strategy.Steps[j];
	}
}

function getDataType(ele){
	var s = "s";
	if(parseInt($(ele).attr("results")) == 1)
		s = ""
	var cl = $(ele).attr("dataType");
	if(cl == "GeneRecordClasses.GeneRecordClass")
		return "Gene" + s;
	if(cl == "SequenceRecordClasses.SequenceRecordClass")
		return "Sequence" + s;
	if(cl == "EstRecordClasses.EstRecordClass")
		return "EST" + s;
	if(cl == "OrfRecordClasses.OrfRecordClass")
		return "ORF" + s;
	if(cl == "IsolateRecordClasses.IsolateRecordClass")
		return "Isolate" + s;
	if(cl == "SnpRecordClasses.SnpRecordClass")
		return "SNP" + s;
	if(cl == "AssembliesRecordClasses.AssembilesRecordClass"){
		if(s == "") 
			return "Assembly";
		else 
			return "Assemblies";
	}
	if(cl == "SageTagRecordClasses.SageTagRecordClass")
		return "Sage Tag" + s;
}
