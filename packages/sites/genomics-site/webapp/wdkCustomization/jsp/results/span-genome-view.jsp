<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>

<%-- gbrowse link does not work if using uppercase in site name --%>
<c:set var="siteName" value="${fn:toLowerCase(applicationScope.wdkModel.name)}" />

<c:set var="wdkStep" value="${requestScope.wdkStep}" />
<c:set var="sequences" value="${requestScope.sequences}" />
<c:set var="segmentSize" value="${requestScope.segmentSize}" />

<c:set var="recordClass" value="${wdkStep.question.recordClass}" />
<c:set var="displayName" value="${recordClass.displayName}" />
<c:set var="displayNamePlural" value="${recordClass.displayNamePlural}" />

<span class="onload-function" data-function="initializeGenomeView"> </span>

<div class="genome-view">

<fieldset class="legend">
  <legend class="title">Legend</legend>
  <ul>
    <li> * <div class="icon region forward"> </div> Segments on forward strand;</li>
    <li> * <div class="icon region reverse"> </div> Segments on reverse strand;</li>
    <li> * <div class="icon"> </div> Size of each segment: ${segmentSize} base pairs;</li>
    <li> * <div class="icon"> </div> The height of each segment reflects the number of ${displayNamePlural} in the segment;</li>
    <li> * <div class="icon feature forward"> </div> ${displayNamePlural} on forward strand;</li>
    <li> * <div class="icon feature reverse"> </div> ${displayNamePlural} on reverse strand;</li>
    <li> * <div class="icon"> </div> Only the first 150 longest sequences are displayed.</li>
  </ul>
</fieldset>


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
            <div>  has ${region.featureCount}  ${recordClass.displayNamePlural}</div>
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
            <ul class="legend">
              <li> * <div class="icon feature forward"> </div> ${displayNamePlural} on forward strand;</li>
              <li> * <div class="icon feature reverse"> </div> ${displayNamePlural} on reverse strand;</li>
            </ul>
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

<table class="datatables">
  <thead>
  <tr>
    <th>Sequence</th>
    <th>Organism</th>
    <th>Chromosome</th>
    <th>#${recordClass.displayNamePlural}</th>
    <th title="Length of the genomic sequence in #bases">Length</th>
    <th>${recordClass.displayName} Locations</th>
  </tr>
  </thead>
  <tbody>
  <c:forEach items="${sequences}" var="sequence">
    <tr class="sequence">
      <c:url var="sequenceUrl" value="/showRecord.do?name=SequenceRecordClasses.SequenceRecordClass&source_id=${sequence.sourceId}" />
      <td class="sequence-id" nowrap><a href="${sequenceUrl}">${sequence.sourceId}</a></td>
      <td class="organism">${sequence.organism}</td>
      <td class="chromosome" nowrap>${sequence.chromosome}</td>
      <td class="span-count" nowrap>${sequence.featureCount}</td>
      <td class="length" nowrap>${sequence.length}</td>
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
    <th>#${recordClass.displayNamePlural}</th>
    <th>Length</th>
    <th>${recordClass.displayName} Locations</th>
  </tr>
  </tfoot>
</table>

</div> <!-- end of .genome-view -->
