<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
          xmlns:jsp="http://java.sun.com/JSP/Page"
          xmlns:c="http://java.sun.com/jsp/jstl/core"
          xmlns:wdk="urn:jsptagdir:/WEB-INF/tags/wdk"
          xmlns:common="urn:jsptagdir:/WEB-INF/tags/site-common"
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

  <c:set var="modelName" value="${applicationScope.wdkModel.name}" />
  <c:set var="wdkView" value="${requestScope.wdkView}" />

  <c:choose>
    <c:when test="${modelName eq 'EuPathDB'}">
      <wdk:recordLink
        primaryKeyValue="${primaryKeyValue}"
        recordClass="${recordClass}"
        displayValue="${displayValue}"
      />
    </c:when>
    <!-- TRANSCRIPTS: do not want to show transcript id URL, and we want to point to the GENE record-->
    <c:when test="${recordClass.fullName eq 'TranscriptRecordClasses.TranscriptRecordClass'}">
      <c:url var="recordLink" value="/app/record/gene/${primaryKeyValue.values['gene_source_id']}/${primaryKeyValue.values['project_id']}" />
      <a href="${recordLink}">${displayValue}</a>
    </c:when>
    <!-- REST of recordtypes, using all PK parts n URL, eg:  source_id, project_id, etc) -->
    <c:otherwise>
      <common:recordLink
        primaryKeyValue="${primaryKeyValue}"
        recordClass="${recordClass}"
        displayValue="${displayValue}"
      />
    </c:otherwise>
  </c:choose>

</jsp:root>
