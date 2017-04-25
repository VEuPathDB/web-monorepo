<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
  xmlns:jsp="http://java.sun.com/JSP/Page"
  xmlns:c="http://java.sun.com/jsp/jstl/core"
  xmlns:wdk="urn:jsptagdir:/WEB-INF/tags/wdk"
  xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp"
  xmlns:fn="http://java.sun.com/jsp/jstl/functions">

  <jsp:directive.attribute
    name="primaryKeyValue"
    type="org.gusdb.wdk.model.record.PrimaryKeyValue"
    required="true"
    description="The primary key value"
    />

  <jsp:directive.attribute
    name="recordClass"
    type="org.gusdb.wdk.model.jspwrap.RecordClassBean"
    required="true"
    description="The full name of the record class"
    />

  <jsp:directive.attribute
    name="displayValue"
    required="true"
    description="The display name of the primarykey"
    />

  <c:url var="recordLink" value="/app/record/${recordClass.urlSegment}" />
  <c:forEach items="${primaryKeyValue.values}" var="pkValue" varStatus="loop">
    <c:set var="recordLink" value="${recordLink}/${pkValue.value}" />
  </c:forEach>

  <a href="${recordLink}">${displayValue}</a>
</jsp:root>
