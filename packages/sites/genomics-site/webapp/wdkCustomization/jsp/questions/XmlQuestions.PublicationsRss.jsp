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
    value="${scheme}://${serverName}${contextPath}/showXmlDataContent.do?name=XmlQuestions.EuPathDBPubs"
/><c:set
    var="dateStringPattern" value="dd MMMM yyyy HH:mm"
/><c:choose><c:when 
    test="${wdkModel.projectId eq 'EuPathDB'}"
><c:set 
    var="self" value="${scheme}://${serverName}/ebrcpublications.rss"
/></c:when
><c:otherwise
><c:set
    var="self" value="${scheme}://${serverName}/publications.rss"
/></c:otherwise
></c:choose><?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:content="http://purl.org/rss/1.0/modules/content/" 
     xmlns:taxo="http://purl.org/rss/1.0/modules/taxonomy/" 
     xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom" 
     version="2.0">
<channel>
    <atom:link href="${self}" rel="self" type="application/rss+xml" />
    <title>${xmlAnswer.question.displayName}</title>
    <link>${linkTmpl}</link>
    <description>Publications from the EuPathDB Bioinformatics Resource Center</description>
    <language>en</language>
    
<c:forEach items="${xmlAnswer.recordInstances}" var="record">
  <fmt:parseDate pattern="${dateStringPattern}" var="pdate" value="${record.attributesMap['record_date']}" parseLocale="en_US"/> 
  <fmt:formatDate value="${pdate}" pattern="EEE, dd MMM yyyy HH:mm:ss zzz" var="fdate"/>
  <c:set var="title" value="${record.attributesMap['title']}"/>
  <% 
      String rawtitle = (String)pageContext.getAttribute("title");
      String cleantitle = rawtitle.replaceAll("\\<.*?\\>", ""); 
      pageContext.setAttribute("title", cleantitle);
  %>
  <c:set var="tag"       value="${ fn:escapeXml( record.attributesMap['tag']      ) }"/>
  <c:set var="reference" value="${ fn:escapeXml( record.attributesMap['reference']     ) }"/>
  <c:set var="authors"   value="${ fn:escapeXml( record.attributesMap['authors']     ) }"/>
  <c:set var="abstract"  value="${ fn:escapeXml( record.attributesMap['abstract']     ) }"/>
  <c:if test="${record.attributesMap['pmid'] != ''}">
    <c:set var="refid"    value="PMID: ${ fn:escapeXml( record.attributesMap['pmid']     ) }"/>
  </c:if>
  <c:if test="${record.attributesMap['isbn'] != ''}">
    <c:set var="refid"    value="ISBN: ${ fn:escapeXml( record.attributesMap['isbn']     ) }"/>
  </c:if>
  <c:set var="tag"      value="${ fn:replace(tag, ' ', '%20') }"/>
    <item>
        <title>${title}</title>
        <link>${linkTmpl}&amp;tag=${tag}</link>
        <description>  
        &lt;b&gt;${title}&lt;/b&gt;
        &lt;br /&gt; &lt;br /&gt;
        ${reference}
        &lt;br /&gt; &lt;br /&gt;
        ${authors}
        &lt;br /&gt; &lt;br /&gt;
        ${abstract}
        &lt;br /&gt; &lt;br /&gt;
        ${refid}
        </description>
        <guid isPermaLink="false">${tag}</guid>
        <pubDate>${fdate}</pubDate>
        <dc:creator>${authors}</dc:creator>
    </item>
</c:forEach>
</channel>
</rss>