var openDetail = null;
var isInsert = "";

$("#diagram").ready(function(){
	$("div.diagram:first div.venn:last span.resultCount a").click();
});

function showDetails(det){
	openDetail = $(det).parent().parent().find("h3 div.crumb_details");
	var parent = openDetail.parent().parent();
	var diagram = parent.parent();
	var dId = $(diagram).attr("id").substring(8);
	dId = parseInt(dId);
	var disp = openDetail.attr("disp");
	$("#strategy_results").children("div.crumb_details").each(function(){
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
			det2.draggable({
				handle: '.dragHandle',
				containment: 'parent'
			});
			//det2.jqDrag(".crumb_menu");
		
//		l = parent.css("left");
//		t = parent.css("top");
//		l = l.substring(0,l.indexOf("px"));
//		t = t.substring(0,t.indexOf("px"));
//		l = parseInt(l) + 53;//58;
//		t = parseInt(t) + 50;//255;
		l = 276;
		t = 114;
		det2.css({
			left: l + "px",
			top: t + "px",
			display: "block"
		});
		det2.appendTo("#strategy_results");
	}
	else{
		openDetail.attr("disp","0");
	}
}

function hideDetails(det){
	openDetail.attr("disp","0");
	openDetail = null;
	
	$("#strategy_results").children("div.crumb_details").each(function(){
		$(this).remove();	
	});
}

function Edit_Step(ele, questionName, url, hideQuery, hideOp){
	//	hideDetails();
		url = "showQuestion.do?questionFullName=" + questionName + url;
		$("#query_form").remove();
	//	var link = $(".filter_link");
	//	$(link).css({opacity:0.2});
	//	$(link).attr("href","javascript:void(0)");
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
				$("#strategy_results").append($(d).html());
				formatFilterForm(data,1,reviseStepNumber, hideQuery, hideOp);
			},
			error: function(data, msg, e){
				alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReload this page might solve the problem. \nOtherwise, please contact site support.");
			}
		});
		$(this).parent().parent().hide();
}

function Insert_Step(ele,dt){
	//$(ele).parent().parent().hide();
	var sNumber = $(ele).attr("id");
	sNumber = sNumber.split("|");
	isInsert = sNumber[1];
	current_Front_Strategy_Id = sNumber[0];
	openFilter(dt,sNumber[0],sNumber[1],false);
}
var a_link;
function Rename_Step(ele, strat, stpId){
	a_link = $("#diagram_" + strat + " div#step_" + stpId + "_sub h3 a#stepId_" + stpId, $(ele).parent().parent().parent());
	old_name = $(a_link).parent().find("#fullStepName").text();
	var input = document.createElement('input');
	$(input).attr("id","new_name_box").attr("value",old_name).blur(function(){RenameStep(this,strat,stpId)}).focus(function(){this.select();}).keypress(function(event){checkEnter(this,event)}).attr("size","10");
	$("#diagram_" + strat + " div#step_" + stpId + "_sub h3 a#stepId_" + stpId, $(ele).parent().parent().parent()).replaceWith(input);
	$("#new_name_box").focus();
}

function RenameStep(ele, s, stp){
	var a = $(ele).parent();
	var new_name = $(ele).val();
	step = getStep(s, stp);
	var url = "renameStep.do?strategy=" + getStrategy(s).backId + "&stepId=" + step.back_step_Id + "&customName=" + new_name;	
	$.ajax({
			url: url,
			dataType: "html",
			success: function(data){
				data = eval("(" + data + ")");
				getStrategy(s).checksum = data.strategies[getStrategy(s).backId];
				$("#fullStepName",a).text(new_name);
				a_link.text((new_name.length > 14)?new_name.substring(0,12) + "...":new_name);
				//a.text(new_name);
				$("input",a).replaceWith(a_link);
				var par = $(a);
				cur = $("div.crumb_details div.crumb_menu a.expand_step_link", par);
				// Only update expand link if it's not the first step.
				if (cur.length != 0){
					cur = cur[0].attributes[0].nodeValue;
					cur = cur.substring(0, cur.lastIndexOf(",")) + ",\"Expanded " + new_name + "\");hideDetails(this)";
					$("div.crumb_details div.crumb_menu a.expand_step_link", par)[0].attributes[0].nodeValue = cur;
				}
			},
			error: function(data, msg, e){
				alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReload this page might solve the problem. \nOtherwise, please contact site support.");
			}
		});
}

function Expand_Step(ele, url){
	$(ele).parent().parent().hide();
	ExpandStep(url);
}

// Utility Functions


