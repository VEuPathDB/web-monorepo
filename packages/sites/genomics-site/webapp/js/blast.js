function changeQuestion(){

        // stores mapping from blast databases to questions
	var blastDb =  document.getElementById( 'BlastDatabaseType' ).value.toLowerCase();

	var questionName;

	if (blastDb.indexOf("est") >= 0){
		questionName = "EstQuestions.EstsBySimilarity";
	} else 	if (blastDb.indexOf("orf") >= 0){
		questionName = "OrfQuestions.OrfsBySimilarity";
	} else 	if (blastDb.indexOf("genom") >= 0){
		questionName = "GenomicSequenceQuestions.SequencesBySimilarity";
	} else {
		questionName = "GeneQuestions.GenesBySimilarity";
	}

	document.getElementById( 'questionFullName' ).value = questionName;
}
