<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>

<%/* get wdkRecord from proper scope */%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="CGI_OR_MOD" value="${props['CGI_OR_MOD']}"/>

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />
<c:set var="projectIdLowerCase" value="${fn:toLowerCase(projectId)}"/>

<c:set value="${wdkRecord.recordClass.type}" var="recordType"/>

<c:set var='bannerText'>
      <c:if test="${wdkRecord.attributes['organism'].value ne 'null'}">
          <font face="Arial,Helvetica" size="+3">
          <b>${wdkRecord.attributes['organism'].value}</b>
          </font> 
          <font size="+3" face="Arial,Helvetica">
          <b>${id}</b>
          </font><br>
      </c:if>
      
      <font face="Arial,Helvetica">${recordType} Record</font>
</c:set>

<site:header title="${id}"
             bannerPreformatted="${bannerText}"
             divisionName="${recordType} Record"
             division="queries_tools"/>

<c:choose>
<c:when test="${wdkRecord.attributes['organism'].value eq 'null'}">
  <br>
  ${id} was not found.
  <br>
  <hr>
</c:when>
<c:otherwise>

<br>

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
  http://${pageContext.request.serverName}/${CGI_OR_MOD}/gbrowse_img/${projectIdLowerCase}/?name=${contig}:${context_start_range}..${context_end_range};hmap=gbrowse;type=${gtracks};width=640;embed=1;h_feat=${id}@yellow
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
    http://${pageContext.request.serverName}/${CGI_OR_MOD}/gbrowse/${projectIdLowerCase}/?name=${contig}:${context_start_range}..${context_end_range};label=${labels};h_feat=${id}@yellow 
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
    content="Computed by ApiDB" />
<br>

<%------------------------------------------------------------------%>
</c:otherwise>
</c:choose> <%/* if wdkRecord.attributes['organism'].value */%>

<site:footer/>

<script type="text/javascript">
  document.write(
    '<img alt="logo" src="/images/pix-white.gif?resolution='
     + screen.width + 'x' + screen.height + '" border="0">'
  );
</script>
<script language='JavaScript' type='text/javascript' src='/gbrowse/wz_tooltip_3.45.js'></script>
