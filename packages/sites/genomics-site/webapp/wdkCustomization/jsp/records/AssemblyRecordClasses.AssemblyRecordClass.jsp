<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />

<c:set var="attrs" value="${wdkRecord.attributes}"/>

<site:header title="${wdkModel.displayName} : Assembly ${id}"
             divisionName="Assembly Record"
             division="queries_tools"
             summary="EST Assembly Record"/>

<c:set var="recordType" value="${wdkRecord.recordClass.type}" />
<c:choose>
  <c:when test="${wdkRecord.attributes['organism'].value eq null || !wdkRecord.validRecord}">
    <h2 style="text-align:center;color:#CC0000;">The ${fn:toLowerCase(recordType)} '${id}' was not found.</h2>
  </c:when>
  <c:otherwise>
<c:set var="overview" value="${attrs['overview']}"/>
<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white
       class=thinTopBottomBorders>
 <tr>
  <td bgcolor=white valign=top>


<br/>

<h2>
<center>
${id}
</center>
</h2>

<table width="90%" align="center" cellspacing="5">
<tr><td>



<!-- Overview -->
<wdk:toggle name="${overview.displayName}"
    displayName="${overview.displayName}" isOpen="true"
    content="${overview.value}" />


<!-- genomic context -->
<%--
<c:set var="gbrowseLink" value="${attrs['gbrowseLink'].value}"/>

<c:set var="dnaContext" value="${attrs['dnaContext'].value}"/>
<c:if test="${! fn:startsWith(dnaContext, 'http')}">
<c:set var="dnaContext">
${pageContext.request.scheme}://${pageContext.request.serverName}/${dnaContext}
</c:set>
</c:if>

<script type='text/javascript' src='/gbrowse/apiGBrowsePopups.js'></script>

<c:catch var="e">
<c:set var="dnaContextContent">
  <c:import url="${dnaContext}"/>

  <br><br><a href="${gbrowseLink}">View this sequence in the genome browser</a><br><font size="-1">(<i>use right click or ctrl-click to open in a new window</i>)</font>
</c:set>
</c:catch>
<c:if test="${e!=null}"> 
  <c:set var="dnaContextContent">
  <site:embeddedError 
      msg="<font size='-2'>temporarily unavailable</font>" 
      e="${e}" 
  />
  </c:set>
</c:if>

<wdk:toggle name="dnaContext" displayName="Genomic Context"
             content="${dnaContextContent}" isOpen="true"
             />


--%>
<c:set var="consensusSeq">
  <c:catch var="e">
  <c:import url="http://${pageContext.request.serverName}/cgi-bin/estClusterProxy?id=${id}&what=getConsensus&project_id=${projectId}" />
  </c:catch>
  <c:if test="${e!=null}"> 
      <site:embeddedError 
          msg="<font size='-2'>temporarily unavailable</font>" 
          e="${e}" 
      />
  </c:if>
</c:set>

<wdk:toggle name="ConsensusSequence"
    displayName="Consensus Sequence"
    content="${consensusSeq}"
    isOpen="true"/>



<wdk:wdkTable tblName="AlignmentInfo" isOpen="true"/>

<wdk:wdkTable tblName="LibraryInfo" isOpen="true"/>

<wdk:wdkTable tblName="EstInfo" isOpen="false"/>

<%------------------------------------------------------------------%>

<c:set var="clusterAlign">
  <c:catch var="e">
  <c:import url="http://${pageContext.request.serverName}/cgi-bin/estClusterProxy?id=${id}&what=getAlignment&project_id=${projectId}" />
  </c:catch>
  <c:if test="${e!=null}"> 
      <site:embeddedError 
          msg="<font size='-2'>temporarily unavailable</font>" 
          e="${e}" 
      />
  </c:if>
</c:set>

<wdk:toggle name="Alignment"
    displayName="Alignment${attr.displayName}"
    content="${clusterAlign}" />


<%-- REFERENCE ----------------------------------------------------%>

<site:panel 
    displayName="Attributions"
    content=" CAP4 clustering and alignments by EuPathDB. EST sequences as individually attributed." />
<br>

<hr>
 
</td></tr>
</table>
</c:otherwise>
</c:choose>

<site:footer/>
