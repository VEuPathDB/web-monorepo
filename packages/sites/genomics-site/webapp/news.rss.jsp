<%-- 
    Do Not insert newlines between any tags preceeding <x:transform>
    
    The xml declaration ( <?xml version....> ) must begin on the first
    line to make a valid feed. Not all readers care about this  but 
    many do (i.e. Safari, Firefox).
    
    Newlines can be added within tags as demonstrated here.
    
    There's the alternate possiblity of using the 'trimSpaces' init-param
    in the server's web.xml but that's for Tomcat 5.5+ only.
    
--%><%@
    page contentType="text/xml" 
%><%@
    taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" 
%><%@ 
    taglib prefix="x" uri="http://java.sun.com/jsp/jstl/xml" 
%><c:set 
    var="wdkModel" value="${applicationScope.wdkModel}"
/><c:set 
    var="xqSet" value="${wdkModel.xmlQuestionSetsMap['XmlQuestions']}" 
/><c:set 
    var="newsModel" value="${xqSet.questionsMap['News']}"
/><c:set 
    var="scheme" value="${pageContext.request.scheme}" 
/><c:set 
    var="serverName" value="${pageContext.request.serverName}"
/><c:set 
    var="contextPath" value="${pageContext.request.contextPath}" 
/><c:set
    var="linkTmpl" 
    value="${scheme}://${serverName}${contextPath}/showXmlDataContent.do?name=XmlQuestions.News&tag="
/><c:import 
    var="xml" url="/WEB-INF/wdk-model/lib/xml/${newsModel.xmlDataURL}" 
/><c:import 
    var="xslt" url="/WEB-INF/wdk-model/lib/xml/news2rss.xsl" 
/><x:transform 
    xml="${xml}" xslt="${xslt}">
    <x:param name="displayName" value="${wdkModel.displayName}"/>
    <x:param name="channelTitle" value="${newsModel.displayName}"/>
    <x:param name="linkTmpl" value="${linkTmpl}"/>
</x:transform>

