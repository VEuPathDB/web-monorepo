<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%/* get wdkRecord from proper scope */%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />

<c:set var="CPARVUMCHR6" value="${props['CPARVUMCHR6']}"/>
<c:set var="CPARVUMCONTIGS" value="${props['CPARVUMCONTIGS']}"/>
<c:set var="CHOMINISCONTIGS" value="${props['CHOMINISCONTIGS']}"/>

<c:set var="extdbname" value="${attrs['extdbname'].value}" />

<%-- display page header with recordClass type in banner --%>
<c:set value="${wdkRecord.recordClass.type}" var="recordType"/>

<c:set var='bannerText'>
  <c:if test="${wdkRecord.attributes['organism'].value ne 'null'}">
    <font face="Arial,Helvetica" size="+3">
	  <b>${wdkRecord.attributes['organism'].value}</b>
	  </font>
	  <font size="+3" face="Arial,Helvetica">
	  <b>${wdkRecord.primaryKey}</b>
	  </font><br>
  </c:if> 
  <font face="Arial,Helvetica">${recordType} Record</font> 
</c:set>

<site:header title="${wdkRecord.primaryKey}"
             bannerPreformatted="${bannerText}"
						 divisionName="Gene Record"
						 division="queries_tools"/>

<c:choose>
<c:when test="${wdkRecord.attributes['organism'].value eq 'null'}">
    ${wdkRecord.primaryKey} was not found.
		<br>
		<hr>
</c:when>
<c:otherwise>

<%--#############################################################--%>

<c:set var="append" value="" />
<c:set var="attr" value="${attrs['overview']}" />
<site:panel 
    displayName="${attr.displayName}"
    content="${attr.value}${append}" />
<br>

<%-- PROTEIN FEATURES -------------------------------------------------%>

<c:choose>
<c:when test="${extdbname eq CPARVUMCONTIGS}">
    <c:set var="ptracks">
    MassSpecPeptides+PfamDomains+SignalP+TMHMM+HydropathyPlot+BLASTP
    </c:set>
</c:when>
<c:when test="${extdbname eq CHOMINISCONTIGS}">
    <c:set var="ptracks">
    MassSpecPeptides+PfamDomains+SignalP+TMHMM+HydropathyPlot+BLASTP
   </c:set>
</c:when>
<c:when test="${extdbname eq CPARVUMCHR6}">
    <c:set var="ptracks">
    </c:set>
</c:when>
<c:otherwise>
    <c:set var="ptracks" value="" />
</c:otherwise>
</c:choose>

<c:set var="proteinFeaturesUrl">
http://${pageContext.request.serverName}/mod-perl/gbrowse_img/cryptodbaa/?name=${wdkRecord.primaryKey};type=${ptracks};width=640;embed=1
</c:set>

<c:if test="${ptracks ne ''}">
    <c:set var="proteinFeaturesImg">
        <noindex follow><center>
        <c:catch var="e">
           <c:import url="${proteinFeaturesUrl}"/>
        </c:catch>
        <c:if test="${e!=null}">
            <site:embeddedError 
                msg="<font size='-2'>error accessing<br>'${proteinFeaturesUrl}'</font>" 
                e="${e}" 
            />
        </c:if>
        </center></noindex>
    </c:set>
    
    <site:panel 
        displayName="Predicted Protein Features"
        content="${proteinFeaturesImg}" />
    <br>
</c:if>
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
<c:set var="attr" value="${attrs['translation']}" />
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

<c:choose>
<c:when test="${extdbname eq CPARVUMCONTIGS}">
    <c:set var="reference">
Abrahamsen MS, Templeton TJ, Enomoto S, Abrahante JE, Zhu G, Lancto CA, 
Deng M, Liu C, Widmer G, Tzipori S, Buck GA, Xu P, Bankier AT, Dear PH, 
Konfortov BA, Spriggs HF, Iyer L, Anantharaman V, Aravind L, Kapur V. 
<b>Complete genome sequence of the apicomplexan, <i>Cryptosporidium parvum</i>.</b> 
Science. 2004 Apr 16;<a href="http://www.sciencemag.org/cgi/content/full/304/5669/441"><b>304</b>(5669):441-5</a>.
    </c:set>
</c:when>
<c:when test="${extdbname eq CHOMINISCONTIGS}">
    <c:set var="reference">
Xu P, Widmer G, Wang Y, Ozaki LS, Alves JM, Serrano MG, Puiu D, Manque P, 
Akiyoshi D, Mackey AJ, Pearson WR, Dear PH, Bankier AT, Peterson DL, 
Abrahamsen MS, Kapur V, Tzipori S, Buck GA. 
<b>The genome of <i>Cryptosporidium hominis</i>.</b> 
Nature. 2004 Oct 28;<a href="http://www.nature.com/nature/journal/v431/n7012/abs/nature02977.html"><b>431</b>(7012):1107-12</a>.
    </c:set>
</c:when>
<c:when test="${extdbname eq CPARVUMCHR6}">
    <c:set var="reference">
Bankier AT, Spriggs HF, Fartmann B, Konfortov BA, Madera M, Vogel C, 
Teichmann SA, Ivens A, Dear PH. 
<b>Integrated mapping, chromosomal sequencing and sequence analysis of <i>Cryptosporidium parvum</i>. 
</b>Genome Res. 2003 Aug;<a href="http://www.genome.org/cgi/content/full/13/8/1787">13(8):1787-99</a>
    </c:set>

</c:when>
<c:otherwise>
    <c:set var="reference" value="${extdbname}" />
</c:otherwise>
</c:choose>

<c:set var="citation" value="${attrs['citation'].value}" />
<c:if test="${citation eq 'CryptoDB'}">
    <c:set var="reference">
    ${reference}<br><br>Gene prediction/annotation by CryptoDB
    </c:set>
</c:if>

<site:panel 
    displayName="Attributions"
    content="${reference}" />
<br>

<%------------------------------------------------------------------%>
</c:otherwise>
</c:choose> <%/* if wdkRecord.attributes['organism'].value */%>

<%-- footer --%>
<jsp:include page="/include/footer.html"/>

<script type="text/javascript">
  document.write(
	  '<img alt="logo" src="/images/pix-white.gif?resolution='
			+ screen.width + 'x' + screen.height + '" border="0">'
  );
</script>
<script language='JavaScript' type='text/javascript' src='/gbrowse/wz_tooltip_3.45.js'></script>
