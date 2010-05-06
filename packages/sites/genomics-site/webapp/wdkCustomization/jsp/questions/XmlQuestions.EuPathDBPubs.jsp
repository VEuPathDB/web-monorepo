<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<%-- get wdkXmlAnswer saved in request scope --%>
<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>

<c:set var="banner" value="${xmlAnswer.question.displayName}"/>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<site:header title="EuPathDB Publications"
                 banner="${banner}"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="Publications"
                 division="about"/>

<style type="text/css">
  .thinTopBottomBorders ul { 
    list-style: inside disc;
	padding-left: 2em;
    text-indent: -1em;
  }
  .thinTopBottomBorders ul ul {
    list-style-type: circle;
  }
  .thinTopBottomBorders p {
	margin-top: 1em;
	margin-bottom: 1em;
  }
</style>


<h2>EuPathDB Documents and Publications</h2>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>


<%-- 
  Validate that the date string in the xml is parsable to a date object.
  Parsable date strings aren't strictly needed for this page but are needed 
  for sorting RSS feeds; the check is here so invalid dates will be
  readily detected and corrected by a human.
  
  Also require a unique, non-empty tag so the portal can deduplicate 
  merged component feeds.
--%>
<c:set var="dateStringPattern" value="dd MMMM yyyy HH:mm"/>
<fmt:setLocale value="en-US"/><%-- req. for date parsing when client browser (e.g. curl) doesn't send locale --%>
<jsp:useBean id="tagMap" class="java.util.HashMap" type="java.util.Map"/> 
<c:catch var="InvalidDateError">
  <c:forEach items="${xmlAnswer.recordInstances}" var="record">
    <c:if test="${!break}">
      <c:set var="lastHeadline" value="${record.attributesMap['title']}"/>

      <%-- date field validation --%>
      <fmt:parseDate pattern="${dateStringPattern}" 
                     value="${record.attributesMap['record_date']}" 
                     var="throwaway"/> 

      <%-- tag field validation --%>
      <c:set var="tag" value="${record.attributesMap['tag']}" />
      <c:if test="${empty tag}">
          <c:set var="InvalidTagError" value="Tag is empty."/>
          <c:set var="break" value="true"/>
      </c:if>
      <c:if test="${! empty tagMap[tag]}">
          <c:set var="InvalidTagError" value="Tag '${tag}' is not unique."/>
          <c:set var="break" value="true"/>
      </c:if>
      <c:set target="${tagMap}" property="${tag}" value="1"/>

    </c:if>
  </c:forEach>
</c:catch>

<c:choose>

  <%-- handle empty result set situation --%>
  <c:when test='${xmlAnswer.resultSize == 0}'>
    Not available.
  </c:when>

  <c:when test="${InvalidDateError != null}">
    <font color="red" size="+1">Error parsing record_date of "${lastHeadline}". 
    Expecting date string of the form "03 August 2007 15:30"</font>
  </c:when>
  
  <c:when test="${InvalidTagError != null}">
    <font color="red" size="+1">Invalid tag for "${lastHeadline}": 
    ${InvalidTagError}.</font>
  </c:when>
  
<c:otherwise>

<!-- main body start -->

<c:set var="i" value="1"/>
<c:forEach items="${xmlAnswer.recordInstances}" var="record">
  <c:set var="tag" value="${record.attributesMap['tag']}"/>
  <c:set var="title" value="${record.attributesMap['title']}"/>
  <c:set var="reference" value="${record.attributesMap['reference']}"/>
  <c:set var="links" value="${record.attributesMap['links']}"/>
  <c:set var="pmid" value="${record.attributesMap['pmid']}"/>
  <c:set var="authors" value="${record.attributesMap['authors']}"/>

  <a name="newsText${i}"/>
  <a name="${tag}"/>
  <table border="0" cellpadding="2" cellspacing="0" width="100%">

  <c:if test="${i > 1}"><tr><td colspan="2"><hr></td></tr></c:if>
  <tr class="rowLight"><td>
    ${authors}<br>
    <b>${title}</b><br>
    ${reference}<br>
    ${links}
    </td></tr></table>
  <c:set var="i" value="${i+1}"/>
</c:forEach>

<!-- main body end -->

  </c:otherwise>
</c:choose>


  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>


