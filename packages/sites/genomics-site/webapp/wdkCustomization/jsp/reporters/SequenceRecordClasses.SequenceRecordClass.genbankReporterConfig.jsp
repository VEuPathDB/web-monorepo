<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<%-- get wdkAnswer from requestScope --%>
<jsp:useBean id="wdkUser" scope="session" type="org.gusdb.wdk.model.jspwrap.UserBean"/>
<c:set value="${requestScope.wdkStep}" var="wdkStep"/>
<c:set var="wdkAnswer" value="${wdkStep.answerValue}" />
<c:set var="format" value="${requestScope.wdkReportFormat}"/>


<%-- display page header --%>
<imp:header banner="Create and download a Report in Genebank Format" />

<%-- display description for page --%>
<p><b>Generate a report of your query result in GFF3 format. </b></p>

<%-- display the parameters of the question, and the format selection form --%>
<imp:reporter/>

<%-- handle empty result set situation --%>
<c:choose>
  <c:when test='${wdkAnswer.resultSize == 0}'>
    No results for your query
  </c:when>
  <c:otherwise>

<%-- content of current page --%>
<form name="downloadConfigForm" method="get" action="<c:url value='/getDownloadResult.do' />">
        <c:if test="${param.signature != null}">
           <input type="hidden" name="signature" value="${param.signature}" />
        </c:if>
        <input type="hidden" name="step" value="${wdkStep.stepId}"/>
        <input type="hidden" name="wdkReportFormat" value="${format}"/>
    <table>
        <tr>
            <td valign="top" nowrap><b>Download Type</b>: 
                <input type="radio" name="downloadType" value="text">Genbank File
                <input type="radio" name="downloadType" value="plain" checked>Show in Browser
            </td>
        </tr>
        <tr>
            <td>
                <html:submit property="downloadConfigSubmit" value="Get Report"/>
            </td>
        </tr>
    </table>
</form>

  </c:otherwise>
</c:choose>

<imp:footer/>
