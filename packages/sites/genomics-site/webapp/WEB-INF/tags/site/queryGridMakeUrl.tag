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
        <c:set var="P" value="<a href='${plasmoRoot}${link}'><img src='/images/plasmodb_letter.gif' border='0' alt='plasmodb' /></a>" />
  </c:if>
  <c:if test="${token eq 'T'}">
        <c:set var="T" value="<a href='${toxoRoot}${link}'><img src='/images/toxodb_letter.gif' border='0' alt='toxodb' /></a>" />
  </c:if>
  <c:if test="${token eq 'C'}">
        <c:set var="C" value="<a href='${cryptoRoot}${link}'><img src='/images/cryptodb_letter.gif' border='0' alt='cryptodb' /></a>" />
  </c:if>
  <c:if test="${token eq 'A'}">
        <c:set var="A" value="<a href='${apiRoot}${link}'><img src='/images/apidb_letter.gif' border='0' alt='apidb' /></a>" />
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

<c:if test="${!empty wdkModel.questionSetsMap[qset].questionsMap[qname]}">
    <td nowrap valign="middle">&nbsp;&nbsp;&#8226;&nbsp;<a href='${link}' class='queryGridActive' onmouseover="this.T_WIDTH=164;this.T_PADDING=6;this.T_BGCOLOR='#d3e3f6'; return escape('${fn:escapeXml(fn:replace(popup, "'", "\\'"))}')">${linktext}</a> ${A}&nbsp;${C}&nbsp;${P}&nbsp;${T}</td>
</c:if>

<c:if test="${ empty wdkModel.questionSetsMap[qset].questionsMap[qname]}">
    <td nowrap valign="middle">&nbsp;&nbsp;&#8226;&nbsp;<a href="javascript:void(0);" class='queryGridInactive' onmouseover="this.T_WIDTH=164;this.T_STICKY=1;this.T_PADDING=6;this.T_BGCOLOR='#d3e3f6'; return escape('This data type is not available for <i>${orgnismName}</i> (or is not yet in ${modelName}).  For questions contact <a href=&quot;help.jsp&quot;><u>${modelName} Support</u></a>')">${linktext}</a> ${A}&nbsp;${C}&nbsp;${P}&nbsp;${T}</td>

</c:if>
