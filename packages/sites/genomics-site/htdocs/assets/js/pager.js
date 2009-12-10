
function GetResultsPage(url, update, ignoreFilters){
	var s = parseUrlUtil("strategy", url);
	var st = parseUrlUtil("step", url);
	var strat = getStrategyFromBackId(s[0]);
	var step = null;
	if(strat == false){
		strat = new Object();
		strat.JSON = new Object();
		step = new Object();
		strat.JSON.name = "";
		step.frontId = "n/a";
	}else
		step = strat.getStep(st[0], false);
	url = url + "&resultsOnly=true";
	if (update){$("#Workspace").block();}
	$.ajax({
		url: url,
		dataType: "html",
		beforeSend: function(){
			if(strat != false) showLoading(strat.frontId);
		},
		success: function(data){
			if (update) {
				ResultsToGrid(data, ignoreFilters);
				$("span#text_strategy_number").html(strat.JSON.name);
				$("span#text_step_number").html(step.frontId);
				$("span#text_strategy_number").parent().show();
				$("#Workspace").unblock();
			}
			if(strat != false) removeLoading(strat.frontId);
		},
		error : function(data, msg, e){
			  alert("ERROR \n "+ msg + "\n" + e
                                      + ". \nReloading this page might solve the problem. \nOtherwise, please contact site support.");
		}
	});
}

function ResultsToGrid(data, ignoreFilters) {
        // the html() doesn't work in IE 7/8 sometimes (but not always.
        // $("div#Workspace").html(data);
	var oldFilters;
	if (ignoreFilters) {
		oldFilters = $("#Workspace div.layout-detail div.filter-instance .link-url");
	}

        document.getElementById('Workspace').innerHTML = data;

	// invoke filters
        var wdkFilter = new WdkFilter();
	
	if (ignoreFilters) {
		wdkFilter.addShowHide();
		wdkFilter.displayFilters();
		oldFilters.each(function() {
			var id = $(this).attr("id");
			var count = $(this).text();
			if (count == 0) {
				$("#" + id).replaceWith(this);
			} else {
				$("#" + id).html(count);
			}
		});
	}
	else {
        	wdkFilter.initialize();
	}

	// create multi select control for adding columns
	var attrSelect = $("#addAttributes");
	if (attrSelect.length > 0) { 
		attrSelect.multiSelect({selectAll: false,
				noneSelected: '--- Add Column ---',
				oneOrMoreSelected: '% selected: leave menu to submit'},
				function() {
					addAttr($("#addAttributes").attr('commandUrl'));
				});
	}

	// convert results table to drag-and-drop flex grid
	$("#Results_Table").flexigrid({height : 'auto',
				       showToggleBtn : false,
				       useRp : false,
				       singleSelect : true,
				       onMoveColumn : moveAttr,
                                       nowrap : false,
				       resizable : false});
}

function updatePageCount(pager_id) {
    var resultSize = parseInt($("input#resultSize").val());
    var psSelect = document.getElementById(pager_id + "_pageSize");
    var index = psSelect.selectedIndex;
    var pageSize = psSelect.options[index].value;
    var pageCount = Math.ceil(resultSize / pageSize);
    if (pageCount * pageSize < resultSize) pageCount++;
    var span = document.getElementById(pager_id + "_pageCount");
    span.innerHTML = pageCount;
}

function gotoPage(pager_id) {
    //alert("hello");
    var pageNumber = document.getElementById(pager_id + "_pageNumber").value;
    var psSelect = document.getElementById(pager_id + "_pageSize");
    var pageSize = psSelect.options[psSelect.selectedIndex].value;

    var pageUrl = document.getElementById("pageUrl").value;
    
    var pageOffset = (pageNumber - 1) * pageSize;
    var gotoPageUrl = pageUrl.replace(/\&pager\.offset=\d+/, "");
    gotoPageUrl = gotoPageUrl.replace(/\&pageSize=\d+/, "");
    gotoPageUrl += "&pager.offset=" + pageOffset;
    gotoPageUrl += "&pageSize=" + pageSize;
    GetResultsPage(gotoPageUrl, true, true);
}

function openAdvancedPaging(element){
    var button = $(element);
   
    var isOpen = (button.val() == "Advanced Paging");
    var panel = button.next(".advanced-paging");
    var offset = button.position();
    offset.left += button.width() + 20;
    offset.top -= 20;
	if(isOpen){
                    panel.css({"display" : "block",
                               "left": offset.left + "px",
                               "top": offset.top + "px",
			   "width": "290px", 
                               "z-index" : 500});
                    button.val("Cancel");
	}else{
                    panel.css({"display" : "none"});
                    button.val("Advanced Paging");
	}
}
