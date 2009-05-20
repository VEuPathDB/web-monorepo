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
<c:set var="extlAnswer" value="${extlQuestion.fullAnswer}"/>

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


<ul><li><a href="<c:url value="/"/>">Home</a></li></ul>

<ul>
    <li><a href="#" title="To access the page with all available searches, choose the last option in the dropdown menu." >New Search</a>
  	<site:drop_down_QG />
    </li>
</ul>

<ul>
    <li><a id="mysearch" href="<c:url value="/showApplication.do"/>" title="Access a summary with all your searches">
<%-- 	<div id="mysearch">My Searches: ${count}</div>   --%>
	My Searches: ${count} 
        </a>
    </li>
</ul>

<ul>
    <li><a href="#">Tools</a>
	<ul>
	    <li><a href="<c:url value="/showQuestion.do?questionFullName=UniversalQuestions.UnifiedBlast"/>"> BLAST</a></li>
</span>
  	    <li><a href="<c:url value="/srt.jsp"/>"> Sequence Retrieval</a></li>
            <li><a href="/common/PubCrawler/"> PubMed and Entrez</a></li>
            <li><a href="/cgi-bin/gbrowse/"> GBrowse</a></li>
            <c:if test="${project == 'CryptoDB'}" >
            	<li><a href="http://apicyc.apidb.org/CPARVUM/server.html">CryptoCyc</a></li>
            </c:if>

    	</ul>

    </li>
</ul>

<ul>
    <li><a href="#">Data Sources</a>
  	<ul>
   	    <li><a href="<c:url value='/showXmlDataContent.do?name=XmlQuestions.DataSources'/>">Data Detail</a></li>
 	    <li><a href="<c:url value='/showXmlDataContent.do?name=XmlQuestions.Methods'/>">Analysis Methods</a></li>
<%--
   		<li><a href="#">Data Statistics</a></li>
                <li><a href="#">Standard Operating Procedures (SOPs)</a></li>
--%>
  	</ul>
    </li>
</ul>

<ul>
    <li><a href="#">Downloads</a>
 	<ul>
    	    <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#download"/>">Understanding Downloads</a></li>
    	    <li><a href="/common/downloads">Data Files</a></li>
    	    <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#doc-prot"/>">Documents and Publications</a></li> 
    	    <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#doc-prot"/>">Protocols and Methods</a></li>
    	    <li><a href="<c:url value="/communityUpload.jsp"/>">Upload Community Files</a></li>
    	    <li><a href="<c:url value="/showSummary.do?questionFullName=UserFileQuestions.UserFileUploads"/>">Download Community Files</a></li>
  	</ul>
    </li>
</ul>
    
<ul>
    <li><a href="#">Community</a>
	<ul>
    	    <li><a href="<c:url value="/communityEvents.jsp"/>">Upcoming Events</a></li>
    	    <li><a href="https://community.eupathdb.org/forum">Discussion Forums</a></li>
    	    <li><a href="#">Related Sites</a>
    		<ul>
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
    		</ul>
    	    </li>
    	    <li><a href="<c:url value="/communityUpload.jsp"/>">Upload Community Files</a></li>
    	    <li><a href="<c:url value="/showSummary.do?questionFullName=UserFileQuestions.UserFileUploads"/>">Download Community Files</a></li>
  	</ul>
    </li>
</ul>



</div>
</div>
<a name="skip" id="skip"></a>
