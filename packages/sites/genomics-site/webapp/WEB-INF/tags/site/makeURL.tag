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
	<td valign="top">&#8226;</td> <td> <tableItem><a href="showQuestion.do?questionFullName=${qset}.${qname}&go.x=13&go.y=9&go=go" onmouseover="this.T_WIDTH=164;this.T_PADDING=6;this.T_BGCOLOR='#d3e3f6'; return escape('${fn:escapeXml(fn:replace(popup, "'", "\\'"))}')">${linktext}</a></tableItem></td>
</c:if>

<c:if test="${ empty wdkModel.questionSetsMap[qset].questionsMap[qname]}">
        <td valign="top">&#8226;</td> <td> <a href="javascript:void(0);" onmouseover="this.T_WIDTH=164;this.T_STICKY=1;this.T_PADDING=6;this.T_BGCOLOR='#d3e3f6'; return escape('Sorry, but this data type is not yet available for <i>${orgnismName}</i> (or is not yet supported by ${modelName}).  For questions, write to: <a href=&quot help.jsp &quot><u>see User Support</u></a>')"> <tableItem> ${linktext} </tableItem> </a></td>

</c:if>


