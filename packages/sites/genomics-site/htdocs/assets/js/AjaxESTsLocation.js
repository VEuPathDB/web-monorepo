
var all_sites = sites.toString();
var all_libs = new Array(sites.length);
var all_orgs = getAllOrgs(sites);
var chromosome_Array = new Array();
var crypto_data = new Array();
var plasmo = new Array();
var toxo = new Array();

window.onload = function (){
	fillArrays();
	//document.getElementById('sequenceId_chromo').disabled = true;
	loadOrganisms('showRecord.do?name=AjaxRecordClasses.ChromosomeTermClass&primary_key=organismVQ.withChromosomesESTsAssems:'+all_sites,'orgSelect',chromosome_Array, sites);
	chooseType('sequenceId','CHROMOSOME');
}

function fillArrays(){
//	var sendReqUrl= 'Snp.xml';
	var libUrl = 'showRecord.do?name=AjaxRecordClasses.ESTTermClass&primary_key=SharedVQ.EstLibraries:';
	var chromoUrlEnum = 'showRecord.do?name=AjaxRecordClasses.ChromosomeTermClass&primary_key=sharedParams.chromosomeOptional:';
	var chromoUrlFlat = 'showRecord.do?name=AjaxRecordClasses.ChromosomeTermClass&primary_key=SharedVQ.TrypChromosomePortal:';
	for(var i=0;i<sites.length;i++){
		all_libs[i] = new Array();
		//alert (sites[i] + ": getting libraries");
		AjaxCall(libUrl + sites[i], all_libs[i]);
		chromosome_Array[i] = new Array();
		if ( (sites[i] == "Leishmania") || (sites[i] == "Trypanosoma") )
			AjaxCall(chromoUrlFlat + sites[i],chromosome_Array[i]);
		else
			AjaxCall(chromoUrlEnum + sites[i],chromosome_Array[i]);
	}
}

function chooseType(paramName, type) {
    // disable inputs accordingly
   if (type == 'CHROMOSOME') {
        var org = document.getElementById('orgSelect');
		var chromo = document.getElementById(paramName + '_chromo');
        var organism = document.getElementById('organism');
		var chromosome = document.getElementById('chromosomeOptional');
		var contig = document.getElementById(paramName + '_contig');
        var genomicSeq = document.getElementById('sequenceId');
		chromo.disabled = false;
        org.disabled = false;       
		contig.disabled = true;
		organism.value = org.options[org.selectedIndex].value;// alert("1 done");
		genomicSeq.value = "choose one";
		chromosome.value = chromo.options[chromo.selectedIndex].value; //alert("2 done");
		loadStrains();
    } else if (type == 'CONTIG') {
        var org = document.getElementById('orgSelect');
		var chromo = document.getElementById(paramName + '_chromo');
        var organism = document.getElementById('organism');
		var chromosome = document.getElementById('chromosomeOptional');
		var contig = document.getElementById(paramName + '_contig');
        var genomicSeq = document.getElementById('sequenceId');
		document.getElementById('libraryId').options.length = 0;
		var bigArray = joinArrays(all_libs);
		fillSelectFromArray(bigArray,'libraryId');
		chromo.disabled = true;
        org.disabled = true;
		contig.disabled = false;
		organism.value = all_orgs;
		chromosome.value = "choose one"; 
		genomicSeq.value = contig.value;
	}
}

function loadStrains(){	
	clearlists('libraryId');
	clearlists('sequenceId_chromo');
	var id = document.getElementById('orgSelect').value;
	var text = document.getElementById('orgSelect').options[document.getElementById('orgSelect').selectedIndex].text;

	if(document.getElementById('orgSelect').options[0].value == '--') {document.getElementById('orgSelect').remove(0);}
	document.getElementById('organism').value = text;
	fillSelectFromArray(chromosome_Array[id],'sequenceId_chromo');
	fillSelectFromArray(all_libs[id],'libraryId');
	
	var s = document.getElementById('sequenceId_chromo');
   	document.getElementById('chromosomeOptional').value = s.options[0].value;
}
