<?xml version="1.0" encoding="UTF-8"?>

<jsp:root version="2.0"
  xmlns:jsp="http://java.sun.com/JSP/Page"
  xmlns:c="http://java.sun.com/jsp/jstl/core"
  xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <jsp:directive.attribute name="paramGroup" type="java.util.Map" required="true"/>

  <c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>

  <c:choose>
    <c:when test="${wdkQuestion.queryName eq 'GenesByGenericFoldChange'}">
      <imp:foldchangeParamGroup paramGroup="${paramGroup}"/>
    </c:when>
    <c:when test="${wdkQuestion.queryName eq 'CompoundsByFoldChange'}">
      <imp:metabolitefoldchangeParamGroup paramGroup="${paramGroup}"/>
    </c:when>
    <c:otherwise>
      <imp:questionParamGroup paramGroup="${paramGroup}"/>
    </c:otherwise>
  </c:choose>

</jsp:root>
