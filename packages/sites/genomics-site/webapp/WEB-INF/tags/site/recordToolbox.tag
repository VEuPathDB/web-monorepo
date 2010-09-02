<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set value="${wdkRecord.primaryKey.values}" var="vals"/>
<c:set value="${vals['source_id']}" var="id"/>
<c:set value="${vals['project_id']}" var="pid"/>
<c:set var="type" value="${wdkRecord.recordClass.fullName}" />
<c:set var="recordType" value="${wdkRecord.recordClass.type}" />
<div id="record-toolbox">
  <ul>
    <c:choose>
      <c:when test="${type == 'GeneRecordClasses.GeneRecordClass'}">
        <li>
          <c:url var="downloadUrl" value="/processQuestion.do?questionFullName=GeneQuestions.GeneBySingleLocusTag&skip_to_download=1&value(single_gene_id)=${id}" />
          <a class="download" href="${downloadUrl}" title="Download this ${recordType}">Download</a>
        </li>
      </c:when>
      <c:when test="${type == 'EstRecordClasses.EstRecordClass'}">
        <li>
          <c:url var="downloadUrl" value="/processQuestion.do?questionFullName=EstQuestions.EstBySourceId&skip_to_download=1&est_id_type=data&est_id_data=${id}" />
          <a class="download" href="${downloadUrl}" title="Download this ${recordType}">Download</a>
        </li>
      </c:when>
      <c:when test="${type == 'IsolateRecordClasses.IsolateRecordClass'}">
        <li>
          <c:url var="downloadUrl" value="/processQuestion.do?questionFullName=IsolateQuestions.IsolateByIsolateId&skip_to_download=1&isolate_id_type=data&isolate_id_data=${id}" />
          <a class="download" href="${downloadUrl}" title="Download this ${recordType}">Download</a>
        </li>
      </c:when>
      <c:when test="${type == 'SequenceRecordClasses.SequenceRecordClass'}">
        <li>
          <c:url var="downloadUrl" value="/processQuestion.do?questionFullName=GenomicSequenceQuestions.SequenceBySourceId&skip_to_download=1&sequenceId_type=data&sequenceId_data=${id}" />
          <a class="download" href="${downloadUrl}" title="Download this ${recordType}">Download</a>
        </li>
      </c:when>
      <c:when test="${type == 'SnpRecordClasses.SnpRecordClass'}">
        <li>
          <c:url var="downloadUrl" value="/processQuestion.do?questionFullName=SnpQuestions.SnpBySourceId&skip_to_download=1&snp_id_type=data&snp_id_data=${id}" />
          <a class="download" href="${downloadUrl}" title="Download this ${recordType}">Download</a>
        </li>
      </c:when>
      <c:when test="${type == 'OrfRecordClasses.OrfRecordClass'}">
        <li>
          <c:url var="downloadUrl" value="/processQuestion.do?questionFullName=OrfQuestions.OrfByOrfId&skip_to_download=1&orf_id_type=data&orf_id_data=${id}" />
          <a class="download" href="${downloadUrl}" title="Download this ${recordType}">Download</a>
        </li>
      </c:when>
      <c:when test="${type == 'SageTagRecordClasses.SageTagRecordClass'}">
        <li>
          <c:url var="downloadUrl" value="/processQuestion.do?questionFullName=SageTagQuestions.SageTagByRadSourceId&skip_to_download=1&rad_source_id_type=data&rad_source_id_data=${id}" />
          <a class="download" href="${downloadUrl}" title="Download this ${recordType}">Download</a>
        </li>
      </c:when>
    </c:choose>
    <li>
        <a class="show-all" href="" title="Show all sections">Show All</a>
    </li>
    <li>
        <a class="hide-all" href="" title="Hide all sections">Hide All</a>
    </li>
  </ul>
</div>

