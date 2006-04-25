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

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>

<%-- handle empty result set situation --%>
<c:choose>
  <c:when test='${xmlAnswer.resultSize == 0}'>
    Not available.
  </c:when>
  <c:otherwise>

<!-- main body start -->

<table border="0" cellpadding="2" cellspacing="0" width="100%">

<c:set var="i" value="0"/>
<c:set var="alreadyPrintedSomething" value="false"/>
<c:forEach items="${xmlAnswer.recordInstances}" var="record">

<c:set var="datasetList" value=",${param['datasets']},"/>
<c:set var="resourcePattern" value=",${record.id},"/>

<c:choose>

<c:when test="${param['idx'] != null && param['idx'] != i}">
</c:when>

<c:when test="${param['datasets'] != null && !fn:contains(datasetList, resourcePattern)}">
</c:when>

<c:otherwise>
<tr class="rowLight">
  <td>

  <c:if test="${alreadyPrintedSomething}"><hr></c:if>
  <c:set var="alreadyPrintedSomething" value="true"/>

  <c:set var="resource" value="${record.attributesMap['resource']}"/>
  <c:set var="publicUrl" value="${record.attributesMap['publicUrl']}"/>
  <c:set var="organisms" value="${record.attributesMap['organisms']}"/>
  <c:set var="description" value="${record.attributesMap['description']}"/>
  <c:set var="category" value="Category: ${record.attributesMap['category']}<br>"/>
  <c:set var="version" value="${record.attributesMap['version']}"/>


<b>${resource}</b> (${version})<br>
<font size="-1">
<c:if test="${publicUrl != ''}"><a href="${publicUrl}">${publicUrl}</a><br></c:if>

<c:if test="${organisms != ''}">Organisms: ${organisms}<br></c:if>

<br>${description}<br><br>


  <c:set var="pubMedPrefix" value="PubMed:"/>
  <c:forEach items="${record.tables}" var="tblEntry">
    <c:set var="rows" value="${tblEntry.rows}"/>
      <c:forEach items="${rows}" var="row">
 
        <c:forEach var="rCol" items="${row}">
          <c:set var="pmid" value="${rCol.value}"/>
${pubMedPrefix}
<a href="http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?cmd=Retrieve&db=pubmed&dopt=Abstract&list_uids=${pmid}"> ${pmid}</a>
          <c:set var="pubMedPrefix" value=" | "/>

        </c:forEach>
      </c:forEach>
  </c:forEach>

</font>
  </td>
</tr>
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

<site:footer/>
