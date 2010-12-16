var revise = false;
var Rtype = "";
var Rprogram = "";
var Rorganism = null;

var is_Done = false;
var selectedArray = "";

// Type Variables
var blastNUrl = "showRecord.do?name=AjaxRecordClasses.BlastNTermClass&primary_key=fill";
var blastPXUrl = "showRecord.do?name=AjaxRecordClasses.BlastPXTermClass&primary_key=fill";
var TblastUrl = "showRecord.do?name=AjaxRecordClasses.TBlastTermClass&primary_key=fill";
var TblastArray = new Array();
var blastNArray = new Array();
var blastPXArray = new Array();

//Organism variables
var GeneUrl = "showRecord.do?name=AjaxRecordClasses.BlastGeneOrganismTermClass&primary_key=fill";
var IsolateUrl = "showRecord.do?name=AjaxRecordClasses.BlastIsolateOrganismTermClass&primary_key=fill";
var AssemblyUrl = "showRecord.do?name=AjaxRecordClasses.BlastAssembliesOrganismTermClass&primary_key=fill";
var ESTUrl = "showRecord.do?name=AjaxRecordClasses.BlastESTOrganismTermClass&primary_key=fill";
var SequenceUrl = "showRecord.do?name=AjaxRecordClasses.BlastSequenceOrganismTermClass&primary_key=fill";
var GSSUrl = "showRecord.do?name=AjaxRecordClasses.BlastGSSOrganismTermClass&primary_key=fill";
var ORFUrl = "showRecord.do?name=AjaxRecordClasses.BlastORFOrganismTermClass&primary_key=fill";
var GeneArray = new Array();
var IsolateArray = new Array();
var AssemblyArray = new Array();
var ESTArray = new Array();
var SequenceArray = new Array();
var ORFArray = new Array();
var GSSArray = new Array();

//Program varaiables
var tgeUrl = "showRecord.do?name=AjaxRecordClasses.Blast_Transcripts_Genome_Est_TermClass&primary_key=fill";
var poUrl = "showRecord.do?name=AjaxRecordClasses.Blast_Protein_Orf_TermClass&primary_key=fill";
var tgeArray = new Array();
var poArray = new Array();

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

function restrictTypes(type){
	var n = "";
	/*if(type.search(/Gene/i) >= 0) n = "0,1";
	else if(type.search(/Isolate/i) >= 0) n = "6";
	else if(type.search(/Assembly/i) >= 0) n = "5";
	else if(type.search(/ESTsBy/i) >= 0) n = "4";
	else if(type.search(/ORF/i) >= 0) n = "3";
	else if(type.search(/Genomic/i) >= 0) n = "2,7";*/
	
	if(type.search(/Gene/i) >= 0) n = "Transcripts,Proteins";
	else if(type.search(/Isolate/i) >= 0) n = "Isolates";
	else if(type.search(/Assembly/i) >= 0) n = "Assemblies";
	else if(type.search(/ESTsBy/i) >= 0) n = "EST";
	else if(type.search(/ORF/i) >= 0) n = "ORF";
	else if(type.search(/Genomic/i) >= 0) n = "Genome,GenomeSurveySequences";

	var y = document.getElementsByName("type");
	n = n.split(",");
	for(var x=0; x < y.length;x++){
		var d = false;
		for(m in n){
		//	alert("x=" +x+"\ny[x].id="+y[x].id+"\nm="+m+"\nn[m]="+n[m]);
			if(y[x].id == "BlastType_" + n[m]){
				d = true;
			}
		}
		if(d){
			y[x].disabled = false;
			document.getElementById("type_" + y[x].id).style.color="black";
			document.getElementById("type_" + y[x].id).style.fontWeight="200";
		}else{
			y[x].disabled = true;
			document.getElementById("type_" + y[x].id).style.color="grey";
			document.getElementById("type_" + y[x].id).style.fontWeight="200";
		}
	}
}

function clickDefault(id, name){
	var type = "";
	var types = document.getElementsByName(name);
	for(var x = 0; x < types.length; x++){
		if(types[x].value == id)
			types[x].click();
	}	
}

function enableRadioArray(name,id){
	var type = "";
	document.getElementById('blastAlgo').value = id;
	var types = document.getElementsByName(name);
	for(var x = 0; x < types.length; x++){
		if(types[x].value == id){
			types[x].disabled = false;
			types[x].checked = true;
		}
	}	
}

function parseUrl(name){
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
 	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );
	if( results == null )
		return "";
	else
		return results[1];
}


function changeQuestion(){
        // stores mapping from blast databases to questions	
	var blastDb = "";
	var types = document.getElementsByName('type');
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

function updateOrganism(){
	var orgValue = "";
	var orgSelect = document.getElementById('BlastOrganism');
	for(var i=0;i<orgSelect.length;i++){
		var op = orgSelect[i];
		if(op.selected){
			orgValue = orgValue + "," + op.value;
		}
	}
	document.getElementById('blastOrg').value = orgValue.substring(1);
}

function getOrganismTerms(){
	var type = "";
	var types = document.getElementsByName('type');
	for(var x = 0; x < types.length; x++){
		if(types[x].checked)
			type = types[x].value;
	}
	document.getElementById('blastType').value = type;
	if(type == 'EST') {
		sendReqUrl = ESTUrl; 
		selectedArray = 'EST';
	}
	else if(type == 'Genome Survey Sequences') {
		sendReqUrl = GSSUrl; 
		selectedArray = 'GSS'; 
	}
	else if(type == 'Genome') {
		sendReqUrl = SequenceUrl; 
		selectedArray = 'Genome'; 
	}
	else if(type == 'Transcripts' || type == 'Proteins') {
		sendReqUrl = GeneUrl; 
		selectedArray = 'Transcripts';
	}
	else if(type == 'Isolates') {
		sendReqUrl = IsolateUrl; 
		selectedArray = 'Isolates';
	}
	else if(type == 'Assemblies') {
		sendReqUrl = AssemblyUrl; 
		selectedArray = 'Assemblies';
	}
	else if(type == 'ORF') {
		sendReqUrl = ORFUrl; 
		selectedArray = 'ORF';
	}

  if(getArray(selectedArray).length > 0){
				
		fillSelectFromXML(null, 'BlastOrganism', selectedArray);
		updateOrganism();	
		return;
	}

  getAndWrite(sendReqUrl, 'BlastOrganism');	
}


function getBlastAlgorithm() {
	var label = "";
  var type = "";
	/*for(var x = 0; x < document.getElementsByName('type').length; x++){
		if(document.getElementById('BlastType_'+x).checked)
			type = document.getElementById('BlastType_'+x).value;
	}*/
	types = document.getElementsByName('type');

    for(var t = 0; t < document.getElementsByName('type').length; t++){
		if(types[t].checked)
			type = types[t].value;
	}
	document.getElementById('blastType').value = type;
		
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
  if(getArray(selectedArray).length > 0){
		fillDivFromXML(null, 'BlastAlgorithm', selectedArray);
		clearList('BlastOrganism');
		getOrganismTerms();
		return;
	} 
	getAndWrite(sendReqUrl, 'BlastAlgorithm');
  clearList('BlastOrganism');
}

function getBlastTerms() {
	var label = "";
        var algorithm = "";
	for(var x = 0; x < document.getElementsByName('algorithm').length; x++){
		if(document.getElementById('BlastAlgorithm_'+x).checked)
			algorithm = document.getElementById('BlastAlgorithm_'+x).value;
	}
	document.getElementById('blastAlgo').value = algorithm;
	if(algorithm.indexOf('t') < 2) {
		sendReqUrl = TblastUrl; 
		selectedArray = 'T';
		if(algorithm.indexOf('n') == algorithm.length-1) {label = "Protein Sequence";}
		else if(algorithm.indexOf('x') == algorithm.length-1) {label = "Nucleotide Sequence";}
	}
	else if(algorithm.indexOf('p') == algorithm.length-1 || algorithm.indexOf('x') == algorithm.length-1 ){
		sendReqUrl = blastPXUrl; 
		selectedArray = 'PX';
		if(algorithm.indexOf('x') == algorithm.length-1) {label = "Nucleotide Sequence";}
		else if(algorithm.indexOf('p') == algorithm.length-1) {label = "Protein Sequence";}
	}
	else if(algorithm.indexOf('n') == algorithm.length-1){
		sendReqUrl = blastNUrl; 
		selectedArray = 'N';
		label = "Nucleotide Sequence";
	}
	document.getElementById('parameter_label').innerHTML = "<b>"+label+"</b>";
    if(getArray(selectedArray).length > 0){
		fillDivFromXML(null, 'BlastDatabaseType', selectedArray);
		clearList('BlastOrganism');
		return;
	}
    getAndWrite(sendReqUrl, 'BlastDatabaseType');
    clearList('BlastOrganism');
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
				if(elementId == 'BlastDatabaseType' || elementId == 'BlastAlgorithm'){ 
					fillDivFromXML( xmlObj.responseXML, elementId, selectedArray);
					getOrganismTerms();
				}
				else{
					fillSelectFromXML( xmlObj.responseXML, elementId, selectedArray);
					updateOrganism();	
				}
			}else{
				alert("Message returned, but with an error status");
			}			
		 }
	}
	xmlObj.open( 'GET', sendReqUrl, true );
	xmlObj.send('');
}

function fillSelectFromXML(obj, id, index)
{
  clearList(id);
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
	var sA = document.getElementById(id);
	sA.disabled = false;
	if( ArrayLength != 0 ){
		for( var x = 0; x < ArrayLength; x++ ){
			term = new String( defArray[x].firstChild.data );
			var option = new Option();
			option.text = term;
			option.value = term;
			if(revise == true && Rorganism != null){
				for(var o in Rorganism){
					if(term == Rorganism[o]) option.selected = true;
				}
			}else if(x == 0) {option.selected = true;}
			sA.options[x] = option;
		}
	}else{
		alert("No Data Returned From the Server!!");
	}
	revise = false;	
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

function clearList(id) {document.getElementById(id).options.length = 0;}
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
function getArrayElement(term,name){	
	var radioArray = document.getElementsByName(name);
	for(var y = 0; y < radioArray.length; y++){
			if(radioArray[y].id == 'BlastAlgorithm_'+term) return radioArray[y];
	}
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
	document.getElementById('blastOrg').value = "";
}

function changeLabel(){	
	var algorithm = "";
	var algos = document.getElementsByName('algorithm');
	for(var y = 0; y < algos.length; y++){
		if(algos[y].checked)
			algorithm = algos[y].value;
	}
	document.getElementById('blastAlgo').value = algorithm;

	if(algorithm.indexOf('t') < 2) {
		if(algorithm.indexOf('n') == algorithm.length-1) {label = "Protein Sequence";}
		else if(algorithm.indexOf('x') == algorithm.length-1) {label = "Nucleotide Sequence";}
	}
	else if(algorithm.indexOf('p') == algorithm.length-1 || algorithm.indexOf('x') == algorithm.length-1 ){
		if(algorithm.indexOf('x') == algorithm.length-1) {label = "Nucleotide Sequence";}
		else if(algorithm.indexOf('p') == algorithm.length-1) {label = "Protein Sequence";}
	}
	else if(algorithm.indexOf('n') == algorithm.length-1){
		label = "Nucleotide Sequence";
	}
	document.getElementById('parameter_label').innerHTML = "<b>"+label+"</b>";
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
		}else{
			document.getElementById('short_sequence_warning').innerHTML = "";
		}
	}else{
		document.getElementById('short_sequence_warning').innerHTML = "";
	}
}

function selectAll_None_Blast(val){
	var orgSel = document.getElementById('BlastOrganism');
	var orgs = orgSel.options;
	for(i=0;i<orgs.length;i++){
		orgs[i].selected = val;
	}
	updateOrganism();
}
 
