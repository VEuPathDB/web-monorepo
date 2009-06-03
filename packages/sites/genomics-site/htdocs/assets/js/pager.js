
function GetResultsPage(url, update){
	var s = parseUrlUtil("strategy", url);
	var st = parseUrlUtil("step", url);
	var strat = getStrategyFromBackId(s[0]);
	var step = strat.getStep(st[0], false);
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
				$("span#text_strategy_number").html(strat.JSON.name);
			    $("span#text_step_number").html(step.frontId);
			    $("span#text_strategy_number").parent().show();
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
        // the html() doesn't work in IE 7/8 sometimes (but not always.
        // $("div#Workspace").html(data);
        document.getElementById('Workspace').innerHTML = data;

        // invoke filters
        var wdkFilter = new WdkFilter();
        wdkFilter.initialize();

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
