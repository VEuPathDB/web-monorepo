

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
				"<div class='record' id='graphic_span'>Loading...</div></div>";//"<div id='loading_span'>Loading</div></div>";
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
				alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReloading this page might solve the problem. \nOtherwise, please contact site support.");
			}
	});

}

function moveAttr(col_ix, table) {
	// Get name of target attribute & attribute to left (if any)
	// NOTE:  Have to convert these from frontId to backId!!!
	var headers = $("tr.headerrow th", table);
	var attr = $(headers[col_ix]).attr("id");
	var left, strat, step;
	if (col_ix > 0) left = $(headers[col_ix-1]).attr("id");
	// Figure out what step/strategy is currently displayed in results panel
	if (table.parents("#strategy_results").length > 0) {
		var step = $("div.selectedarrow");
	        if (step.length == 0) step = $("div.selectedtransform");
		if (step.length == 0) step = $("div.selected");
		var stepfId = step.attr("id").split('_')[1];
		var stratfId = step.parent().attr("id").split('_')[1];
		strat = getStrategy(stratfId).backId;
		step = getStep(stratfId, stepfId).back_step_Id;
	}
	else {
		step = table.attr('step');
	}
	// build url.
	var url = "processSummary.do?strategy=" + strat + "&step=" + step + "&command=arrange&attribute=" + attr + "&left=" + left;
	if (table.parents("#strategy_results").length > 0) {
		GetResultsPage(url, false, true);
	}
	else {
		ChangeBasket(url + "&results_only=true");
	}
}

// FOLLOWING TAKEN FROM OLD CUSTOMSUMMARY

function addAttr(attrSelector) {
	var attributes = attrSelector.val();

	if (attributes.length == 0) return;

	attributes = attributes.split(',').join("&attribute=");

	var url = attrSelector.attr('commandurl') + "&command=add&attribute=" + attributes;
	if (attrSelector.parents("div#strategy_results").length > 0) {
		GetResultsPage(url, true, true);
	}
	else {
		ChangeBasket(url + "&results_only=true");
	}
}


function resetAttr(url, button) {
    if (confirm("Are you sure you want to reset the column configuration back to the default?")) {
        var url = url + "&command=reset";
	if ($(button).parents("#strategy_results").length > 0) {
	        GetResultsPage(url, true, true);
	}
	else {
		ChangeBasket(url + "&results_only=true");
	}
    }
}

function ChangeBasket(url) {
	$.ajax({
		url: url,
		dataType: "html",
		success: function(data){
			showBasket();
		},
		error : function(data, msg, e){
			  alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReloading this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
}

//Shopping basket on clickFunction
function updateBasket(ele, type, pk, pid,recordType) {
	var i = $("img",ele);
	var a = new Array();
	var action = null;
	var da = null;
	if(type == "single"){
		var o = new Object();
		o.source_id = pk;
		o.project_id = pid;
		a.push(o);
		da = $.json.serialize(a);
		action = (i.attr("value") == '0') ? "add" : "remove";
	}else if(type == "page"){
		$("a[class^='primaryKey_']").each(function(){
			var o = new Object();
			sid = $(this).attr("class").split("_||_")[1];
			o.source_id = sid;
			o.project_id = pid;
			a.push(o);
		});
		action = (i.attr("value") == '0') ? "add" : "remove";
		da = $.json.serialize(a);
	}else if(type == "clear"){
		action = "clear";
	}else{
		da = type;
		action = "add-all";//(i.attr("value") == '0') ? "add-all" : "remove-all";
	}
	var d = "action="+action+"&type="+recordType+"&data="+da;
		$.ajax({
			url: "processBasket.do",
			type: "post",
			data: d,
			dataType: "html",
			beforeSend: function(){
				$("body").block();
			},
			success: function(data){
				$("body").unblock();
				if(type == "single"){
					if(action == "add") {
						i.attr("src","/assets/images/basket_color.png");
						i.attr("value", "1");
					}else{
						i.attr("src","/assets/images/basket_gray.png");
						i.attr("value", "0");
					}
				}else if(type == "clear"){
					showBasket();
				}else{
					if(action == "add-all" || action == "add") {
						$("div#" + getCurrentTabCookie(false) + " div#Results_Div img.basket").attr("src","/assets/images/basket_color.png");
						$("div#" + getCurrentTabCookie(false) + " div#Results_Div img.basket").attr("value", "1");
					}else{
						$("div#" + getCurrentTabCookie(false) + " div#Results_Div img.basket").attr("src","/assets/images/basket_gray.png");
						$("div#" + getCurrentTabCookie(false) + " div#Results_Div img.basket").attr("value", "0");
					}
				}
				checkPageBasket();
			},
			error: function(){
				$("body").unblock();
				alert("Error adding Gene to basket!");
			}
		});
}

function checkPageBasket(){
	allIn = true;
	$("div#" + getCurrentTabCookie(false) + " div#Results_Div img.basket").each(function(){
		if(!($(this).hasClass("head"))){
			if($(this).attr("value") == 0){
				allIn = false;
			}
		}
	});
	if(allIn){
		$("div#" + getCurrentTabCookie(false) + " div#Results_Div img.head.basket").attr("src","/assets/images/basket_color.png");
		$("div#" + getCurrentTabCookie(false) + " div#Results_Div img.head.basket").attr("value", "1");
	}else{
		$("div#" + getCurrentTabCookie(false) + " div#Results_Div img.head.basket").attr("src","/assets/images/basket_gray.png");
		$("div#" + getCurrentTabCookie(false) + " div#Results_Div img.head.basket").attr("value", "0");
	}
}
		
