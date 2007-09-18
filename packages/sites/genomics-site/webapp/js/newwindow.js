var newwindow;
function poptastic(url,name)
{
	newwindow=window.open(url,name,'scrollbars=yes,height=700,width=700');
	if (window.focus) {newwindow.focus()}
}
