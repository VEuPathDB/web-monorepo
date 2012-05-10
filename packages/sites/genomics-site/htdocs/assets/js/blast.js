
$(function() {
    setUpBlastPage();
});

function setUpBlastPage() {
	// add warning span to sequence field
	var sequenceValue = $('#BlastQuerySequence').val();
    var sequenceHtml = $('#BlastQuerySequence').parent().html();
    //'<textarea id="sequence" onchange="checkSequenceLength()" rows="4" cols="50" name="value(BlastQuerySequence)"></textarea>
    $('#BlastQuerySequence').parent().html(sequenceHtml +
    		'<br/><i>Note: only one input sequence allowed.<br>maximum allowed sequence length is 31K bases.</i><br/><div class="usererror"><span id="short_sequence_warning"></span></div>');    
	$('#BlastQuerySequence').val(sequenceValue);
	
    // set onchange for sequence field to display appropriate warning message
	$('#BlastQuerySequence').attr("onchange","checkSequenceLength();");
    
	// set onchange for database type to set blast type-specific fields (i.e. all radio buttons)
	$('input[name="array(BlastDatabaseType)"]').attr("onchange","changeQuestion(); changeAlgorithms();");

	// set onchange for algorithm type to change sequence type (i.e. all radio buttons)
	$('input[name="array(BlastAlgorithm)"]').attr("onchange","changeSequenceLabel(); checkSequenceLength();");

	// set these based on whatever defaults come out of the question page
	changeQuestion();
	changeAlgorithms();
}

function changeQuestion() {
	// stores mapping from blast databases to questions	
	var blastDb = getSelectedDatabaseName().toLowerCase();
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
	var sequence = $('#BlastQuerySequence').val();
	if (sequence.length != 0){
		var algorithm = getSelectedAlgorithmName();
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

function getSelectedDatabaseName() { return getSelectedRadioButton("array(BlastDatabaseType)"); }
function getSelectedAlgorithmName() { return getSelectedRadioButton("array(BlastAlgorithm)"); }

function getSelectedRadioButton(radioName) {
	var inputs = $('input[name="' + radioName + '"]');
	for (var y = 0; y < inputs.size(); y++) {
		if (inputs[y].checked) {
			return inputs[y].value;
		}
	}
	if (inputs.size() > 0) {
		// none are selected; return first element
	    return inputs[0].value;
	}
	// element not loaded
	return "";
}
