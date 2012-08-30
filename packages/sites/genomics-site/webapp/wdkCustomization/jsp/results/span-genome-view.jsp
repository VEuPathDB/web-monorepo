<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>

<%-- gbrowse link does not work if using uppercase in site name --%>
<c:set var="siteName" value="${fn:toLowerCase(applicationScope.wdkModel.name)}" />

<c:set var="wdkStep" value="${requestScope.wdkStep}" />
<c:set var="sequences" value="${requestScope.sequences}" />

<c:set var="recordClass" value="${wdkStep.question.recordClass}" />

<script type="text/javascript">
$(initializeGenomeView);
</script>

<%--
<div class="legend">
  <div class="title">Legend</div>
  <div>
    <div class="span forward"></div> ${recordClass.type} on forward strand
  </div>
  <div>
    <div class="span reverse"></div> ${recordClass.type} on reversed strand
  </div>
</div>
--%>
<%-- <div style="float:left"> --%>
<div>
<table class="legend">
<tr>
<td>
  <div class="title">Legend</div>
</td>
<td class="smaller-font">
    <div class="span forward"></div> ${recordClass.type} on forward strand<br>
    <div class="span reverse"></div> ${recordClass.type} on reversed strand
</td>
</tr>
</table>
</div>

<%--
<div style="float:left;position:relative;bottom:35px;left:30px;"><img src="<c:url value='/wdk/images/betatesting.png' />" /></div>

<div style="float:left;position:relative;top:5px;left:30px;font-weight:bold">
<a onclick="poptastic(this.href); return false;" target="_blank" href="<c:url value='/betatester.jsp' />">

 <span style="font-size:120%">Be our Beta Tester!</span> &nbsp;&nbsp;<span style="background-color:yellow">Click here</span> to provide feedback on this beta feature!
</a></div>
--%>

<c:url var="zoomInImage" value="/wdkCustomization/images/zoom_in.png" />
<c:url var="zoomOutImage" value="/wdkCustomization/images/zoom_out.png" />
<c:set var="zoomInAllTip" value="Zoom in all the sequences." />
<c:set var="zoomOutAllTip" value="Zoom out all the sequences." />

<%-- <div style="clear:both;;position:relative;top:-20px"> --%>
<div>
<table class="genome-view datatables">
  <thead>
  <tr>
    <th>Sequence</th>
    <th>Organism</th>
    <th>Chromosome</th>
    <th>#${recordClass.type}s</th>
    <th title="Length of the genomic sequence in #bases">Length</th>
    <th>${recordClass.type} Locations</th>
    <th>
      <img class="zoomin-all" title="${zoomInAllTip}" src="${zoomInImage}" />
      <img class="zoomout-all" title="${zoomOutAllTip}" src="${zoomOutImage}" />
    </th>
  </tr>
  </thead>
  <tbody>
  <c:forEach items="${sequences}" var="sequence">
    <tr class="sequence">
      <c:url var="sequenceUrl" value="/showRecord.do?name=SequenceRecordClasses.SequenceRecordClass&source_id=${sequence.sourceId}" />
      <td class="sequence-id" nowrap><a href="${sequenceUrl}">${sequence.sourceId}</a></td>
      <td class="organism">${sequence.organism}</td>
      <td class="chromosome" nowrap>${sequence.chromosome}</td>
      <td class="span-count" nowrap>${sequence.spanCountFormatted}</td>
      <td class="length" nowrap>${sequence.lengthFormatted}</td>
      <td width="100%">
       <div class="canvas">
        <c:set var="pctLength" value="${sequence.percentLength}" />
        <div class="spans" base-size="${pctLength}" size="${pctLength}" style="width:${pctLength}%">
          <div class="ruler" title="${sequence.sourceId}, length: ${sequence.lengthFormatted}"> </div>
          <c:forEach items="${sequence.spans}" var="span">
            <c:set var="spanStyle" value="${span.forward ? 'forward' : 'reverse'}" />
            <c:set var="tooltip" value="${span.sourceId}, on ${spanStyle} strand, [${span.startFormatted} - ${span.endFormatted}]. (Click to go to the record page.)" />
            <c:url var="spanUrl" value="/showRecord.do?name=${recordClass.fullName}&source_id=${span.sourceId}" />
            <div class="span ${spanStyle}" url="${spanUrl}"
               style="left:${span.percentStart}%; width:${span.percentLength}%">
              <div class="tooltip">
                <p align="center"><b>${span.sourceId}</b></p>
                <p>Location: [${span.startFormatted} - ${span.endFormatted}], on ${spanStyle} strand.</p>
                <br />
                <p>View this ${recordClass.type} in:</p>
                <ul>
                  <li> - <a href="<c:url value='/showRecord.do?name=${recordClass.fullName}&source_id=${span.sourceId}' />">Record Page</a></li>
                  <c:if test="${recordClass.fullName eq 'GeneRecordClasses.GeneRecordClass'}">
                    <c:set var="context" value="${span.context}" />
                    <li> - <a href="/cgi-bin/gbrowse/${siteName}/?name=${context};h_feat=${span.sourceId}@yellow">Gbrowse</a></li>
                  </c:if>
                </ul>
              </div>
            </div>
          </c:forEach>
        </div>
       </div>
      </td>
      <td class="control" nowrap>
        <img class="zoomin" src="${zoomInImage}" title="Zoom in sequence ${sequence.sourceId}." />
        <img class="zoomout" src="${zoomOutImage}" title="Zoom out sequence ${sequence.sourceId}." />
      </td>
    </tr>
  </c:forEach>
  </tbody>
  <tfoot>
  <tr>
    <th>Sequence</th>
    <th>Organism</th>
    <th>Chromosome</th>
    <th>#${recordClass.type}s</th>
    <th>Length</th>
    <th>${recordClass.type} Locations</th>
    <th>
      <img class="zoomin-all" title="${zoomInAllTip}" src="${zoomInImage}" />
      <img class="zoomout-all" title="${zoomOutAllTip}" src="${zoomOutImage}" />
    </th>
  </tr>
  </tfoot>
</table>
</div>
