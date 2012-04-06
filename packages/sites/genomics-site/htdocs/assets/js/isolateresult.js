//only used by isolates summary/basket page
function checkboxAll(ele) {
	var form = $(ele).parents("form[name=checkHandleForm]");
	var cbs = form.find('input:checkbox[name=selectedFields]');
	cbs.each(function(){
		this.checked = true;
	});

//  for (i = 0; i < field.length; i++)
//    field[i].checked = true ;
}

function checkboxNone(ele) {
	var form = $(ele).parents("form[name=checkHandleForm]");
	var cbs = form.find('input:checkbox[name=selectedFields]');
	cbs.each(function(){
		this.checked = false;
	});

//  for (i = 0; i < field.length; i++)
//    field[i].checked = false ;
}

