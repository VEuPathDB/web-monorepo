$(document).ready(function() {
	initTypeAhead();
});

function initTypeAhead() {
	if ($("#searchBox").hasClass("typeAhead")) {
		var record = $("#searchBox").attr("recordClass");
		var dataType = $("#searchBox").attr("dataType");
		var isParam = $("#searchBox").attr("isParam");
		if (isParam) {
			$("select[name='myMultiProp(" + dataType + ")']").unbind('change');
			$("select[name='myMultiProp(" + dataType + ")']").change(function() {
				loadSelectedData(record, dataType, isParam);
			});
		} else {
			loadSelectedData(record, dataType, isParam);
		}
	}
}

function loadSelectedData(record, type, isParam){
	var dataType = type;
	if (isParam) {
		var selectElt = "select[name='myMultiProp(" + dataType + ")']";
		if ($(selectElt + " option").index($(selectElt + " option:selected")) == 0)
			return false;
		dataType = $(selectElt).val(); //use this to select database
	}
	var sendReqUrl = 'showRecord.do?name=' + record + '&primary_key='+ dataType;
	$.ajax({
		url: sendReqUrl,
		dataType: "xml",
		success: function(data){
			createAutoComplete(data);
		}
	});
}

function createAutoComplete(obj){
	var def = new Array();
	var term;
	if( $("term",obj).length != 0 ){
		$("term",obj).each(function(){
			term = this.firstChild.data;
			def.push(term);
		});
		$("#searchBox").autocomplete(def,{
			matchContains: true
		});		
	}else{
		// No Panther data returned from server
	}
}
