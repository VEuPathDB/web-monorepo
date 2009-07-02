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
   <c:when test="${fn:containsIgnoreCase(site, 'CryptoDB')}">
      <c:set var="simple" value="be21be3fa78e67fa" />
      <c:set var="expanded" value="645f96ff3792dcd8" />
   </c:when>

<c:when test="${fn:containsIgnoreCase(site, 'GiardiaDB')}">
      <c:set var="simple" value="1aae5898da478e93" />
      <c:set var="expanded" value="371bdee08100f6f5" />
   </c:when>

 <c:when test="${fn:containsIgnoreCase(site, 'PlasmoDB')}">
      <c:set var="simple" value="1e0dccb636a58a91" />
      <c:set var="expanded" value="5d0b81139d371422" />
      <c:set var="expressed" value="c4e672fb46e21b2d0" />
      <c:set var="expressedPknowlesi" value="9e370e45de7a124c" />
      <c:set var="PfalVaccineAg" value="d6da190be19651a3" />
      <c:set var="PfalDrugTargets" value="3dada0a520754b5d" />
      <c:set var="vivaxCryptoOrthologs" value="5734b351e036548c" />
   </c:when>

<c:when test="${fn:containsIgnoreCase(site, 'ToxoDB')}">
      <c:set var="simple" value="cc5c9876caa70f82" />
      <c:set var="expanded" value="64ee4d56cc82e2f9" />

   </c:when>

<c:when test="${fn:containsIgnoreCase(site, 'TrichDB')}">

   </c:when>

 <c:when test="${fn:containsIgnoreCase(site, 'TriTrypDB')}">
      <c:set var="simple" value="6d18cc017993d226" />
      <c:set var="expanded" value="f58790bf857161c3" />
      <c:set var="expressed" value="55b70c857bee1bfa" />
      <c:set var="expressedLbrazilliensis" value="36217c6cc264ac15" />
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

<c:if test="${expressed != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" href="<c:url value="/im.do?s=${expressed}"/>">Expressed Genes</a> </td>
	<td>Strategy with a nested strategy</td>
	<td>Find all genes in the database that have any direct evidence for expression</td>
</tr>
</c:if>

<c:if test="${expressedLbrazilliensis != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" href="<c:url value="/im.do?s=${expressedLbrazilliensis}"/>"><i>L. brazilliensis</i> Expressed Genes</a> </td>
	<td>Strategy with an ortholog transform</td>
	<td>Find all genes from <i>L. brazilliensis</i> that have any evidence for expression based on direct evidence or using orthology</td>
</tr>
</c:if>

<c:if test="${expressedPknowlesi != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" href="<c:url value="/imp.do?s=${expressedPknowlesi}"/>">P.knowlesi Expressed Genes</a> </td>
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
	<td>Find genes from <i>P. falciparum</i> that that could be worth following up as potential drug targets.  Note that there are many ways to do this search ... experiment with different parameter settings and incorporating different queries.</td>
</tr>
</c:if>

<c:if test="${vivaxCryptoOrthologs != null}">
<tr align = "left">
	<td><a   title="Click to import this strategy in your workspace" href="<c:url value="/im.do?s=${vivaxCryptoOrthologs}"/>"><i>P.vivax</i> orthologs</a> </td>
	<td>Simple stategy</td>
	<td><i>P. vivax</i> orthologs of cryptosporidium genes that have evidence of expression in oocysts.</td>
</tr>
</c:if>

</table>


