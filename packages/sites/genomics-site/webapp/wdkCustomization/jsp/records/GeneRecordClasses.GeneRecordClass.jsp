<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>

<c:set var="projectId" value="${applicationScope.wdkModel.projectId}" />

<c:catch var="err">
<%-- force RecordInstance.fillColumnAttributeValues() to run
      and set isValidRecord to false if appropriate. 
      wdkRecord.isValidRecord is tested in the project's RecordClass --%>
<c:set var="junk" value="${wdkRecord.attributes['project_id']}"/>
</c:catch>

<jsp:include page="/wdkCustomization/jsp/${projectId}/GeneRecordClasses.GeneRecordClass.jsp"/>

<api:errors/>

<imp:pageLogger name="gene page" />