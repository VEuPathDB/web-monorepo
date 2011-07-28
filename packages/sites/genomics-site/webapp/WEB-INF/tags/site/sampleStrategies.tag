<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="random" uri="http://jakarta.apache.org/taglibs/random-1.0" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="version" value="${wdkModel.version}"/>
<c:set var="site" value="${wdkModel.displayName}"/>

<%--  <h1>Sample Strategies</h1>  --%>
<br><br>

<%-------------  Set sample strategy signatures in all sites  ----------------%>
<c:choose>
   <c:when test="${fn:containsIgnoreCase(site, 'AmoebaDB')}">
      <c:set var="secKin" value="95ac3b1a4f6acfd4" />
      <c:set var="ap2Motif" value="856a9a5b29f9e99e" />
   </c:when>

   <c:when test="${fn:containsIgnoreCase(site, 'CryptoDB')}">
      <c:set var="simple" value="be21be3fa78e67fa" />
      <c:set var="expanded" value="f38d8d049867593d" />
      <c:set var="ap2Motif" value="db57d627778a4b16" />
   </c:when>

   <c:when test="${fn:containsIgnoreCase(site, 'GiardiaDB')}">
      <c:set var="simple" value="f5c9f3e4fd59f3bb" />
      <c:set var="expanded" value="699c7268ffcb3e66" />
      <c:set var="ap2Motif" value="1c4c35adc3734f0b" />
   </c:when>

   <c:when test="${fn:containsIgnoreCase(site, 'MicrosporidiaDB')}">
      <c:set var="mspHypoGeneGO" value="f4bd3039772ccc43" />
      <c:set var="fungiNotAnimal" value="0f3e27c0bf3b1540" />
      <c:set var="ap2Motif" value="8281128855c66f56" />
   </c:when>

 <c:when test="${fn:containsIgnoreCase(site, 'PlasmoDB')}">
      <c:set var="simple" value="1e0dccb636a58a91" />
  <%--    <c:set var="expanded" value="aea5452877157ff5" /> --%>
     <c:set var="expanded" value="19eaaf6ea54f7244" /> 
      <c:set var="expressed" value="1b9b55c3c788b8bc" />
      <c:set var="expressedPknowlesi" value="6b39827bdee7406d" />
      <c:set var="PfalDrugTargets" value="57c0cf7dabba1408" />
      <c:set var="ap2Motif" value="0ffa670cc2b0a579" />
<%-- these need to be regenerated
      <c:set var="PfalVaccineAg" value="d6da190be19651a3" />
--%>
   </c:when>

<c:when test="${fn:containsIgnoreCase(site, 'ToxoDB')}">
      <c:set var="simple" value="cc5c9876caa70f82" />
      <c:set var="expanded" value="7d1b3f3e66521bea" />
      <c:set var="ap2Motif" value="48481038291ab7fa" />
   </c:when>

<c:when test="${fn:containsIgnoreCase(site, 'TrichDB')}">
      <c:set var="simple" value="7fbf3b1254b01c94" />
<%--  <c:set var="expandedTmOrSP" value="0820464a66737f55" /> --%>
      <c:set var="expandedTmOrSP" value="36fffaa5684ac600" /> 
      <c:set var="ap2Motif" value="e892ef6112576c45" />
   </c:when>

<c:when test="${fn:containsIgnoreCase(site, 'PiroplasmaDB')}">
      <c:set var="spConsPiroNotHum" value="b395b99384348aa6" />
      <c:set var="expandedTmOrSPortho" value="742254e8ef7609ab" />
      <c:set var="ap2Motif" value="740d4a3c334f50dd" />
   </c:when>

 <c:when test="${fn:containsIgnoreCase(site, 'TriTrypDB')}">
      <c:set var="simple" value="6d18cc017993d226" />
      <c:set var="expanded" value="2138414b43b897b5" />
      <c:set var="TcAllexpressed" value="4abe1d668c3cc290" />
      <c:set var="expressedLbrazilliensis" value="edf8019a9b1c938f" />
      <c:set var="SecretedAmastigoteKin" value="24351a75599d35f8" />
      <c:set var="rbpMotif" value="14342db338d7884e" />
   </c:when>

 <c:when test="${fn:containsIgnoreCase(site, 'EuPathDB')}">
      <c:set var="simple" value="f8336deab20f2975" />
      <c:set var="expanded" value="3dc751bcbcf93330" />
      <c:set var="ap2Motif" value="6db0178d3994b287" />
   </c:when>


</c:choose>

<div class="h2center">Click to import a strategy in your workspace</div>

<table class="tableWithBorders" style="margin-left: auto; margin-right: auto;" width="90%">

<tr align = "center" style="font-weight:bold"><td>Strategy name</td><td>Example of</td><td>Description</td></tr>

<c:if test="${simple != null}">
<tr align = "left">
	<td><a title="Click to import this strategy in your workspace" onclick="loadSampleStrat('<c:url value="/im.do?s=${simple}"/>');" href="javascript:void(0);">Protein Coding having Signal Pep and EST Evidence</a> </td>
	<td>Simple strategy</td>
	<td>Find all protein coding genes that have a signal peptide and evidence for expression based on EST alignments</td>
</tr>
</c:if>

<c:if test="${spConsPiroNotHum != null}">
<tr align = "left">
	<td><a title="Click to import this strategy in your workspace" onclick="loadSampleStrat('<c:url value="/im.do?s=${spConsPiroNotHum}"/>');" href="javascript:void(0);">Protein Coding Signal Pep not conserved in human</a> </td>
	<td>Simple strategy</td>
	<td>Find all protein coding genes that have a signal peptide and are conserved among Piroplasmida but not in human or mouse</td>
</tr>
</c:if>

<c:if test="${expanded != null}">
  <tr align = "left">
	<td><a  title="Click to import this strategy in your workspace" onclick="loadSampleStrat('<c:url value="/im.do?s=${expanded}"/>');" href="javascript:void(0);">Kinases with TM domains and EST or mass spec. evidence</a> </td>
	<td>Strategy with nested strategy and transform</td>
	<td>Find all kinases that have at least one transmembrane domain and evidence for expression based on EST alignments or proteomics evidence and transform the result to identify all orthologs since not all organisms have expression evidence</td>
</tr>
</c:if>

<c:if test="${expandedTmOrSP != null}">
  <tr align = "left">
	<td><a  title="Click to import this strategy in your workspace" onclick="loadSampleStrat('<c:url value="/im.do?s=${expandedTmOrSP}"/>');" href="javascript:void(0);">kinase, TM or SP, EST evidence</a> </td>
	<td>Strategy with nested strategy</td>
	<td>Find all kinases that have at least one transmembrane domain or a signal peptide and evidence for expression based on EST alignments</td>
</tr>
</c:if>

<c:if test="${expandedTmOrSPortho != null}">
  <tr align = "left">
	<td><a  title="Click to import this strategy in your workspace" onclick="loadSampleStrat('<c:url value="/im.do?s=${expandedTmOrSPortho}"/>');" href="javascript:void(0);">kinase, TM or SP, ortholog transform</a> </td>
	<td>Strategy with nested strategy and ortholog transform</td>
	<td>Find all kinases that have at least one transmembrane domain or a signal peptide with an ortholog transform to identify additional genes that may be mis-annotated</td>
</tr>
</c:if>

<c:if test="${TcAllexpressed != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" onclick="loadSampleStrat('<c:url value="/im.do?s=${TcAllexpressed}"/>');" href="javascript:void(0);"><i>T.c.</i> Expressed Genes</a> </td>
	<td>Strategy with a nested strategy</td>
	<td>Find all <i> T. cruzi</i> genes in the database that have direct evidence for expression</td>
</tr>
</c:if>

<c:if test="${expressedLbrazilliensis != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" onclick="loadSampleStrat('<c:url value="/im.do?s=${expressedLbrazilliensis}"/>');" href="javascript:void(0);"><i>L.b.</i> Proteins with epitopes and expression evidence</a> </td>
	<td>Strategy with an ortholog transform</td>
	<td>Find all genes from <i>L. brazilliensis</i> whose protein product has epitope and expression evidence using orthology</td>
</tr>
</c:if>

<c:if test="${SecretedAmastigoteKin != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" onclick="loadSampleStrat('<c:url value="/im.do?s=${SecretedAmastigoteKin}"/>');" href="javascript:void(0);">Secreted Amastigote Kinases</a> </td>
	<td>Strategy with nested strategies and an ortholog transform</td>
	<td>Find all genes in TriTrypDB (based on orthology) that are kinases (based on text search), are likely secreted (signal peptide and transmembrane domain prediction) and have any evidence for expression in the amastigote stage of <i>T. cruzi</i> (proteomics and EST)</td>
</tr>
</c:if>

<c:if test="${expressedPknowlesi != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" onclick="loadSampleStrat('<c:url value="/im.do?s=${expressedPknowlesi}"/>');" href="javascript:void(0);">P.knowlesi Expressed Genes</a> </td>
	<td>Strategy with a nested strategy and an ortholog transform</td>
	<td>Find all genes from <i>P. knowlesi</i> that have any evidence for expression based on orthology to other <i>Plasmodium</i> species</td>
</tr>
</c:if>

<c:if test="${PfalVaccineAg != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" onclick="loadSampleStrat('<c:url value="/im.do?s=${PfalVaccineAg}"/>');" href="javascript:void(0);"><i>P.falciparum</i> candidate vaccine antigens</a> </td>
	<td>Simple stategy to identify potential vaccine antigens</td>
	<td>Find all genes from <i>P. falciparum</i> that that could be worth following up as a potential vaccine antigen.  Note that there are many ways to do this search ... experiment with different parameter settings and incorporating different queries.</td>
</tr>
</c:if>

<c:if test="${PfalDrugTargets != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" onclick="loadSampleStrat('<c:url value="/im.do?s=${PfalDrugTargets}"/>');" href="javascript:void(0);">Candidate drug targets</a> </td>
	<td>Nested stategy to identify potential drug targets.</td>
	<td>Find <i>Plasmodium</i> genes that could be worth following up as potential drug targets.  Note that there are many ways to do this search ... experiment with different parameter settings and incorporating different queries.</td>
</tr>
</c:if>

<c:if test="${mspHypoGeneGO != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" onclick="loadSampleStrat('<c:url value="/im.do?s=${mspHypoGeneGO}"/>');" href="javascript:void(0);">GO annotated hypotheticals</a> </td>
	<td>Hypothetical genes with GO annotation.</td>
	<td>Find <i>Encephalitozoon</i> genes which have the word 'hypothetical' in the product description and which have gene ontology (GO) terms assigned. 
	This set of genes are candidates for improved gene annotation when the computationally assigned GO terms hint at the role or function of the gene product.</td>
</tr>
</c:if>

<c:if test="${fungiNotAnimal != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" onclick="loadSampleStrat('<c:url value="/im.do?s=${fungiNotAnimal}"/>');" href="javascript:void(0);">Conservered Fungi/secr.TM</a> </td>
	<td>Secreted genes conserved in Fungi and absent from animals.</td>
	<td>Find signal peptide and transmembrane domain-containing proteins conserved in fungi and which lack detectable orthologs in animals.</td>
</tr>
</c:if>

<c:if test="${secKin != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" onclick="loadSampleStrat('<c:url value="/im.do?s=${secKin}"/>');" href="javascript:void(0);">Secreted kinases</a> </td>
	<td>Secreted kinases not conserved in mammals.</td>
	<td>Find <i>Entamoeba</i> genes which have characteristics of encoding secretory-pathway proteins (have signal peptide and have a transmembrane domain) and which lack detectable orthologs in mammals.</td>
</tr>
</c:if>

<c:if test="${ap2Motif != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" onclick="loadSampleStrat('<c:url value="/im.do?s=${ap2Motif}"/>');" href="javascript:void(0);">Genes with AP-2 like motif</a> </td>
	<td>Simple strategy using DNA motifs and relative genomic locations</td>
	<td>Find protein coding genes that have an Ap-2 like motif within 1000 bp of their 5' end.</td>
</tr>
</c:if>

<c:if test="${rbpMotif != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" onclick="loadSampleStrat('<c:url value="/im.do?s=${rbpMotif}"/>');" href="javascript:void(0);">Genes with RBP like motif</a> </td>
	<td>Simple strategy using DNA motifs and relative genomic locations</td>
	<td>Find protein coding genes that have an RNA binding like motif in their 3' region (-300 to +300 of gene end).</td>
</tr>
</c:if>

</table>

