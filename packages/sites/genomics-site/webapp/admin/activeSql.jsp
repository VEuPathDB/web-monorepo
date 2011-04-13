<%@ taglib prefix="c"   uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>
<%@ taglib prefix="fn"  uri="http://java.sun.com/jsp/jstl/functions" %>
<api:checkWSKey keyFile="/usr/local/tomcat_instances/shared/.apidb_siteinfo_key" />

<api:wdkRecord name="UtilityRecordClasses.SiteInfo" recordKey="si"/>
<c:set var="selfHlColor" value="#F9F4EE"/>

<html> 
<head> 
 <title>Active SQL: ${fn:toLowerCase(si.attributes['service_name'].value)}</title> 
 <script type="text/JavaScript" src="/assets/js/lib/jquery-1.2.6.js"></script> 
 <script type="text/JavaScript"> 

$(document).ready(function(){ 
       xmlSource = "activeSql.xml.jsp";     
	   
      	getAndParseXml();
      	
      	$("[name=refresh]").click(function(){
      	    $("#contentTable").empty();
      	    getAndParseXml();
      	});
});

function getAndParseXml() {
   $.get(xmlSource, {}, function(xml) {
     
    content = '';
    content += '<table id="sqlTable" width="98%" border="0" cellpadding="0" cellspacing="0">';
    content += '<th>Sysdate</th><th>SQL</th><th>Last Active Time</th>';
    content += '<th>Db<br>Login</th><th>OS User</th>';
    
    $('query', xml).each(function(i) {

        qTime             = $(this).find("qTime").text();
        sql_fulltext      = $(this).find("sql_fulltext").text();
        serial_no         = $(this).find("serial_no").text();
        osuser            = $(this).find("osuser").text();
        machine           = $(this).find("machine").text();
        username          = $(this).find("username").text();
        last_active_time  = $(this).find("last_active_time").text();
        isSelf            = $(this).find("isSelf").text();

        mydata = tableRow(qTime, sql_fulltext, serial_no, osuser, username, 
                          last_active_time, machine, isSelf);

        content = content + mydata;
    });
    content += '</table>';
    
    $("#contentTable").append(content);

	});
}
function tableRow(qTime, sql_fulltext, serial_no, osuser, username, 
                  last_active_time, machine, isSelf) {

	output = '';
	
	if (isSelf == "true") {
	  output += '<tr style="background-color: ${selfHlColor};">';
	} else {
	  output += '<tr>';
    }

	output += '<td>'+ qTime + '</td>';
	output += '<td><pre>'+ sql_fulltext + '</pre></td>';
	output += '<td>'+ last_active_time + '</td>';
	output += '<td>'+ username + '</td>';
	output += '<td>'+ osuser + '@' + machine + '</td>';
	output += '</tr>';
	return output;
}
	 
 </script> 
<style type="text/css"> 
#pageContent {
  font-size: 0.5em;
}
#contentTable table { 
  font-size: 1em;
  border-collapse: collapse;
  border: 1px solid black; 
  border-spacing: 0px;
} 
#contentTable td { 
  padding: 5px;
  border: 1px solid black; 
} 
#contentTable th { 
  border: 1px solid black;
  color: white;
  background-color: #336699;
} 
input { background-color: blue; 
background-color: #c4cfcb; 
color: #2f4f4f; 
font-size: 0.25em;
}

</style> 
</head> 
<body>
<div id="pageContent">
Active SQL in <b>${fn:toLowerCase(si.attributes['service_name'].value)}</b>. 
System and oracle user queries are not shown. SQL queries by this site's db login 
(${fn:toLowerCase(si.attributes['login'].value)}) are highlighted 
<span style="background-color:${selfHlColor}; border:1px solid black; padding-left:1em;">&nbsp;</span> 
(not distinguishing if login is in use by multiple webapps).
<p>
<center><input type="submit" name="refresh" value="Refresh"></center>
<br>
<div id="contentTable"></div>
</div>
</body> 
</html>
