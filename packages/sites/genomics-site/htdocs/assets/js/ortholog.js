/*
  ortholog.js
  Functions for supporting the ortholog link in details box.

*/

function openOrthologFilter(strat_back_id, step_id){
	var strat = getStrategyFromBackId(strat_back_id);
	isInsert = step_id;
	current_Front_Strategy_Id = strat.frontId;

        if(openDetail != null) hideDetails(); 

        var url = "wizard.do?stage=show_ortholog&action=revise";
        url += "&strategy=" + strat_back_id + "&step=" + step_id;
        url += "&questionFullName=InternalQuestions.GenesByOrthologs";

        // display the stage
        callWizard(url,null,null,null,'next'); 
}

function openSyntenicOrthologFilter(strat_id, step_id){
	var strat = getStrategyFromBackId(strat_id);
	isInsert = step_id;
	current_Front_Strategy_Id = strat.frontId;
	var url = 'showQuestion.do?questionFullName=InternalQuestions.GenesBySyntenicOrthologs&gene_result=' + step_id;
	$("#query_form").remove();
	$("#Strategies div a#filter_link span").css({opacity: 1.0});
	$("#Strategies div#diagram_" + current_Front_Strategy_Id + " a#filter_link span").css({opacity: 0.4});
	$("body").append("<div id='query_form' style='min-height:140px; display:none'><span class='dragHandle'><div class='modal_name'><h1 id='query_form_title'></h1></div><a id='close_filter_query' href='javascript:closeAll()'><img src='/assets/images/Close-X-box.png' alt='Close'/></a></span></div>");
//	setDraggable($("#query_form"), ".handle");
	getQueryForm(url, true, true, strat.frontId);
}
