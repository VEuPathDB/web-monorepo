<%-- 
    Do Not insert newlines between any tags preceeding the xml 
    declaration ( <?xml version....> ). This must begin on the first
    line of output to make a valid feed. Not all readers care about this 
    but many do (i.e. Safari, Firefox).
    
    Newlines can be added within tags as demonstrated here.
    
    There's the alternate possiblity of using the 'trimSpaces' init-param
    in the server's web.xml but that's for Tomcat 5.5+ only.
    
--%><%@
    page contentType="application/rss+xml; charset=UTF-8" 
%><%@
    taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" 
%><%@ 
    taglib prefix="x" uri="http://java.sun.com/jsp/jstl/xml" 
%><%@ 
    taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" 
%><%@ 
    taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"
%><%-- 
    setLocale req. for date parsing when client browser (e.g. curl) doesn't send locale 
--%><fmt:setLocale 
    value="en-US"
/><c:set 
    var="wdkModel" value="${applicationScope.wdkModel}"
/><c:set 
    var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"
/><c:set 
    var="scheme" value="${pageContext.request.scheme}" 
/><c:set 
    var="serverName" value="${pageContext.request.serverName}"
/><c:set 
    var="contextPath" value="${pageContext.request.contextPath}" 
/><c:set
    var="linkTmpl" 
    value="${scheme}://${serverName}${contextPath}/showXmlDataContent.do?name=XmlQuestions.News"
/><c:set
    var="dateStringPattern" value="dd MMMM yyyy HH:mm"
/><?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:content="http://purl.org/rss/1.0/modules/content/" 
     xmlns:taxo="http://purl.org/rss/1.0/modules/taxonomy/" 
     xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom" 
     version="2.0">
<channel>
    <title>${xmlAnswer.question.displayName}</title>
    <link>${linkTmpl}</link>
    <description>Releases from ${wdkModel.displayName}</description>
    <language>en</language>
    <atom:link href="${scheme}://${serverName}/releases.rss" rel="self" type="application/rss+xml" />
    
<c:forEach items="${xmlAnswer.recordInstances}" var="record">
  <c:if test="${record.attributesMap['category'] eq 'release'}">
  <fmt:parseDate pattern="${dateStringPattern}" var="pdate" value="${record.attributesMap['date']}" parseLocale="en_US"/> 
  <fmt:formatDate value="${pdate}" pattern="EEE, dd MMM yyyy HH:mm:ss zzz" var="fdate"/>
  <c:set var="headline" value="${ fn:escapeXml( record.attributesMap['headline'] ) }"/>
  <c:set var="tag"      value="${ fn:escapeXml( record.attributesMap['tag']      ) }"/>
  <c:set var="date"     value="${ fn:escapeXml( record.attributesMap['date']     ) }"/>
  <c:set var="item"     value="${ fn:escapeXml( record.attributesMap['item']     ) }"/>
  <c:set var="tag"      value="${ fn:replace(tag, ' ', '%20') }"/>
    <item>
        <title>${headline}</title>
        <link>${linkTmpl}&amp;tag=${tag}</link>
        <description>  
        ${item}
        &lt;br /&gt;
        <fmt:formatDate value="${pdate}" pattern="d MMMM yyyy"/>
        </description>
        <guid isPermaLink="false">${tag}</guid>
        <pubDate>${fdate}</pubDate>
        <dc:creator>${wdkModel.displayName}</dc:creator>
        <dc:type>${record.attributesMap['category']}</dc:type>
    </item>
    </c:if>
</c:forEach>

</channel>
</rss>
