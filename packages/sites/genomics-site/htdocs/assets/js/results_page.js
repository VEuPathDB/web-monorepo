

function ToggleGenePageView(id,url){
	$("#Results_Pane").css({display: "none"});
	$("#Record_Page_Div").css({display: "none"});
	$("#record_page_cell_div").html("");
	$("#primaryKey_div").css({display: "none"});
	$(".marker").removeClass("marker");
	if(id == ""){
		$("#Results_Pane").css({display: "block"});
		$("#summary_view_button").attr("disabled","disabled");
	} else {
		$("#primaryKey_div").css({display: "block"});
		$("#Record_Page_Div").css({display: "block"});
		var id_link = $("#list_" + id);
		id_link.addClass("marker");
		var feature_id = id.substring(8);
		$("#record_cell_header").text(feature_id);
		$("#summary_view_button").attr("disabled","");
		LoadGenePage(url,'record_page_cell_div');
	}
}

function LoadGenePage(url,dest_id) {
	$.ajax({
			url: url,
			dataType: "html",
			beforeSend: function(obj){
				var pro_bar = "<div id='gene_page_progress_bar'>" +
							  "<div class='record' id='graphic_span'>Loading...</div></div>";//<div id='loading_span'>Loading</div></div>";
				$("#" + dest_id).html(pro_bar);
				$("#graphic_span").css({opacity: 0.2});
			  for(i = 0;i<100;i++){
				$("#graphic_span").animate({
					opacity: 1.0
				},1000);
				$("#graphic_span").animate({
					opacity: 0.2
				},1000);
			  }
			},
			success: function(data){
				$("#" + dest_id).html(data);
			},
			error: function(data, msg, e){
				alert("ERROR \n "+ msg + "\n" + e);
			}
	});

}

function moveAttr(col_ix) {
	// Get name of target attribute & attribute to left (if any)
	// NOTE:  Have to convert these from frontId to backId!!!
	var headers = $("div.flexigrid tr.headerrow th");
	var attr = $(headers[col_ix]).attr("id");
	var left;
	if (col_ix > 0) left = $(headers[col_ix-1]).attr("id");
	// Figure out what step/strategy is currently displayed in results panel
	var step = $("div.selectedarrow");
	if (step.length == 0) step = $("div.selected");
	var stepfId = step.attr("id").split('_')[1];
	var stratfId = step.parent().attr("id").split('_')[1];
	var strat = getStrategy(stratfId);
	var step = getStep(stratfId, stepfId);
	// build url.
	var url = "processSummary.do?strategy=" + strat.backId + "&step=" + step.back_step_Id + "&command=arrange&attribute=" + attr + "&left=" + left;
	GetResultsPage(url, false);
}

// FOLLOWING TAKEN FROM OLD CUSTOMSUMMARY

function addAttr(url) {
    var attributeSelect = document.getElementById("addAttributes");
    var index = attributeSelect.selectedIndex;
    var attribute = attributeSelect.options[index].value;
    
    if (attribute.length == 0) return;

    var url = url + "&command=add&attribute=" + attribute;
    GetResultsPage(url, true);
	//window.location.href = url;
}


function resetAttr(url) {
    if (confirm("Are you sure you want to reset the column configuration back to the default?")) {
        var url = url + "&command=reset";
        GetResultsPage(url, true);
		//window.location.href = url;
    }
}
		
