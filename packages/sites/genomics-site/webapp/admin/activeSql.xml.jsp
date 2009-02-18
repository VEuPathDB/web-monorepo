<%@
    page contentType="text/xml" 
%><%@
    taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" 
%><%@ 
    taglib prefix="api" uri="http://apidb.org/taglib"
%><%@ 
    taglib prefix="fn"  uri="http://java.sun.com/jsp/jstl/functions"
%><api:wdkRecord 
    name="UtilityAjaxClasses.CurrentlyRunningSql" source_id="mheiges"
/><c:set 
    var="tbl" value="${wdkRecord.tables['CurrentlyRunningSql']}"
/><querySet>
<c:forEach 
    var="row" items="${tbl}"
>  <query>
<c:forEach
 var="col" items="${row}"
><c:choose
><c:when test="${col.value.displayName == 'sql_fulltext'}"
>     <${col.value.displayName}><![CDATA[${fn:escapeXml(col.value.value)}]]></${col.value.displayName}>
</c:when
><c:otherwise
>     <${col.value.displayName}>${col.value.value}</${col.value.displayName}>
</c:otherwise
></c:choose
></c:forEach
>  </query>
</c:forEach
></querySet>