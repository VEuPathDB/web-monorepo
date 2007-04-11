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

<c:set var="P" value="" />
<c:set var="T" value="" />
<c:set var="C" value="" />
<c:set var="A" value="" />

<c:set var="plasmoRoot" value="http://www.plasmodb.org/plasmo/" />
<c:set var="toxoRoot" value="http://www.toxodb.org/toxo/" />
<c:set var="cryptoRoot" value="http://www.cryptodb.org/cryptodb/" />
<c:set var="apiRoot" value="http://www.apidb.org/apidb/" />

<c:set var="link" value="showQuestion.do?questionFullName=${qset}.${qname}" />

<c:set var="array" value="${fn:split(existsOn, ' ')}" />
<c:forEach var="token" items="${array}" >
  <c:if test="${token eq 'P'}">
        <c:set var="P_image">
            <c:url value="/images/plasmodb_letter.gif" />
        </c:set>
        <c:set var="P" value="<a href='${plasmoRoot}${link}'>&nbsp;<img src='${P_image}' border='0' alt='plasmodb' /></a>" />
  </c:if>
  <c:if test="${token eq 'T'}">
        <c:set var="T_image">
            <c:url value="/images/toxodb_letter.jpg" />
        </c:set>
        <c:set var="T" value="<a href='${toxoRoot}${link}'>&nbsp;<img src='${T_image}' border='0' alt='toxodb' /></a>" />
  </c:if>
  <c:if test="${token eq 'C'}">
        <c:set var="C_image">
            <c:url value="/images/cryptodb_letter.gif" />
        </c:set>
        <c:set var="C" value="<a href='${cryptoRoot}${link}'>&nbsp;<img src='${C_image}' border='0' alt='cryptodb' /></a>" />
  </c:if>
  <c:if test="${token eq 'A'}">
        <c:set var="A_image">
            <c:url value="/images/apidb_letter.gif" />
        </c:set>
        <c:set var="A" value="<a href='${apiRoot}${link}'>&nbsp;<img src='${A_image}' border='0' alt='apidb' /></a>" />
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
<c:if test="${!empty wdkModel.questionSetsMap[qset].questionsMap[qname].summary}">
    <c:set var="popup" value="${wdkModel.questionSetsMap[qset].questionsMap[qname].summary}"/>
</c:if>
<c:if test="${empty wdkModel.questionSetsMap[qset].questionsMap[qname].summary}">
        <c:set var="popup" value="${wdkModel.questionSetsMap[qset].questionsMap[qname].description}"/>
</c:if>



    <td width="5" align="left"  valign="top">&nbsp;&#8226;&nbsp; </td>

<%-- LINK ACTIVE --%>
<c:if test="${!empty wdkModel.questionSetsMap[qset].questionsMap[qname]}">

    <td  align="left" valign="bottom"><a href='${link}' class='queryGridActive' onmouseover="this.T_WIDTH=200;this.T_PADDING=6;this.T_BGCOLOR='white'; this.T_FONTCOLOR='#003366';  this.T_BORDERCOLOR='#003366'; this.T_FONTSIZE='12px'; return escape('${fn:escapeXml(fn:replace(popup, "'", "\\'"))}')">${linktext}</a> 
    </td>

</c:if>

<%-- LINK INACTIVE --%>
<c:if test="${ empty wdkModel.questionSetsMap[qset].questionsMap[qname]}">

    <td   align="left" valign="bottom"><a href="javascript:void(0);" class='queryGridInactive' onmouseover="this.T_WIDTH=200;this.T_STICKY=1;this.T_PADDING=6;this.T_BGCOLOR='white'; this.T_FONTCOLOR='#003366'; this.T_BORDERCOLOR='#003366';  this.T_FONTSIZE='12px';  return escape('This data type is not available for <i>${orgnismName}</i> (or is not yet in ${modelName}).  For questions contact <a href=&quot;help.jsp&quot;><u>${modelName} Support</u></a>')">${linktext}</a>
    </td>

</c:if>

    <td  width="56" nowrap align="right"  valign="bottom">
<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr nowrap>
	<td width="14">${A}</td>
	<td width="14">${C}</td>
	<td width="14">${P}</td>	
	<td width="14">${T}</td>
</tr>
</table>
    </td>
