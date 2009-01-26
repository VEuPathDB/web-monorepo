$("#diagram").ready(function(){
	$("div.diagram:first div.venn:last span.resultCount a").click();
});

var openDetail = null;

function showDetails(det){
	openDetail = $(det).parent().parent().find("h3 div.crumb_details");
	var parent = openDetail.parent().parent();
	var diagram = parent.parent();
	var disp = openDetail.attr("disp");
	$("#Strategies").children("div.crumb_details").each(function(){
		$(this).remove();	
	});
	$("div.crumb_details", diagram).each(function(){
		$(this).attr("disp","0");
	})
	
	if(disp == "0"){
		openDetail.attr("disp","1");
		var det2 = openDetail.clone();
			det2.addClass("jqDnR");
			det2.find(".crumb_menu").addClass("dragHandle");
			det2.jqDrag(".crumb_menu");
		
		l = parent.css("left");
		t = parent.css("top");
		l = l.substring(0,l.indexOf("px"));
		t = t.substring(0,t.indexOf("px"));
		l = parseInt(l) + 58;
		t = parseInt(t) + 255;
		det2.css({
			left: l + "px",
			top: t + "px",
			display: "block"
		});
		det2.appendTo("#Strategies");
	}
	else{
		openDetail.attr("disp","0");
	}
}

function hideDetails(det){
	openDetail.attr("disp","0");
	openDetail = null;
	
	$("#Strategies").children("div.crumb_details").each(function(){
		$(this).remove();	
	});
}

function Edit_Step(ele, questionName, url){
	//	hideDetails();
		url = "showQuestion.do?questionFullName=" + questionName + url;
		var link = $(".filter_link");
		$(link).css({opacity:0.2});
		$(link).attr("href","javascript:void(0)");
		var revisestep = $(ele).attr("id");
		var parts = revisestep.split("|");
		var strat = parts[0];
		current_Front_Strategy_Id = parts[0];
		revisestep = parseInt(parts[1]);
		var operation = parts[2];
		var reviseStepNumber = strat + ":" + revisestep + ":0:0:" + operation;
		$.ajax({
			url: url,
			dataType: "html",
			success: function(data){
				d = document.createElement('div');
				qf = document.createElement('div');
				$(qf).attr("id","query_form").addClass("jqDnR");
				$(d).append(qf);
				$("#Strategies").append(d);
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

function Rename_Step(ele, strat, stpId){
	var link = $("#diagram_" + strat + " div#step_" + stpId + "_sub h3 a#stepId_" + stpId, $(ele).parent().parent().parent());
	link.hide();
	link.after("<input id='new_name' type='text' value='"+link.text()+"' onblur='RenameStep(this, " + strat + "," + stpId +")' onfocus='this.select()' onkeypress='blah(this,event)' size='10'/>");
	$("#new_name").focus();
}

function RenameStep(ele, s, stp){
	var new_name = $(ele).val();
	step = getStep(s, stp);
	var url = "renameStep.do?stepId=" + step.back_step_Id + "&customName=" + new_name;	
	if(new_name.length > 14)
		new_name = new_name.substring(0,12) + "...";	
	$.ajax({
			url: url,
			dataType: "html",
			success: function(data){
				var link = $("#diagram_" + s + " div#step_" + stp + "_sub h3 a#stepId_" + stp);
				$(link).text(new_name);
				$(ele).remove();
				$(link).show();
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


