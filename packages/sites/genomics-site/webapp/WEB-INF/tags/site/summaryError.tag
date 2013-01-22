<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<%-- OLDOLDOLDOLDOLDOLDOLDOLDOLD
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
OLDOLDOLDOLDOLDOLDOLDOLDOLODLOLDOLDOLDOLDOLDOLD--%>



<h3>Sorry, an error has occured.<br>
<br>
If you can see the strategy panel on top of this message, it is possible that in this strategy, you have hit a step that somehow is in error.
Or because of a new release, a step might need to be revised and run again. If that is the case, please click on the name of the first step that shows a <span style="color:red">red X</span> on top, and choose the 'revise' option.<br><br>
In any case, please  <a href="<c:url value="/help.jsp"/>" target="_blank" onClick="poptastic(this.href); return false;">contact us</a> and let us know what happened to the best of your recollection, with as much detail as possible. <br><br>
Your EuPathDB team.
</h3>


