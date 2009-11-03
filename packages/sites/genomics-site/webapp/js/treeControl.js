//jQuery.noConflict();
$(document).ready(function(){
	var root = $(".param-tree");
	initTreeState(root);
/*	if (root.length > 0) {
		var fNode = $(".term-node:first input");
		toggleChildrenCheck(fNode);
		var children = $(".term-children").hide();
	}*/
});

function initTreeState(rootNode){
	if (rootNode.length > 0) {
		var topNodes = $(rootNode).children(".term-node");
		for(var n = 0; n < topNodes.length; n++){
			var subnodes = $(topNodes[n]).children(".term-children").children(".term-node").children("input[type='checkbox']");
			for(var m = 0; m < subnodes.length; m++)
				toggleChildrenCheck(subnodes[m]);
		}
	}
}

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
		if($(ele).parent().children("div.term-children").length > 0 && $(ele).prev().hasClass('plus'))
			toggleChildren($(ele).prev());
	}else{
		uncheck(ele);
		checkBranch(ele);
	}
}

function checkBranch(ele){
	if($(ele).parent().parent().hasClass("param") || ele == undefined) return;
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
		var kids = $(childDiv).children(".term-node");
		for(var i=0;i<kids.length;i++){
			uncheck($(kids[i]).children("input")[0]);
		}
	}
}

function check(ele){
	$(ele).attr("checked",true);
	var childDiv = $(ele).siblings(".term-children");
	if(childDiv.length > 0){
		var kids = $(childDiv).children(".term-node");
		for(var i=0;i<kids.length;i++){
			check($(kids[i]).children("input")[0]);
		}
	}
}

function expandCollapseAll(ele, flag) {
    $(ele).parents(".param-tree").find(".term-node > img").each(function() {
        if ($(this).siblings(".term-children").length == 0) return;
        if ($(this).hasClass("plus")){
            if (flag) toggleChildren(this);
        } else {
            if (!flag) toggleChildren(this);
        }
    });
}


//alternative look on positioning select/clear/expand/collapse on multipick params
function expandCollapseAll2(ele, flag, name) {
//  $(ele).parent().next().children(".param-tree").find(".term-node > img").each(function() {
   $("#" + name + "aaa").children(".param-tree").find(".term-node > img").each(function() {
       	if ($(this).siblings(".term-children").length == 0) return;
       	if ($(this).hasClass("plus")){
      	    if (flag) toggleChildren(this);
        } else {
            if (!flag) toggleChildren(this);
        }
    });
}
