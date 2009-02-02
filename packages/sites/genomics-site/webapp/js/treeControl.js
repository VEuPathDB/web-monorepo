//jQuery.noConflict();
$(document).ready(function(){
	var root = $(".tree");
	if (root.length > 0) {
		var fNode = $(".term-node:first input");
		toggleChildrenCheck(fNode);
		var children = $(".term-children").hide();
		var x = 1;
	}
});

function toggleChildren(ele){
	if($(ele).hasClass("plus")){
		$(ele).attr("src","images/minus.gif");
		$(ele).removeClass("plus");
		$(ele).siblings(".term-children").show();
	}else{
		$(ele).attr("src","images/plus.gif");
		$(ele).addClass("plus");
		$(ele).siblings(".term-children").hide();
	}
}

function toggleChildrenCheck(ele){
	if($(ele).attr("checked")){
		check(ele);
		checkBranch(ele);
		//$(ele).parent().parents(".term-node").children("input").attr("disabled",true).attr("checked", true);
	}else{
		uncheck(ele);
		checkBranch(ele);
	}
}

function checkBranch(ele){
	if($(ele).parent().parent().hasClass("param")) return;
	var any = false;
	var all = true;
	if(ele.checked) 
		any = true;
	else
		all = false;
	$(ele).parent().siblings("div.term-node").children("input").each(function(t){
		if(this.checked){
			any = true;
		}else{ 
			all = false;
		}
	});
	if(!any)
		all = true;
	$(ele).parent().parent().parent().children("input").attr("disabled",!all).attr("checked", any);
//	else
//	$(ele).parent().parent().parent().children("input").attr("disabled",true).attr("checked", true);
	checkBranch($(ele).parent().parent().parent().children("input")[0]);
}

function uncheck(ele){
	$(ele).attr("checked",false);
	var childDiv = $(ele).siblings(".term-children");
	if(childDiv.length > 0){
		var kids = $(childDiv).children(".term-node input");
		for(var i=0;i<kids.length;i++){
			uncheck($(kids[i]).children("input")[0]);
		}
	}
}

function check(ele){
	$(ele).attr("checked",true);
	var childDiv = $(ele).siblings(".term-children");
	if(childDiv.length > 0){
		var kids = $(childDiv).children(".term-node input");
		for(var i=0;i<kids.length;i++){
			check($(kids[i]).children("input")[0]);
		}
	}
}
