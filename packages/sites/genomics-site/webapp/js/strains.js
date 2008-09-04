var curLink = [];

$(document).ready(function() {
	$("a.filter_link").each(function(i) {
		var url = $(this).attr("href");
		curLink[i] = $(this);
		$.ajax({
			url: url,
			dataType: "html",
			success: function(data){
				curLink[i].attr("href", $(data).attr("href"));
				curLink[i].html($(data).text());
				curLink[i].attr("class", "");
			},
			error: function(data, msg, e){
				alert("ERROR \n " + msg + "\n" + e);
			}
		});
	});
});

function toggleAdvanced() {
	var text = $("a#toggle_filter").text();
	var html = $("a#toggle_filter").html();
	if (text == "Show") {
		$("a#toggle_filter").html("Hide");
		$("table#advanced_filters").removeClass("hidden");
		translateFilterLinks();
	}
	else {
		$("a#toggle_filter").html("Show");
		$("table#advanced_filters").addClass("hidden");
	}
}
		
function translateFilterLinks() {
	$("a.filter_link").each(function(i) {
		var url = $(this).attr("href");
		curLink[i] = $(this);
		$.ajax({
			url: url,
			dataType: "html",
			success: function(data){
				curLink[i].attr("href", $(data).attr("href"));
				curLink[i].html($(data).text());
				curLink[i].attr("class", "");
			},
			error: function(data, msg, e){
				alert("ERROR \n " + msg + "\n" + e);
			}
		});
	});
}
