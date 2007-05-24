<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<%@ attribute name="tblName"
              required="true"
              description="Value to appear at top of page"
%>

<%@ attribute name="align"
              required="false"
              description="Value to appear at top of page"
%>

<c:if test="!${align}">
    <c:set var="align" value="center" />
</c:if>
<c:set var="wdkRecord" value="${requestScope.wdkRecord}" />
<c:set var="tbl" value="${wdkRecord.tables[tblName]}"/>

<c:set var="theTable">

<table border="0" cellspacing="3" cellpadding="2" align="${align}">

<%-- table header --%>
<tr class="secondary3">
<%--<c:forEach var="hCol" items="${tbl.visibleAttributeFields}">--%>
<c:forEach var="hCol" items="${tbl.displayableFields}">
<c:if test="${!hCol.internal}">
<th align="left"><font size="-2">${hCol.displayName}</font></th>
</c:if>
</c:forEach>
</tr>

<%/* table rows */%>
<c:set var="i" value="0"/>
<c:forEach var="row" items="${tbl.visibleRows}">
    
    <c:choose>
    <c:when test="${i % 2 == 0}"><tr class="rowLight"></c:when>
    <c:otherwise><tr class="rowMedium"></c:otherwise>
    </c:choose>
    
    <c:forEach var="rCol" items="${row}">
    
        <c:choose>
        <c:when test="${rCol.value.name eq 'pval'}">
        <td nowrap="nowrap">
        </c:when>
        <c:otherwise>
        <td>
        </c:otherwise>
        </c:choose>
        
        <%/* need to know if value should be hot linked */%>
        <c:set var="colVal" value="${rCol.value}"/>
        <c:choose>
        <c:when test=
        "${colVal.class.name eq 'org.gusdb.wdk.model.LinkValue'}">
        <a href="${colVal.url}">${colVal.visible}</a>
        </c:when>
        <c:otherwise>
        ${colVal.value}
        </c:otherwise>
        </c:choose>
        </td>
    
    </c:forEach>
    </tr>
    <c:set var="i" value="${i +  1}"/>
</c:forEach>
</table>
<%/* close resultList */%>
<c:set var="junk" value="${tbl.close}"/>
</c:set>

<c:choose>
    <c:when test="${i == 0}">
    none
    </c:when>
    <c:otherwise>
    ${theTable}
    </c:otherwise>
</c:choose>
