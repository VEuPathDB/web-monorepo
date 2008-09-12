var curLink;

$(document).ready(function() {
	translateFilterLinks();
});

function toggleAdvanced() {
	var text = $("a#toggle_filter").text();
	var html = $("a#toggle_filter").html();

	if (text = "Show") {
		$("a#toggle_filter").html("Hide");
		$("div#advanced_filters").removeClass("hidden");
		$("a.filter_link.hidden").removeClass("hidden");
		$("#toggle_filter").parent("div.clear_all").html("<span id='toggle_filter'>Hide</span> comparison of similarities and differences between strains.</div>");
		translateFilterLinks();
	}
	else {
		$("a#toggle_filter").html("Show");
		$("div#advanced_filters").addClass("hidden");
	}

	saveParameter("filters_param", text);
}
		
function translateFilterLinks() {
	curLink = $("a.filter_link:first");
	curLink.removeClass("filter_link");
	var url = curLink.attr("href");
	if (url && !curLink.hasClass("hidden")) {
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
				curLink.html("Error");
				translateFilterLinks();
			}
		});
	}
	else {
		$("#toggle_filter").parent("div.clear_all").html("<a id='toggle_filter' href='javascript:void(0);' onclick='toggleAdvanced();'>" + $("#toggle_filter").text() + "</a> comparison of similarities and differences between strains.</div>");
	}
}
