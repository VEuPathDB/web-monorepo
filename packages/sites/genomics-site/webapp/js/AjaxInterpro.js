function loadSelectedData(){

	var datatype =  $("#domain_database_list").val(); //use this to select database
	var sendReqUrl = 'showRecord.do?name=AjaxRecordClasses.InterproTermClass&primary_key='+datatype;
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
