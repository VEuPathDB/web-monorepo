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
		
	function ajaxControl( reqType, pullFrom, pushTo ){
		
		/* Variable Declaration */
 		this.sendReqUrl = reqType;
		var typebox = pullFrom;
		var dataarea = pushTo;
		var counter = 0;
		var storage = new Array(2000);
		
		/* -------------------------------------------
			loadData()
			@param: none
			@return: none
			@desc: prepares the URL which retrieves
				the data in XML, sends formatted URL
				to ajaxRead. creates the XMLHttpRequest then
				sends the data retrived from the _url
				packaged as an xmlObj
				@to: processXML( xmlObj.responseXML )
		------------------------------------------- */
		this.loadData = function( ){
	
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
			
			xmlObj.open( 'GET', this.sendReqUrl, true );
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
	
				var dataArray = obj.getElementsByTagName('term');
				var dataArrayLen = dataArray.length;
				var insertData = '<div align="center" ><select name="select" size="5" onChange="insertAndClear( this.innerHTML, this.value, \''+typebox+'\' );">';
				var term;
				var id;
								 
				if( dataArrayLen != 0 ){
					
					for( var i = 0; i < dataArrayLen; i++ ){
				
						term = new String( dataArray[i].firstChild.data );
						id = new String( dataArray[i].getAttribute('id') );
						storage[i] = new Array(2);
						storage[i][0] = term;
						storage[i][1] = id;
						counter++;
						insertData += '<option onClick="insertAndClear( this.innerHTML, this.value, \''+typebox+'\' );" value="' + id + '" >' + term + '</option>';
		
					}
					
					insertData += '<option>_________________________________________________________________</option>';
					insertData += '</select></div>';
					
					document.getElementById ( dataarea ).innerHTML = insertData;
				
				}
			
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
			
			var result;
			var counting = 0;
			var reg_exp = new RegExp( request , "i");
			var insertData = '<div align="center"><select name="select" size="5"  onChange="insertAndClear( this.innerHTML, this.value, \''+typebox+'\' );">';
	
			for( var x = 0; x < counter; x++ ){
				
				
				result = storage[x][0].match( reg_exp );
				
				if( result != null ){
	
					if( result.length > 0 ){
	
						insertData += '<option onClick="insertAndClear( this.innerHTML, this.value, \''+typebox+'\' );" value="' + storage[ x ][1] + '" >' + storage[ x ][0] + '</option>';
						counting++;
					}
	
				}
			
			}
			
			if( counting == 0 ){
				insertData += '<option>_________________________** No Matches Found **____________________</option>';
			}
	
			insertData += '<option>_________________________________________________________________</option>';
			insertData += '</select></div>';
			document.getElementById ( dataarea ).innerHTML = insertData;
	
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
		this.check_typeahead_list = function( ){
		
			var query = document.getElementById( typebox ).value;
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
			show_typeahead_list()
			@param: none
			@return: none
			@desc: retrieves information from this.storage
				   , and loads the complete list of
				   definitions via the DOM
		------------------------------------------- */
		function show_typeahead_list(){
		
			var insertData = '<div align="center"><select name="select" size="5" onChange="insertAndClear( this.innerHTML, this.value, \''+typebox+'\' );">';
			
			for( var x = 0; x < counter; x++ ){
				
				insertData += '<option onClick="insertAndClear( this.innerHTML, this.value, \''+typebox+'\' );" value="'+ storage[x][1] +'" >' + storage[x][0] + '</option>';
				
			}
			
			insertData += '<option>_________________________________________________________________</option>';
			insertData += '</select></div>';
			document.getElementById ( dataarea ).innerHTML = insertData;

		}
		
		
		/* -------------------------------------------
			remove_typeahead_list( q )
			@param: none
			@return: none
			@desc: clears typeahead list
		------------------------------------------- */
		function remove_typeahead_list(){
			document.getElementById( dataarea ).innerHTML = '';
		}



	}

		/* -------------------------------------------
			insertAndClear( data )
			@param: pdata
			@return: none
			@desc: takes the users selection, places
				it within the pfam typeahead area, 
				and clears the selection field
		------------------------------------------- */
		function insertAndClear( data, id, area ){
			
			if( data == '_________________________________________________________________' ){
				//do nothing
			}else{
				//remove_typeahead_list();
				document.getElementById( area ).value = data;
			}
		
		}
