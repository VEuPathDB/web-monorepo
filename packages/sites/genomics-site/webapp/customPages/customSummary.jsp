<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<%-- from customQueryHistory --%>
<%-- get wdkUser saved in session scope --%>
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<%-- end from customQueryHistory --%>

<c:set var="dsCol" value="${param.dataset_column}"/>
<c:set var="dsColVal" value="${param.dataset_column_label}"/>

<c:set var="model" value="${applicationScope.wdkModel}" />
<c:set var="showHist" value="${requestScope.showHistory}" />
<c:set var="strategies" value="${requestScope.wdkActiveStrategies}"/>
<c:set var="modelName" value="${applicationScope.wdkModel.name}" />

<c:set var="commandUrl">
    <c:url value="/processSummary.do?${wdk_query_string}" />
</c:set>

<c:set var="headElement">
<link rel="stylesheet" href="/assets/css/flexigrid/flexigrid.css" type="text/css"/>
</c:set>
<site:header refer="customSummary" headElement="${headElement}"/>
<site:dyk />
<c:set var="scheme" value="${pageContext.request.scheme}" />
<c:set var="serverName" value="${pageContext.request.serverName}" />
<c:set var="request_uri" value="${requestScope['javax.servlet.forward.request_uri']}" />
<c:set var="request_uri" value="${fn:substringAfter(request_uri, '/')}" />
<c:set var="request_uri" value="${fn:substringBefore(request_uri, '/')}" />
<c:set var="exportBaseUrl" value = "${scheme}://${serverName}/${request_uri}/im.do?s=" />

<%-- inline script for initial load of summary page --%>
<script type="text/javascript" language="javascript">
        var guestUser = '${wdkUser.guest}';
        init_strat_ids = ${strategies};
        <c:if test="${wdkUser.viewStrategyId != null && wdkUser.viewStepId != null}">
          init_view_strat = "${wdkUser.viewStrategyId}";
          init_view_step = "${wdkUser.viewStepId}";
        </c:if>
        $(document).ready(function(){
		// tell jQuery not to cache ajax requests.
		$.ajaxSetup ({ cache: false}); 
		exportBaseURL = '${exportBaseUrl}';
		var current = getCurrentTabCookie();
		if (!current || current == null)
			showPanel('strategy_results');
		else
	                showPanel(current);
	});

  function goToIsolate() {
    var form = document.checkHandleForm;
    var cbs = form.selectedFields;
    var count = 0;
    var url = "/cgi-bin/isolateClustalw?project_id=${modelName};isolate_ids=";
    for (var i=0; i < cbs.length; i++) {
      if(cbs[i].checked) {
      url += cbs[i].value + ",";
      count++;
      }
    }
    if(count < 2) {
      alert("Please select at lease two isolates to run ClustalW");
      return false;
    }
    window.location.href = url;
  }

  function create_Portal_Record_Url(recordName, projectId, primaryKey, portal_url) {
  //var portal_url = "";
  if(portal_url.length == 0){
    if(projectId == 'CryptoDB'){
      portal_url = "http://cryptodb.org/cryptodb/showRecord.do?name=" + recordName + "&project_id=" + projectId + "&source_id=" + primaryKey;
    } else if(projectId == 'PlasmoDB'){
      portal_url = "http://plasmodb.org/plasmo/showRecord.do?name=" + recordName + "&project_id=" + projectId + "&source_id=" + primaryKey;
    } else if(projectId == 'ToxoDB'){
      portal_url = "http://toxodb.org/toxo/showRecord.do?name=" + recordName + "&project_id=" + projectId + "&source_id=" + primaryKey;
    } else if(projectId == 'GiardiaDB'){
      portal_url = "http://giardiadb.org/giardiadb/showRecord.do?name=" + recordName + "&project_id=" + projectId + "&source_id=" + primaryKey;
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


<%--------------- TABS ---------------%>

<div id="strategy_workspace" class="h2center">
My Search Strategies Workspace
</div>


<ul id="strategy_tabs">
<%-- showPanel() is in filter_menu.js --%>

   <li><a id="tab_strategy_new" title="START a NEW strategy: CLICK to access the page with all available searches"   
	href="javascript:showPanel('strategy_new')" >New Strategy</a></li>
   <li><a id="tab_strategy_results" title="Graphical display of your opened strategies. To close a strategy click on the right top corner X." 
	onclick="this.blur()" href="javascript:showPanel('strategy_results')">Run</a></li>
   <li><a id="tab_search_history" title="Summary of all your strategies. From here you can open/close strategies on the 'Run Strategies' tab, our graphical display." 
	onclick="this.blur()" href="javascript:showPanel('search_history')">Browse</a></li>
   <li><a style="padding-left:5px;" id="tab_basket" title="Where to store your GENES of interest. YOU NEED TO LOGIN to use the basket. In the future you will be able to have baskets for other feature types such as ESTs, SNPs, genomic sequences, etc." onclick="this.blur()" href="javascript:showPanel('basket')"><img class="basket" src="/assets/images/basket_gray.png" width="15" height="15"/>&nbsp;My Basket</a></li>
   <li><a id="tab_sample_strat"  onclick="this.blur()" title="View some examples of linear and non-linear strategies." 
	href="javascript:showPanel('sample_strat')">Examples</a></li>
   <li><a id="tab_help" href="javascript:showPanel('help')"  title="List of hints on how to use our website, also available in the Did You Know popup">Help</a></li>

</ul>





<%--------------- REST OF PAGE ---------------%>

<c:set var="newStrategy" value="${requestScope.newStrategy}" />
<c:set var="newStrat"><c:if test="${newStrategy != null && newStrategy == true}">newStrategy="true"</c:if></c:set>

<div id="strategy_results">
	<div id="Strategies" ${newStrat}>
	</div>

	<input type="hidden" id="target_step" value="${stepNumber+1}"/>

	<br/>

	<div id="Workspace">&nbsp;
	</div> 

</div>

<div id="search_history">
</div>

<div id="basket">
	<table class="basket"><tr>
		<td><input type="button" value="Refresh" onClick="showBasket();"/></td>
		<td><input type="button" value="Empty Basket" onClick="updateBasket(this,'clear',0,0,'GeneRecordClasses.GeneRecordClass')"/></td>
	</tr></table>
	<div id="Workspace">&nbsp;</div>
</div>

<div id="sample_strat">
        <site:sampleStrategies wdkModel="${wdkModel}" wdkUser="${wdkUser}" />
</div>


<div id="help" style="display:none">
        <site:helpStrategies wdkModel="${wdkModel}" wdkUser="${wdkUser}" />
</div>


<div id="strategy_new" style="display:none">
        <site:queryGrid  from="tab"/>
</div>

<site:footer />
