<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="random" uri="http://jakarta.apache.org/taglibs/random-1.0" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<%@ attribute name="wdkModel"
             type="org.gusdb.wdk.model.jspwrap.WdkModelBean"
             required="false"
             description="Wdk Model Object for this site"
%>

<%@ attribute name="wdkUser"
    type="org.gusdb.wdk.model.jspwrap.UserBean"
    required="true"
    description="Currently active user object"
%>

<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="version" value="${wdkModel.version}"/>
<c:set var="site" value="${wdkModel.displayName}"/>

<%--  <h1>Sample Strategies</h1>  --%>
<br><br>

<%-------------  Set sample strategy signatures in all sites  ----------------%>
<c:choose>
   <c:when test="${fn:containsIgnoreCase(site, 'AmoebaDB')}">
      <c:set var="secKin" value="95ac3b1a4f6acfd4" />
   </c:when>

   <c:when test="${fn:containsIgnoreCase(site, 'CryptoDB')}">
      <c:set var="simple" value="be21be3fa78e67fa" />
      <c:set var="expanded" value="645f96ff3792dcd8" />
   </c:when>

   <c:when test="${fn:containsIgnoreCase(site, 'GiardiaDB')}">
      <c:set var="simple" value="f5c9f3e4fd59f3bb" />
      <c:set var="expanded" value="699c7268ffcb3e66" />
   </c:when>

   <c:when test="${fn:containsIgnoreCase(site, 'MicrosporidiaDB')}">
      <c:set var="mspHypoGeneGO" value="f4bd3039772ccc43" />
      <c:set var="fungiNotAnimal" value="0f3e27c0bf3b1540" />
   </c:when>

 <c:when test="${fn:containsIgnoreCase(site, 'PlasmoDB')}">
      <c:set var="simple" value="1e0dccb636a58a91" />
      <c:set var="expanded" value="5d0b81139d371422" />
      <c:set var="expressed" value="1b9b55c3c788b8bc" />
      <c:set var="expressedPknowlesi" value="6b39827bdee7406d" />
<%-- these need to be regenerated
      <c:set var="PfalVaccineAg" value="d6da190be19651a3" />
      <c:set var="PfalDrugTargets" value="3dada0a520754b5d" />
--%>
   </c:when>

<c:when test="${fn:containsIgnoreCase(site, 'ToxoDB')}">
      <c:set var="simple" value="cc5c9876caa70f82" />
      <c:set var="expanded" value="7d1b3f3e66521bea" />
   </c:when>

<c:when test="${fn:containsIgnoreCase(site, 'TrichDB')}">
      <c:set var="simple" value="7fbf3b1254b01c94" />
      <c:set var="expandedTmOrSP" value="0820464a66737f55" />
   </c:when>

 <c:when test="${fn:containsIgnoreCase(site, 'TriTrypDB')}">
      <c:set var="simple" value="6d18cc017993d226" />
      <c:set var="expanded" value="8699257e6a988b74" />
      <c:set var="TcAllexpressed" value="4abe1d668c3cc290" />
      <c:set var="expressedLbrazilliensis" value="edf8019a9b1c938f" />
      <c:set var="SecretedAmastigoteKin" value="c867cab6ad4645a0" />
   </c:when>

 <c:when test="${fn:containsIgnoreCase(site, 'EuPathDB')}">
      <c:set var="simple" value="4961f7629e7950c9" />
      <c:set var="expanded" value="c8badd7f483025f8" />
   </c:when>


<c:when test="${fn:containsIgnoreCase(site, 'EuPathDB')}">
 
   </c:when>

</c:choose>

<div class="h2center">Click to import a strategy in your workspace</div>

<table class="tableWithBorders" style="margin-left: auto; margin-right: auto;" width="90%">

<tr align = "center" style="font-weight:bold"><td>Strategy name</td><td>Example of</td><td>Description</td></tr>

<c:if test="${simple != null}">
<tr align = "left">
	<td><a title="Click to import this strategy in your workspace" href="<c:url value="/im.do?s=${simple}"/>">Prot Cod Sig Pep EST Evidence</a> </td>
	<td>Simple strategy</td>
	<td>Find all protein coding genes that have a signal peptide and evidence for expression based on EST alignments</td>
</tr>
</c:if>

<c:if test="${expanded != null}">
  <tr align = "left">
	<td><a  title="Click to import this strategy in your workspace" href="<c:url value="/im.do?s=${expanded}"/>">kin, TM, (EST or Prot) ortho</a> </td>
	<td>Strategy with nested strategy and transform</td>
	<td>Find all kinases that have at least one transmembrane domain and evidence for expression based on EST alignments or proteomics evidence and transform the result to identify all orthologs since not all organisms have expression evidence</td>
</tr>
</c:if>

<c:if test="${expandedTmOrSP!= null}">
  <tr align = "left">
	<td><a  title="Click to import this strategy in your workspace" href="<c:url value="/im.do?s=${expandedTmOrSP}"/>">kinase, TM or SP, EST evidence</a> </td>
	<td>Strategy with nested strategy</td>
	<td>Find all kinases that have at least one transmembrane domain or a signal peptide and evidence for expression based on EST alignments</td>
</tr>
</c:if>

<c:if test="${TcAllexpressed != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" href="<c:url value="/im.do?s=${TcAllexpressed}"/>"><i>T.c.</i> Expressed Genes</a> </td>
	<td>Strategy with a nested strategy</td>
	<td>Find all <i> T. cruzi</i> genes in the database that have direct evidence for expression</td>
</tr>
</c:if>

<c:if test="${expressedLbrazilliensis != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" href="<c:url value="/im.do?s=${expressedLbrazilliensis}"/>"><i>L.b.</i> Proteins with epitopes and direct expression evidence</a> </td>
	<td>Strategy with an ortholog transform</td>
	<td>Find all genes from <i>L. brazilliensis</i> whose protein product has epitope and expression evidence based on direct evidence or using orthology</td>
</tr>
</c:if>

<c:if test="${SecretedAmastigoteKin != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" href="<c:url value="/im.do?s=${SecretedAmastigoteKin}"/>">Secreted Amastigote Kinases</a> </td>
	<td>Strategy with nested strategies and an ortholog transform</td>
	<td>Find all genes in TriTrypDB (based on orthology) that are kinases (based on text search), are likely secreted (signal peptide and transmembrane domain prediction) and have any evidence for expression in the amastigote stage of <i>T. cruzi</i> (proteomics and EST)</td>
</tr>
</c:if>

<c:if test="${expressedPknowlesi != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" href="<c:url value="/im.do?s=${expressedPknowlesi}"/>">P.knowlesi Expressed Genes</a> </td>
	<td>Strategy with a nested strategy and an ortholog transform</td>
	<td>Find all genes from <i>P. knowlesi</i> that have any evidence for expression based on orthology to other <i>Plasmodium</i> species</td>
</tr>
</c:if>

<c:if test="${PfalVaccineAg != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" href="<c:url value="/im.do?s=${PfalVaccineAg}"/>"><i>P.falciparum</i> candidate vaccine antigens</a> </td>
	<td>Simple stategy to identify potential vaccine antigens</td>
	<td>Find all genes from <i>P. falciparum</i> that that could be worth following up as a potential vaccine antigen.  Note that there are many ways to do this search ... experiment with different parameter settings and incorporating different queries.</td>
</tr>
</c:if>

<c:if test="${PfalDrugTargets != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" href="<c:url value="/im.do?s=${PfalDrugTargets}"/>"><i>P.falciparum</i> candidate drug targets</a> </td>
	<td>Nested stategy to identify potential drug targets.</td>
	<td>Find genes from <i>P. falciparum</i> that could be worth following up as potential drug targets.  Note that there are many ways to do this search ... experiment with different parameter settings and incorporating different queries.</td>
</tr>
</c:if>

<c:if test="${mspHypoGeneGO != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" href="<c:url value="/im.do?s=${mspHypoGeneGO}"/>">GO annotated hypotheticals</a> </td>
	<td>Hypothetical genes with GO annotation.</td>
	<td>Find <i>Encephalitozoon</i> genes which have the word 'hypothetical' in the product description and which have gene ontology (GO) terms assigned. 
	This set of genes are candidates for improved gene annotation when the computationally assigned GO terms hint at the role or function of the gene product.</td>
</tr>
</c:if>

<c:if test="${fungiNotAnimal != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" href="<c:url value="/im.do?s=${fungiNotAnimal}"/>">Conservered Fungi/secr.TM</a> </td>
	<td>Secreted genes conserved in Fungi and absent from animals.</td>
	<td>Find signal peptide and transmembrane domain-containing proteins conserved in fungi and which lack detectable orthologs in animals.</td>
</tr>
</c:if>

<c:if test="${secKin != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" href="<c:url value="/im.do?s=${secKin}"/>">Secreted kinases</a> </td>
	<td>Secreted kinases not conserved in mammals.</td>
	<td>Find <i>Entamoeba</i> genes which have characteristics of encoding secretory-pathway proteins (have signal peptide and have a transmembrane domain) and which lack detectable orthologs in mammals.</td>
</tr>
</c:if>

</table>


