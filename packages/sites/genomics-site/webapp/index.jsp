<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
  xmlns:jsp="http://java.sun.com/JSP/Page"
  xmlns:c="http://java.sun.com/jsp/jstl/core">
  <c:set var="projectId" value="${applicationScope.wdkModel.projectId}"/>
  <c:choose>
    <c:when test="${projectId eq 'PlasmoDB'}">
      <c:redirect url="app/"/>
    </c:when>
    <c:otherwise>
      <jsp:forward page="/home.jsp"/>
    </c:otherwise>
  </c:choose>
</jsp:root>
