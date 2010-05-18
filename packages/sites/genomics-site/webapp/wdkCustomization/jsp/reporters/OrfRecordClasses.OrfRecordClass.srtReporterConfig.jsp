<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- get wdkAnswer from requestScope -->
<jsp:useBean id="wdkUser" scope="session" type="org.gusdb.wdk.model.jspwrap.UserBean"/>
<c:set value="${requestScope.wdkStep}" var="wdkStep"/>
<c:set var="wdkAnswer" value="${wdkStep.answerValue}" />
<c:set var="history_id" value="${requestScope.wdk_history_id}"/>
<c:set var="format" value="${requestScope.wdkReportFormat}"/>
<c:set var="allRecordIds" value="${wdkAnswer.allIdList}" />

<c:set var="site" value="${wdkModel.displayName}"/>

<!-- display page header -->
<site:header refer="srt" banner="Retrieve Orf Sequences" />

<!-- display description for page -->
<p><b>This reporter will retrieve the sequences of the open reading frames in your result.</b></p>

<!-- display the parameters of the question, and the format selection form -->
<wdk:reporter/>


<%--
<c:choose>
<c:when test="${fn:containsIgnoreCase(site, 'EuPathDB')}">
  <form action="/cgi-bin/Api_orfSrt" method="post">
</c:when>
<c:otherwise>
--%>
 <form action="/cgi-bin/orfSrt" method="post">
<%--
</c:otherwise>
</c:choose>
--%>


    <input type="hidden" name="ids" value="${allRecordIds}">
    <input type="hidden" name="project_id" value="${wdkModel.name}"/>
    
    <table border="0" width="100%" cellpadding="4">

    <tr><td colspan="2">
    <b>Choose the type of sequence:</b>
        <input type="radio" name="type" value="genomic" checked onclick="setEnable(true)">genomic
        <input type="radio" name="type" value="protein" onclick="setEnable(false)">protein
    </td></tr>

    <tr>
        <td colspan="2">
    <table id="offsetOptions2" cellpadding="2">
        <tr><td colspan="2">
            <b>Choose the region of the sequence(s):</b>
        </td></tr>
        <tr><td>begin at</td>
            <td align="left">
		<select name="upstreamAnchor">
                    <option value="Start" selected>start</option>
                    <option value="End">stop</option>
                </select>
            </td>
            <td align="left">
                <select name="upstreamSign">
		    <option value="plus" selected>+</option>
                    <option value="minus">-</option>
                </select>
            </td>
            <td align="left">
                <input name="upstreamOffset" value="0" size="6"/> nucleotides
            </td></tr>

        <tr><td>end at</td>
          <td align="left">
		<select name="downstreamAnchor">
                    <option value="Start">start</option>
                    <option value="End" selected>stop</option>
                </select>
            </td>
            <td align="left">
                <select name="downstreamSign">
		    <option value="plus" selected>+</option>
                    <option value="minus">-</option>
                </select>
	    </td>
            <td align="left">
                <input name="downstreamOffset" value="0" size="6"/> nucleotides
            </td></tr>
      </table>
     </td>
    </tr>

    <tr><td valign="top" nowrap><b>Download Type</b>:
            <input type="radio" name="downloadType" value="text">Save to File</input>
            <input type="radio" name="downloadType" value="plain" checked>Show in Browser</input>
        </td></tr>
    <tr><td align="center"><input name="go" value="Get Sequences" type="submit"/></td></tr>

    </table>
  </form>

<hr>

<b><a name="help">Help</a></b>
  <br>
  <br>

<site:srtHelp/>
 
<site:footer/>
