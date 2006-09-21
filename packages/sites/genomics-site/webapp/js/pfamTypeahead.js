
	/* -------------------------------------------
		Style Setter Functions
	------------------------------------------- */
	function tokhaki(obj){
		obj.style.backgroundColor="#E7DEAA";
	}		             
	
	function towhite(obj){
		obj.style.backgroundColor="#FFFFFF";
	}
	
	function togrey(obj){
		obj.style.backgroundColor="#CCCCCC";
	}  
	
	
	/* -------------------------------------------
		loadData()
		@param: none
		@return: none
		@desc: prepares the URL which retrieves
			the data in XML, sends formatted URL
			to ajaxRead
	------------------------------------------- */
	function loadData(){
		var sendReq = 'showRecord.do?name=UtilityRecordClasses.PfamTermList.jsp&id=%20';
		//var sendReq = 'misc/ajaxPfamTypeahead.jsp';
		ajaxRead( sendReq );
	}


	/* -------------------------------------------
		ajaxRead()
		@param: _url 
			@from: loadData()
		@return: none
		@desc: creates the XMLHttpRequest then
			sends the data retrived from the _url
			packaged as an xmlObj
			@to: processXML( xmlObj.responseXML )
	------------------------------------------- */
	function ajaxRead( _url ){

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
				processXML( xmlObj.responseXML );
			 }
		}
		xmlObj.open( 'GET', _url, true );
		xmlObj.send('');
	}


	/* -------------------------------------------
		processXML( obj )
		@param: obj (responseXML)
			@from: ajaxRead( _url )
		@return: none
		@desc: formats the response XML and uses
			the DOM to place the results
			accordingly
	------------------------------------------- */
	function processXML( obj ){
		
		var dataArray = obj.getElementsByTagName('pfam');
		var dataArrayLen = dataArray.length;
		var insertData = '<div align="center" ><select name="select" size="5" onChange="insertAndClear(this.value);">';
		var pfam_term;
						 
		if( dataArrayLen != 0 ){
			
			for( var i = 0; i < dataArrayLen; i++ ){
		
				pfam_term = new String( dataArray[i].firstChild.data );
				document.getElementById( 'storageArea' ).innerHTML = document.getElementById( 'storageArea' ).innerHTML+":"+pfam_term;
				insertData += '<option onClick="insertAndClear(this.value);" value="'+dataArray[i].firstChild.data+'" >' + dataArray[i].firstChild.data + '</option>';
				//insertData += '<option onClick="insertAndClear(this.innerHTML);">' + dataArray[i].firstChild.data + '</option>';

			}
			
			insertData += '<option>_________________________________________________________________</option>';
			insertData += '</select></div>';
			document.getElementById ( 'dataArea' ).innerHTML = insertData;
		
		}
		
	}
	

	/* -------------------------------------------
		show_typeahead_list()
		@param: none
		@return: none
		@desc: retrieves information placed within
			the hidden storage area stored client
			side, and loads the complete list of
			definitions via the DOM
	------------------------------------------- */
	function show_typeahead_list(){
	
		var storage = document.getElementById( 'storageArea' ).innerHTML;
		var storageArray = storage.split(":");
		 	  
       
		var insertData = '<div align="center"><select name="select" size="5" onChange="insertAndClear(this.value);">';
		var counter = 0;
		
		while( counter < storageArray.length - 1 ){
			insertData += '<option onClick="insertAndClear(this.value);" value="'+storageArray[ counter ]+'" >' + storageArray[ counter ] + '</option>';
			counter++;
		}
		
		insertData += '<option>_________________________________________________________________</option>';
		insertData += '</select></div>';
		document.getElementById ( 'dataArea' ).innerHTML = insertData;
	}


	/* -------------------------------------------
		searchStorage( request )
		@param: request
		@return: none
		@desc: Creates a regex out of the request,
			loads the information from the client's
			cached storage area, and returns all
			definitions containing the substring
			'request', then places it via the DOM
	------------------------------------------- */
	function searchStorage( request ){
	
	
		var reg_exp = new RegExp( request , "i");
		var storage = document.getElementById( 'storageArea' ).innerHTML;
		var storageArray = storage.split(":");
		var result;
		var insertData = '<div align="center"><select name="select" size="5" onChange="insertAndClear(this.value);">';
		var counter = 0;

		while( counter < storageArray.length - 1 ){

			result = storageArray[ counter ].match( reg_exp );

			if( result != null ){

				if( result.length > 0 ){

					insertData += '<option onClick="insertAndClear(this.value);" value="'+storageArray[ counter ]+'" >' + storageArray[ counter ] + '</option>';

				}

			}

			counter++;
		}

		insertData += '<option>_________________________________________________________________</option>';
		insertData += '</select></div>';
		document.getElementById ( 'dataArea' ).innerHTML = insertData;
		
	}


	/* -------------------------------------------
		check_typeahead_list( query )
		@param: query
		@return: none
		@desc: checks to see if query string is 
			long enough, if it is then it sends
			it on to searchStorage
			@to: searchStorage( query )
	------------------------------------------- */
	function check_typeahead_list(  ){
	
		var query = document.getElementById( 'searchBox' ).value;
		var querySend = query.replace(/\*/gi,"");
		
		if( querySend.length < 3 ){
			remove_typeahead_list()
			show_typeahead_list();
		}else{
			remove_typeahead_list()
			searchStorage( querySend );
		}

	}
	

	/* -------------------------------------------
		remove_typeahead_list( q )
		@param: none
		@return: none
		@desc: clears typeahead list
	------------------------------------------- */
	function remove_typeahead_list(){
		document.getElementById( 'dataArea' ).innerHTML = '';
	}
	

	/* -------------------------------------------
		insertAndClear( pfam_data )
		@param: pfam_data
		@return: none
		@desc: takes the users selection, places
			it within the pfam typeahead area, 
			and clears the selection field
	------------------------------------------- */
	function insertAndClear( pfam_data ){
		
		if( pfam_data == '_________________________________________________________________' ){
			//do nothing
		}else{
			//remove_typeahead_list();
			document.getElementById('searchBox').value = pfam_data;
		}
		
	}
