
$(function() {
	$('#form_question').submit(checkIsolateInputs);
});


function checkIsolateInputs (){
    var count = 0;
    for (var i = 0; i < $('#form_question input[name*=htsSnp_isolates]').size(); i++) {

        if($('#form_question input[name*=htsSnp_isolates]')[i].checked) {
            count++;
        }
    }

    if(count < 3) {
        alert("WARNING:  You must choose at least 3 Isolates.  Please try again.");
        return(false);
    }

    return(true);
}
