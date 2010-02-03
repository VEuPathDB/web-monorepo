<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>




<c:set var="project" value="${applicationScope.wdkModel.name}" />
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>

<c:set var="xqSetMap" value="${wdkModel.xmlQuestionSetsMap}"/>
<c:set var="xqSet" value="${xqSetMap['XmlQuestions']}"/>
<c:set var="xqMap" value="${xqSet.questionsMap}"/>
<c:set var="extlQuestion" value="${xqMap['ExternalLinks']}"/>
<c:catch var="extlAnswer_exception">
    <c:set var="extlAnswer" value="${extlQuestion.fullAnswer}"/>
</c:catch>

<c:choose>
<c:when test="${wdkUser.stepCount == null}">
<c:set var="count" value="0"/>
</c:when>
<c:otherwise>
<c:set var="count" value="${wdkUser.strategyCount}"/>
</c:otherwise>
</c:choose>

<div id="menubar">
<div id="menu">

<%--
<ul><li><a href="<c:url value="/"/>">Home</a></li></ul>
--%>


<ul>
    <li><a href="<c:url value="/queries_tools.jsp"/>" title="START a NEW search strategy, or CLICK to access the page with all available searches (last option in the dropdown menu)." >New Search</a>
  	<site:drop_down_QG2 />
    </li>
</ul>

<ul>
    <li><a id="mysearch" href="<c:url value="/showApplication.do"/>" title="Access your Search Strategies Workspace">
	My Searches: ${count} 
        </a>
    </li>
</ul>

<%--  <c:if test = "${wdkUser.guest}">   --%>
<ul>
    <li><a title="Here you store your IDs to do further work on them. In the future you will be able to keep selected IDs for other feature types such as ESTs, SNPs, genomic sequences, etc." onclick="this.blur()" href="javascript:showPanel('basket')">My Selected IDs:0</a>
    </li>
</ul>


<ul>
    <li><a href="#" title="Here you store all your favorite IDs for easy access to their data" >My Favorites:0</a>
  
    </li>
</ul>
<%--  </c:if>  --%>

<ul>
    <li><a href="#">Tools</a>
	<ul>

	    <li><a href="<c:url value="/showQuestion.do?questionFullName=UniversalQuestions.UnifiedBlast"/>"> BLAST</a></li>
  	    <li><a href="<c:url value="/srt.jsp"/>"> Sequence Retrieval</a></li>
            <li><a href="/common/PubCrawler/"> PubMed and Entrez</a></li>
 	    <c:if test="${project != 'EuPathDB'}" >
            	<li><a href="/cgi-bin/gbrowse/${fn:toLowerCase(project)}/"> GMOD Genome Browser </a></li>
 	    </c:if>
	    <c:if test="${project == 'PlasmoDB'}" >
		<li><a href="http://v4-4.plasmodb.org/restricted/PlasmoAPcgi.shtml">PlasmoAP</a>
		</li>
		<li><a href="http://gecco.org.chemie.uni-frankfurt.de/pats/pats-index.php">PATS</a>
		</li>
		<li><a href="http://gecco.org.chemie.uni-frankfurt.de/plasmit">PlasMit</a>
		</li>
	    </c:if>
            <c:if test="${project == 'CryptoDB'}" >
            	<li><a href="http://apicyc.apidb.org/CPARVUM/server.html">CryptoCyc</a></li>
            </c:if>
 	    <c:if test="${project == 'PlasmoDB'}" >
            	<li><a href="http://apicyc.apidb.org/PLASMO/server.html">PlasmoCyc</a></li>
            </c:if>
 	    <c:if test="${project == 'ToxoDB'}" >
		<li><a href="http://ancillary.toxodb.org">Ancillary Genome Browser</a></li>
            	<li><a href="http://apicyc.apidb.org/TOXO/server.html">ToxoCyc</a></li>
            </c:if>
	    <li><a href="<c:url value="/serviceList.jsp"/>"> Searches via Web Services</a></li>

    	</ul>

    </li>
</ul>

<ul>
	<li><a href="#">Data Summary</a>
  	<ul>

<c:if test="${project == 'EuPathDB'}">
	    <li><a href="<c:url value='/showXmlDataContent.do?name=XmlQuestions.About#protocols_methods'/>">Data Sources and Methods</a></li>	
</c:if>
<c:if test="${project != 'EuPathDB'}">
   	    <li><a href="<c:url value='/showXmlDataContent.do?name=XmlQuestions.DataSources'/>">Data Sources</a></li>
 	    <li><a href="<c:url value='/showXmlDataContent.do?name=XmlQuestions.Methods'/>">Analysis Methods</a></li>
</c:if>
<c:if test="${project == 'CryptoDB'}">
	 <li id='h-'><a href="http://cryptodb.org/static/SOP/">SOPs for <i>C.parvum</i> Annotation</a></li>
</c:if>


    	<li><a title="Table summarizing all the genomes and their different data types available in EuPathDB" href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.GenomeDataType"/>">EuPathDB Genomes and Data Types</a></li>
	<li><a title="Table summarizing gene counts for all the available genomes, and evidence supporting them" href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.GeneMetrics"/>">EuPathDB Gene Metrics</a></li>


	</ul>
	</li>


</ul>

<ul>
    <li><a href="#">Downloads</a>
 	<ul>
    	    <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#downloads"/>">Understanding Downloads</a></li>
    	    <li><a href="/common/downloads">Data Files</a></li>

    	  <%--  <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#protocols_methods"/>">Protocols and Methods</a></li> --%>
    	    <li><a href="<c:url value="/communityUpload.jsp"/>">Upload Community Files</a></li>
    	    <li><a href="<c:url value="/showSummary.do?questionFullName=UserFileQuestions.UserFileUploads"/>">Download Community Files</a></li>
    	    <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.EuPathDBPubs"/>">EuPathDB Publications</a></li> 
  	</ul>
    </li>
</ul>
    




<ul>
    <li><a href="#">Community</a>
	<ul>
    	    <li><a href="<c:url value="/communityEvents.jsp"/>">Upcoming Events</a></li>
    	    <li><a href="https://community.eupathdb.org">Discussion Forums</a></li>
    	    
    	    <c:choose>
    	    <c:when test="${extlAnswer_exception != null}">
    	    <li><a href="#"><font color="#CC0033"><i>Error. related sites temporarily unavailable</i></font></a></li>
    	    </c:when>
    	    <c:otherwise>
    	    <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.ExternalLinks"/>">Related Sites</a>
    	<%--	<ul>
                    <c:forEach items="${extlAnswer.recordInstances}" var="record">
                      <c:forEach items="${record.tables}" var="table">
                        <c:forEach items="${table.rows}" var="row"> 
                          <c:set var='url' value='${row[1].value}'/>
                          <c:set var='tmp' value='${fn:replace(url, "http://", "")}'/>
                          <c:set var='tmp' value='${fn:replace(tmp, ".", "")}'/>
                          <c:set var='uid' value=''/>
                          <c:forEach var="i" begin="0" end="${fn:length(tmp)}" step='3'>
                            <c:set var='uid'>${uid}${fn:substring(tmp, i, i+1)}</c:set>
                          </c:forEach>
        
                          <li id='rs-${uid}'><a href="${url}">${row[0].value}</a></li>
                        </c:forEach>
                      </c:forEach>
                    </c:forEach> 
    		</ul>--%>
    	    </li>
    	    </c:otherwise>
    	    </c:choose>
    	    
    	    <li><a href="<c:url value="/communityUpload.jsp"/>">Upload Community Files</a></li>
    	    <li><a href="<c:url value="/showSummary.do?questionFullName=UserFileQuestions.UserFileUploads"/>">Download Community Files</a></li>
  	</ul>
    </li>
</ul>



</div>
</div>
<a name="skip" id="skip"></a>
