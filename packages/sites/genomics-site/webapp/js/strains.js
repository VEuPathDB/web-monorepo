var curLink;
var overFilter = 0;
var mouseX = 0;
var mouseY = 0;

$(document).ready(function() {
	translateFilterLinks();
});

$().mousemove(function(e) {
	mouseX = e.pageX;
	mouseY = e.pageY;
});	

function toggleAdvanced() {
	var text = $("a#toggle_filter").text();
	var html = $("a#toggle_filter").html();

	if (text == "Show") {
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

	savePreference("filters_param", text);
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
				var parent = curLink.parent();
				parent.html(data);
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

function displayDetails(filter) {
	if (overFilter != filter) hideAnyDetails();
	overFilter = filter;

	if (mouseX == 0 && mouseY == 0) return;

	var target = $("#div_" + filter);
	target.addClass("filter_details");
	target.css("top", mouseY+3);
	target.css("left", mouseX+3);
	target.removeClass("hidden");
}

function hideDetails(filter) {
	if (overFilter == 0) return;
	
	var target = $("#div_" + filter);
	target.addClass("hidden");
	target.removeClass("filter_details");
}

function hideAnyDetails() {
	hideDetails(overFilter);
}
