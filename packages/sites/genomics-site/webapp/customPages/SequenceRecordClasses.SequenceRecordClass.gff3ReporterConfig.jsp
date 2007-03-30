<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<!-- get wdkAnswer from requestScope -->
<jsp:useBean id="wdkUser" scope="session" type="org.gusdb.wdk.model.jspwrap.UserBean"/>
<c:set value="${requestScope.wdkAnswer}" var="wdkAnswer"/>
<c:set var="history_id" value="${requestScope.wdk_history_id}"/>
<c:set var="format" value="${requestScope.wdkReportFormat}"/>


<!-- display page header -->
<site:header banner="Create and download a Report in GFF3 Format" />

<!-- display description for page -->
<p><b>Generate a report of your query result in GFF3 format. </b></p>

<!-- display the parameters of the question, and the format selection form -->
<wdk:reporter/>

<!-- handle empty result set situation -->
<c:choose>
  <c:when test='${wdkAnswer.resultSize == 0}'>
    No results for your query
  </c:when>
  <c:otherwise>

<!-- content of current page -->
<form name="downloadConfigForm" method="get" action="<c:url value='/getDownloadResult.do' />">
        <input type="hidden" name="wdk_history_id" value="${history_id}"/>
        <input type="hidden" name="wdkReportFormat" value="${format}"/>
    <table>
        <tr>
            <td valign="top" nowrap><b>Download Type</b>: 
                <input type="radio" name="downloadType" value="text">GFF File
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

<site:footer/>
