
$(document).ready(function(){

	$("div.crumb_details").hide();
	$("#filter_div").hide();
	$("#query_form").hide();
	$(".top_nav ul li a").click(function(){
		
		var url = $(this).attr("href");
		//$.get(url, function(data){
		//		$("#query_form").html(data);
		//	}
		//);
		$.ajax({
			url: url,
			dataType:"html",
			success: function(data){
				var proto = $("#proto").text();
				var historyId = $("#history_id").val();
				var close_link = "<a id='close_filter_query' href='javascript:close()'>close[x]</a>";
				var quesTitle = $("b font[size=+3]",data).parent().text().replace(/Identify Genes based on/,"");
				var quesForm = $("form",data);

				$("input[value=Get Answer]",quesForm).val("Run Filter");

				$("table:first",quesForm).prepend("<tr><td valign='top' align='right' style='padding: 5px 0;'><b>Operator</b></td><td><div id='operations'><ul><li class='opcheck'><input type='radio' name='myProp(booleanExpression)' value='" + historyId + " AND' checked='checked'/>&nbsp;AND&nbsp</li><li class='operation INTERSECT'/><li class='opcheck'><input type='radio' name='myProp(booleanExpression)' value='" + historyId + " OR'>&nbsp;OR&nbsp;</li><li class='operation UNION'/><li class='opcheck'><input type='radio' name='myProp(booleanExpression)' value='" + historyId + " NOT'>&nbsp;NOT&nbsp</li><li class='operation MINUS'/></ul></div></td></tr>");

				var action = quesForm.attr("action").replace(/processQuestion/,"processFilter");
					
				quesForm.prepend("<span id='question_title'>" + quesTitle + " Filter</span><br>"); 
				quesForm.prepend("<input name='myProp(protocol)' type='hidden' value='" + proto +"' />");
				quesForm.attr("action",action);
				$("#query_form").html(close_link);
				$("#query_form").append("<img class='dragHandle' alt='' src='images/HAND.png'/>");
				$("#query_form").append(quesForm);
				$("#query_selection").fadeOut("normal");
				$("#query_form").css({
					top: "163px",
					left: "140px"
				});
				$("#query_form").jqDrag(".dragHandle");
				$("#query_form").fadeIn("normal");
			},
			error: function(data, msg, e){
				alert("ERROR \n "+ msg + "\n" + e);
			}
		});
		$("#instructions").text("Choose an operation and fill in the parameters of your query then click run filter to see a new reuslts page with your filtered results.");
		return false;
	});
	
	$("#filter_link").click(function(){;
		if($(this).text() == "Create Filter"){
			$("#filter_div").fadeIn("normal");
			$(this).text("Cancel [X]");
	}else{
			$("#filter_div").fadeOut("normal");
			$("#query_selection").show();
			$("#query_form").hide();
			$(this).text("Create Filter");
	}
	});

	$(".crumb").bind("mouseenter",function(){
		$(".crumb_details",this).fadeIn("fast");
	}).bind("mouseleave",function(){
		$(".crumb_details",this).fadeOut("fast");
	});

//	$(".crumb_details").mouseover(function(){
//		$(this).filter(".crumb_detail").show();
//	}).mouseout(function(){
//		$(this).hide();
//	});
	
}); // End of Ready Function

function close(){
	$("#query_form").fadeOut("normal");
	$("#query_selection").fadeIn("normal");
	$("#instructions").text("Choose a query to use as a filter from the list below.  The individual queries will expad when you mouse over the categories");
}
