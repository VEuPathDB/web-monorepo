<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="pathway"
              description="Restricts output to only this pathway"
%>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set value="${wdkRecord.tables['ECNumberOrganismMap']}" var="tbl"/>

<map name=pathwayMap>
<c:forEach var="row" items="${tbl}">
    <c:if test="${pathway eq row['source_id'].value}">

      <c:set var="ecNumber"        value="${row['ec_number'].value}"/>
      <c:set var="organisms"       value="${row['organisms'].value}"/>
      <c:set var="genes"           value="${row['genes'].value}"/>
      <c:set var="x1"              value="${row['x1'].value}"/>
      <c:set var="y1"              value="${row['y1'].value}"/>
      <c:set var="x2"              value="${row['x2'].value}"/>
      <c:set var="y2"              value="${row['y2'].value}"/>

      <c:set var="popup"           value="EC Number: ${ecNumber}&#013;&#013;Organisms: ${organisms}&#013;&#013;Genes: ${genes}&#013;"/>

    <area shape="rect" coords="${x1},${y1},${x2},${y2}" alt="Ec Number" title="${popup}">
    </c:if>
</c:forEach>

</map>
