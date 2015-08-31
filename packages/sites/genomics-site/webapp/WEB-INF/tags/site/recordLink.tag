<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core">

  <jsp:directive.attribute
    name="primaryKeyAttributeValue"
    type="org.gusdb.wdk.model.record.attribute.PrimaryKeyAttributeValue"
    required="true"
    description="The primary key AttributeValue instance"
  />

  <jsp:directive.attribute
    name="recordName"
    required="false"
    description="The full name of the record class"
  />

  <c:url var="recordLink" value="/app/record/${recordName}?" />
  <c:forEach items="${primaryKeyAttributeValue.values}" var="pkValue" varStatus="loop">
    <c:set var="recordLink" value="${recordLink}${pkValue.key}=${pkValue.value}" />
    <c:if test="${not loop.end}">
      <c:set var="recordLink" value="${recordLink}&amp;"/>
    </c:if>
  </c:forEach>

  <a href="${recordLink}">${primaryKeyAttributeValue.value}</a>

</jsp:root>
