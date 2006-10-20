function loadSelectedData(){

	var datatype =  document.getElementById( 'dataDropdownBox' ).value; //use this to select database
	var sendReqUrl = 'showRecord.do?name=UtilityRecordClasses.InterproTermList.jsp&id='+datatype;
	var xmlObj = null;

	if(window.XMLHttpRequest){
		
		xmlObj = new XMLHttpRequest();
	
	} else if(window.ActiveXObject){
		
		xmlObj = new ActiveXObject("Microsoft.XMLHTTP");

		
	} else {
		
		return;
		
	}
	
	xmlObj.onreadystatechange = function(){
		if(xmlObj.readyState == 4 ){
			createAutoComplete( xmlObj.responseXML );
		 }
	}

	
	xmlObj.open( 'GET', sendReqUrl, true );
	xmlObj.send('');

			

	
}

function createAutoComplete( obj ){
	
	var def = new Array();
	
	var defArray = obj.getElementsByTagName('term'); //I'm assuming they're 'term' tags
	var ArrayLength = defArray.length;
	var term;
	
	if( ArrayLength != 0 ){
		
		for( var x = 0; x < ArrayLength; x++ ){
			
			term = new String( defArray[x].firstChild.data );
			def.push(term);
			
		}
		
	}else{
		// No Panther data returned from server
	}
	
	new Autocompleter.Local('searchBox','searchBoxupdate', def,
	{ tokens: new Array(',','\n'), fullSearch: true, partialSearch: true, partialChars: 0 });
	
}