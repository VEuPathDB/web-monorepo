<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
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

<style type="text/css">
  td { 
    padding: 1px;
}
</style>



<c:set var="E_image">
   /assets/images/empty_letter.gif
</c:set>
<c:set var="E" value="<img src='${E_image}' border='0' alt='' />" />
 

<c:set var="Am" value="${E}" />
<c:set var="M" value="${E}" />
<c:set var="P" value="${E}" />
<c:set var="T" value="${E}" />
<c:set var="C" value="${E}" />
<c:set var="A" value="${E}" />    <%-- for portal --%>
<c:set var="G" value="${E}" />
<c:set var="Tr" value="${E}" />  <%-- for Trich --%>
<c:set var="Tt" value="${E}" />   <%-- for TriTryp --%>



<c:set var="amoebaRoot" value="http://www.amoebadb.org/amoeba/" />
<c:set var="microRoot" value="http://www.microsporidiadb.org/micro/" />
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
        <c:set var="Am_image">
            /assets/images/A_letter.gif
        </c:set>
        <c:set var="Am" value="<a href='${amoebaRoot}${link}'><img src='${Am_image}' border='0' alt='amoebadb' width='10' height='10'/></a>" />
  </c:if>
<c:if test="${token eq 'M'}">
        <c:set var="M_image">
            /assets/images/M_letter.gif
        </c:set>
        <c:set var="M" value="<a href='${microRoot}${link}'><img src='${M_image}' border='0' alt='microdb' width='10' height='10'/></a>" />
  </c:if>
<c:if test="${token eq 'Tt'}">
        <c:set var="Tt_image">
            /assets/images/tritrypdb_letter.gif
        </c:set>
        <c:set var="Tt" value="<a href='${tritrypRoot}${link}'><img src='${Tt_image}' border='0' alt='tritrypdb' /></a>" />
  </c:if>
  <c:if test="${token eq 'G'}">
        <c:set var="G_image">
            /assets/images/giardiadb_letter.gif
        </c:set>
        <c:set var="G" value="<a href='${giardiaRoot}${link}'><img src='${G_image}' border='0' alt='giardiadb' /></a>" />
  </c:if>
<c:if test="${token eq 'Tr'}">
        <c:set var="Tr_image">
            /assets/images/trichdb_letter.gif
        </c:set>
        <c:set var="Tr" value="<a href='${trichRoot}${link}'><img src='${Tr_image}' border='0' alt='trichdb' /></a>" />
  </c:if>
<c:if test="${token eq 'P'}">
        <c:set var="P_image">
            /assets/images/plasmodb_letter.gif
        </c:set>
        <c:set var="P" value="<a href='${plasmoRoot}${link}'><img src='${P_image}' border='0' alt='plasmodb' /></a>" />
  </c:if>
  <c:if test="${token eq 'T'}">
        <c:set var="T_image">
            /assets/images/toxodb_letter.gif
        </c:set>
        <c:set var="T" value="<a href='${toxoRoot}${link}'><img src='${T_image}' border='0' alt='toxodb' /></a>" />
  </c:if>
  <c:if test="${token eq 'C'}">
        <c:set var="C_image">
            /assets/images/cryptodb_letter.gif
        </c:set>
        <c:set var="C" value="<a href='${cryptoRoot}${link}'><img src='${C_image}' border='0' alt='cryptodb' /></a>" />
  </c:if>
  <c:if test="${token eq 'A'}">
        <c:set var="A_image">
             /assets/images/eupathdb_letter.gif 
        </c:set>
        <c:set var="A" value="<a href='${apiRoot}${link}'><img src='${A_image}' border='0' alt='apidb' /></a>" />
  </c:if>
</c:forEach>

<c:set var="modelName" value="${wdkModel.displayName}"/>
<c:if test="${modelName eq 'AmoebaDB'}">
    <c:set var="orgnismName" value="Entamoeba"/>
</c:if>
<c:if test="${modelName eq 'MicrosporidiaDB'}">
    <c:set var="orgnismName" value="Encephalitozoon"/>
</c:if>
<c:if test="${modelName eq 'CryptoDB'}">
    <c:set var="orgnismName" value="Cryptosporidium"/>
</c:if>
<c:if test="${modelName eq 'PlasmoDB'}">
        <c:set var="orgnismName" value="Plasmodium"/>
</c:if>
<c:if test="${modelName eq 'ToxoDB'}">
        <c:set var="orgnismName" value="Toxoplasma"/>
</c:if>
<c:if test="${modelName eq 'GiardiaDB'}">
        <c:set var="orgnismName" value="Giardia"/>
</c:if>
<c:if test="${modelName eq 'TrichDB'}">
        <c:set var="orgnismName" value="Trichomonas"/>
</c:if>
<c:if test="${modelName eq 'TriTrypDB'}">
        <c:set var="orgnismName" value="Kinetoplastid"/>
</c:if>

<c:set var="popup" value="${wdkModel.questionSetsMap[qset].questionsMap[qname].summary}"/>


    <td width="5" align="left"  valign="top">&nbsp;&#8226;&nbsp; </td>

<%-- LINK ACTIVE --%>
<c:if test="${!empty wdkModel.questionSetsMap[qset].questionsMap[qname]}">

     <td align="left" valign="bottom" ><a id="${qset}_${qname}_${type}" href='${link}' class='queryGridActive' rel='htmltooltip'>${linktext}</a></td>
     <div id="${qset}_${qname}_${type}_tip" class="htmltooltip">${popup}</div>

</c:if>

<%-- LINK INACTIVE --%>
<c:if test="${ empty wdkModel.questionSetsMap[qset].questionsMap[qname]}">

<%--  do not think this is needed ....
<c:if test="${API}">
   <c:set var="modelName" value="EuPathDB"/>
</c:if>
--%>

     <td align="left" valign="bottom"><a id="${qset}_${qname}_${type}" href='javascript:void(0);' class='queryGridInactive' rel='htmltooltip'>${linktext}</a></td>
     <div id="${qset}_${qname}_${type}_tip" class="htmltooltip">This data type is not available for <i>${orgnismName}</i> (or is not yet in ${modelName}).</div>

</c:if>

    <td  width="84" nowrap align="right"  valign="bottom">

<c:if test="${API}">

<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr nowrap>

	<td width="14">${Am}</td>
	<td width="14">${C}</td>
	<td width="14">${G}</td>
	<td width="14">${M}</td>	
	<td width="14">${P}</td>	
	<td width="14">${T}</td>
	<td width="14">${Tr}</td>
	<td width="14">${Tt}</td>
</tr>

</table>
</c:if>

<c:if test="${COMPONENT}">

<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr nowrap>

	<td align="right">${A}</td>

</tr>
</table>
</c:if>



    </td>

