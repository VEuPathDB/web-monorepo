
$(function() {
	if (!isRevise()) {
		setUpBlastPage();
	}
});

function setUpBlastPage() {
	// set sequence field as textarea with onchange event instead of standard text field
	var sequenceValue = $('#BlastQuerySequence').val();
    $('#BlastQuerySequence').parent()
        .html('<textarea id="sequence" onchange="checkSequenceLength()" rows="4" cols="50" name="value(BlastQuerySequence)"></textarea><br/>'+
              '<i>Note: max.allowed sequence is 31K bases</i><br/><div class="usererror"><span id="short_sequence_warning"></span></div>');
	$('#sequence').val(sequenceValue);
	
	// set onchange for database type to set blast type-specific fields
	$('input[name="array(BlastDatabaseType)"]').attr("onchange","changeQuestion(); changeAlgorithms();");

	// set onchange for algorithm type to change sequence type
	$('input[name="array(BlastAlgorithm)"]').attr("onchange","changeSequenceLabel(); checkSequenceLength();");

	// set these based on whatever defaults came out of the question page
	changeQuestion();
	changeAlgorithms();
	
	// not sure what this does...
	//if (window.location.href.indexOf("showApplication") == -1)
	//	initBlastQuestion(window.location.href);
}

function changeQuestion() {
	// stores mapping from blast databases to questions	
	var blastDb = getSelectedDatabaseName();
	var questionName;
	if (blastDb.indexOf("est") >= 0) {
		questionName = "EstQuestions.EstsBySimilarity";
	} else 	if (blastDb.indexOf("assem") >= 0) {
		questionName = "AssemblyQuestions.AssembliesBySimilarity";
	} else 	if (blastDb.indexOf("orf") >= 0) {
		questionName = "OrfQuestions.OrfsBySimilarity";
	} else 	if (blastDb.indexOf("survey") >= 0) {
		questionName = "GenomicSequenceQuestions.GSSBySimilarity";
	} else 	if (blastDb.indexOf("genom") >= 0) {
		questionName = "GenomicSequenceQuestions.SequencesBySimilarity";
	} else 	if (blastDb.indexOf("iso") >= 0) {
		questionName = "IsolateQuestions.IsolatesBySimilarity";
	} else {
		questionName = "GeneQuestions.GenesBySimilarity";
	}
	$('#questionFullName').val(questionName);
	// don't think this is necessary since using question page now
	//$('#questionFullName_id_that_IE7_likes').val(questionName);
}

function changeAlgorithms() {
	// get valid program list (based on data type) and grey inapplicable options
	var tgeUrl = "showRecord.do?name=AjaxRecordClasses.Blast_Transcripts_Genome_Est_TermClass&primary_key=fill";
	var poUrl = "showRecord.do?name=AjaxRecordClasses.Blast_Protein_Orf_TermClass&primary_key=fill";
	var type = getSelectedDatabaseName();
	var sendReqUrl;

	// determine appropriate URL to get list of valid algorithms for this database
	if (type == 'EST' || type == 'Transcripts' || type == 'Genome' ||
		type == 'Genome Survey Sequences' || type == 'Isolates' || type == 'Assemblies') {
		sendReqUrl = tgeUrl;
	}
	else if (type == 'ORF' || type == 'Proteins'){
		sendReqUrl = poUrl;
	}
	else {
		alert("Oops! illegal BLAST database type: " + type + ". Please contact the administrator about this error.");
		return;
	}

	// make ajax call to get xml-formatted list; parse and populate
	$.ajax({
		url: sendReqUrl,
		dataType: "xml",
		success: function(xml) {
			// first get currently selected button
			var current = getSelectedAlgorithmName();
			var mustSelectFirst = true;
			var firstValidAlgorithm = "";
			
			// then deactivate all (will turn back on if appropriate)
			$('input[name="array(BlastAlgorithm)"]').attr("disabled", true).attr("checked", false).parent().children().filter("span").attr("style","color:gray");
			
			// then reactivate all valid algorithms for this type
			$(xml).find("term").each(function() {
				var algName = $(this).attr("id");
				$('input[value="'+algName+'"]').attr("disabled", false).parent().children().filter("span").attr("style","color:black");
				if (firstValidAlgorithm == "") firstValidAlgorithm = algName;
				if (algName == current) mustSelectFirst = false;
			});
			
			// reselect current, or select the first activated option if
			//   the previously selected option has been deactivated
			current = (mustSelectFirst ? firstValidAlgorithm : current);
			$('input[value="'+current+'"]').attr("checked", true);

			// update sequence label to reflect new algorithm
			changeSequenceLabel();
		},
		error: function(data, msg, e) {
			alert("ERROR \n "+ msg + "\n" + e +
                  ". \nReloading this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
}

function changeSequenceLabel() {
	var algorithm = getSelectedAlgorithmName();
	$('#blastAlgo').val(algorithm);
	var label = ((algorithm == "blastp" || algorithm == "tblastn") ? "Protein Sequence" : "Nucleotide Sequence");
	$('#help_BlastQuerySequence').parent().children().filter("span").html(label);
}

function checkSequenceLength() {
	if ($('#sequence').val().length != 0){
		var algorithm = getSelectedAlgorithmName();
		var sequence = $('#sequence').val();
		var expectationElem = $('#-e')[0];
		var filteredSeq = sequence.replace(/^>.*/,"").replace(/[^a-zA-Z]/g,"");
		if (filteredSeq.length <= 25 && algorithm == "blastn") {
			$('#short_sequence_warning').html("Note: The expect value has been set from " + expectationElem.value + " to 1000 because<br/>your query sequence is less than 25 nucleotides. You may want<br/>to adjust the expect value further to refine the specificity of your<br/>query.");
			expectationElem.value = 1000;
		} else if (filteredSeq.length > 31000) {
			$('#short_sequence_warning').html("Note: The maximum allowed size for your sequence is 31000 base pairs.");
		} else {
			$('#short_sequence_warning').html("");
		}
	} else {
		$('#short_sequence_warning').html("");
	}
}

function isRevise() {
	// not sure of best way to test this, but for now, this seems to work
	//  (i.e. if there's no input called BlastDatabaseType, then this is revise)
	return ($('input[name="array(BlastDatabaseType)"]').size() == 0);
}

function getSelectedDatabaseName() { return getSelectedRadioButton("array(BlastDatabaseType)"); }
function getSelectedAlgorithmName() { return getSelectedRadioButton("array(BlastAlgorithm)"); }

function getSelectedRadioButton(radioName) {
	var inputs = $('input[name="' + radioName + '"]');
	for (var y = 0; y < inputs.size(); y++) {
		if (inputs[y].checked) {
			return inputs[y].value;
		}
	}
	// none are selected; return first element
	return inputs[0].value;
}

///////////////////////////////////////////////////////////////////////
var revise = false;
var Rtype = "";
var Rprogram = "";
var Rorganism = null;
var selectedArray = "";

//Program variables
var tgeArray = new Array();
var poArray = new Array();

function clickDefault(){}

function initBlastQuestion(url){
	revise = false;
	var target = parseUrlUtil('questionFullName',url)[0];
	if(window.location.href.indexOf("showApplication.do") != -1){
		restrictTypes(target);
	}
	if(parseUrlUtil('-filter',url) != ""){
       revise = true;
       Rorganism = unescape(parseUrlUtil('BlastDatabaseOrganism',url)).replace(/\+/g," ").split(",");
	   Rtype = parseUrlUtil('BlastDatabaseType',url)[0];
	   if(Rtype.search(/\+/i) >= 0) Rtype = Rtype.replace(/\+/gi," ");
	   Rprogram = parseUrlUtil('BlastAlgorithm',url);   
	   clickDefault(Rtype, 'type'); 
	   enableRadioArray('algorithm', Rprogram);
	}else{
		if(target.search(/Gene/i) >= 0) clickDefault('Transcripts','type');
		else if(target.search(/ORF/i) >= 0) clickDefault('ORF','type');
		else if(target.search(/ESTsBy/i) >= 0) clickDefault('EST','type');
		else if(target.search(/Genomic/i) >= 0) clickDefault('Genome','type');
		else if(target.search(/Isolate/i) >= 0) clickDefault('Isolates','type');
		else if(target.search(/Assembly/i) >= 0) clickDefault('Assemblies','type');
		else $("input.blast-type:checked").click();
	}
}

function updateDatabaseTypeOnclick() {
	alert("updating database type values!!!");
	var question = $('#questionName').attr(name);
	var questionLow = question.toLowerCase();
  // disable options based on the selected question
  algos = document.getElementsByName('array(BlastDatabaseType)');
  for(var i = 0; i < algos.length; i++)
  {
       var alg = algos[i];
       var type = alg.value;
       var disabled = true;
       if (question == "UnifiedBlast"
           || questionLow.match(type.toLowerCase()) != null
           || (question == "GenesBySimilarity" && (type == "Transcripts" || type == "Proteins"))
           || (question == "SequencesBySimilarity" && type == "Genome")
          ) { 
           disabled = false;
       }
       if (disabled) $(alg).attr("disabled", "disabled")
       else $(alg).removeAttr("disabled");
       alg.onclick =function() { checkSequenceLength();changeQuestion();getBlastAlgorithm(); }
  }
}


function getBlastAlgorithm_old() {
	var tgeUrl = "showRecord.do?name=AjaxRecordClasses.Blast_Transcripts_Genome_Est_TermClass&primary_key=fill";
	var poUrl = "showRecord.do?name=AjaxRecordClasses.Blast_Protein_Orf_TermClass&primary_key=fill";
	var type = getSelectedDatabaseName();
		
	if (type == 'EST' || type == 'Transcripts' || type == 'Genome' ||
		type == 'Genome Survey Sequences' || type == 'Isolates' || type == 'Assemblies') {
		sendReqUrl = tgeUrl; 
		selectedArray = 'tge';
	}
	else if (type == 'ORF' || type == 'Proteins'){
		sendReqUrl = poUrl; 
		selectedArray = 'po';
	}
	else {
		alert("Oops! illegal database type: " + type);
	}

	$.ajax({
		url: sendReqUrl,
		dataType: "xml",
		success: function(data) {
			fillDivFromXML( data, 'BlastAlgorithm', selectedArray);
		},
		error: function(data, msg, e) {
			alert("ERROR \n "+ msg + "\n" + e +
                  ". \nReloading this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
}

function fillDivFromXML_old(obj, id, index)
{
	var defArray = null;
	if(obj != null){
		var def = new Array();
		defArray = obj.getElementsByTagName('term'); //I'm assuming they're 'term' tags
		if(index == 'tge') tgeArray = arr;
		if(index == 'po') poArray = arr;
	} else {
		if(index == 'tge') defArray = tgeArray;
		else if(index == 'po') defArray = poArray;
		else alert("Aaaah: illegal value for index: "+index);
	}
	var ArrayLength = defArray.length;
	var term;
	if(!revise) {
		// initialize radio array
		var radioArray = document.getElementsByName('algorithm');
		for(var y = 0; y < radioArray.length; y++){
			radioArray[y].disabled = true;
			radioArray[y].checked = false;
			document.getElementById(radioArray[y].value+'_font').style.color="gray";
			document.getElementById(radioArray[y].value+'_font').style.fontWeight="200";
		}
		document.getElementById('blastAlgo').value = "";
	}
	if( ArrayLength != 0 ){
		for(var i=0; i<ArrayLength;i++){
			term = new String( defArray[i].firstChild.data );
			var radio;
			var radioArray = document.getElementsByName('algorithm');
			for (var y = 0; y < radioArray.length; y++){
				if(radioArray[y].id == 'BlastAlgorithm_'+term) {
					radio = radioArray[y];
					break;
				}
			}
			if(radio.id == 'BlastAlgorithm_'+term){
				radio.disabled = false;
				if(i==0){
					radio.checked = true;
					changeLabel();
				}
				document.getElementById(term+'_font').style.color="black";
				document.getElementById(term+'_font').style.fontWeight="bold";
			}
		}
	}else{
		alert("No Data Returned From the Server!!");
	}	
}
