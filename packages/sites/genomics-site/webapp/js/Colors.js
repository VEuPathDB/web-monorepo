
var siteCount = sites.length;

var all_libs = new Array(siteCount);

var site_indicies = new Array();

var selected_index = new Array(siteCount);
var loaded_libs = new Array(siteCount);
var used_libs = new Array(siteCount);

//Check that the color array matches the order the organisms are listed in the Model.prop file
var colorArray = new Array("khaki","#b5dfbd","#ddccdd","#add8e6","#efd4d1");
// APIDB COLOR SCHEME ---- var colorArray = new Array("khaki","#ddccdd","#add8e6");

window.onload = function(){
	for(var i=0;i<siteCount;i++){
		used_libs[i] = new Array();
		all_libs[i] = new Array();
		loaded_libs[i] = "";
		site_indicies[i] = new Array();
		initArray(site_indicies[i], 0);
	}
	fillArrays();
	navigation_toggle_Color('Eukaryotic Pathogens','organism','libraryIdGenes');
}	

function loadESTLibs(projectId, checked, sid){
	clearSelectLists(sid);
	if(checked){
		loaded_libs[projectId] = loaded_libs[projectId] + "x";
	}else{
		loaded_libs[projectId] = loaded_libs[projectId].substring(1);
	}

	selected_index = new Array();
	var ind = 0;
	used_libs = new Array();
	for(var z=0;z<loaded_libs.length;z++){
		if(loaded_libs[z].length != 0){
//			used_libs = used_libs.concat(all_libs[z]);
			used_libs[z] = all_libs[z];
			selected_index[ind] = site_indicies[z];
			ind++;
		}else {
			used_libs[z] = new Array();
			selected_index[z] = new Array();
			site_indicies[z].length = 0;
			ind++;
		}
	}

	fillSelectFromArray1(used_libs, sid);
	whichColor(sid);
}

function fillArrays(){
	var sendReqUrl= 'showRecord.do?name=AjaxRecordClasses.ESTTermClass&primary_key=' + query +':';
	for(var z=0;z<siteCount;z++){
		AjaxCall(sendReqUrl + sites[z], all_libs[z])
	}
}
	



function fillSelectFromArray1(arr, id)
{
	var offset = 0;
//	var def = new Array();
	var term;
	var intern;
	var sA = document.getElementById(id);
	for(var i=0;i<arr.length;i++){
	   var defArray = arr[i];
	   var indexArray = selected_index[i];
	   var ArrayLength = defArray.length;
	   
   	   if( ArrayLength != 0 ){
		
		for( var x = 0; x < ArrayLength; x++ ){
			term = new String( GetText(defArray[x]));
			intern = new String(defArray[x].attributes[0].value );
			var option = new Option();
			option.text = term;
			if(query == "geneParams.ms_assay")
				option.value = intern;
			else
				option.value = term;
		//	option.style.color = whichColor(i);
			if(indexArray[x] == 1) option.selected = "true";			

			sA[x+offset] = option;
		}
		offset = offset + ArrayLength;
	   }//else{
		//alert("Array is empty");
	   //}	
	}
}

function clearSelectLists(lib){
	//get selected values
	var x = new Option();
	x.text = "filling text";
	x.value = "testvalue";
	lib = document.getElementById(lib);	
	var ops = lib.options;
	var index = 0;
	for(var z=0;z<loaded_libs.length;z++){
		if(loaded_libs[z].length != 0){
			var size = all_libs[z].length;
			for(var i = 0; i < size; i++){
				if(lib[index].selected) site_indicies[z][i] = 1;
				else site_indicies[z][i] = 0;
				index++;
			}
		}
	}
	lib.length = 0;
}

function initArray(arr, val){
	for(var i = 0; i < arr.length; i++)
		arr[i] = val;
}

function whichColor(lib){
	lib = document.getElementById(lib);
	var ops = lib.options;
	var index = 0;
	for(var z=0;z<loaded_libs.length;z++){
		if(loaded_libs[z].length != 0){
			for(var i = 0; i < all_libs[z].length; i++){
				lib[index].style.backgroundColor = colorArray[z];
				index++;
			}
		}
	}
}
