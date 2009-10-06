
var chromosome_Array = new Array();
var strain_A_Array = new Array();
var strain_B_Array = new Array();

//window.onload = 
function initSNPLoc(){
	fillArrays();
	loadOrganisms('showRecord.do?name=AjaxRecordClasses.ChromosomeTermClass&primary_key=organismVQ.withChromosomesSNPs:Cryptosporidium parvum,Plasmodium falciparum,Toxoplasma gondii','orgSelect',chromosome_Array,sites);
}

function fillArrays(){
	chromo_url = 'showRecord.do?name=AjaxRecordClasses.ChromosomeTermClass&primary_key=sharedParams.chromosomeOptional:';	
    snp_A_url = 'showRecord.do?name=AjaxRecordClasses.SnpStrainATermClass&primary_key=sharedParams.snp_strain_a:';
	snp_B_url = 'showRecord.do?name=AjaxRecordClasses.SnpStrainBTermClass&primary_key=sharedParams.snp_strain_m:';
    
	for(var i=0;i<sites.length;i++){
		chromosome_Array[i] = new Array();
		strain_A_Array[i] = new Array();
		strain_B_Array[i] = new Array();
		AjaxCall(chromo_url + sites[i], chromosome_Array[i]);
		AjaxCall(snp_A_url + sites[i], strain_A_Array[i]);
		AjaxCall(snp_B_url + sites[i], strain_B_Array[i]);
	}		
}

function changeLists(){
	var id = document.getElementById('orgSelect').value;
	var text = document.getElementById('orgSelect').options[document.getElementById('orgSelect').selectedIndex].text;
	clearlists('chromoSelect');
	clearlists('StrainM');
	clearlists('StrainA');
	fillSelectFromArray(chromosome_Array[id],'chromoSelect');
	fillSelectFromArray(strain_A_Array[id],'StrainA');
	fillSelectFromArray(strain_B_Array[id],'StrainM');
    updateSelectInput('chromosomeOptional','chromoSelect');
	document.getElementById('orgText').value = text;
}

function loadStrains(){changeLists();}
