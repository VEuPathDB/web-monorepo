<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- get wdkXmlAnswer saved in request scope -->
<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>

<c:choose>

<c:when test="${param['idx'] != null}">
  <c:set var="banner" value="Featured Dataset"/>
</c:when>

<c:when test="${param['datasets'] != null}">
  <c:set var="banner" value="Data Sources for ${param['title']}"/>
</c:when>

<c:otherwise>
<c:set var="banner" value="${xmlAnswer.question.displayName}"/>
</c:otherwise>
</c:choose>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<site:header title="${wdkModel.displayName} : Data Sources"
                 banner="${banner}"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="Data Sources"
                 division="data_sources"/>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBorders> 

 <tr>
  <td bgcolor=white valign=top>

<%-- handle empty result set situation --%>
<c:choose>
  <c:when test='${xmlAnswer.resultSize == 0}'>
    Not available.
  </c:when>
  <c:otherwise>

<!-- main body start -->
<c:if test="${param['datasets'] == null}">
<c:set var="tocBegin" value="true"/>
<c:forEach items="${xmlAnswer.recordInstances}" var="pass1record">
	<c:set var="currentCat" value="${pass1record.attributesMap['category']}"/>
	<c:set var="showCat" value="false"/>
	<c:choose>
	<c:when test="${tocBegin}">
		<c:set var="showCat" value="true"/>
	</c:when>
	<c:otherwise>
		<c:if test="${prevCat ne currentCat}">
			<c:set var="showCat" value="true"/>
		</c:if>
	</c:otherwise>
	</c:choose>
	<c:if test="${tocBegin}">
		<b><a name="toc"></a>DataSources Categories</b>
		<ul>
	</c:if>
	<c:if test="${showCat}">
		<li><a href="#${currentCat}">${currentCat}</a></li>
	</c:if>
	<c:set var="tocBegin" value="false"/>
	<c:set var="prevCat" value="${currentCat}"/>
	</c:forEach>
		</ul>
</c:if>

<table border="0" cellpadding="2" cellspacing="0" width="100%">

<c:set var="i" value="0"/>
<c:set var="alreadyPrintedSomething" value="false"/>
<c:set var="prevCat" value="null"/>

<c:forEach items="${xmlAnswer.recordInstances}" var="record">

<c:set var="datasetList" value=",${param['datasets']},"/>
<c:set var="resourcePattern" value=",${record.id},"/>

<c:choose>

<c:when test="${param['idx'] != null && param['idx'] != i}">
</c:when>

<c:when test="${param['datasets'] != null && !fn:contains(datasetList, resourcePattern)}">
</c:when>

<c:otherwise>
  <c:set var="display" value="${record.attributesMap['display']}"/>
  <c:if test="${display}">
  <c:set var="resource" value="${record.attributesMap['resource']}"/>
  <c:set var="publicUrl" value="${record.attributesMap['publicUrl']}"/>
  <c:set var="organisms" value="${record.attributesMap['organisms']}"/>
  <c:set var="description" value="${record.attributesMap['description']}"/>
  <c:set var="currentCat" value="${record.attributesMap['category']}"/>
  <c:set var="version" value="${record.attributesMap['version']}"/>
  
  	<c:set var="printedHeader" value="false"/>
    <c:if test="${param['datasets'] == null && (prevCat == null || prevCat ne currentCat)}">
      	<tr><td><br/></td></tr>
  		<tr class="headerRow">
	  	<td><b><i><a name="${currentCat}">${currentCat}</a></i></b></td>
	  	<td><font size="-1">[&nbsp;<a href="#toc">Top</a>&nbsp;]</font></td>
  		</tr>
  		<tr><td><br/></td></tr>
  		<c:set var="printedHeader" value="true"/>
  </c:if>
  
  <c:set var="prevCat" value="${currentCat}"/>
  
<tr class="rowLight">
  <td>

  <c:if test="${alreadyPrintedSomething && !printedHeader}"><hr/></c:if>
  <c:set var="alreadyPrintedSomething" value="true"/>

<a name="${record.id}"><b>${resource}</b></a> (version: ${version})<br>
<font size="-1">
<c:if test="${publicUrl != ''}"><a href="${publicUrl}">${publicUrl}</a><br></c:if>

<c:if test="${organisms != ''} || ${organisms != null}">Organisms: ${organisms}<br></c:if>

<br>${description}<br><br>

  <c:set var="pubMedPrefix" value="PubMed: "/>
  <c:set var="pubmedReferences" value="References:"/>
  <c:set var="pubmedFirstTime" value="true"/>
  <c:forEach items="${record.tables}" var="tblEntry">
    <c:set var="rows" value="${tblEntry.rows}"/>
      <c:forEach items="${rows}" var="row">
	    <c:choose>
		<c:when test="${!empty row[1].value}">
	  	    <c:if test="${pubmedFirstTime}">
		      ${pubmedReferences}
		      <c:set var="pubmedFirstTime" value="false"/>
			  <ul>
		    </c:if>

		    <c:set var="pmid" value="${row[0].value}"/>
		    <c:set var="pmdetails" value="${row[1].value}"/>
		    <c:set var="pmauthors" value="${row[2].value}"/>
		    <c:set var="pmtitle" value="${row[3].value}"/>
            <li><a href="http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?cmd=Retrieve&db=pubmed&dopt=Abstract&list_uids=${pmid}">
   		    ${pmauthors}
		    ${pmtitle}
		    ${pmdetails}
		    </a>
		    </li>
	  </c:when>
	  <c:otherwise>
          <c:set var="pmid" value="${row[0].value}"/>
          ${pubMedPrefix}
          <a href="http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?cmd=Retrieve&db=pubmed&dopt=Abstract&list_uids=${pmid}"> ${pmid}</a>
          <c:set var="pubMedPrefix" value=" | "/>
	  
	  </c:otherwise>
	  </c:choose>

      </c:forEach>
	  <c:if test="false(${pubmedFirstTime})">
	  </ul>
	  </c:if>
  </c:forEach>

</font>
  </td>
</tr>
</c:if> <!-- end display=true -->
</c:otherwise>
</c:choose>

<c:set var="i" value="${i+1}"/>
</c:forEach>

</tr>
</table>

<!-- main body end -->

  </c:otherwise>
</c:choose>


  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 
<br/>
<c:if test="${param['datasets'] != null}">
<a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.DataSources"/>"><font size="-1">Click here to see the complete list of Data Sources</font></a><br/>
</c:if>
<site:footer/>
