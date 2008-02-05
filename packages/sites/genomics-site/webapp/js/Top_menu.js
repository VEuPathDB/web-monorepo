//window.onload = function(){
//	renameInputs('Eukaryotic Pathogens_area','none');
//	renameInputs('Apicomplexan_area','none');
//	renameInputs('Anaerobic Protists_area','none');
//	navigation_toggle('Eukaryotic Pathogens');
//}

function navigation_toggle(area,p_name)
{
	if(document.getElementById(area+"_area").style.display == "none")
	{
		
		var divs = document.getElementById('navigation').getElementsByTagName('div');
		for(var i=0;i<divs.length;i++){
			if(divs[i].style.display=="") {
				var sect_name = divs[i].id.substring(0,divs[i].id.indexOf('_area'));
				document.getElementById(sect_name).className = "";
				renameInputs(divs[i],'none');
				Effect.toggle(divs[i].id,'slide',{duration: .5});
			}
		}
	
/*
		if(document.getElementById('Eukaryotic Pathogens_area').style.display=="") {
			document.getElementById('Eukaryotic Pathogens').className = "";
			renameInputs('Eukaryotic Pathogens_area','none');
			Effect.toggle('Eukaryotic Pathogens_area','slide',{duration: .5});
		}
		
		if(document.getElementById('Apicomplexan_area').style.display==""){
			document.getElementById('Apicomplexan').className = "";
			renameInputs('Apicomplexan_area','none');
			Effect.toggle('Apicomplexan_area','slide',{duration: .5}); 
		}
		
		if(document.getElementById('Anaerobic Protists_area').style.display==""){
			document.getElementById('Anaerobic Protists').className = "";
			renameInputs('Anaerobic Protists_area','none');
			Effect.toggle('Anaerobic Protists_area','slide',{duration: .5});
		}
*/		
		var inputs = document.getElementById(area+'_area').getElementsByTagName('Input');
		document.getElementById(area).className = "seled";
		renameInputs(area+'_area','myMultiProp('+p_name+')');				
		Effect.toggle(area+'_area','slide',{duration: .5});
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
 
