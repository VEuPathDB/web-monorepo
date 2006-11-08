function changeQuestion(){

	var blastDb =  document.getElementById( 'BlastDatabaseType' ).value;

	var questionName;

	if (blastDb == "ESTs"){
		questionName = "EstQuestions.EstsBySimilarity";
	} else if (blastDb == "Genes: Proteins"){
		questionName = "GeneQuestions.GenesBySimilarity";
	} else if (blastDb == "Genes: Six frame translated CDSs"){
		questionName = "GeneQuestions.GenesBySimilarity";
	} else if (blastDb == "Genes: Transcripts"){
		questionName = "GeneQuestions.GenesBySimilarity";
	} else if (blastDb == "ORFs"){
		questionName = "OrfQuestions.OrfsBySimilarity";
	} else if (blastDb == "Sequences: Genome"){
		questionName = "GenomicSequenceQuestions.SequencesBySimilarity";
	} else {		
		alert("unknown blast database: " + blastDb);
	}

	document.getElementById( 'questionFullName' ).value = questionName;
}
