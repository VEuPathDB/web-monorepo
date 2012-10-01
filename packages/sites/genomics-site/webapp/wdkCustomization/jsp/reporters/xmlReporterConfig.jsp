<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<%-- get wdkModel saved in application scope --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set value="${wdkModel.displayName}" var="project"/>

<%-- get wdkAnswer from requestScope --%>
<jsp:useBean id="wdkUser" scope="session" type="org.gusdb.wdk.model.jspwrap.UserBean"/>
<c:set value="${requestScope.wdkStep}" var="wdkStep"/>
<c:set var="wdkAnswer" value="${wdkStep.answerValue}" />
<c:set var="format" value="${requestScope.wdkReportFormat}"/>

<%-- display page header --%>
<imp:header banner="Create and download a Full Records Report" />


<script language="JavaScript" type="text/javascript">
<!-- //
function makeSelection(state)
{
    var form = document.downloadConfigForm;
    var cb = form.elements;
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

<%-- display the parameters of the question, and the format selection form --%>
<imp:reporter/>

<%-- display description for page --%>
<h3>Generate a report that contents the complete information for each record.</h3>


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
  <table  width="100%">
  <tr><td width="20%"></td>
      <td>
        <input type="hidden" name="step" value="${step_id}"/>
        <input type="hidden" name="wdkReportFormat" value="${format}"/>
        <c:set var="numPerLine" value="2"/>



        <table>
          <tr>
             <th colspan="${numPerLine}">Columns</th>
          </tr>
          <c:if test="${wdkAnswer.useCheckboxTree}">
            <tr>
              <td colspan="${numPerLine}">
                <input type="checkbox" name="o-fields" value="${wdkAnswer.recordClass.primaryKeyAttribute.name}" checked="checked" style="display:none;"/>
                <imp:checkboxTree id="selectedFieldsCBT" rootNode="${wdkAnswer.reportMakerAttributeTree}" checkboxName="o-fields" showSelectAll="false" showResetCurrent="true" useHelp="true"/>
              </td>
            </tr>
          </c:if>
          <c:if test="${not wdkAnswer.useCheckboxTree}">

	          <c:set var="attributeFields" value="${wdkAnswer.allReportMakerAttributes}"/>
	          <c:set var="numPerColumn" value="${fn:length(attributeFields) / numPerLine}"/>
	          <c:set var="i" value="0"/>
	
	          <tr>
	            <td nowrap>
	              <c:forEach items="${attributeFields}" var="rmAttr">
	                <c:choose>
	                      <c:when test="${rmAttr.name eq 'primary_key'}">
	                        <input type="checkbox" checked="checked" disabled="true" >
	                        <input type="hidden" name="o-fields" value="${rmAttr.name}" >
	                      </c:when>
	                      <c:otherwise>
	                        <input type="checkbox" name="o-fields" value="${rmAttr.name}">
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
          
<%-- if project is portal, skip the tables --%>
<c:if test="${project ne 'EuPathDB'}"> 
          <c:set var="tableFields" value="${wdkAnswer.allReportMakerTables}"/>
          <c:set var="numPerColumn" value="${fn:length(tableFields) / numPerLine}"/>
          <c:set var="i" value="0"/>

          <tr>
             <th colspan="${numPerLine}">Tables</th>
          </tr>
 	<tr>
      <td colspan="2"align="center">
          <input type="button" value="select all" onclick="makeSelection(1)">
          <input type="button" value="clear all" selected="yes" onclick="makeSelection(0)">
          <input type="button" value="select inverse" selected="yes" onclick="makeSelection(-1)">
        </td></tr>
          <tr>
            <td nowrap>
              <c:forEach items="${tableFields}" var="rmTable">
                <input type="checkbox" name="o-tables" value="${rmTable.name}">
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
          <tr>
      <td colspan="2"align="center">
          <input type="button" value="select all" onclick="makeSelection(1)">
          <input type="button" value="clear all" selected="yes" onclick="makeSelection(0)">
          <input type="button" value="select inverse" selected="yes" onclick="makeSelection(-1)">
        </td></tr>
</c:if> <%-- if project is portal, skip the tables --%>

        </table>
      </td>
  </tr>

   <tr><td colspan="2"><hr></td></tr>

<!--
  <tr><td valign="top">&nbsp;</td>
      <td align="center">
          <input type="button" value="select all" onclick="makeSelection(1)">
          <input type="button" value="clear all" selected="yes" onclick="makeSelection(0)">
          <input type="button" value="select inverse" selected="yes" onclick="makeSelection(-1)">
        </td></tr>
-->

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


  <tr>
      <td  colspan="2" style="text-align:center"><html:submit property="downloadConfigSubmit" value="Get Report"/>
      </td></tr>


</table>
</form>

  </c:otherwise>
</c:choose>

<imp:footer/>
