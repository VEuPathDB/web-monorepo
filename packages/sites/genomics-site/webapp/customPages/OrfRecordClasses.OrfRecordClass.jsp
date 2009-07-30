<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>

<%/* get wdkRecord from proper scope */%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="recordType" value="${wdkRecord.recordClass.type}" />
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />
<c:set var="projectIdLowerCase" value="${fn:toLowerCase(projectId)}"/>

<site:header title="${id}"
             divisionName="${recordType} Record"
             division="queries_tools"/>

<c:choose>
<c:when test="${wdkRecord.attributes['organism'].value eq 'null' || !wdkRecord.validRecord}">
  <h2 style="text-align:center;color:#CC0000;">The ${recordType} '${id}' was not found.</h2>
</c:when>
<c:otherwise>


<br/>

<h2>
<center>
${id}
</center>
</h2>


<%--#############################################################--%>

<c:set var="append" value="" />

<c:set var="attr" value="${attrs['overview']}" />
<site:panel 
    displayName="${attr.displayName}"
    content="${attr.value}" />
<br>

<%-- DNA CONTEXT --------------------------------------------------%>

<c:set var="gtracks" value="${attrs['gbrowseTracks'].value}" />

<c:set var="contig" value="${attrs['nas_id'].value}" /> 
<c:set var="context_start_range" value="${attrs['orf_start'].value - 300}" /> 
<c:set var="context_end_range" value="${attrs['orf_end'].value + 300}" /> 

<c:set var="genomeContextUrl">
  http://${pageContext.request.serverName}/cgi-bin/gbrowse_img/${projectIdLowerCase}/?name=${contig}:${context_start_range}..${context_end_range};hmap=gbrowse;type=${gtracks};width=640;embed=1;h_feat=${id}@yellow
</c:set>

<c:set var="genomeContextImg">
  <noindex follow><center>
  <c:catch var="e">
    <c:import url="${genomeContextUrl}"/>
  </c:catch>
  <c:if test="${e!=null}">
    <site:embeddedError 
        msg="<font size='-2'>temporarily unavailable</font>" 
        e="${e}" 
    />
  </c:if>
  </center>
  </noindex> 
  <c:set var="labels" value="${fn:replace(gtracks, '+', ';label=')}" />
  <c:set var="gbrowseUrl"> 
    http://${pageContext.request.serverName}/cgi-bin/gbrowse/${projectIdLowerCase}/?name=${contig}:${context_start_range}..${context_end_range};label=${labels};h_feat=${id}@yellow 
  </c:set> 
  <a href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a> 
</c:set> 

  <c:set var="attribution">

  </c:set>

<site:panel 
 displayName="Genomic Context" 
  content="${genomeContextImg}"
  attribution="${attribution}"/>

<br> 


<%-- GENOMIC LOCATIONS ------------------------------------------------%>
  <site:wdkTable tblName="Locations" isOpen="true"
                 attribution=""/>

<%-- GENOME SEQUENCE ------------------------------------------------%>
<c:set var="attr" value="${attrs['sequence']}" />
<c:set var="seq">
    <noindex> <%-- exclude htdig --%>
    <font class="fixed">
    <w:wrap size="60" break="<br>">${attr.value}</w:wrap>
    </font>
    </noindex>
</c:set>
<site:panel 
    displayName="${attr.displayName}"
    content="${seq}" />
<br>

<%------------------------------------------------------------------%>

<site:panel 
    displayName="Attributions"
    content="Computed by EuPathDB" />
<br>

<%------------------------------------------------------------------%>
</c:otherwise>
</c:choose> <%/* if wdkRecord.attributes['organism'].value */%>

<script type='text/javascript' src='/gbrowse/apiGBrowsePopups.js'></script>
<script type='text/javascript' src='/gbrowse/wz_tooltip.js'></script>

<site:footer/>

