<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- get wdkAnswer from requestScope -->
<jsp:useBean id="wdkUser" scope="session" type="org.gusdb.wdk.model.jspwrap.UserBean"/>
<c:set value="${requestScope.wdkAnswer}" var="wdkAnswer"/>
<c:set var="history_id" value="${requestScope.wdk_history_id}"/>
<c:set var="format" value="${requestScope.wdkReportFormat}"/>
<c:set var="allRecordIds" value="${wdkAnswer.allIdList}"/>

<c:set var="site" value="${wdkModel.displayName}"/>

<!-- display page header -->
<site:header banner="Retrieve Genome Sequences" />

<!-- display description for page -->
<p><b>This reporter will retrieve the sequences of the genome records in your result.</b></p>

<!-- display the parameters of the question, and the format selection form -->
<wdk:reporter/>

<c:choose>
<!-- <c:when test="${fn:containsIgnoreCase(site, 'EuPathDB')}">
  <form action="/cgi-bin/Api_contigSrt" method="post">
</c:when>
<c:otherwise> 
  <form action="/cgi-bin/contigSrt" method="post">
</c:otherwise>
</c:choose> -->

<form action="/cgi-bin/contigSrt" method="post">

    <input type="hidden" name="ids" value="${allRecordIds}">
    <input type="hidden" name="project_id" value="${wdkModel.name}"/>
    
    <table border="0" width="100%" cellpadding="4">

    <tr><td colspan="2">
    <b>Choose the region of the sequence(s):</b>
    </td></tr>
    <tr><td colspan="2">
        <table style="margin-left:20px;" cellpadding="2">
            <tr><td colspan="2">
                <input type="checkbox" name="revComp" value="protein">Reverse & Complement
            </td></tr>
            <tr><td>Nucleotide positions</td>
                <td align="left">
                                 <input name="start" value="1" size="6"> to
                                 <input name="end" value="0" size="6"></td></tr>
            <tr><td align="left"><input name="go" value="Get Sequences" type="submit"/></td></tr>        
        </table>
    </td></tr>
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
Options:
  <table width="100%" cellpadding="4">
     <tr>
        <td><i><b>complete sequence</b></i></td>
        <td>to retrieve the complete sequence for the requested genomic regions, use "Nucleotide positions 1 to 0"</td>
     </tr>
     <tr>
        <td><i><b>specific sequence region</b></i></td>
        <td>to retrieve a specific region for the requested genomic regions, use "Nucleotide positions <i>x</i> to <i>y</i>, where <i>y</i> is greater than <i>x</i>
     </tr>
  </table>
<table>
<tr>
  <td valign="top" class="dottedLeftBorder"></td> 
</tr>
</table> 
 
<site:footer/>
