var newwindow;
function poptastic(url,name)
{
	newwindow=window.open(url,name,'resizable=yes,scrollbars=yes,height=600,width=800');
	if (window.focus) {newwindow.focus()}
}
