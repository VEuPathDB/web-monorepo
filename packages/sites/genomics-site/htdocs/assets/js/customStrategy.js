// Hacks to keep EuPath family-specific functionality in place

// Initialize blast question in step popups on all sites
function customGetQueryForm(questionName, url) {
   if(questionName.indexOf("BySimilarity") != -1){
      initBlastQuestion(url);
   }
}


// Initialize blast & ortholog questions in edit step
// popups on all sites
function customEditStep(questionName, url) {
   if(questionName.indexOf("BySimilarity") != -1){
      initBlastQuestion(url);
   } else if (questionName.indexOf("OrthologPattern") != -1){
      initOrthologQuestion(url);
   }
}

// Include orthologs link in gene details boxes in all sites
function customCreateDetails(jsonstep, modelstep) {
   var orthologs = "";
   if(jsonstep.dataType == "GeneRecordClasses.GeneRecordClass"){
      var orthologTgt;
      if (jsonstep.isboolean){
         orthologTgt = modelstep.back_boolean_Id;
      }else{
         orthologTgt = modelstep.back_step_Id;
      }
      orthologs = "<a title='Add an ortholog transform to this step: obtain the ortholog genes to the genes in this result' class='orthologs_link' href='javascript:void(0)' onclick='openOrthologFilter(\"" + strat.backId + "\"," + orthologTgt + ");hideDetails(this)'>Orthologs</a>&nbsp;|&nbsp;";
   }
   return orthologs;
}

function loadSampleStrat(url) {
	$.blockUI();
	window.location = url;
}

function customShowError() {
	alert("An error occurred. \n The EuPathDB Team is currently working to resolve this issue.");
}

function customNewTab() {
	var tooltips = $("#queryGrid div.htmltooltip");
	tooltips.remove();
	$('body').append(tooltips);
	htmltooltip.render();
}

// TODO: If span logic code is moved back into WDK,
// this should be moved into view-JSON.js
function customSpanParameters(params) {
	var sentence;
	$(params).each(function() {
		if (this.name === 'span_sentence') {
			sentence = document.createElement('tr');
			var td = document.createElement('td');
			var value = document.createElement('div');
			value.setAttribute('class','span-step-text');
			$(value).html(this.internal);
			$(td).append(value);
			$(sentence).append(td);
		}
	});
	return sentence;
}
