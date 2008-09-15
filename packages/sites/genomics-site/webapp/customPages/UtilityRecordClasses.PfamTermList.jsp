<%--

Pfam List for Ajax Typeahead
Returns format:

<data><terms>
<term id="PF00244">14-3-3 protein</term>
<term id="PF01138">3' exoribonuclease family, domain 1</term>
</terms></data>

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
    var="tbl" value="${wdkRecord.tables['PfamTerms']}"
/><data><terms>
<c:forEach 
    var="row" items="${tbl}"
><term id="${row['accession'].value}">${row['description'].value}</term>
</c:forEach></terms></data>