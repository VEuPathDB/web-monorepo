<%-- this tag is now deprecated. Please use wdk:wdkTable instead. --%>
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

<c:catch var='e'>

<c:if test="!${align}">
    <c:set var="align" value="center" />
</c:if>
<c:set var="wdkRecord" value="${requestScope.wdkRecord}" />
<c:set var="tbl" value="${wdkRecord.tables[tblName]}"/>

<c:set var="theTable">

<table border="0" cellspacing="3" cellpadding="2" align="${align}">

<%-- table header --%>
<tr class="secondary3">
<c:forEach var="hCol" items="${tbl.tableField.attributeFields}">
<c:if test="${!hCol.internal}">
<th align="left"><font size="-2">${hCol.displayName}</font></th>
</c:if>
</c:forEach>
</tr>

<%/* table rows */%>
<c:set var="i" value="0"/>
<c:forEach var="row" items="${tbl}">
    
    <c:choose>
    <c:when test="${i % 2 == 0}"><tr class="rowLight"></c:when>
    <c:otherwise><tr class="rowMedium"></c:otherwise>
    </c:choose>
    
    <c:forEach var="rCol" items="${row}">
        <c:set var="colVal" value="${rCol.value}"/>
        <c:if test="${colVal.attributeField.internal == false}">
            <%-- need to know if value should be hot linked --%>
            <c:set var="align" value="align='${colVal.attributeField.align}'" />
            <c:set var="nowrap">
                <c:if test="${colVal.attributeField.nowrap}">nowrap</c:if>
            </c:set>
        
            <td ${align} ${nowrap}>
                <c:choose>
                    <c:when test="${colVal.class.name eq 'org.gusdb.wdk.model.LinkAttributeValue'}">
                        <a href="${colVal.url}">${colVal.displayText}</a>
                    </c:when>
                    <c:otherwise>
                        ${colVal.value}
                    </c:otherwise>
                </c:choose>
            </td>
        </c:if>
    </c:forEach>
    </tr>
    <c:set var="i" value="${i +  1}"/>
</c:forEach>
</table>
</c:set>

<c:choose>
    <c:when test="${i == 0}">
    none
    </c:when>
    <c:otherwise>
    ${theTable}
    </c:otherwise>
</c:choose>

</c:catch>
<c:if test="${e!=null}">
<font color="red">information not available</font><br><font size='-2'>${fn:replace(e, fn:substring(e, 175, -1), '...')}</font>
</c:if>
