
//Create the XMLObjectRequest suitable for the given browser type
function createAjaxObject(){
  	var xmlObj = null;
	if(window.XMLHttpRequest){ 
		xmlObj = new XMLHttpRequest();
	} else if(window.ActiveXObject){
		xmlObj = new ActiveXObject("Microsoft.XMLHTTP");
	} 
	return xmlObj;
}

//Make the call to the xmlObj based the given URL and store data in an Array 
// RETURNS : array containing the data retrieved from the server
function AjaxCall(sendReqUrl,arr){
	var xmlObj = createAjaxObject();
//	var arr = new Array();
	xmlObj.onreadystatechange = function(){
		if(xmlObj.readyState == 4 ){
			if(xmlObj.status == 200){
				StoreDataInArray( xmlObj.responseXML,arr);
//				return arr;
			}else{
				alert("Message returned, but with an error status");
			}
			
		 }
	}
	xmlObj.open( 'GET', sendReqUrl, true );
	xmlObj.send('');
} 

//Store data from XMLResponse in StoreageArray
function StoreDataInArray(obj,arr){
	var def = new Array();
	def = obj.getElementsByTagName('term'); //I'm assuming they're 'term' tags
	for(var i=0;i<def.length;i++){
		arr[i] = def[i];
	}
//	return def;
}

//Moves data from an array into select object, id.
function fillSelectFromArray(arr, id)
{
	var defArray = new Array();
	defArray = arr;
	var ArrayLength = defArray.length;
	var term;
	var intern;
	var sA = document.getElementById(id);
	sA.disabled = false;
	if( ArrayLength != 0 ){
		for( var x = 0; x < ArrayLength; x++ ){
			term = new String( GetText(defArray[x]));
			intern = new String( defArray[x].attributes[0].value );
			var option = new Option();
			option.text = term;
			option.value = term;
			//if(x == 0) {option.selected = true;}
			sA.options[x] = option;
		}
	}else{
		//alert("fillSelectFromArray() : No Data Returned From the Server!!");
	}	
	updateSelectInput('chromosomeOptional',id);
}

//Moves data from an array into select object, id.
function fillOrganisms(arr, id, dataArr, sites)
{
	var defArray = new Array();
	defArray = arr;
	var ArrayLength = defArray.length;
	var term;
	var sA = document.getElementById(id);
	sA.disabled = false;
	if( ArrayLength != 0 ){
	   for(i=0;i<sites.length;i++){
		for( var x = 0; x < ArrayLength; x++ ){
			term = new String( defArray[x].firstChild.data );
			if(term.indexOf(sites[i]) != -1){
				var option = new Option();
				option.text = term;
				option.value = i;
				//if(x == 0) {option.selected = true;}
				sA.options[x] = option;
			}
		}
	   }
	}else{
		//alert("fillOrganisms() : No Data Returned From the Server!!");
	}
	updateSelectInput('organism',id);	
}

//Copies values selected from a Select Box to a hidden text field
//paramId -- String [The id of the hidden text field]
//inputId -- String [id of the Select Box]
function updateSelectInput(paramId, inputId){
   	var sel = document.getElementById(inputId);
	
	var hid = null;
	hid = document.getElementById(paramId);
	if(hid == null) return;
	if(hid.tagName != "INPUT")
		hid = document.getElementsByName("myProp(" + paramId + ")")[0];
	
	if(sel.multiple == false){
		hid.value = sel.options[sel.selectedIndex].text;//value;
	}else {
		var t = ",";
		for (i=0;i<sel.length;i++){
			var op = sel[i];
			if(op.selected){
				t = t + "," + op.value;
		    }
		}
		hid.value = t.substring(2);
	}
}

//Copies values selected from a Text Box to a hidden text field
//paramId -- String [The id of the hidden text field]
//inputId -- String [id of the Text Box]
function updateTextInput(paramId, inputId){
   var s = document.getElementById(inputId);
   document.getElementById(paramId).value = s.value; 
}

//Empties the Option list in the given id
//id -- String [the id of the select box to be cleared]
function clearlists(id){
	document.getElementById(id).options.length = 0;
}

//combines arrays into one large array
function joinArrays (arr){
	var bigarray = new Array();
	for(var z=0;z<arr.length;z++){
		for(var k = 0; k < arr[z].length; k++){
			bigarray[bigarray.length] = arr[z][k];
		}
	}	
	return bigarray;
}

//holds the script for a specified number of milliseconds
//millis -- Int [time in milliseconds to stall the script]
function pausecomp(millis)
{
var date = new Date();
var curDate = null;

do { curDate = new Date(); }
while(curDate-date < millis);
}

//Loads the organisms returned by the given URL into the given element
//sendReqUrl -- String [url to the data]
//id -- String [id of the element to load the data into]
function loadOrganisms(sendReqUrl, id, dataArr, sites){
	var xmlObj = createAjaxObject();
	var arr = new Array();
	xmlObj.onreadystatechange = function(){
		if(xmlObj.readyState == 4 ){
			if(xmlObj.status == 200){
				StoreDataInArray( xmlObj.responseXML,arr);				
				fillOrganisms(arr,id, dataArr, sites);
				loadStrains();
			}else{
				alert("Message returned, but with an error status");
			}			
		 }
	}
	xmlObj.open( 'GET', sendReqUrl, true );
	xmlObj.send('');
}

function getAllOrgs(sites){
	var orgs = "";
	for(i=0;i<sites.length;i++){
    		if(sites[i].indexOf('Entamoeba') != -1)
			orgs = orgs+","+sites[i]+" invadens";
		if(sites[i].indexOf('Encephalitozoon') != -1)
			orgs = orgs+","+sites[i]+" intestinalis";
		if(sites[i].indexOf('Crypto') != -1)
			orgs = orgs+","+sites[i]+" parvum";
		if(sites[i].indexOf('Giardia') != -1)
			orgs = orgs+","+sites[i]+" Assemblage A isolate WB";
		if(sites[i].indexOf('Plasmo') != -1)
			orgs = orgs+","+sites[i]+" falciparum";
		if(sites[i].indexOf('Toxo') != -1)
			orgs = orgs+","+"Neospora caninum";
		if(sites[i].indexOf('Trich') != -1)
			orgs = orgs+","+sites[i]+" vaginalis";
		if(sites[i].indexOf('Trypa') != -1)
			orgs = orgs+","+sites[i]+" cruzi";
//		if(sites[i].indexOf('Leish') != -1)
//			orgs = orgs+","+sites[i]+" major";
		
	}
	return orgs.substring(1);
}

function noop(){
var i = 0;
}

function GetText(term){
     if(navigator.appName == "Microsoft Internet Explorer"){
	var kids = term.childNodes;
	for(var i=0; i<kids.length;i++){
	    if(kids[i].nodeType == 3){
		if(i == 0) 
			text = kids[i].nodeValue;
		else
			text = text + " " + kids[i].nodeValue;
	    }else{
		if(i == 0) 
			text = GetText(kids[i]);
		else
			text = text + " " + GetText(kids[i]);
	    }
	}
	return text;
     } else {
	return term.textContent;
     }

}
