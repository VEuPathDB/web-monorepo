$(document).ready(function() {
	$("input:radio[name=type]").each(function() {
		if ($(this).attr('checked')) $(this).click();
	});
});

// Functions taken from various srt-related pages.
function setEnable(flag) {
    var offsetOptions = document.getElementById("offsetOptions");
    if (flag) offsetOptions.style.display = "block";
    else offsetOptions.style.display = "none";   
}

function setEnable2(flag) {
    var offsetOptions2 = document.getElementById("offsetOptions2");
    if (flag) offsetOptions2.style.display = "block";
    else offsetOptions2.style.display = "none";   
}
