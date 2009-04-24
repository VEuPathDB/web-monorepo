//show the loading icon in the upper right corner of the strategy that is being operated on
function showLoading(divId){
	var d = null;
	var l = 0;
	var t = 0;
	if(divId == undefined){
		d = $("#Strategies");
		le = "225px";
		t = "40px";
		l_gif = "loading.gif";
		sz = "45";
	}else{
		d = $("#diagram_" + divId);
		le = "10px";
		t = "10px";
		l_gif = "loading2.gif";
		sz = "35";
	}
	var l = document.createElement('span');
	$(l).attr("id","loadingGIF");
	var i = document.createElement('img');
	$(i).attr("src","/assets/images/" + l_gif);
	$(i).attr("height",sz);
	//$(l).html("<p style='position:relative;top:-17px;z-index:300'>Loading...</p>");
	$(l).prepend(i);
	$(l).css({
		"text-align": "center",
		position: "absolute",
		left: le,
		top: t
	});
	$(d).append(l);
}

// remove the loading icon for the given strategy
function removeLoading(divId){
	if(divId == undefined)
		$("#Strategies span#loadingGIF").remove();
	else
		$("#diagram_" + divId + " span#loadingGIF").remove();
}

// parses the inputs of the question form to be sent via ajax call
function parseInputs(){
	var quesForm = $("form[name=questionForm]");
	var inputs = $("input, textarea", quesForm);
	var selects = $("select", quesForm);

        // Jerric - use ajax to serialize the form data
	var d = quesForm.serialize();
        return d;
}

function checkEnter(ele,evt){
	var charCode = (evt.which) ? evt.which : evt.keyCode;
	if(charCode == 13) $(ele).blur();
}

function parseUrl(name,url){
 	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
 	var regexS = "[\\?&]"+name+"=([^&#]*)";
 	var regex = new RegExp( regexS,"g" );
 	var res = new Array();
 	//while (regex.lastIndex < url.length){
 		var results = regex.exec( url );
 		if( results != null )
 			res.push(results[1]);
 	//	else
 	//		break;
 	//}
 	if(res.length == 0)
 		return "";
 	else
 		return res;
}
