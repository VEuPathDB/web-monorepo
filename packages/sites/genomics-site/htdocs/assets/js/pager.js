
function GetResultsPage(url){
//	var url = $(this).attr("href");
	url = url + "&resultsOnly=true";
	$.ajax({
		url: url,
		dataType: "html",
		success: function(data){
			$("div#Workspace").html(data);
		},
		error : function(data, msg, e){
			  alert("ERROR \n "+ msg + "\n" + e);
		}
	});
}
