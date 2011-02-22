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
function customSpanParameters(aParams) {
	var selectedOutput, aType, bType;
	var paramsDiv = document.createElement('div');
	var params = new Array();

	function makeSpanTable(aSpanParams, aType, aGroup) {
		var tr, table = document.createElement('table');
		tr = document.createElement('tr');
		$(tr).append("<td class='region_" + aGroup + "' rowspan='2'>" + aType + " Region:</td>");
		$(tr).append("<td class='param value'>Begin at:</td>");
		$(tr).append(aSpanParams['span_begin_' + aGroup]);
		$(tr).append(aSpanParams['span_begin_direction_' + aGroup]);
		$(tr).append(aSpanParams['span_begin_offset_' + aGroup]);
		$(table).append(tr);
		tr = document.createElement('tr');
		$(tr).append("<td class='param value'>End at:</td>");
		$(tr).append(aSpanParams['span_end_' + aGroup]);
		$(tr).append(aSpanParams['span_end_direction_' + aGroup]);
		$(tr).append(aSpanParams['span_end_offset_' + aGroup]);
		$(table).append(tr);
		return table
	}

	$(aParams).each(function() {
		switch (this.name) {
		case 'span_sentence':
			var sentence = document.createElement('div');
			sentence.setAttribute('class','span-step-text');
			$(sentence).html(this.internal);
			$(paramsDiv).append(sentence);
			break;
		case 'span_output':
			selectedOutput = this.internal;
			break;
		default:
			var td = document.createElement('td');
			td.className = "param value";
			$(td).html(this.value);
			params[this.name] = td;
			break;
		}
	});

	if (selectedOutput === 'a') {
		aType = $('span.span_output',paramsDiv).text();
		aType = aType.substring(0,aType.indexOf(' from'));
		bType = $('span.comparison_type', paramsDiv).text();
	}
	else {
		bType = $('span.span_output',paramsDiv).text();
		bType = bType.substring(0,bType.indexOf(' from'));
		aType = $('span.comparison_type', paramsDiv).text();
	}

	$(paramsDiv).append(makeSpanTable(params, aType, 'a'));

	$(paramsDiv).append(makeSpanTable(params, bType, 'b'));

	var tr = document.createElement('tr');
	var td = document.createElement('td');
	$(td).append(paramsDiv);
	$(tr).append(td);

	return tr;
}
