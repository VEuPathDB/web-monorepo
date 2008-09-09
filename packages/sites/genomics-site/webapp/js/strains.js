var curLink;
//var curLink = [];

$(document).ready(function() {
	translateFilterLinks();
	// OLD WAY, BULK LOAD
	//$("a.filter_link").each(function(i) {
	//	var url = $(this).attr("href");
	//	curLink[i] = $(this);
	//	$.ajax({
	//		url: url,
	//		dataType: "html",
	//		success: function(data){
	//			curLink[i].attr("href", $(data).attr("href"));
	//			curLink[i].html($(data).text());
	//			curLink[i].attr("class", "");
	//		},
	//		error: function(data, msg, e){
	//			curLink[i].attr("disabled", "yes");
	//			curLink[i].attr("Error");
	//			//alert("ERROR \n " + msg + "\n" + e);
	//		}
	//	});
	//});
});

function toggleAdvanced() {
	var text = $("a#toggle_filter").text();
	var html = $("a#toggle_filter").html();
	if (text == "Show") {
		$("a#toggle_filter").html("Hide");
		$("div#advanced_filters").removeClass("hidden");
		translateFilterLinks();
	}
	else {
		$("a#toggle_filter").html("Show");
		$("div#advanced_filters").addClass("hidden");
	}
}
		
function translateFilterLinks() {
	curLink = $("a.filter_link:first");
	if (curLink) {
		var url = curLink.attr("href");
		$.ajax({
			url: url,
			dataType: "html",
			success: function(data){
				curLink.attr("href", $(data).attr("href"));
				curLink.html($(data).text());
				curLink.attr("class", "");
				translateFilterLinks();
			},
			error: function(data, msg, e){
				curLink[i].attr("disabled", "yes");
				curLink[i].attr("Error");
				//alert("ERROR \n " + msg + "\n" + e);
			}
		});
	}
	// OLD WAY, BULK LOAD
	//$("a.advanced_filter_link").each(function(i) {
	//	var url = $(this).attr("href");
	//	curLink[i] = $(this);
	//	$.ajax({
	//		url: url,
	//		dataType: "html",
	//		success: function(data){
	//			curLink[i].attr("href", $(data).attr("href"));
	//			curLink[i].html($(data).text());
	//			curLink[i].attr("class", "");
	//		},
	//		error: function(data, msg, e){
	//			alert("ERROR \n " + msg + "\n" + e);
	//		}
	//	});
	//});
}
