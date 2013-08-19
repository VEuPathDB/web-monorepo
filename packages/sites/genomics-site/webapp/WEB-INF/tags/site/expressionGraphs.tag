<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="sourceId" value="${pkValues['source_id']}" />

<%@ attribute name="species"
              description="Restricts output to only this species"
%>

<%@ attribute name="organism"
              description="Restricts output to only this species"
%>

<imp:profileGraphs species="${species}" tableName="ExpressionGraphs"/>

<%--
<c:if test="${projectId eq 'PlasmoDB'}">
    <imp:plasmoLegacyGraphs organism="${organism}" id="${sourceId}"/>
</c:if>
--%>

