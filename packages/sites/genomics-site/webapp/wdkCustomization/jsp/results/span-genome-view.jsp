<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>

<%-- gbrowse link does not work if using uppercase in site name --%>
<c:set var="siteName" value="${fn:toLowerCase(applicationScope.wdkModel.name)}" />

<c:set var="wdkStep" value="${requestScope.wdkStep}" />
<c:set var="sequences" value="${requestScope.sequences}" />

<c:set var="recordClass" value="${wdkStep.question.recordClass}" />

<span class="onload-function" data-function="initializeGenomeView"> </span>

<div class="genome-view">

<div class="legend">
  <div class="title">Legend</div>
  <div>
    <div class="region forward"></div> 
    A genomic sequence segment on forward strand, the height of the segment 
    reflects the number of ${recordClass.type}s that are overlapped with the
    segment.
  </div>
  <div>
    <div class="region reverse"></div> 
    A genomic sequence segment on reversed strand, the height also reflects
    the number of ${recordClass.type}s.
  </div>
</div>

<%--
<div style="float:left;position:relative;bottom:35px;left:30px;"><img src="<c:url value='/wdk/images/betatesting.png' />" /></div>

<div style="float:left;position:relative;top:5px;left:30px;font-weight:bold">
<a onclick="poptastic(this.href); return false;" target="_blank" href="<c:url value='/betatester.jsp' />">

 <span style="font-size:120%">Be our Beta Tester!</span> &nbsp;&nbsp;<span style="background-color:yellow">Click here</span> to provide feedback on this beta feature!
</a></div>
--%>

<div id="sequences">
  <c:forEach items="${sequences}" var="sequence">
    <div id="${sequence.sourceId}" class="sequence"
         data-length="${sequence.length}">
      <div class="chromosome">${sequence.chromosome}</div>
      <div class="organism">${sequence.organism}</div>
      <div class="regions">
        <c:forEach items="${sequence.regions}" var="region">
          <div id="${region.sourceId}" class="region">
            <h4>Region ${region}</h4>
            <div>  has ${region.featureCount}  ${recordClass.type}s</div>
            <div>Region location:</div>
            <div class="end">${region.endFormatted}</div>
            <div class="start">${region.startFormatted}</div>
            <div class="canvas">
              <div class="ruler"> </div>
              <c:forEach items="${region.features}" var="feature">
                <c:set var="forward" value="${feature.forward ? 'forward' : 'reverse'}" />
                <div id="${feature.sourceId}" class="feature ${forward}"
                     style="left:${feature.percentStart}%; width:${feature.percentLength}%;">
                </div>
              </c:forEach>
            </div>
            <div class="features">
              <c:forEach items="${region.features}" var="feature">
                <div id="${feature.sourceId}">
                  <h4>${feature.sourceId}</h4>
                  <p>start: ${feature.startFormatted}, end: ${feature.endFormatted}, 
                     on ${feature.forward ? "forward" : "reverse"} strand of ${sequence.sourceId}</p>
                  <p>${feature.description}</p>
                  <ul>
                    <li><a href="<c:url value='/showRecord.do?name=${recordClass.fullName}&source_id=${feature.sourceId}' />">Record page</a></li>
                    <li><a href="/cgi-bin/gbrowse/${siteName}/?name=${context};h_feat=${feature.sourceId}@yellow">Gbrowse</a></li>
                  <ul>
                </div>
              </c:forEach>
            </div>
          </div>
        </c:forEach>
      </div>
    </div>
  </c:forEach>
</div>

<c:url var="zoomInImage" value="/wdkCustomization/images/zoom_in.png" />
<c:url var="zoomOutImage" value="/wdkCustomization/images/zoom_out.png" />
<c:set var="zoomInAllTip" value="Zoom in all the sequences." />
<c:set var="zoomOutAllTip" value="Zoom out all the sequences." />


<table class="datatables">
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
      <td class="span-count" nowrap>${sequence.featureCountFormatted}</td>
      <td class="length" nowrap>${sequence.lengthFormatted}</td>
      <td width="100%">
       <div class="canvas">
        <div class="ruler" title="${sequence.sourceId}, length: ${sequence.lengthFormatted}"
             style="width:${sequence.percentLength}%"> </div>
            <c:forEach items="${sequence.regions}" var="region">
              <c:set var="forwardCount" value="${region.forwardCount}" />
              <c:set var="reverseCount" value="${region.reverseCount}" />
              <c:if test="${forwardCount gt 0}">
                <div data-id="${region.sourceId}" class="region forward" 
                     title="${region.sourceId}, ${forwardCount} ${recordClass.displayName}s on forward strand. Click to view detail."
                     style="left:${region.percentStart}%; width:${region.percentLength}%; height:${forwardCount * 2}px">
                </div>
              </c:if>
              <c:if test="${reverseCount gt 0}">
                <div data-id="${region.sourceId}" class="region reverse" 
                     title="${region.sourceId}, ${reverseCount} ${recordClass.displayName}s on reverse strand. Click to view detail."
                     style="left:${region.percentStart}%; width:${region.percentLength}%; height:${reverseCount * 2}px">
                </div>
              </c:if>
            </c:forEach>
       </div>  
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

</div> <!-- end of .genome-view -->
