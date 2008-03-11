//window.onload = function(){
//	renameInputs('Eukaryotic Pathogens_area','none');
//	renameInputs('Apicomplexan_area','none');
//	renameInputs('Anaerobic Protists_area','none');
//	navigation_toggle('Eukaryotic Pathogens');
//}

function navigation_toggle(area,p_name)
{
	var IE = false;
	if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion <= 6)
  	   IE = true;
	
	if(document.getElementById(area+"_area").style.display == "none")
	{
		
		var divs = document.getElementById('navigation').getElementsByTagName('div');
		for(var i=0;i<divs.length;i++){
			if(divs[i].style.display=="") {
				var sect_name = divs[i].id.substring(0,divs[i].id.indexOf('_area'));
				document.getElementById(sect_name).className = "";
				renameInputs(divs[i],'none');
				if(!IE)
				    Effect.toggle(divs[i].id,'slide',{duration: .5});
				else
                                    document.getElementById(divs[i].id).style.display="none";
			}
		}
	
		var inputs = document.getElementById(area+'_area').getElementsByTagName('Input');
		document.getElementById(area).className = "seled";
		renameInputs(area+'_area','myMultiProp('+p_name+')');				
		if(!IE)
		   Effect.toggle(area+'_area','slide',{duration: .5});
		else
                   document.getElementById(area+'_area').style.display="";
              
		return true;

	}
}

function renameInputs(id,val){
	if (typeof id == "string")
		var inputs = document.getElementById(id).getElementsByTagName('Input');
	else
		var inputs = id.getElementsByTagName('Input');
	for(var i=0;i<inputs.length;i++){
			inputs[i].name = val;
	}
}

function copySelection(item)
{
	var inputs = document.getElementById('navigation').getElementsByTagName('Input');
	for(var i=0;i<inputs.length;i++){
		if(inputs[i].value == item.value)
			inputs[i].checked = item.checked;
	}
}

function selectAll_None(area,val){
	var items = document.getElementById(area+'_area').getElementsByTagName('Input');
	for(i=0;i<items.length;i++){
		if((val == true && items[i].checked == false) || (val == false && items[i].checked == true)){
			items[i].click();
		}
	}
}

function parseUrl(name){
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
 	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS,"g" );
	var res = new Array();
	while (regex.lastIndex < window.location.href.length){
	  var results = regex.exec( window.location.href );
	  if( results != null )
		res.push(results[1]);
	  else
		break;
	}
	if(res.length == 0)
		return "";
	else
		return res;
		
}

function isRevise(){
	var inputs = document.getElementById('navigation').getElementsByTagName('Input');
	var orgs = parseUrl('organism');
	if(orgs != ""){
	  for(var j=0;j<orgs.length;j++){
	    org = orgs[j].replace('+',' ');
	    for(var i=0;i<inputs.length;i++){
		if(inputs[i].value == org)
		    inputs[i].checked = true;
	    }
	  }	
	}
}
