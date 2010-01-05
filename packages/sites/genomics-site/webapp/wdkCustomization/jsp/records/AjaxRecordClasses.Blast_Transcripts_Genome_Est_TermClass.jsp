<%--

InterPro domain list for Ajax typeahead

JSTL below is formatted to prevent blank lines
--%>
<%@ 
    page contentType="text/xml"
%><%@
    taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" 
%><c:set 
    value="${requestScope.wdkRecord}" 
    var="wdkRecord"
/><c:set 
    var="tbl" value="${wdkRecord.tables['BlastTGETerms']}"
/><data><terms>
<c:forEach 
    var="row" items="${tbl}"
><term id="${row['internal'].value}">${row['term'].value}</term>
</c:forEach></terms></data>
