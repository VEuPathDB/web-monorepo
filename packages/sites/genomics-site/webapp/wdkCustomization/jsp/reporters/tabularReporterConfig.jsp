<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<!-- get wdkAnswer from requestScope -->
<jsp:useBean id="wdkUser" scope="session" type="org.gusdb.wdk.model.jspwrap.UserBean"/>
<c:set value="${requestScope.wdkStep}" var="wdkStep"/>
<c:set var="wdkAnswer" value="${wdkStep.answerValue}" />
<c:set var="format" value="${requestScope.wdkReportFormat}"/>


<!-- display page header -->
<site:header banner="Create and download a Report in Tabular Format" />

<%-- galaxy.psu.edu users; to send data to Galaxy  --%>
<script type="text/javascript">
function appendchecked(url) {
    var newtxt = '';
    var chkbx = document.downloadConfigForm.selectedFields;
    for(var i = 0; i < chkbx.length; i++) {
        if( chkbx[i].type=="hidden" ||
            (chkbx[i].type == 'checkbox' && chkbx[i].checked === true)
          ) {
            if(newtxt.length !== 0) {
                newtxt += ',';
            }
            newtxt += chkbx[i].value;
        }
    }
    document.galaxy_exchange.URL.value = url + newtxt;
}
</script>
<%-- end galaxy.psu.edu users  --%>

<!-- display description for page -->
<p><b>Generate a tab delimited report of your query result.  Select columns to include in the report.  Optionally include a first line with column names</b></p>

<!-- display the parameters of the question, and the format selection form -->
<wdk:reporter/>

<!-- handle empty result set situation -->
<c:choose>
  <c:when test='${wdkAnswer.resultSize == 0}'>
    No results for your query
  </c:when>
  <c:otherwise>

<!-- content of current page -->
<form name="downloadConfigForm" method="get" action="<c:url value='/getDownloadResult.do' />" >
  <table>
  <tr><td valign="top"><b>Columns:</b></td>
      <td>
        <input type="hidden" name="step" value="${step_id}">
        <input type="hidden" name="wdkReportFormat" value="${format}">
        <c:set var="attributeFields" value="${wdkAnswer.allReportMakerAttributes}"/>
        <c:set var="numPerLine" value="2"/>
        <c:set var="numPerColumn" value="${fn:length(attributeFields) / numPerLine}"/>
        <c:set var="i" value="0"/>
        <table>
          <tr>
            <td colspan="${numPerLine}">
              <input type="checkbox" name="selectedFields" value="default" onclick="uncheckFields(1);" checked>
              Default (same as in <a href="showApplication.do">result</a>), or...
            </td>
          </tr>

          <tr><td colspan="${numPerLine}">&nbsp;</td></tr>

          <tr>
            <td nowrap>
              <c:forEach items="${attributeFields}" var="rmAttr">
                <%-- this is a hack, why some reportMakerAttributes have no name? --%>
                <c:choose>
                  <c:when test="${rmAttr.name != null && rmAttr.name != ''}">
                    <c:choose>
                      <c:when test="${rmAttr.name eq 'primary_key'}">
                        <input type="checkbox" checked="checked" disabled="true" >
                        <input type="hidden" name="selectedFields" value="${rmAttr.name}" >
                      </c:when>
                      <c:otherwise>
                        <input type="checkbox" name="selectedFields" value="${rmAttr.name}" onclick="uncheckFields(0);">
                      </c:otherwise>
                    </c:choose>
                        ${rmAttr.displayName}
                    <c:set var="i" value="${i+1}"/>
                    <c:choose>
                      <c:when test="${i >= numPerColumn}">
                        <c:set var="i" value="0"/>
                        </td><td nowrap>
                      </c:when>
                      <c:otherwise>
                        <br />
                      </c:otherwise>
                    </c:choose>
                  </c:when>
                  <c:otherwise>
                    <!-- <td><html:multibox property="selectedFields">junk</html:multibox>junk</td>${br} -->
                  </c:otherwise>
                </c:choose>
              </c:forEach>
            </td>
          </tr>
          </table>
        </td>
    </tr>

  <tr><td valign="top">&nbsp;</td>
      <td align="center"><input type="button" value="select all" onclick="checkFields(1)">
          <input type="button" value="clear all" selected="yes" onclick="checkFields(0)">
        </td></tr>

  <tr><td valign="top"><b>Column names: </b></td>
      <td><input type="radio" name="includeHeader" value="yes" checked>include
          <input type="radio" name="includeHeader" value="no">exclude
        </td></tr>
  <tr><td valign="top"><b>Download Type: </b></td>
      <td>
          <input type="radio" name="downloadType" value="text">Text File
          <input type="radio" name="downloadType" value="excel">Excel File
          <input type="radio" name="downloadType" value="plain" checked>Show in Browser
        </td></tr>
  <tr><td colspan="2">&nbsp;</td></tr>
  <tr><td colspan="2">Please note: if you choose Excel as download type, you can only download maximum 10M (in bytes) of the results, and the rest are discarded. Opening huge Excel file may crash you system. If you need to get the complete results, please choose the Download Type is Text File, or Show in Browser.</td></tr>
  <tr><td></td>
      <td><html:submit property="downloadConfigSubmit" value="Get Report"/>
      </td></tr></table>
</form>

  <%-- galaxy.psu.edu users; send data to Galaxy  --%>
  <c:if test="${!empty sessionScope.GALAXY_URL}">
    <div style="text-align:center;background-color:#FFCCFF;border-style:double; width:300px">
    <c:url var='downloadPath' 
           value='/getDownloadResult.do;jsessionid=${pageContext.session.id}?step=${step_id}&includeHeader=yes&downloadType=plain&wdkReportFormat=tabular&selectedFields='/>
    <c:set var='downloadUrl'>
      ${pageContext.request.scheme}://${pageContext.request.serverName}${downloadPath}
    </c:set>
    <br>
    <form action="${sessionScope.GALAXY_URL}" name="galaxy_exchange" id="galaxy_exchange" method="POST">
      <input type="hidden" name="URL" value="${fn:escapeXml(downloadUrl)}">
      <input type="submit" name="Send" value="Send to Galaxy" onclick="appendchecked('${fn:escapeXml(downloadUrl)}')">
    </form>
    </div>
  </c:if>
  <%-- galaxy.psu.edu users  --%>

  </c:otherwise>
</c:choose>

<site:footer/>
