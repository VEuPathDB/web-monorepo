var OOSMessage = "Your operation was canceled due to an inconsistancy between your display and the data on our server.\n" +
				 "We will update your display to show the status ont eh server and you will have to repeat your last operation";

function ErrorHandler(evt, data, strategy, qform){
	var type = null;
	if(data.type == "success"){
		return true;
	}else{
		type = data.type;
		if(type == "param-error"){ //Error is in the parameter list
			table = document.createElement('table');
			$(table).addClass("parameter-errors").html("<tr><td colspan=2>"+data.message+"</td></tr>");
			params = data.params;
			for(p in params){
				if(p != "length"){
					tr = document.createElement('tr');
					tdPrompt = document.createElement('td');
					tdMessage = document.createElement('td');
					$(tdPrompt).html(params[p].prompt + ": ");
					$(tdMessage).html(params[p].message);
					$(tr).append(tdPrompt).append(tdMessage);
					$(table).append(tr);
				}
			}
			$("form",qform).prepend(table);
			$(qform).parent().show();
		}else if(type == "out-of-sync"){ //Checksum sent did not match the back-end checksum
			alert(OOSMessage);
			removeStrategyDivs(strategy.backId);
			f_strategyId = updateStrategies(data, evt, strategy);
			removeLoading(strategy.frontId);
			$("#diagram_" + strategy.frontId + " div.venn:last .resultCount a").click();
			isInsert = "";
		}else{ //Gerenal Error Catcher
			alert(data.message);
			//TODO : Add a AJAX call to send an e-mail to Admininstrator with exception, stacktrace and message
			initDisplay(0);
		}
	}
}

function ValidateView(strategies){
	var failed = new Array();
	for(str in strats){
		strat = strats[str];
		if(strat.checksum != strategies[strat.backId])
			failed.push(strat.frontId);
	}
	if(failed.length == 0)
		return true;
	else
		return failed;
}