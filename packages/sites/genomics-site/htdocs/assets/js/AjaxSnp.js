
all_sites = sites.toString();

var strain_A_Array = new Array();
var strain_B_Array = new Array();

//window.onload = 
function initGeneSNP(){
	loadArrays();
	loadOrganisms('showRecord.do?name=AjaxRecordClasses.ChromosomeTermClass&primary_key=organismVQ.withChromosomesSNPs:'+all_sites,'orgSelect',strain_A_Array, sites);
}

function loadStrains(){
	clearlists('StrainA');
	clearlists('StrainB');
	var id = document.getElementById('orgSelect').value;
	var text = document.getElementById('orgSelect').options[document.getElementById('orgSelect').selectedIndex].text;
	if(document.getElementById('orgSelect').options[0].value == '--') {document.getElementById('orgSelect').remove(0);}
	fillSelectFromArray(strain_A_Array[id], 'StrainA');
	fillSelectFromArray(strain_B_Array[id], 'StrainB');
	document.getElementById('myOrg').value = text;
}

function loadArrays(){
    var urlA = 'showRecord.do?name=AjaxRecordClasses.SnpStrainATermClass&primary_key=sharedParams.snp_strain_a:';
	var urlB = 'showRecord.do?name=AjaxRecordClasses.SnpStrainBTermClass&primary_key=sharedParams.snp_strain_m:';
	for(var i=0; i<sites.length; i++){
		strain_A_Array[i] = new Array();
		strain_B_Array[i] = new Array();		
		AjaxCall(urlA + sites[i], strain_A_Array[i]);
		AjaxCall(urlB + sites[i], strain_B_Array[i]);
	}
}
