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

<c:set var="zoomInAllTip" value="Zoom in all the sequences." />
<c:set var="zoomOutAllTip" value="Zoom out all the sequences." />

<table id="genome-view" class="datatables">
  <thead>
  <tr>
    <th>Sequence</th>
    <th>Length</th>
    <th>Chromosome</th>
    <th>#${recordClass.type}s</th>
    <th>${recordClass.type} Locations</th>
    <th>
      <img class="zoomin-all" title="${zoomInAllTip}" src="<c:url value='/wdk/images/plus.gif' />" />
      <img class="zoomout-all" title="${zoomOutAllTip}" src="<c:url value='/wdk/images/minus.gif' />" />
    </th>
  </tr>
  </thead>
  <tbody>
  <c:forEach items="${sequences}" var="sequence">
    <tr class="sequence">
      <c:url var="sequenceUrl" value="/showRecord.do?name=SequenceRecordClasses.SequenceRecordClass&source_id=${sequence.sourceId}" />
      <td class="sequence-id" nowrap><a href="${sequenceUrl}">${sequence.sourceId}</a></td>
      <td class="length" nowrap>${sequence.lengthFormatted}</td>
      <td class="chromosome" nowrap>${sequence.chromosome == null ? 'Not Assigned' : sequence.chromosome}</td>
      <td class="span-count" nowrap>${sequence.spanCountFormatted}</td>
      <td width="100%">
       <div class="canvas">
        <c:set var="pctLength" value="${sequence.percentLength}" />
        <div class="spans" base-size="${pctLength}" size="${pctLength}" style="width:${pctLength}%">
          <div class="ruler" title="${sequence.sourceId}, length: ${sequence.lengthFormatted}"> </div>
          <c:forEach items="${sequence.spans}" var="span">
            <c:set var="spanStyle" value="${span.forward ? 'forward' : 'reverse'}" />
            <c:set var="tooltip" value="${span.sourceId}, on ${spanStyle} strand, [${span.startFormatted} - ${span.endFormatted}]. (Click to go to the record page.)" />
            <c:url var="spanUrl" value="/showRecord.do?name=${recordClass.fullName}&source_id=${span.sourceId}" />
            <div class="span ${spanStyle}" title="${tooltip}" url="${spanUrl}"
               style="left:${span.percentStart}%; width:${span.percentLength}%">
            </div>
          </c:forEach>
        </div>
       </div>
      </td>
      <td class="control" nowrap>
        <img class="zoomin" src="<c:url value='/wdk/images/plus.gif' />"
             title="Zoom in sequence ${sequence.sourceId}." />
        <img class="zoomout" src="<c:url value='/wdk/images/minus.gif' />"
             title="Zoom out sequence ${sequence.sourceId}." />
      </td>
    </tr>
  </c:forEach>
  </tbody>
  <tfoot>
  <tr>
    <th>Sequence</th>
    <th>Length</th>
    <th>Chromosome</th>
    <th>#${recordClass.type}s</th>
    <th>${recordClass.type} Locations</th>
    <th>
      <img class="zoomin-all" title="${zoomInAllTip}" src="<c:url value='/wdk/images/plus.gif' />" />
      <img class="zoomout-all" title="${zoomOutAllTip}" src="<c:url value='/wdk/images/minus.gif' />" />
    </th>
  </tr>
  </tfoot>
</table>
