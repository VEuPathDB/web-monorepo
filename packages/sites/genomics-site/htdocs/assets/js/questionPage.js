
function toggleHelp(id)
{
	//var id = a-element.attr("href");
	var ele = $("#help_" + id);
	ele.toggle();
}

/*$(document).ready(function(){
	$(".help_div").hide();
	$("a.help_link").click(function(){
		var id = $(this).attr("href");
		var ele = $("div#" + id);
		ele.toggle();
		return false;
	});
});
*/
