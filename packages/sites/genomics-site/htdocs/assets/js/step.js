$("#diagram").ready(function(){
	$("div.diagram:first div.venn:last span.resultCount a").click();
});

function showDetails(det){
	det = $(det).parent().parent().find("h3 div.crumb_details");
	var disp = det.css("display");
	var crumb_details = $("#diagram h3 div.crumb_details");
	for(i=0;i<crumb_details.length;i++){
		if($(crumb_details[i]).css("display") == "block")
			$(crumb_details[i]).css("display", "none");
	}
	if(disp == "none")
		det.show();
	else
		det.hide();
}

function hideDetails(det){
	det = $(det).parent().parent().parent();
	det.hide();
}

function Edit_Step(ele,url){
		$(ele).parent().parent().hide();
		var link = $(".filter_link");
		$(link).css({opacity:0.2});
		$(link).attr("href","javascript:void(0)");
		hideDetails();
		var revisestep = $(ele).attr("id");
		var parts = revisestep.split("|");
		var strat = parts[0];
		revisestep = parseInt(parts[1]);
		var operation = parts[2];
		var reviseStepNumber = strat + ":" + revisestep + ":0:0:" + operation;
		$.ajax({
			url: url,
			dataType: "html",
			success: function(data){
				formatFilterForm(data,1,reviseStepNumber);
			},
			error: function(data, msg, e){
				alert("ERROR \n "+ msg + "\n" + e);
			}
		});
		$(this).parent().parent().hide();
}

function Insert_Step(ele,url){
	$(ele).parent().parent().hide();
	var sNumber = $(ele).attr("id");
	sNumber = sNumber.split("|");
	openFilter(sNumber[0] + ":" + sNumber[1]);
}

function Rename_Step(ele){
	$(ele).parent().parent().hide();
	var link = $(ele).parent().parent().parent().find("a:first");
	link.html("<input id='new_name_box' type='text' value='"+link.text()+"' onblur='RenameStep(this)' onfocus='this.select()' onkeypress='blah(this,event)' size='10'/>");
	$("#new_name_box").focus();
}

function RenameStep(ele){
	var a = $(ele).parent();
	var new_name = $(ele).val();
	var x = $(ele).parent().attr("id");
	x = x.substring(7);
	var url = "renameStep.do?stepId=" + x + "&customName=" + new_name;	
	if(new_name.length > 14)
		new_name = new_name.substring(0,12) + "...";	
	$.ajax({
			url: url,
			dataType: "html",
			success: function(data){
				a.text(new_name);
			},
			error: function(data, msg, e){
				alert("ERROR \n "+ msg + "\n" + e);
			}
		});
}

function Expand_Step(ele, url){
	$(ele).parent().parent().hide();
	ExpandStep(url);
}

// Utility Functions

function blah(ele,evt){
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


