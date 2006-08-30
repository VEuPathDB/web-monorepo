<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>

<%@ attribute name="tblName"
              description="name of table attribute"
%>

<%@ attribute name="isOpen"
              description="Is show/hide block initially open, by default?"
%>

<%@ attribute name="attribution"
              description="Dataset name, for attribution"
%>

<%@ attribute name="postscript"
              description="Text to go below the table"
%>

<%@ attribute name="suppressColumnHeaders"
              description="Should the display of column headers be skipped?"
%>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set value="${wdkRecord.tables[tblName]}" var="tbl"/>
<c:set var="noData" value="false"/>

<c:set var="tblContent">

<c:if test="${suppressColumnHeaders == null || !suppressColumnHeaders}">
    <c:set var="h" value="0"/>
    <tr class="headerRow">
        <c:forEach var="hCol" items="${tbl.visibleAttributeFields}">
           <c:set var="h" value="${h+1}"/>
           <th align="left">${hCol.displayName}</th>
        </c:forEach>
    </tr>
</c:if>

    <%-- table rows --%>
    <c:set var="i" value="0"/>
    <c:forEach var="row" items="${tbl.visibleRows}">
        <c:choose>
            <c:when test="${i % 2 == 0}"><tr class="rowLight"></c:when>
            <c:otherwise><tr class="rowMedium"></c:otherwise>
        </c:choose>

        <c:set var="j" value="0"/>
        <c:forEach var="rColEntry" items="${row}">
            <c:set var="j" value="${j+1}"/>
            <c:set var="rCol" value="${rColEntry.value}"/>

            <%-- need to know if value should be hot linked --%>
            <td>
                <c:choose>
                    <c:when test="${rCol.class.name eq 'org.gusdb.wdk.model.LinkValue'}">
                        <a href="${rCol.url}">${rCol.visible}</a>
                    </c:when>
                    <c:when test="${rCol.class.name eq 'org.gusdb.wdk.model.AttributeFieldValue'}">
                        ${rCol.value}
                    </c:when>
                    <c:otherwise>
                        ${rCol}
                    </c:otherwise>
                </c:choose>
            </td>
        </c:forEach>

        </tr>
        <c:set var="i" value="${i +  1}"/>
    </c:forEach>

<c:if test="${i == 0}">
  <c:set var="noData" value="true"/>
</c:if>

${postscript}

</c:set>

<site:toggle name="${tblName}" displayName="${tbl.displayName}"
             content="${tblContent}" isOpen="${isOpen}" noData="${noData}"
             attribution="${attribution}"/>

<%-- close resultList --%>
<c:set var="junk" value="${tbl.close}"/>
