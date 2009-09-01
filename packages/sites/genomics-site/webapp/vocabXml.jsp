<%--

XML for Ajax typeahead params

JSTL below is formatted to prevent blank lines
--%>
<%@ 
    page contentType="text/xml"
%><%@
    taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" 
%><%@
    taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"
%><c:set 
    value="${requestScope.vocabParam.displayMap}" 
    var="displayMap"
/><data><terms>
<c:forEach 
    var="row" items="${displayMap}"
><term id="${row.key}">${fn:replace(fn:replace(fn:replace(row.value,"<","&lt;"),">","&gt;"),"&","&amp;")}</term>
</c:forEach></terms></data>
