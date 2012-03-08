var newwindow;
function poptastic(url,name,h,w)
{
if(h) {
	newwindow=window.open(url,name,'resizable=yes,scrollbars=yes,height='+h+',width='+w);
	if (window.focus) {newwindow.focus()}
} else {
	newwindow=window.open(url,name,'resizable=yes,scrollbars=yes,height=600,width=800');
	if (window.focus) {newwindow.focus()}
     }
}
