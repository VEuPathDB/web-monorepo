
function GetResultsPage(url, update){
	var s = parseUrlUtil("strategy", url);
	var strat = getStrategyFromBackId(s[0]);
	url = url + "&resultsOnly=true";
	$.ajax({
		url: url,
		dataType: "html",
		beforeSend: function(){
			showLoading(strat.frontId);
		},
		success: function(data){
			if (update) {
				ResultsToGrid(data);
			}
			removeLoading(strat.frontId);
		},
		error : function(data, msg, e){
			  alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReloading this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
}

function ResultsToGrid(data) {
	$("div#Workspace").html(data);

	// specify column sizes so flexigrid generates columns properly.
/*
	var headers = $('#Results_Table th');
	$('#Results_Table tbody tr:first td').each(
		function(idx,ele){
			$(headers[idx]).attr("width", Math.max($(ele).width(),$(headers[idx]).width()) );
		}
	);
	$("#Results_Table").flexigrid({height : 'auto',
				       showToggleBtn : false,
				       useRp : false,
				       singleSelect : true,
				       onMoveColumn : moveAttr,
                                       nowrap : false,
				       resizable : false});
	$(".cDrag").remove();
	flexifluid.init();
*/
}
