
var all_sites = sites.toString();

var all_orgs = getAllOrgs(sites);

var dataArray = new Array(sites.length);

var sendReqUrl = 'showRecord.do?name=AjaxRecordClasses.ChromosomeTermClass&primary_key=sharedParams.chromosomeOptional2:';

//window.onload = 
function initSTLoc() {
	for(var i=0;i<sites.length;i++){
		dataArray[i] = new Array();
		AjaxCall(sendReqUrl + sites[i],dataArray[i]);
	}
	loadOrganisms('showRecord.do?name=AjaxRecordClasses.ChromosomeTermClass&primary_key=organismVQ.tg-pf:'+all_sites,'orgSelect', dataArray, sites);
	document.getElementById('sequenceId_chromo').disabled = true;
	chooseType('sequenceId','CHROMOSOME');
}

function chooseType(paramName, type) {
   if (type == 'CHROMOSOME') {
        var org = document.getElementById('orgSelect');
		var chromo = document.getElementById(paramName + '_chromo');
        var organism = document.getElementById('organism');
		var chromosome = document.getElementById('chromosomeOptional2');
		var contig = document.getElementById(paramName + '_contig');
        var genomicSeq = document.getElementById('sequenceId');
		chromo.disabled = false;
        org.disabled = false;       
		contig.disabled = true;
		organism.value = org.options[org.selectedIndex].value;// alert("1 done");
		genomicSeq.value = "choose one";
		chromosome.value = chromo.options[chromo.selectedIndex].value; //alert("2 done");
    } else if (type == 'CONTIG') {
        var org = document.getElementById('orgSelect');
		var chromo = document.getElementById(paramName + '_chromo');
        var organism = document.getElementById('organism');
		var chromosome = document.getElementById('chromosomeOptional2');
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
	document.getElementById('organism').value = text;
	
	fillSelectFromArray(dataArray[id],'sequenceId_chromo');
}
