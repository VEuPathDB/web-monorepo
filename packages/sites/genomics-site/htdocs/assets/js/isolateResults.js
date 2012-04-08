//functions only used by isolates summary/basket page

/* now using generic functions provided in WDK's  api.js
function checkboxAll(ele) {
	var form = $(ele).parents("form[name=checkHandleForm]");
	var cbs = form.find('input:checkbox[name=selectedFields]');
	cbs.each(function(){
		this.checked = true;
	});
}
function checkboxNone(ele) {
	var form = $(ele).parents("form[name=checkHandleForm]");
	var cbs = form.find('input:checkbox[name=selectedFields]');
	cbs.each(function(){
		this.checked = false;
	});
*/

function goToIsolate(ele) {
	var form = $(ele).parents("form[name=checkHandleForm]");
	var cbs = form.find('input:checkbox[name=selectedFields]:checked');
	//alert("cbs length is " + cbs.length);
	if(cbs.length < 2) {
		alert("Please select at least two isolates to run ClustalW");
		return false;
	}
	var url = "/cgi-bin/isolateClustalw?project_id=" + modelName() + ";isolate_ids=";
	cbs.each(function(){
		url += $(this).val() + ",";
	});
	//alert(url);
	/* code if we want to popup a new window */
	var w = open ('', 'clustalwResult', 'width=800,height=500,titlebar=1,menubar=1,resizable=1,scrollbars=1,toolbar=1');
	w.document.open();
	w.location.href=url;
	//window.location.href = url;
}
