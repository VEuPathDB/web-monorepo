<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="x" uri="http://java.sun.com/jsp/jstl/xml" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="api" uri="http://apidb.org/taglib"%>
<%@ taglib prefix="synd" uri="http://crashingdaily.com/taglib/syndication"%>


<c:catch var="error">
<%-- 
    setLocale req. for date parsing when client browser (e.g. curl) doesn't send locale 
--%>

<fmt:setLocale value="en-US"/>

<c:set 
    var="project" value="${applicationScope.wdkModel.name}" 
/>

<api:configurations 
    var="config" configfile="WEB-INF/wdk-model/config/apifed-config.xml"
/>

<%--
 synd:feed returns a SyndFeed object which has a Bean interface for
iteration and getting SyndEntry objects and their attributes.
See the Rome API for SyndEntry attributes you can get.
https://rome.dev.java.net/apidocs/0_9/com/sun/syndication/feed/synd/package-summary.html
--%>
<c:set var="rss_Url">
http://${pageContext.request.serverName}/a/showXmlDataContent.do?name=XmlQuestions.NewsRss
</c:set>

<c:forEach items="${config}" var="s">
<c:set 
    var="rss_Url">
    ${rss_Url}
    ${fn:substringBefore(s.value,'services')}showXmlDataContent.do?name=XmlQuestions.NewsRss
</c:set>
</c:forEach>
<%-- Thu May 13 15:00:00 EDT 2010 --%>
<c:set
    var="dateStringPattern" value="EEE MMMM d HH:mm:ss z yyyy"
/>
<synd:feed 
    feed="allFeeds" timeout="7000" 
    channelLink="http://eupathdb.org/"
    title="EuPathDB BRC News"
    >
    ${rss_Url}
</synd:feed>
<synd:sort
    feed="allFeeds" direction="desc" value="date"
/>

</c:catch>






<c:set var="rssUrl" value="showXmlDataContent.do?name=XmlQuestions.NewsRss"/>
<c:set var="headElement">
<link rel="alternate" type="application/rss+xml" 
  title="RSS Feed for ${wdkModel.displayName}" 
  href="${rssUrl}" />
</c:set>

<site:header title="${wdkModel.displayName} : News"
                 banner="${banner}"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="News"
                 division="news"
                 headElement="${headElement}" 
/>
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

<table border='0' width='100%' cellpadding='3' cellspacing='0' 
       bgcolor='white' class='thinTopBottomBorders'> 

 <tr>
  <td bgcolor=white valign=top>

<c:set var="i" value="1"/>
<c:forEach items="${allFeeds.entries}" var="e">

  <fmt:parseDate pattern="${dateStringPattern}" var="pdate" value="${e.publishedDate}"/> 
  <fmt:formatDate var="fdate" value="${pdate}" pattern="d MMMM yyyy"/>

  <c:set var="headline" value="${e.title}"/>
  <c:set var="tag" value="${e.author}"/>
  <c:set var="item" value="${e.description.value}"/>

  <c:if test="${param.tag == null or param.tag eq tag or param.tag == ''}">
    <a name="newsItem${i}"/>
    <a name="${e.author}"/>
    <table border="0" cellpadding="2" cellspacing="0" width="100%">
  
    <c:if test="${i > 1}"><tr><td colspan="2"><hr></td></tr></c:if>
    <tr class="rowLight"><td>
      <a href="showXmlDataContent.do?name=XmlQuestions.News&amp;tag=${tag}">
      <font color='black'><b>${headline}</b></font></a> (${fdate})<br><br>
      ${item}</td></tr></table>
    <c:set var="i" value="${i+1}"/>
  </c:if>

</c:forEach>

<p>

<table width='100%'>
<tr><td>
<c:if test="${param.tag != null and param.tag != ''}">
 <a href="showXmlDataContent.do?name=XmlQuestions.News" id='allnews'>All EuPathDB News</a>
</c:if>
</td><td align="right">
<a href="${rssUrl}">
  <img src="${pageContext.request.contextPath}/images/feed-icon16x16.png" alt="" border='0'>
<font size='-2' color='black'>RSS</font></a>
</td></tr>
</table>


  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
