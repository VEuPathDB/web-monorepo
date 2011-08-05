<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="sourceId" value="${pkValues['source_id']}" />

<%@ attribute name="organism"
              description="Restricts output to only this organism"
%>


<c:if test="${projectId eq 'PlasmoDB'}">
    <site:plasmoLegacyGraphs organism="${organism}" id="${sourceId}"/>
</c:if>

<site:profileGraphs organism="${organism}" tableName="ExpressionGraphs"/>
