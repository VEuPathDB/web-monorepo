<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>

<%/* get wdkRecord from proper scope */%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />

<c:set value="${wdkRecord.recordClass.type}" var="recordType"/>
<c:set var="target_name" value="${attrs['target_name'].value}" />
<c:set var="min_subject_start" value="${attrs['min_subject_start'].value}" />
<c:set var="max_subject_end" value="${attrs['max_subject_end'].value}" />
<c:set var="gene_description" value="${attrs['gene_description'].value}" />

<c:set var="gtracks">
     Gene+SyntenyGene+BLASTX+IsolateCDC
</c:set>

<c:set var='bannerText'>
      <c:if test="${wdkRecord.attributes['organism'].value ne 'null'}">
          <font face="Arial,Helvetica" size="+2">
          <b>${wdkRecord.attributes['organism'].value}</b>
          </font> 
          <font size="+2" face="Arial,Helvetica">
          <b>${wdkRecord.primaryKey}</b>
          </font><br>
      </c:if>
      
      <font face="Arial,Helvetica">${recordType} Record</font>
</c:set>

<site:header title="${wdkRecord.primaryKey}"
             bannerPreformatted="${bannerText}"
             divisionName="${recordType} Record"
             division="queries_tools"/>

<c:choose>
<c:when test="${wdkRecord.attributes['organism'].value eq 'null'}">
  <br>
  ${wdkRecord.primaryKey} was not found.
  <br>
  <hr>
</c:when>

<c:otherwise>

<%--#############################################################--%>

<c:set var="attr" value="${attrs['overview']}" />

<site:panel
    displayName="${attr.displayName}"
		    content="${attr.value}" />
<br>


<%--#############################################################--%>


<c:set var="genomeContextUrl">
  http://${pageContext.request.serverName}/cgi-bin/gbrowse_img/cryptodb/?name=${target_name}:${min_subject_start}..${max_subject_end};type=${gtracks};width=640;embed=1;h_feat=${wdkRecord.primaryKey}@yellow
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
</c:set>

<c:set var="gbrowseUrl">
    ${genomeContextUrl}
		<a href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>
</c:set>


<c:set var="attribution">
	CparvumContigs,ChominisContigs,CparvumChr6Scaffold,CparvumESTs,
	Wastling2DGelLSMassSpec,Wastling1DGelLSMassSpec,WastlingMudPitSolMassSpec,
	WastlingMudPitInsolMassSpec,CryptoLoweryLCMSMSInsolExcystedMassSpec,
	CryptoLoweryLCMSMSInsolNonExcystedMassSpec,CryptoLoweryLCMSMSSolMassSpec
</c:set>

<site:panel
 displayName="Genomic Context"
   content="${genomeContextImg}"
	/>


<%-- <site:wdkTable tblName="Mapping" attribution="test"/> %>


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

<%-- PROTEIN SEQUENCE ------------------------------------------------%>
<c:set var="attr" value="${attrs['protein_sequence']}" />
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


<%-- ATTRIBUTION ------------------------------------------------%>
<c:set var="attr" value="${attrs['attribution']}" />

<site:panel
    displayName="${attr.displayName}"
		    content="${attr.value}" />
<br>

</c:otherwise>
</c:choose>

<script language='JavaScript' type='text/javascript' src='/gbrowse/wz_tooltip_3.45.js'></script>

