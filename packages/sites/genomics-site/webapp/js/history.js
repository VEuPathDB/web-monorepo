selected = [];

function selectAllHist() {
	$("div.history_panel.enabled input:checkbox").attr("checked", "yes");
	updateSelectedList();
}

function selectNoneHist() {
	$("div.history_panel input:checkbox").removeAttr("checked");
	selected = [];
}

function displayHist(type) {
	if(!$("div#panel_" + type).hasClass("enabled")) {
		$("li#selected").removeAttr("id");
		$("div.history_panel.enabled").removeClass("enabled");
		selectNoneHist();
		$("a#tab_" + type).parent().attr("id", "selected");
		$("div#panel_" + type).addClass("enabled");
	}
}

function updateSelectedList() {
	selected = [];
	$("div.history_panel input:checkbox").each(function (i) {
		if ($(this).attr("checked")) {
			selected.push($(this).attr("id"));
		}
	});
}
		
function deleteHistories(url) {
	// make sure something is selected.
	if (selected.length == 0) {
		return false;
	}
	// else delete and replace page sections that have changed
	var agree=confirm("Are you sure you want to delete the selected histories?");
 	if (agree) {
		url = url + selected.join("&wdk_history_id=");
		$.ajax({
			url: url,
			dataType: "html",
			success: function(data) {
				$("body").html(data, "body");
			},
			error: function(data, msg, e) {
				alert("ERROR \n " + msg + "\n" + e);
			}
		});
	}	
}
