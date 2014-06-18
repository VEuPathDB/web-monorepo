<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>

<%-- gbrowse link does not work if using uppercase in site name --%>
<c:set var="siteName" value="${fn:toLowerCase(applicationScope.wdkModel.name)}" />

<c:set var="wdkStep" value="${requestScope.wdkStep}" />
<c:set var="sequences" value="${requestScope.sequences}" />

<c:set var="recordClass" value="${wdkStep.question.recordClass}" />
<c:set var="displayName" value="${recordClass.displayName}" />
<c:set var="displayNamePlural" value="${recordClass.displayNamePlural}" />
<c:set var="isDetail" value="${requestScope.isDetail}" />
<c:set var="isTruncate" value="${requestScope.isTruncate}" />

<span class="onload-function" data-function="initializeGenomeView"> </span>


<div class="genome-view">

<c:choose>
  <c:when test="${isTruncate == 'true'}">
    <p>The number of ${displayNamePlural} in the result exceeds the display limit (2000 IDs), Genomic Summary View is not available for the result.</p>
  </c:when>
  <c:otherwise> <%-- display genomic view --%>

 <div class="legend">
<%--
   <div class="title">Note:  Only the first 150 most dense sequences are listed.<br>Click on a Segment to see the Genes in it.</div>
   <div class="icon region forward"> </div> Segments on forward strand;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
   <div class="icon region reversed diffSize"> </div> Segments on reversed strand;<br>
   <b title="Based on the length of the longest sequence and its gene density.">Segment width:</b> ${segmentSize} base pairs;
   <b>Segment height</b>: #${displayNamePlural} in the Segment;
--%>
              <div> <div class="icon feature forward"> </div> ${displayNamePlural} on forward strand;</div>
              <div> <div class="icon feature reversed"> </div> ${displayNamePlural} on reversed strand;</div>
 </div>

<%--
<div style="float:left;position:relative;bottom:35px;left:30px;"><imp:image src="/wdk/images/betatesting.png" /></div>

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
          <div id="${region.sourceId}" class="region" data-forward="${region.forward}">
            <h4>Region ${region}</h4>
            <div>  has ${region.featureCount}  ${recordClass.displayNamePlural}</div>
            <div>Region location:</div>
            <div class="end">${region.endFormatted}</div>
            <div class="start">${region.startFormatted}</div>
            <div class="canvas">
              <div class="ruler"> </div>
              <c:forEach items="${region.features}" var="feature">
                <div data-id="${feature.sourceId}" class="feature ${region.strand}"
                     style="left:${feature.percentStart}%; width:${feature.percentLength}%;">
                </div>
              </c:forEach>
            </div>
            <br />
            <ul class="legend">
              <c:choose>
                <c:when test="${region.forward}">
                  <li> * <div class="icon feature forward"> </div> ${displayNamePlural} on forward strand;</li>
                </c:when>
                <c:otherwise>
                  <li> * <div class="icon feature reversed"> </div> ${displayNamePlural} on reversed strand;</li>
                </c:otherwise>
              </c:choose>
            </ul>
            <br />

            <table class="feature-list">
              <thead>
               <tr>
                <th>${recordClass.displayName}</th>
                <th>Start</th>
                <th>End</th>
                <th>Go To</th>
               </tr>
              </thead>
              <tbody>
                <c:forEach items="${region.features}" var="feature">
                 <tr>
                  <td>
                    <a href="<c:url value='/showRecord.do?name=${recordClass.fullName}&source_id=${feature.sourceId}' />">
                      <u>${feature.sourceId}</u>
                    </a>
                  </td>
                  <td data-order="${feature.start}">${feature.start}</td>
                  <td data-order="${feature.end}">${feature.end}</td>
                  <td><a href="/cgi-bin/gbrowse/${siteName}/?name=${feature.context};h_feat=${feature.sourceId}@yellow"><u>Gbrowse
</u></a></td>
                 </tr>
                </c:forEach>
              </tbody>
            </table>
          </div>
        </c:forEach>
      </div>
      <div class="features">
              <c:forEach items="${sequence.features}" var="feature">
                <div id="${feature.sourceId}">
                  <h4>${feature.sourceId}</h4>
                  <p>start: ${feature.startFormatted}, end: ${feature.endFormatted},
                     on ${feature.strand} strand of ${sequence.sourceId}</p>
                  <p>${feature.description}</p>
                  <ul>
                    <li><a href="<c:url value='/showRecord.do?name=${recordClass.fullName}&source_id=${feature.sourceId}' />"><u>Record page</u></a></li>
                    <li><a href="/cgi-bin/gbrowse/${siteName}/?name=${feature.context};h_feat=${feature.sourceId}@yellow"><u>Gbrowse</u></a></li>
                  <ul>
                </div>
              </c:forEach>
      </div>
    </div>
  </c:forEach>
</div>

<!-- add an option to filter out empty chromosomes -->
<div id="emptyChromosomes">
  <input type="checkbox" /> Show empty chromosomes
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
      <td class="organism" nowrap><i>${sequence.organism}</i></td>
      <td class="chromosome" nowrap>${sequence.chromosome}</td>
      <td class="span-count" data-order="${sequence.featureCount}" nowrap>${sequence.featureCount}</td>
      <td class="length" data-order="${sequence.length}" nowrap>${sequence.length}</td>
      <td width="100%">
       <div class="canvas"> <%-- display a region with multiple features --%>
        <div class="ruler" title="${sequence.sourceId}, length: ${sequence.lengthFormatted}"
             style="width:${sequence.percentLength}%"> </div>
            <c:forEach items="${sequence.regions}" var="region">
              <c:choose>
                <c:when test="${region.featureCount > 1}">
                  <div data-id="${region.sourceId}" class="region ${region.strand}" 
                       title="${region}, with ${region.featureCount} ${recordClass.displayNamePlural}. Click to view detail."
                       style="left:${region.percentStart}%; width:${region.percentLength}%;">
                  </div>
                </c:when>
                <c:otherwise> <%-- display single feature --%>
                  <c:set var="feature" value="${region.features[0]}" />
                  <%-- has to use the location of the region, since the ones on feature is relative to the region --%>
                  <div data-id="${feature.sourceId}" class="feature ${feature.strand}"
                       style="left:${region.percentStart}%; width:${region.percentLength}%;">
                  </div>
                </c:otherwise>
              </c:choose>
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

  </c:otherwise> <%-- end of display genomic view --%>
</c:choose>

</div> <!-- end of .genome-view -->
