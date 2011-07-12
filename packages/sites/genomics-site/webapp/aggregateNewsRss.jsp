<%@
    page contentType="text/xml" 
%><%@
    taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" 
%><%@ 
    taglib prefix="x" uri="http://java.sun.com/jsp/jstl/xml" 
%><%@ 
    taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" 
%><%@ 
    taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"
%><%@ 
    taglib prefix="api" uri="http://apidb.org/taglib"
%><%@
    taglib prefix="wir" uri="http://crashingdaily.com/taglib/wheninrome"
%><c:catch 
    var="error"
><%-- 
    setLocale req. for date parsing when client browser (e.g. curl) doesn't send locale 
--%><fmt:setLocale 
    value="en-US"
/><c:set 
    var="project" value="${applicationScope.wdkModel.name}" 
/><api:configurations 
    var="config" configfile="/WEB-INF/wdk-model/config/apifed-config.xml"
/><%--
 wir:feed returns a SyndFeed object which has a Bean interface for
iteration and getting SyndEntry objects and their attributes.
See the Rome API for SyndEntry attributes you can get.
http://www.jarvana.com/jarvana/view/rome/rome/0.9/rome-0.9-javadoc.jar!/index.html
--%><c:set var="rss_Url">
http://${pageContext.request.serverName}/a/showXmlDataContent.do?name=XmlQuestions.NewsRss
</c:set><c:forEach
    items="${config}" var="s"
><c:set 
    var="rss_Url">
    ${rss_Url}
    ${fn:substringBefore(s.value,'services')}showXmlDataContent.do?name=XmlQuestions.NewsRss
</c:set></c:forEach><c:set
    var="dateStringPattern" value="dd MMMM yyyy HH:mm"
/><wir:feed 
    feed="allFeeds" timeout="7000" 
    channelLink="http://eupathdb.org/"
    title="EuPathDB BRC News"
    >
    ${rss_Url}
</wir:feed><wir:sort
    feed="allFeeds" direction="desc" value="date"
/><wir:xmlout feed="allFeeds" />
</c:catch>
