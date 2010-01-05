/*

genePage.js
  Contains functions used for displaying gene page in results table
  We definitely don't support this...not sure if we plan to anymore.

*/
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

