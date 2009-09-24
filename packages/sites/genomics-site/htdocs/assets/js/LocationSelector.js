var chromoSel = "myMultiProp(chromosomeOptional)";
var sequence = "myProp(sequenceId)";
var org = "myMultiProp(organism)";

function changeType(type) {	
   	if (type == 'organism') {
		document.getElementById('sequenceId').disabled = true;
		document.getElementById('organism').disabled = false;
		document.getElementById('chromosomeOptional').disabled = false;
		document.getElementById('chromosomeOptional_holder').name = "holder";
		document.getElementById('organism_holder').name = "holder";
		document.getElementById('organism').name = org;
		document.getElementById('chromosomeOptional').name = chromoSel;
		document.getElementById('sequenceId').name = "none";
    } else if (type == 'sequenceId') {
		document.getElementById('sequenceId').disabled = false;
		document.getElementById('organism').disabled = true;
		document.getElementById('chromosomeOptional').disabled = true;
		document.getElementById('chromosomeOptional_holder').value = document.getElementById('chromosomeOptional').value;
		document.getElementById('chromosomeOptional_holder').name = document.getElementById('chromosomeOptional').name;
		document.getElementById('organism_holder').value = document.getElementById('organism').value;
		document.getElementById('organism_holder').name = document.getElementById('organism').name;
		document.getElementById('organism').name = "none";
		document.getElementById('chromosomeOptional').name = "none";
		document.getElementById('sequenceId').name = sequence;
	}
}

