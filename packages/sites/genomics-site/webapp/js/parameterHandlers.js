var validTerms = new Array();
var dependedParams = new Array();
var typeAheadXml = new Array();
var hideInvalidTerms = new Array();

$(document).ready(function() {
	initTypeAhead();
	initDependentParamHandlers();
});

function initDependentParamHandlers() {
	$("input.dependentParam, select.dependentParam").each(function() {
		var name = $(this).attr('name');
		name = name.substring(name.indexOf("myMultiProp(") + 12, name.indexOf(")"));
		var dependedParam = $("input[name='myMultiProp(" + dependedParams[name] + ")'], select[name='myMultiProp(" + dependedParams[name] + ")']");
		if ($(this).hasClass("typeAhead")) {
			dependedParam.change(function() {
				createDependentAutoComplete(name, $(this).attr("value"));
			});		
		} else {
			dependedParam.change(function() {
				updateDependentParam(name, $(this).attr("value"));
			});		
		}
	});
}

function initTypeAhead() {
	var test = $("input:text.typeAhead");
	$("input:text.typeAhead").each(function() {
		var typeAhead = $(this);
		var questionName = $("#form_question input:hidden[name='questionFullName']").attr("value");
		var paramName = typeAhead.attr('name');
		paramName = paramName.substring(paramName.indexOf("myMultiProp(") + 12, paramName.indexOf(")"));
		var sendReqUrl = 'getTypeAheadData.do?questionFullName=' + questionName + '&name=' + paramName;
		$.ajax({
			url: sendReqUrl,
			dataType: "xml",
			success: function(data){
				if (typeAhead.hasClass('dependentParam'))
					typeAheadXml[paramName] = data;
				else
					createAutoComplete(data, paramName);
			}
		});
	});
}

function createAutoComplete(obj, name) {
	var def = new Array();
	var term;
	if( $("term",obj).length != 0 ){
		$("term",obj).each(function(){
			term = this.firstChild.data;
			def.push(term);
		});		
	}
	$("input[name='myMultiProp(" + name + ")']").autocomplete(def,{
		matchContains: true
	});
}

function createDependentAutoComplete(name, dependedValue) {
	var def = new Array();
	var term;
	$("div.ac_results").remove(); // Remove any old autocomplete results.
	if( $("term",typeAheadXml[name]).length != 0 ){
		$("term",typeAheadXml[name]).each(function(){
			if ($(this).attr('parentTerm').indexOf(dependedValue) >= 0) {
				term = this.firstChild.data;
				def.push(term);
			}
		});		
	}
	$("input[name='myMultiProp(" + name + ")']").autocomplete(def,{
		matchContains: true
	});
}

function updateDependentParam(name, dependedValue) {
	var dependentParam = $("input[name='myMultiProp(" + name + ")']");
	if (dependentParam.length == 0) dependentParam = $("select[name='myMultiProp(" + name + ")'] option");
	if (hideInvalid[name]) dependentParam.attr('disabled','true');
	else dependentParam.hide();
	dependentParam.each(function() {
		if (validTerm[name][$(this).attr("value")].indexOf(dependedValue) >= 0) {
			if (hideInvalid[name]) $(this).removeAttr('disabled');
			else $(this).show();
		}
	});
}
