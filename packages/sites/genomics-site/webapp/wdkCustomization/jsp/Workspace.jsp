<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>


<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="model" value="${applicationScope.wdkModel}" />
<c:set var="modelName" value="${applicationScope.wdkModel.name}" />

<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>

<c:set var="showHist" value="${requestScope.showHistory}" />
<c:set var="strategies" value="${requestScope.wdkActiveStrategies}"/>

<c:set var="dsCol" value="${param.dataset_column}"/>
<c:set var="dsColVal" value="${param.dataset_column_label}"/>

<c:set var="commandUrl">
    <c:url value="/processSummary.do?${wdk_query_string}" />
</c:set>

<c:set var="headElement">
</c:set>
<imp:header refer="summary" headElement="${headElement}"/>


<!------------------------   ONLY PORTAL  --------------------------------------->
<c:if test="${fn:containsIgnoreCase(modelName, 'EuPathDB')}">
<script>

// Fix record links in results page on EuPathDB
function customResultsPage() {
   var activeView = wdk.findActiveView();
   fixRecordPageLinks(activeView);
}
function customBasketPage() {
   var activeView = wdk.findActiveView();
   fixRecordPageLinks(activeView);
}
function fixRecordPageLinks(viewSelector) {
   $(viewSelector).find(".Results_Table .rootBody tr td div a").each(function() {
         var currentUrl = $(this).attr('href');
         var recordName = parse_Url(currentUrl, "name");
         var primaryKey = parse_Url(currentUrl, "source_id");
         var projectId = parse_Url(currentUrl, "project_id");
         $(this).attr('href','javascript:void(0)');
	 $(this).click(function() {
		create_Portal_Record_Url(recordName, projectId, primaryKey, '');
	 });
   });
}
function create_Portal_Record_Url(recordName, projectId, primaryKey, portal_url) {
  //var portal_url = "";
  if(portal_url.length == 0){
    if(projectId == 'CryptoDB'){
      portal_url = "http://cryptodb.org/cryptodb/showRecord.do?name=" + recordName + "&project_id=" + projectId + "&source_id=" + primaryKey;
    } else  if(projectId == 'AmoebaDB'){
      portal_url = "http://amoebadb.org/amoeba/showRecord.do?name=" + recordName + "&project_id=" + projectId + "&source_id=" + primaryKey;
    } else if(projectId == 'MicrosporidiaDB'){
      portal_url = "http://microsporidiadb.org/micro/showRecord.do?name=" + recordName + "&project_id=" + projectId + "&source_id=" + primaryKey;
    } else if(projectId == 'PlasmoDB'){
      portal_url = "http://plasmodb.org/plasmo/showRecord.do?name=" + recordName + "&project_id=" + projectId + "&source_id=" + primaryKey;
    } else if(projectId == 'ToxoDB'){
      portal_url = "http://toxodb.org/toxo/showRecord.do?name=" + recordName + "&project_id=" + projectId + "&source_id=" + primaryKey;
    } else if(projectId == 'GiardiaDB'){
      portal_url = "http://giardiadb.org/giardiadb/showRecord.do?name=" + recordName + "&project_id=" + projectId + "&source_id=" + primaryKey;
    } else if(projectId == 'PiroplasmaDB'){
      portal_url = "http://piroplasmadb.org/piro/showRecord.do?name=" + recordName + "&project_id=" + projectId + "&source_id=" +   primaryKey;
    } else if(projectId == 'TrichDB'){
      portal_url = "http://trichdb.org/trichdb/showRecord.do?name=" + recordName + "&project_id=" + projectId + "&source_id=" +   primaryKey;
    } else if(projectId == 'TriTrypDB'){
      portal_url = "http://tritrypdb.org/tritrypdb/showRecord.do?name=" + recordName + "&project_id=" + projectId + "&source_id=" +   primaryKey;
    } else if(projectId == 'ApiDB'){
      portal_url = "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?db=nucleotide&cmd=search&term=" + primaryKey; 
    }
    window.location = portal_url;
  } else {
    recordName = parse_Url(portal_url, "name");
    primaryKey = parse_Url(portal_url, "source_id");
    create_Portal_Record_Url(recordName,projectId,primaryKey,"");
  } 
}
function parse_Url( url, parameter_name )
{
  parameter_name = parameter_name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+parameter_name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( url );
  if( results == null )
    return "";
  else
    return results[1];
}
</script>
</c:if>
<!------------------------   END OF ONLY PORTAL  --------------------------------------->


<imp:strategyWorkspace includeDYK="true" />

<imp:footer  refer="customSummary" />
