<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
<%@ taglib prefix="nested" uri="http://struts.apache.org/tags-nested" %>

<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="dateStringPattern" value="dd MMMM yyyy HH:mm"/>
<fmt:setLocale value="en-US"/><%-- req. for date parsing when client browser (e.g. curl) doesn't send locale --%>
<c:set var="rssUrl" value="showXmlDataContent.do?name=XmlQuestions.NewsRss"/>

<imp:pageFrame title="${wdkModel.displayName} : News">
  <link rel="alternate" type="application/rss+xml" 
    title="RSS Feed for ${wdkModel.displayName}" 
    href="${rssUrl}" />

<!-- 
  Validate that the date string in the xml is parsable to a date object.
  Parsable date strings aren't strictly needed for news but are needed 
  for sorting RSS feeds; the check is here so invalid dates will be
  readily detected and corrected by a human.
  
  Also require a unique, non-empty tag so the portal can deduplicate 
  merged component feeds.
-->
<jsp:useBean id="tagMap" class="java.util.HashMap" type="java.util.Map"/> 
<c:catch var="InvalidDateError">
  <c:forEach items="${xmlAnswer.recordInstances}" var="record">
    <c:if test="${!break}">
      <c:set var="lastHeadline" value="${record.attributesMap['headline']}"/>

      <!-- date field validation -->
      <fmt:parseDate pattern="${dateStringPattern}" 
                     value="${record.attributesMap['date']}" 
                     var="throwaway"/> 

      <!-- tag field validation -->
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


<!-- handle empty result set situation -->
<c:choose>
  <c:when test='${xmlAnswer.resultSize == 0}'>
    Not available.
  </c:when>

  <c:when test="${InvalidDateError != null}">
    <font color="red" size="+1">Error parsing date of "${lastHeadline}". 
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

  <fmt:parseDate pattern="${dateStringPattern}" var="pdate" value="${record.attributesMap['date']}"/> 
  <fmt:formatDate var="fdate" value="${pdate}" pattern="d MMMM yyyy"/>

  <c:set var="headline" value="${record.attributesMap['headline']}"/>
  <c:set var="tag" value="${record.attributesMap['tag']}"/>
  <c:set var="item" value="${record.attributesMap['item']}"/>

  <!-- if a 'tag' parameter is included in the url querystring and its value matches the 
        XmlRecord's tag, show the matching record and skip the others. If there is no tag parameter, 
        show all records. 
        Examples: 
            /showXmlDataContent.do?name=XmlQuestions.News      
            /showXmlDataContent.do?name=XmlQuestions.News&tag=toxo2_11_news
        The latter record-specific URL is used in RSS feeds.
  -->
  <c:if test="${param.tag eq tag or param.tag == null or param.tag == ''}">
    <a name="newsItem${i}"/>
    <a name="${tag}"/>
    <c:if test="${i > 1}"><hr></c:if>

 <!-- these headlines do not need to link once in the news page
    <a href="showXmlDataContent.do?name=XmlQuestions.News&amp;tag=${tag}"> -->
    <h2 style="color:maroon">${headline}</h2>
	  <i>(${fdate})</i>
    <br><br>
    ${item}
    <br><hr>
    <c:set var="i" value="${i+1}"/>
  </c:if>

</c:forEach>

<br>

<table width='100%'>
<tr><td>
<c:if test="${param.tag != null and param.tag != ''}">
  <!-- if a tag parameter is included in the url querystring we will be showing only
       one record, so add a link to a page with 'All' records -->
 <a href="showXmlDataContent.do?name=XmlQuestions.News" id='allnews'>All ${xmlAnswer.question.displayName}</a>
</c:if>
</td><td align="right">
<a href="${rssUrl}">
  <img src="${pageContext.request.contextPath}/images/feed-icon16x16.png" alt="" border='0'>
<font size='-2' color='black'>RSS</font></a>
</td></tr>
</table>

<!-- main body end -->

  </c:otherwise>
</c:choose>

</imp:pageFrame>
