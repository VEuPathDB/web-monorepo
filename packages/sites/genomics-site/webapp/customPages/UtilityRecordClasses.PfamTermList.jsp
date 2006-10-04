<%--

Pfam List for Ajax Typeahead
Returns format:

<data><pfams>
<pfam pfam_id="PF00244" pfam_term="14-3-3">14-3-3 protein</pfam>
<pfam pfam_id="PF00111" pfam_term="Fer2">2Fe-2S iron-sulfur cluster binding domain</pfam>
</pfams></data>

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
    var="row" items="${tbl.visibleRows}"
><term id="${row['accession'].value}">${row['description'].value}</term>
</c:forEach></terms></data>
<c:set var="junk" value="${tbl.close}"/>
