<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<%-- 
   there are four attributes set by the showSummary action:
   - questionDisplayName: the display name of the question; if the question doesn't
     exist in the current model, the question's full name will be used
   - customName: the custom name for this history; if the custom name doesn't exist, 
     corresponding question's display name will be used; if no corresponding question,
     the questionFullName will be used; 
   - params: a map of paramName-paramValue tuples;
   - paramNames: a map of paramName-paramDisplayName tuples;
--%>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
     
<!-- display page header with wdkAnswer's recordClass's type as banner -->
<c:if test="${resultOnly}">
    <site:header refer="summaryError"/>
</c:if>

<%-- <site:header banner="Query cannot be executed" /> --%>
<h2><span style="color: red;">Query cannot be executed</span></h2>
<div style="color: red;">
    <pre>
    ${exception.message}
    </pre>
</div>
<api:errors showStacktrace="false"/>



<hr />
<h2>Step/Query Details</h2>
<p>The following is the detail information about the current invalid step. If you have any questions about this step, please 
<a href="<c:url value="/help.jsp"/>"  target="_blank" onClick="poptastic(this.href); return false;">contact us</a>,
 and copy the information below in the message.</p>


<!-- display question and param values and result size for wdkAnswer -->
<table>
    <tr>
        <td align="right" nowrap><b>Query :</b></td>
        <td>${questionDisplayName}</td>
    </tr>
    <tr>
        <td align="right" valign="top" nowrap><b>Custom Name :</b></td>
        <td>${customName}</td>
    </tr>
    <tr>
        <td align="right" valign="top" nowrap><b>Parameters: </b></td>
        <td>
            <table border="0" cellspacing="0" cellpadding="0">
                <c:forEach items="${params}" var="item">
                    <c:set var="pName" value="${item.key}"/>
                    <c:set var="pValue" value="${item.value}"/>
                    <c:set var="pDisplay" value="${paramNames[pName]}"/>
                    <tr>
                        <td align="right" valign="top" nowrap class="medium"><b><i>${pDisplay}</i><b></td>
                        <td valign="top" class="medium">&nbsp;:&nbsp;</td>
                        <td class="medium">${pValue}</td>
                    </tr>
                </c:forEach>
            </table>
        </td>
    </tr>
</table>

<p>If the previous step(s) contains invalid ones (marked by a red cross), you have to revise to correct them (click on them). Sometimes you may have more than one invalid steps, a good practice is to revise them from left to right, starting from the left-most one with a red mark on it.</p>


<hr>

<p>  There are several possible reasons for this failure:</p>
<ul>
<li>You have entered invalid value(s) for the parameter(s) of the question. Please click 
    the <b>BACK</b> button in your browser, and try other values.</li>
<li>Your query may have been bookmarked or saved from a previous version of ${wdkModel.displayName} and is no longer compatible 
    with the current version of ${wdkModel.displayName}.  In most cases, you will be able 
    to work around the incompatibility by <a href="<c:url value="queries_tools.jsp" />">finding an equivalent query</a> in this 
    version, and running it with similar parameter values.</li>
<li>A system error.
</ul>
<p>Please for any questions   
<a href="<c:url value="/help.jsp"/>"  target="_blank" onClick="poptastic(this.href); return false;">drop us a line</a>.</p>

<!-- pager at bottom -->
<c:if test="${resultOnly}">
    <site:footer/>
</c:if>
