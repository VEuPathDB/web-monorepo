function showParamGroup(group, isShow) 
{
    var groupLink = document.getElementById(group + "_link");
    var groupArea = document.getElementById(group + "_area");

    if (isShow == "yes") {
        groupLink.innerHTML = "<a href=\"#\" onclick=\"return showParamGroup('" + group + "', 'no');\">Hide</a>";
        groupArea.style.display = "block";
    } else {
        groupLink.innerHTML = "<a href=\"#\" onclick=\"return showParamGroup('" + group + "', 'yes');\">Show</a>";
        groupArea.style.display = "none";
    }
     
    return false;
}

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
