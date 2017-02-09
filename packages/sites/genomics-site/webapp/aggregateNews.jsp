<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="x" uri="http://java.sun.com/jsp/jstl/xml" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="api" uri="http://eupathdb.org/taglib"%>
<%@ taglib prefix="wir" uri="http://crashingdaily.com/taglib/wheninrome"%>

<c:catch var="error">
<%--  setLocale req. for date parsing when client browser (e.g. curl) doesn't send locale --%>
<fmt:setLocale value="en-US"/>

<api:configurations 
    var="config" configfile="/WEB-INF/wdk-model/config/projects.xml"
/>
<%--
 wir:feed returns a SyndFeed object which has a Bean interface for
iteration and getting SyndEntry objects and their attributes.
See the Rome API for SyndEntry attributes you can get.
http://www.jarvana.com/jarvana/view/rome/rome/0.9/rome-0.9-javadoc.jar!/index.html
--%>
<c:set var="rss_Url">
  http://${pageContext.request.serverName}/a/showXmlDataContent.do?name=XmlQuestions.NewsRss
</c:set>

<c:forEach items="${config}" var="s">
  <c:if test="${!fn:contains(s, 'EuPathDB')}"> <%-- projects.xml contains an empty value for eupathdb, let's skip it --%>
    <c:set 
      var="rss_Url">
      ${rss_Url}
      ${fn:substringBefore(s.value,'services')}/showXmlDataContent.do?name=XmlQuestions.NewsRss
    </c:set>
  </c:if>
</c:forEach>
<%-- Thu May 13 15:00:00 EDT 2010 --%>
<c:set
    var="dateStringPattern" value="EEE MMMM d HH:mm:ss z yyyy"
/>

<wir:feed 
    feed="allFeeds" timeout="7000" 
    channelLink="http://eupathdb.org/"
    title="EuPathDB BRC News"
    >
    ${rss_Url}
</wir:feed>
<wir:sort
    feed="allFeeds" direction="desc" value="date"
/>

</c:catch> 

<imp:pageFrame title="${wdkModel.displayName} : News"
                 banner="${banner}"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="News"
                 division="news">

<c:choose>
<c:when test="${error != null}">
	<i>News is temporarily unavailable</i>
</c:when>
<c:otherwise>

<c:set var="i" value="1"/>
<c:forEach items="${allFeeds.entries}" var="e">

  <fmt:parseDate pattern="${dateStringPattern}" var="pdate" value="${e.publishedDate}"/> 
  <fmt:formatDate var="fdate" value="${pdate}" pattern="d MMMM yyyy"/>

  <c:set var="headline" value="${e.title}"/>
  <c:set var="tag" value="${e.uri}"/>
  <c:set var="item" value="${e.description.value}"/>
  <c:if test="${param.tag == null or param.tag eq tag or param.tag == ''}">
    <a name="${tag}"/>
    <table id="news">
  
    <c:if test="${i > 1}"><tr><td colspan="2"><hr></td></tr></c:if>
    <tr class="rowLight"><td>
 <!--   <a style="text-decoration:none" href="aggregateNews.jsp?tag=${tag}">  -->
	<font color='black'><b>${headline}</b></font>
	<!-- </a>  -->
	(${fdate})<br><br>
	${item}</td></tr>
    </table>
  <c:set var="i" value="${i+1}"/>
  </c:if>

</c:forEach>

<table width='100%'>
<tr><td>
	<c:if test="${param.tag != null and param.tag != ''}">
 	<a href="aggregateNews.jsp" id='allnews'>All EuPathDB News</a>
	</c:if>
</td>
<td align="right">
	<a href="${rssUrl}">
  	<imp:image src="images/feed-icon16x16.png" alt="" border='0'/>
	<font size='-2' color='black'>RSS</font></a>
</td></tr>
</table>

</c:otherwise>
</c:choose>
</imp:pageFrame>
