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

<script language="JavaScript" type="text/javascript">
<!-- //
function makeSelection(state)
{
    var form = document.downloadConfigForm;
    var cb = form.selectedFields;
    for (var i=0; i<cb.length; i++) {
        if (cb[i].disabled) continue;
        if (state == 1) cb[i].checked = 'checked';
        else if (state == 0) cb[i].checked = null;
        else if (state == -1) {
            cb[i].checked = ((cb[i].checked) ? '' : 'checked');
        }
    }
}
//-->
</script>


<!-- display page header -->
<site:header banner="Create and download a Full Records Report" />

<!-- display description for page -->
<p><b>Generate a report that contents the complete information for each record.  Select columns to include in the report.</b></p>

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
  <table>
  <tr><td valign="top"><b>Columns:</b></td>
      <td>
        <input type="hidden" name="step" value="${step_id}"/>
        <input type="hidden" name="wdkReportFormat" value="${format}"/>
        <c:set var="numPerLine" value="2"/>
        <table>
          <tr>
             <th colspan="${numPerLine}">Attributes</th>
          </tr>
	        <c:if test="${wdkAnswer.useAttributeTree}">
	          <tr>
	            <td colspan="${numPerLine}">
    	          <wdk:attributeTree treeObject="${wdkAnswer.reportMakerAttributeTree}" wdkAnswer="${wdkAnswer}" checkboxName="selectedFields"/>
    	        </td>
    	      </tr>
	        </c:if>
	        <c:if test="${not wdkAnswer.useAttributeTree}">
	        
	          <c:set var="attributeFields" value="${wdkAnswer.allReportMakerAttributes}"/>
	          <c:set var="numPerColumn" value="${fn:length(attributeFields) / numPerLine}"/>
	          <c:set var="i" value="0"/>
	          <tr>
	            <td nowrap>
	              <c:forEach items="${attributeFields}" var="rmAttr">
	                <c:choose>
	                      <c:when test="${rmAttr.name eq 'primary_key'}">
	                        <input type="checkbox" checked="checked" disabled="true" >
	                        <input type="hidden" name="selectedFields" value="${rmAttr.name}" >
	                      </c:when>
	                      <c:otherwise>
	                        <input type="checkbox" name="selectedFields" value="${rmAttr.name}">
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
	              </c:forEach>
	            </td>
	          </tr>
          
          </c:if>
          
          <c:set var="tableFields" value="${wdkAnswer.allReportMakerTables}"/>
          <c:set var="numPerColumn" value="${fn:length(tableFields) / numPerLine}"/>
          <c:set var="i" value="0"/>

          <tr>
             <th colspan="${numPerLine}">Tables</th>
          </tr>
          <tr>
            <td nowrap>
              <c:forEach items="${tableFields}" var="rmTable">
                <input type="checkbox" name="selectedFields" value="${rmTable.name}">
                <c:choose>
                  <c:when test="${rmTable.displayName == null || rmTable.displayName == ''}">
                    ${rmTable.name}
                  </c:when>
                  <c:otherwise>
                    ${rmTable.displayName}
                  </c:otherwise>
                </c:choose>
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
              </c:forEach>
            </td>
          </tr>
         
        </table>
      </td>
  </tr>

  <tr><td valign="top">&nbsp;</td>
      <td align="center">
          <input type="button" value="select all" onclick="makeSelection(1)">
          <input type="button" value="clear all" selected="yes" onclick="makeSelection(0)">
          <input type="button" value="select inverse" selected="yes" onclick="makeSelection(-1)">
        </td></tr>

  <tr><td valign="top"><b>Download Type: </b></td>
      <td>
          <input type="radio" name="downloadType" value="text">Text File
          <input type="radio" name="downloadType" value="plain" checked>Show in Browser
        </td></tr>

  <tr>
    <td colspan="2" valign="top">
        <input type="checkbox" name="hasEmptyTable" value="true" checked>Include Empty Table
    </td>
  </tr>

  <tr><td colspan="2">&nbsp;</td></tr>
  <tr><td></td>
      <td><html:submit property="downloadConfigSubmit" value="Get Report"/>
      </td></tr></table>
</form>

  </c:otherwise>
</c:choose>

<site:footer/>
