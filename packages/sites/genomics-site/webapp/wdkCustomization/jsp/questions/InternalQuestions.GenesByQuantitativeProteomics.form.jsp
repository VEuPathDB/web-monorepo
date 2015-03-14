<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>
<c:set var="projectId" value="${applicationScope.wdkModel.projectId}" />

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set value="${wdkModel.displayName}" var="project"/>

<c:set value="2" var="columns"/>

<!-- show error messages, if any -->
<div class='usererror'><api:errors/></div>

<%-- div needed for Add Step --%>
<div id="form_question">


<!--    questions will be displayed in columns -number of columns is determined above
        queryList.tag relies on EITHER the question displayName having the organism acronym (P.f.) as first characters 
				OR having questions grouped by "study", here the study tells about the organism as in "P.f.study:"
        queryList.tag contains the organism mapping (from P.f. to Plasmodium falciparum, etc)
	if organism is not found (a new organism), no header will be displayed
-->

<c:set var="tritrypQuestions" value="T.b.study:T. brucei SILAC Quantitative Mass Spec (Urbaniak),GeneQuestions.GenesByQuantProtDirecttbruTREU927_quantitativeMassSpec_Urbaniak_CompProt_RSRC"/>
<c:set var="toxoQuestions" value="T.g.study:VEG infection Time Series (H. sapien host)(Wastling),GeneQuestions.GenesByQuantProttgonME49_quantitativeMassSpec_Wastling_VEG_timecourse_Quant_RSRCFoldChange"/>
<c:set var="hostQuestions" value="H.s.study: T gondii VEG infection Time Series (Wastling),GeneQuestions.GenesByQuantProthsapREF_quantitativeMassSpec_Wastling_VEG_timecourse_Quant_host_RSRCFoldChange"/>

<table width="100%" cellpadding="4">
<tr class="headerRow"><td colspan="${columns + 2}" align="center"><b>Choose a Search</b><br><i style="font-size:80%">Mouse over to read description ${project}</i></td></tr>


<c:choose>
 <c:when test = "${project == 'HostDB,InitDB'}">
    <imp:queryList columns="${columns}" questions="${hostQuestions}"/>
  </c:when>
  <c:when test = "${project == 'EuPathDB'}">
    <imp:queryList columns="${columns}" questions="${toxoQuestions},${tritrypQuestions}"/>
  </c:when>
  <c:when test = "${project == 'ToxoDB'}">
    <imp:queryList columns="${columns}" questions="${toxoQuestions}"/>
  </c:when>
  <c:when test = "${project == 'TriTrypDB'}">
    <imp:queryList columns="${columns}" questions="${tritrypQuestions}"/>
  </c:when>
</c:choose>

</table>
</div>



