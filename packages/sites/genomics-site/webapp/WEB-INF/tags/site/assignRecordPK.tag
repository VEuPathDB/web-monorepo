<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="recordClass"
              type="org.gusdb.wdk.model.jspwrap.RecordClassBean"
              required="true"
              description="recordclass bean"
%>
<%@ attribute name="favorite"
              type="org.gusdb.wdk.model.jspwrap.FavoriteBean"
              required="true"
              description="favorite bean"
%>
<c:set var="primaryKey" value="${favorite.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />

<c:choose>
<c:when test="${ fn:containsIgnoreCase(recordClass.fullName, 'Transcript') }"> 
              <c:set var="url" value="/app/record/gene/${pkValues['gene_source_id']}" />
              <a title="Click to access this ID's page" href="<c:url value='${url}' />">${pkValues['gene_source_id']}</a>
</c:when>
<c:otherwise>
              <c:set var="url" value="/app/record/${recordClass.urlSegment}/${pkValues['source_id']}" />
              <a title="Click to access this ID's page" href="<c:url value='${url}' />">${pkValues['source_id']}</a>
</c:otherwise>
</c:choose>

