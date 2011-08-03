var revise = false;
var Rtype = "";
var Rprogram = "";
var Rorganism = null;

var is_Done = false;
var selectedArray = "";

//Program varaiables
var tgeUrl = "showRecord.do?name=AjaxRecordClasses.Blast_Transcripts_Genome_Est_TermClass&primary_key=fill";
var poUrl = "showRecord.do?name=AjaxRecordClasses.Blast_Protein_Orf_TermClass&primary_key=fill";
var tgeArray = new Array();
var poArray = new Array();


function clickDefault(){}

window.onload = function(){
	if(window.location.href.indexOf("showApplication") == -1)
		initBlastQuestion(window.location.href);
}

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


function checkSequenceLength(){	
	if(document.getElementById('sequence').value.length != 0){
    		var algorithm = "";
		var algos = document.getElementsByName('algorithm');
		for(var y = 0; y < algos.length; y++){
			if(algos[y].checked)
				algorithm = algos[y].value;
		}
		var eval = document.getElementById('e');
		var str=document.getElementById('sequence').value;
		var str1 = str.replace(/^>.*/,"");
		var str2 = str1.replace(/[^a-zA-Z]/g,"");
		if(str2.length <= 25 && algorithm == "blastn"){
			document.getElementById('short_sequence_warning').innerHTML = "Note:  The expect value has been set from " + eval.value + " to 1000 because <br> your query sequence is less than 25 nucleotides.  You may want <br> to adjust the expect value further to refine the specificity of your <br> query.";
			eval.value = 1000;
		}else if (str2.length > 31000) {
			document.getElementById('short_sequence_warning').innerHTML = "Note:  The maximum allowed size for your sequence is 31000 base pairs.";
		}else{
			document.getElementById('short_sequence_warning').innerHTML = "";
		}
	}else{
		document.getElementById('short_sequence_warning').innerHTML = "";
	}
}


function changeQuestion(){
        // stores mapping from blast databases to questions	
	var blastDb = "";
	var types = document.getElementsByName('array(BlastDatabaseType)');
	for(var x = 0; x < types.length; x++){
		if(types[x].checked)
			blastDb = types[x].value.toLowerCase();
	}
	var questionName;
	if (blastDb.indexOf("est") >= 0){
		questionName = "EstQuestions.EstsBySimilarity";
	} else 	if (blastDb.indexOf("assem") >= 0){
		questionName = "AssemblyQuestions.AssembliesBySimilarity";
	} else 	if (blastDb.indexOf("orf") >= 0){
		questionName = "OrfQuestions.OrfsBySimilarity";
	} else 	if (blastDb.indexOf("survey") >= 0){
		questionName = "GenomicSequenceQuestions.GSSBySimilarity";
	} else 	if (blastDb.indexOf("genom") >= 0){
		questionName = "GenomicSequenceQuestions.SequencesBySimilarity";
	} else 	if (blastDb.indexOf("iso") >= 0){
		questionName = "IsolateQuestions.IsolatesBySimilarity";
	} else {
		questionName = "GeneQuestions.GenesBySimilarity";
	}
	document.getElementById( 'questionFullName_id_that_IE7_likes' ).value = questionName;
}


function changeLabel(){	
	var algorithm = "";
	var algos = document.getElementsByName('algorithm');


	for(var y = 0; y < algos.length; y++){
		if(algos[y].checked)
			algorithm = algos[y].value;
	}

       document.getElementById('blastAlgo').value = algorithm;

       if(algorithm == "blastp" || algorithm == "tblastn") {
           label = "Protein Sequence";
       }
       else {
           label = "Nucleotide Sequence";
       }

       document.getElementById('parameter_label').innerHTML = "<b>"+label+"</b>";
}


function updateDatabaseTypeOnclick(question){
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


function getBlastAlgorithm() {
	var label = "";
  var type = "";

	types = document.getElementsByName("array(BlastDatabaseType)");

    for(var t = 0; t < types.length; t++){
		if(types[t].checked)
			type = types[t].value;
	}
//	document.getElementById('blastType').value = type;
		
	if(type == 'EST' || type == 'Transcripts' || type == 'Genome' || type == 'Genome Survey Sequences') {
		sendReqUrl = tgeUrl; 
		selectedArray = 'tge';
	}
	else if(type == 'ORF' || type == 'Proteins'){
		sendReqUrl = poUrl; 
		selectedArray = 'po';
	}
	else if(type == 'Isolates'){
		sendReqUrl = tgeUrl; 
		selectedArray = 'tge';
	}
	else if(type == 'Assemblies'){
		sendReqUrl = tgeUrl; 
		selectedArray = 'tge';
	}

	getAndWrite(sendReqUrl, 'BlastAlgorithm');
}


function getAndWrite(sendReqUrl, elementId){ 
  var xmlObj = null;
	is_Done = false;
	if(window.XMLHttpRequest){		
		xmlObj = new XMLHttpRequest();
	} else if(window.ActiveXObject){
		xmlObj = new ActiveXObject("Microsoft.XMLHTTP");
	} else {
		return;
	}
	xmlObj.onreadystatechange = function(){
		if(xmlObj.readyState == 4 ){
			if(xmlObj.status == 200){
				if(elementId == 'BlastAlgorithm'){ 
					fillDivFromXML( xmlObj.responseXML, elementId, selectedArray);
				}
			}else{
				alert("Message returned, but with an error status");
			}			
		 }
	}
	xmlObj.open( 'GET', sendReqUrl, true );
	xmlObj.send('');
}

function fillDivFromXML(obj, id, index)
{
	var defArray = null;
	if(obj != null){
		var def = new Array();
		defArray = obj.getElementsByTagName('term'); //I'm assuming they're 'term' tags
		setArray(index, defArray);
	} else {
		defArray = getArray(index);
	}
	var ArrayLength = defArray.length;
	var term;
	if(!revise) initRadioArray('algorithm'); 
	//else revise = false;
	if( ArrayLength != 0 ){
		for(var i=0; i<ArrayLength;i++){
			term = new String( defArray[i].firstChild.data );
			var radio = getArrayElement(term,'algorithm');
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


function getArray(index){
	if(index == 'N') return blastNArray;
	if(index == 'PX') return blastPXArray;
	if(index == 'T') return TblastArray;
	if(index == 'Genome') return SequenceArray;
	if(index == 'GSS') return GSSArray;
	if(index == 'EST') return ESTArray;
	if(index == 'Transcripts') return GeneArray;
	if(index == 'Isolates') return IsolateArray;
	if(index == 'Assemblies') return AssemblyArray;
	if(index == 'ORF') return ORFArray;
	if(index == 'tge') return tgeArray;
	if(index == 'po') return poArray;
}
function setArray(index, arr){
	if(index == 'N') blastNArray = arr;
	if(index == 'PX') blastPXArray = arr;
	if(index == 'T') TblastArray = arr;
	if(index == 'Genome') SequenceArray = arr;
	if(index == 'GSS') GSSArray = arr;
	if(index == 'EST') ESTArray = arr;
	if(index == 'Transcripts') GeneArray = arr;
	if(index == 'Isolates') IsolateArray = arr;
	if(index == 'Assemblies') AssemblyArray = arr;
	if(index == 'ORF') ORFArray = arr;
	if(index == 'tge') tgeArray = arr;
	if(index == 'po') poArray = arr;
}


function initRadioArray(name){
	var radioArray = document.getElementsByName(name);
	for(var y = 0; y < radioArray.length; y++){
		radioArray[y].disabled = true;
		radioArray[y].checked = false;
		document.getElementById(radioArray[y].value+'_font').style.color="gray";
		document.getElementById(radioArray[y].value+'_font').style.fontWeight="200";
	}
	document.getElementById('blastAlgo').value = "";
//	document.getElementById('blastOrg').value = "";
}

function getArrayElement(term,name){	
	var radioArray = document.getElementsByName(name);
	for(var y = 0; y < radioArray.length; y++){
			if(radioArray[y].id == 'BlastAlgorithm_'+term) return radioArray[y];
	}
}


