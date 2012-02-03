<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- get wdkAnswer from requestScope -->
<jsp:useBean id="wdkUser" scope="session" type="org.gusdb.wdk.model.jspwrap.UserBean"/>
<c:set value="${requestScope.wdkStep}" var="wdkStep"/>
<c:set var="wdkAnswer" value="${wdkStep.answerValue}" />
<c:set var="history_id" value="${requestScope.step_id}"/>
<c:set var="format" value="${requestScope.wdkReportFormat}"/>
<c:set var="allRecordIds" value="${wdkAnswer.allIdList}" />

<c:set var="site" value="${wdkModel.displayName}"/>

<!-- display page header -->
<imp:header refer="srt" banner="Retrieve Gene Sequences" />

<!-- display the parameters of the question, and the format selection form -->
<imp:reporter/>

<!-- display description for page -->
<h3>This reporter will retrieve the sequences of the genes in your result.</h3>


<imp:geneSrt allRecordIds="${allRecordIds}" />

<hr>

<b><a name="help">Help</a></b>
  <br>
  <br>

<imp:srtHelp/>
 
<imp:footer/>
