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

<c:set var="P" value="" />
<c:set var="T" value="" />
<c:set var="C" value="" />
<c:set var="A" value="" />
<c:set var="G" value="" />
<c:set var="Tr" value="" />

<c:set var="plasmoRoot" value="http://www.plasmodb.org/plasmo/" />
<c:set var="toxoRoot" value="http://www.toxodb.org/toxo/" />
<c:set var="cryptoRoot" value="http://www.cryptodb.org/cryptodb/" />
<c:set var="apiRoot" value="http://www.eupathdb.org/eupathdb/" />
<c:set var="giardiaRoot" value="http://www.giardiadb.org/giardiadb/" />
<c:set var="trichRoot" value="http://www.trichdb.org/trichdb/" />

<%-- get wdkModel saved in application scope --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="modelName" value="${wdkModel.displayName}"/>


<c:set var="API" value="${fn:containsIgnoreCase(modelName, 'api')    }"     />
<c:set var="COMPONENT" value="${ fn:containsIgnoreCase(modelName, 'plasmo') || fn:containsIgnoreCase(modelName, 'toxo') || fn:containsIgnoreCase(modelName, 'crypto') || fn:containsIgnoreCase(modelName, 'giardia') || fn:containsIgnoreCase(modelName, 'trich')    }"     />

<c:choose>
<c:when test="${qname == 'UnifiedBlast'}">
<c:set var="link" value="showQuestion.do?questionFullName=${qset}.${qname}&target=${type}" />
</c:when>
<c:otherwise>
<c:set var="link" value="showQuestion.do?questionFullName=${qset}.${qname}" />
</c:otherwise>
</c:choose>



<c:set var="array" value="${fn:split(existsOn, ' ')}" />
<c:forEach var="token" items="${array}" >
  <c:if test="${token eq 'G'}">
        <c:set var="G_image">
            <c:url value="/images/giardiadb_letter.gif" />
        </c:set>
        <c:set var="G" value="<a href='${giardiaRoot}${link}'><img src='${G_image}' border='0' alt='giardiadb' /></a>" />
  </c:if>
<c:if test="${token eq 'Tr'}">
        <c:set var="Tr_image">
            <c:url value="/images/trichdb_letter.gif" />
        </c:set>
        <c:set var="Tr" value="<a href='${trichRoot}${link}'><img src='${Tr_image}' border='0' alt='trichdb' /></a>" />
  </c:if>
<c:if test="${token eq 'P'}">
        <c:set var="P_image">
            <c:url value="/images/plasmodb_letter.gif" />
        </c:set>
        <c:set var="P" value="<a href='${plasmoRoot}${link}'><img src='${P_image}' border='0' alt='plasmodb' /></a>" />
  </c:if>
  <c:if test="${token eq 'T'}">
        <c:set var="T_image">
            <c:url value="/images/toxodb_letter.gif" />
        </c:set>
        <c:set var="T" value="<a href='${toxoRoot}${link}'><img src='${T_image}' border='0' alt='toxodb' /></a>" />
  </c:if>
  <c:if test="${token eq 'C'}">
        <c:set var="C_image">
            <c:url value="/images/cryptodb_letter.gif" />
        </c:set>
        <c:set var="C" value="<a href='${cryptoRoot}${link}'><img src='${C_image}' border='0' alt='cryptodb' /></a>" />
  </c:if>
  <c:if test="${token eq 'A'}">
        <c:set var="A_image">
            <c:url value="/images/apidb_letter.gif" />
        </c:set>
        <c:set var="A" value="<a href='${apiRoot}${link}'><img src='${A_image}' border='0' alt='apidb' /></a>" />
  </c:if>
</c:forEach>

<c:set var="modelName" value="${wdkModel.displayName}"/>
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


<c:set var="popup" value="${wdkModel.questionSetsMap[qset].questionsMap[qname].summary}"/>


    <td width="5" align="left"  valign="top">&nbsp;&#8226;&nbsp; </td>

<%-- LINK ACTIVE --%>
<c:if test="${!empty wdkModel.questionSetsMap[qset].questionsMap[qname]}">

    <td align="left" valign="bottom"><a href='${link}' class='queryGridActive' 
        onmouseover="return overlib('${popup}',
                FGCOLOR, 'white',
                BGCOLOR, '#003366',
                TEXTCOLOR, '#003366',
                TEXTSIZE, '11px',
                WIDTH, 300,
                CELLPAD, 5)"
        onmouseout = "return nd();">
        ${linktext}</a> 
    </td>

</c:if>

<%-- LINK INACTIVE --%>
<c:if test="${ empty wdkModel.questionSetsMap[qset].questionsMap[qname]}">

    <td align="left" valign="bottom"><a href="javascript:void(0);" class='queryGridInactive' 
        onmouseover="return overlib('This data type is not available for <i>${orgnismName}</i> (or is not yet in ${modelName}).',
                FGCOLOR, 'white',
                BGCOLOR, '#003366',
                TEXTCOLOR, '#003366',
                TEXTSIZE, '11px',
                WIDTH, 200,
                CELLPAD, 5)"
        onmouseout = "return nd();">
        ${linktext}</a>
    </td>

</c:if>

    <td  width="56" nowrap align="right"  valign="bottom">

<c:if test="${API}">

<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr nowrap>

	<td width="14">${C}</td>
	<td width="14">${G}</td>	
	<td width="14">${P}</td>	
	<td width="14">${T}</td>
	<td width="14">${Tr}</td>
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
