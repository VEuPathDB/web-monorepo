
var all_sites = sites.toString();

var all_orgs = getAllOrgs(sites);

var dataArray = new Array(sites.length);

// Because wdkqueryplugin currently only handles enum params, 
//        here we need to be explicit with flat vocabs: indicate the queryRef
//        the model defines a flatvocab for TriTryp for chromosomeOptional (to obtain the chromosome values)
var sendReqUrlEnum = 'showRecord.do?name=AjaxRecordClasses.ChromosomeTermClass&primary_key=sharedParams.chromosomeOptional:';
var sendReqUrlFlatTryp = 'showRecord.do?name=AjaxRecordClasses.ChromosomeTermClass&primary_key=SharedVQ.TrypChromosomePortal:';
var sendReqUrlFlatMicro = 'showRecord.do?name=AjaxRecordClasses.ChromosomeTermClass&primary_key=SharedVQ.MicroChromosomePortal:';

// If site is TriTrypDB, or Micro  use the flat vocab ajax call
//window.onload = function() { initLocation(); }
function initLocation() {
	for(var i=0;i<sites.length;i++){
		dataArray[i] = new Array();
	//	alert(sites[i]);
		if ( (sites[i] == "Leishmania") || (sites[i] == "Trypanosoma" ) )
			AjaxCall(sendReqUrlFlatTryp + sites[i],dataArray[i]);
		else 	if ( (sites[i] == "Encephalitozoon" ) )
			AjaxCall(sendReqUrlFlatMicro + sites[i],dataArray[i]);
		else 
			AjaxCall(sendReqUrlEnum + sites[i],dataArray[i]);
	}
	loadOrganisms('showRecord.do?name=AjaxRecordClasses.ChromosomeTermClass&primary_key=organismVQ.withChromosomes:'+all_sites,'orgSelect', dataArray, sites);
//	document.getElementById('sequenceId_chromo').disabled = true;
//	chooseType('sequenceId','CHROMOSOME');
}

function chooseType(paramName, type) {
   if (type == 'CHROMOSOME') {
        var org = document.getElementById('orgSelect');
		var chromo = document.getElementById(paramName + '_chromo');
        var organism = $("input#organism");
		if(organism == undefined) 
			organism = document.getElementsByName('myProp(organism)')[0];
		else
			organism = organism[0];
		var chromosome = document.getElementById('chromosomeOptional');
		var contig = document.getElementById(paramName + '_contig');
        var genomicSeq = document.getElementById('sequenceId');
		chromo.disabled = false;
        org.disabled = false;       
		contig.disabled = true;
		organism.value = org.options[org.selectedIndex].text;// alert("1 done");
		genomicSeq.value = "choose one";
		chromosome.value = chromo.options[chromo.selectedIndex].text; //alert("2 done");
    } else if (type == 'CONTIG') {
        var org = document.getElementById('orgSelect');
		var chromo = document.getElementById(paramName + '_chromo');
        var organism = $("input#organism");
		if(organism == undefined) 
			organism = document.getElementsByName('myProp(organism)')[0];
		else
			organism = organism[0];
		var chromosome = document.getElementById('chromosomeOptional');
		var contig = document.getElementById(paramName + '_contig');
        var genomicSeq = document.getElementById('sequenceId');
		chromo.disabled = true;
        org.disabled = true;
		contig.disabled = false;
		organism.value = all_orgs;
		chromosome.value = "choose one"; 
		genomicSeq.value = contig.value;
	}
}

function loadStrains(){	
	clearlists('sequenceId_chromo');
	var id = document.getElementById('orgSelect').value;
	var text = document.getElementById('orgSelect').options[document.getElementById('orgSelect').selectedIndex].text;
	if(document.getElementById('orgSelect').options[0].value == '--') {document.getElementById('orgSelect').remove(0);}
	var o = $("input#organism")[0];
	if(o == undefined) 
		o = document.getElementsByName('myProp(organism)')[0];
	o.value = text;
	fillSelectFromArray(dataArray[id],'sequenceId_chromo');
}
