<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>

<c:set var="wdkStep" value="${requestScope.wdkStep}" />
<c:set var="sequences" value="${requestScope.sequences}" />

<c:set var="recordClass" value="${wdkStep.question.recordClass}" />

<script type="text/javascript">
<!--
initializeGenomeView();
-->
</script>

<div class="legend">
  <div class="title">Legend</div>
  <div>
    <div class="span forward"></div> ${recordClass.type} on forward strand
  </div>
  <div>
    <div class="span reverse"></div> ${recordClass.type} on reversed strand
  </div>
</div>

<table id="genome-view" class="datatables">
  <thead>
  <tr>
    <th>Sequence</th>
    <th>Length</th>
    <th>#${recordClass.type}s</th>
    <th>${recordClass.type} Locations</th>
  </tr>
  </thead>
  <tbody>
  <c:set var="rowStyle" value="odd" />
  <c:forEach items="${sequences}" var="sequence">
    <tr class="sequence ${rowStyle}">
      <c:url var="sequenceUrl" value="/showRecord.do?name=SequenceRecordClasses.SequenceRecordClass&source_id=${sequence.sourceId}" />
      <td class="sequence-id" nowrap><a href="${sequenceUrl}">${sequence.sourceId}</a></td>
      <td class="length" nowrap>${sequence.length}</td>
      <td class="span-count" nowrap>${fn:length(sequence.spans)}</td>
      <td width="100%">
        <div class="spans">
          <div class="ruler" style="width:${sequence.percentLength}%"> </div>
          <c:forEach items="${sequence.spans}" var="span">
            <c:set var="spanStyle" value="${span.forward ? 'forward' : 'reverse'}" />
            <c:set var="tooltip" value="${span.sourceId}, on ${spanStyle} strand, starts at: ${span.start}, ends at ${span.end}" />
            <c:url var="spanUrl" value="/showRecord.do?name=${recordClass.fullName}&source_id=${span.sourceId}" />
            <div class="span ${spanStyle}" title="${tooltip}" url="${spanUrl}"
               style="left:${span.percentStart}%; width:${span.percentLength}%">
            </div>
          </c:forEach>
        </div>
      </td>
    </tr>
    <c:set var="rowStyle" value="${(rowStyle eq 'odd') ? 'even' : 'odd'}" />
  </c:forEach>
  </tbody>
  <tfoot>
  <tr>
    <th>Sequence</th>
    <th>Length</th>
    <th>#${recordClass.type}s</th>
    <th>${recordClass.type} Locations</th>
  </tr>
  </tfoot>
</table>
