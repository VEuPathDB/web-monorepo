var currentTip = 0;
var tipMax;
var tips = null;
$(document).ready(function(){
	initHelp();
});

function initHelp() {
	var url = "showXmlDataContent.do?name=XmlQuestions.StrategiesHelp";
	$.ajax({
		url: url,
		type: "POST",
		dataType: "html",
		success: function(data){
			$("div#help div.h2center").after($("div#contentcolumn2 div.innertube",data).html() + "<hr />");
			$("div#help span[id^='tip_']").each(function() {
				$("#dyk-box div#content").append(this);
			});
			if($("div#Strategies").attr("newstrategy") == true)
				initDYK(true);
			else
				initDYK(false);
		}
	});
}

function initDYK(o){
	setTipMax();
	var co = $.cookie("DYK");
	if(co && !o){
		tips = $("#dyk-box,#dyk-shadow").remove();
		return;
	} 
	$("#dyk-box,#dyk-shadow").show();
	var randomnumber=Math.floor(Math.random()*tipMax);
	setCurrent(randomnumber);
	$("#dyk-box input#close").click(function(){
		dykClose();
	});
	
	$("#dyk-box input#previous").click(function(){ prevTip()});
	$("#dyk-box input#next").click(function(){ nextTip()});

	$("div#dyk-box").resizable({
		minWidth: 405,
		minHeight: 87,
		alsoResize: '#dyk-shadow,#dyk-text'
	});
	$("div#dyk-shadow").resizable();

	$("div#dyk-box").draggable({
		handle: ".dragHandle",
		containment: 'window',
/*		drag: function(e, u){
			var lef = $(this).css('left');
			var to = $(this).css('top');
			lef = parseInt(lef.split("px")[0]) - 3;
			to = parseInt(to.split("px")[0]) + 3;
			$("div#dyk-shadow").css({
				top: to + "px",
				left: lef + "px"
			});
		}*/
		start:function(e,ui){
			$("#dyk-shadow").hide();
		},
		stop:function(e,ui){
			var lef = $(this).css('left');
			var to = $(this).css('top');
			lef = parseInt(lef.split("px")[0]) + 6;
			to = parseInt(to.split("px")[0]) + 6;
			$("div#dyk-shadow").css({
				top: to + "px",
				left: lef + "px"
			});
			$("#dyk-shadow").show();
		}
	});
}

function setTipMax(){
	tipMax = $("#dyk-box span[id^='tip_']").length;
}

function setCount(){
	$("#dyk-count").text((currentTip + 1) + " of " + (tipMax));
}

function displayCurrent(){
	if(currentTip >= 0 && currentTip < tipMax )
		$("#dyk-box div#dyk-text").html($("#dyk-box span#tip_" + currentTip).html());
	else {
		if(currentTip < 0)
			currentTip = tipMax - 1;
		else
			currentTip = 0;
		$("#dyk-box div#dyk-text").html($("#dyk-box span#tip_" + currentTip).html());
	}
	$("#dyk-box div#dyk-text a").click(function(){
		showPanel('help');
	});
	setCount();
}

function setCurrent(tipnum){
	currentTip = tipnum;
	displayCurrent();
}

function nextTip(){
	currentTip = parseInt(currentTip) + 1;
	displayCurrent();
}

function prevTip(){
	currentTip = parseInt(currentTip) - 1;
	displayCurrent();
}

function dykOpen(){
//	$(tips[0]).find("input#stay-closed-check").attr("disabled",true);
	$("div.innertube").append(tips[0]);
	$("div.innertube").append(tips[1]);
	initDYK(true);
}

function dykClose(){
	var ex = $("div#dyk-box input#stay-closed-check").attr("checked");
	setDYKCookie(ex);
	tips = $("#dyk-box,#dyk-shadow").remove();
}

function setDYKCookie(expire){
	if(expire)
		$.cookie("DYK","true",{path: '/',expires: 300});
	else
		$.cookie("DYK","true",{path: '/'});
}
