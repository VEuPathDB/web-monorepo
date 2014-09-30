<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="qset"
              required="true"
              description="question set name"
%>

<%@ attribute name="qname"
              required="true"
              description="question name"
%>

<%@ attribute name="linktext"
              required="true"
              description="link text"
%>

<%@ attribute name="existsOn"
              required="false"
              description="check site existence"
%>

<%@ attribute name="type"
              required="false"
              description="GENE,SEQ,ORF or EST"
%>

<c:set var="E_image" value="images/empty_letter.gif"/>
<c:set var="E"> <imp:image src="${E_image}" border="0" alt="" /> </c:set>
 

<c:set var="Am" value="${E}" />
<c:set var="M" value="${E}" />
<c:set var="P" value="${E}" />
<c:set var="Pi" value="${E}" />    <%-- for piroplasma --%>
<c:set var="T" value="${E}" />
<c:set var="C" value="${E}" />
<c:set var="A" value="${E}" />    <%-- for portal --%>
<c:set var="G" value="${E}" />
<c:set var="Tr" value="${E}" />  <%-- for Trich --%>
<c:set var="Tt" value="${E}" />   <%-- for TriTryp --%>



<c:set var="amoebaRoot" value="http://www.amoebadb.org/amoeba/" />
<c:set var="microRoot" value="http://www.microsporidiadb.org/micro/" />
<c:set var="piroRoot" value="http://www.piroplasmadb.org/piro/" />
<c:set var="plasmoRoot" value="http://www.plasmodb.org/plasmo/" />
<c:set var="toxoRoot" value="http://www.toxodb.org/toxo/" />
<c:set var="cryptoRoot" value="http://www.cryptodb.org/cryptodb/" />
<c:set var="apiRoot" value="http://www.eupathdb.org/eupathdb/" />
<c:set var="giardiaRoot" value="http://www.giardiadb.org/giardiadb/" />
<c:set var="trichRoot" value="http://www.trichdb.org/trichdb/" />
<c:set var="tritrypRoot" value="http://www.tritrypdb.org/tritrypdb/" />


<%-- get wdkModel saved in application scope --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="modelName" value="${wdkModel.displayName}"/>

<%-- if we need to get all the organisms..
<c:set var="qSetMap" value="${wdkModel.questionSetsMap}"/>
<c:set var="sqSet" value="${qSetMap['GenomicSequenceQuestions']}"/>
<c:set var="sqMap" value="${sqSet.questionsMap}"/>
<c:set var="seqByTaxonQuestion" value="${sqMap['SequencesByTaxon']}"/>
<c:set var="stpMap" value="${seqByTaxonQuestion.paramsMap}"/>
<c:catch var="orgParam_exception">
	<c:set var="orgParam" value="${stpMap['organism']}"/>
    <c:set var="listOrganisms" value="" />
    <c:forEach items="${orgParam.vocabMap}" var="item">
      <c:set var="term" value="${item.key}" />
      <c:if test="${fn:length(listOrganisms) > 0}">
        <c:set var="listOrganisms" value="${listOrganisms}," />
      </c:if>
      <c:set var="listOrganisms" value="${listOrganisms}${term}" />
    </c:forEach>
</c:catch>
--%>

<c:choose>
<c:when test="${fn:containsIgnoreCase(modelName, 'eupath')    }">
	<c:set var="API" value="true"     />
</c:when>
<c:otherwise>
	<c:set var="COMPONENT" value="true" />
</c:otherwise>
</c:choose>

<c:set var="link" value="showQuestion.do?questionFullName=${qset}.${qname}" />

<c:set var="array" value="${fn:split(existsOn, ' ')}" />
<c:forEach var="token" items="${array}" >
  <c:if test="${token eq 'Am'}">
    <c:set var="Am_image" value="images/A_letter.gif"/>
    <c:set var="Am">
      <a href='${amoebaRoot}${link}'><imp:image src='${Am_image}' border='0' alt='amoebadb' width='10' height='10'/></a>
    </c:set>
  </c:if>
  <c:if test="${token eq 'M'}">
    <c:set var="M_image" value="images/M_letter.gif"/>
    <c:set var="M">
      <a href='${microRoot}${link}'><imp:image src='${M_image}' border='0' alt='microdb' width='10' height='10'/></a>
    </c:set>
  </c:if>
  <c:if test="${token eq 'Tt'}">
    <c:set var="Tt_image" value="images/tritrypdb_letter.gif"/>
    <c:set var="Tt">
      <a href='${tritrypRoot}${link}'><imp:image src='${Tt_image}' border='0' alt='tritrypdb' /></a>
    </c:set>
  </c:if>
  <c:if test="${token eq 'G'}">
    <c:set var="G_image" value="images/giardiadb_letter.gif"/>
    <c:set var="G">
      <a href='${giardiaRoot}${link}'><imp:image src='${G_image}' border='0' alt='giardiadb' /></a>
    </c:set>
  </c:if>
  <c:if test="${token eq 'Tr'}">
    <c:set var="Tr_image" value="images/trichdb_letter.gif"/>
    <c:set var="Tr">
      <a href='${trichRoot}${link}'><imp:image src='${Tr_image}' border='0' alt='trichdb' /></a>
    </c:set>
  </c:if>
  <c:if test="${token eq 'P'}">
    <c:set var="P_image" value="images/plasmodb_letter.gif"/>
    <c:set var="P">
      <a href='${plasmoRoot}${link}'><imp:image src='${P_image}' border='0' alt='plasmodb' /></a>
    </c:set>
  </c:if>
  <c:if test="${token eq 'Pi'}">
    <c:set var="Pi_image" value="images/plasmodb_letter.gif"/>
    <c:set var="Pi">
      <a href='${piroRoot}${link}'><imp:image src='${Pi_image}' border='0' alt='piroplasmadb' /></a>
    </c:set>
  </c:if>
  <c:if test="${token eq 'T'}">
    <c:set var="T_image" value="images/toxodb_letter.gif"/>
    <c:set var="T">
      <a href='${toxoRoot}${link}'><imp:image src='${T_image}' border='0' alt='toxodb' /></a>
    </c:set>
  </c:if>
  <c:if test="${token eq 'C'}">
    <c:set var="C_image" value="images/cryptodb_letter.gif"/>
    <c:set var="C">
      <a href='${cryptoRoot}${link}'><imp:image src='${C_image}' border='0' alt='cryptodb' /></a>
    </c:set>
  </c:if>
  <c:if test="${token eq 'A'}">
    <c:set var="A_image" value="images/eupathdb_letter.gif "/>
    <c:set var="A">
      <a href='${apiRoot}${link}'><imp:image src='${A_image}' border='0' alt='apidb' /></a>
    </c:set>
  </c:if>
</c:forEach>

<c:set var="modelName" value="${wdkModel.displayName}"/>

<%-- remove harcoded 
<c:if test="${modelName eq 'HostDB'}">
    <c:set var="organismName" value="Human, Mouse"/>
</c:if>
<c:if test="${modelName eq 'AmoebaDB'}">
    <c:set var="organismName" value="Entamoeba"/>
</c:if>
<c:if test="${modelName eq 'MicrosporidiaDB'}">
    <c:set var="organismName" value="Encephalitozoon,Enterocytozoon,Nematocida,Nosema,Octosporea,Vavraia"/>
</c:if>
<c:if test="${modelName eq 'CryptoDB'}">
    <c:set var="organismName" value="Cryptosporidium"/>
</c:if>
<c:if test="${modelName eq 'PiroplasmaDB'}">
        <c:set var="organismName" value="Babesia,Theileria"/>
</c:if>
<c:if test="${modelName eq 'PlasmoDB'}">
        <c:set var="organismName" value="Plasmodium"/>
</c:if>
<c:if test="${modelName eq 'ToxoDB'}">
        <c:set var="organismName" value="Eimeria,Neospora,Toxoplasma"/>
</c:if>
<c:if test="${modelName eq 'GiardiaDB'}">
        <c:set var="organismName" value="Giardia"/>
</c:if>
<c:if test="${modelName eq 'TrichDB'}">
        <c:set var="organismName" value="Trichomonas"/>
</c:if>
<c:if test="${modelName eq 'TriTrypDB'}">
        <c:set var="organismName" value="Kinetoplastid"/>
</c:if>
--%>

<c:set var="popup" value="${wdkModel.questionSetsMap[qset].questionsMap[qname].summary}"/>

<td width="5" align="left" class="queryGridBullet">&nbsp;&#8226;&nbsp; </td>

<%-- LINK ACTIVE --%>

<%-- adding symbols for build14, until we get this from the model https://redmine.apidb.org/issues/9045
not clear we need icons on categories, ui-infra meet May 22, 2012
<c:if test="${modelName eq 'PlasmoDB' || modelName eq 'EuPathDB'}">
<c:if test="${linktext eq 'Microarray Evidence' || linktext eq 'RNA Seq Evidence'}">
	<c:set var="astyle" value="position:relative;top:-5px;"/>
</c:if>
</c:if>
 --%>

<c:if test="${!empty wdkModel.questionSetsMap[qset].questionsMap[qname]}">
     <td align="left"><a style="${astyle}" id="${qset}_${qname}_${type}" class="queryGridLink queryGridActive" href='${link}' title="${fn:escapeXml(popup)}">${linktext}</a>


<%-- not clear we need icons on categories, ui-infra meet May 22, 2012
<c:if test="${linktext eq 'Microarray Evidence'  || linktext eq 'RNA Seq Evidence'}">
	<imp:image width="40" alt="Revised feature icon" title="This category has been revised" 
         	src="wdk/images/revised-small.png" />
</c:if>
--%>

<%--
<c:if test="${fn:containsIgnoreCase(linktext, 'Host Response')}">
	<imp:image alt="New feature icon" title="This is a new search" 
         src="wdk/images/new-feature.png" />
</c:if>
--%>

<c:if test="${fn:containsIgnoreCase(qname, 'SnpsByIsolatesGroup')}">
	<imp:image alt="New feature icon" title="This is a new search" 
         src="wdk/images/beta2-30.png" />
</c:if>


</td>
</c:if>

<%-- LINK INACTIVE --%>
<c:if test="${ empty wdkModel.questionSetsMap[qset].questionsMap[qname]}">

     <c:set var="tooltip" value="This search type is not available yet in ${modelName}."/>  
     <td align="left"><a id="${qset}_${qname}_${type}" class="queryGridLink queryGridInactive" href='javascript:void(0);' title="${fn:escapeXml(tooltip)}">${linktext}</a></td>

</c:if>

    <td  width="84" nowrap align="right" class="queryGridIcons">

<c:if test="${API}">

<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>

	<td width="14">${Am}</td>
	<td width="14">${C}</td>
	<td width="14">${G}</td>
	<td width="14">${M}</td>	
	<td width="14">${Pi}</td>	
	<td width="14">${P}</td>	
	<td width="14">${T}</td>
	<td width="14">${Tr}</td>
	<td width="14">${Tt}</td>
</tr>

</table>
</c:if>

<c:if test="${COMPONENT}">

<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>

	<td align="right">${A}</td>

</tr>
</table>
</c:if>



    </td>

