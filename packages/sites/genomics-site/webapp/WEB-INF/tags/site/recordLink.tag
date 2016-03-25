<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
          xmlns:jsp="http://java.sun.com/JSP/Page"
          xmlns:c="http://java.sun.com/jsp/jstl/core"
          xmlns:wdk="urn:jsptagdir:/WEB-INF/tags/wdk"
          xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp"
          xmlns:fn="http://java.sun.com/jsp/jstl/functions">

  <jsp:directive.attribute
     name="primaryKeyAttributeValue"
     type="org.gusdb.wdk.model.record.attribute.PrimaryKeyAttributeValue"
     required="true"
     description="The primary key AttributeValue instance"
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

  <c:set var="modelName" value="${applicationScope.wdkModel.name}" />
  <c:set var="wdkView" value="${requestScope.wdkView}" />

  <c:choose>
    <!-- TRANSCRIPTS: do not want to show transcript and project in URL, and we want to point to the GENE record-->
    <c:when test="${recordClass.fullName eq 'TranscriptRecordClasses.TranscriptRecordClass'}">
      <c:url var="recordLink" value="/app/record/gene/${primaryKeyAttributeValue.values['gene_source_id']}" />
      <a href="${recordLink}">${displayValue}</a>
    </c:when>
    <!-- REST of recordtypes, using all PK parts n URL, eg:  source_id, project_id, etc) -->
    <c:otherwise>
      <c:url var="recordLink" value="/app/record/${recordClass.urlSegment}" />
      <c:forEach items="${primaryKeyAttributeValue.values}" var="pkValue" varStatus="loop">
        <c:set var="recordLink" value="${recordLink}/${pkValue.value}" />
      </c:forEach>
      <a href="${recordLink}">${displayValue}</a>
    </c:otherwise>
  </c:choose>

</jsp:root>
