<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:fn="http://java.sun.com/jsp/jstl/functions">

  <jsp:useBean id="constants" class="org.eupathdb.common.model.JspConstants"/>

  <c:set var="project" value="${applicationScope.wdkModel.name}"/>
  <c:set var="baseUrl" value="${pageContext.request.contextPath}"/>
  
  <c:set var="isPortal" value="${project eq 'EuPathDB'}"/>
<!--   <c:set var="hasSiteStats" value="${project eq 'GiardiaDB' or project eq 'TrichDB'}"/> -->

  <c:set var="newsUrl" value="${isPortal ? 'aggregateNews.jsp' : 'showXmlDataContent.do?name=XmlQuestions.News'}"/>
  <!-- if the site has statistics on its own, not covered in the Portal Data Summary table, show them, otherwise show the genome table -->
  <c:set var="statsUrl" value="${'/processQuestion.do?questionFullName=OrganismQuestions.GenomeDataTypes'}"/>

  <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.About">What is ${project}?</a></li>
 <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.EuPathDBPubs">EuPathDB Publications</a></li>
  <li><a href="http://eupathdb.org/tutorials/eupathdbFlyer.pdf">EuPathDB Brochure</a></li>
  <li><a href="http://eupathdb.org/tutorials/eupathdbFlyer_Chinese.pdf">EuPathDB Brochure in Chinese</a></li>

<br/><span class="smallTitle">------ Data in ${project}</span>
  
<c:choose>
<c:when test="${project == 'TrichDB'}">
  <c:set var="linkToDataSummary" value="/eupathGenomeTable.jsp" />
  <c:set var="linkToGeneMetrics" value="/showXmlDataContent.do?name=XmlQuestions.GeneMetrics" />
</c:when>
<c:otherwise>
  <c:set var="linkToDataSummary" value="/processQuestion.do?questionFullName=OrganismQuestions.GenomeDataTypes" />
  <c:set var="linkToGeneMetrics" value="/processQuestion.do?questionFullName=OrganismQuestions.GeneMetrics" />
</c:otherwise>
</c:choose>

  <li><a href="${baseUrl}${linkToDataSummary}">Organisms</a></li>
  <c:if test="${project eq 'CryptoDB'}">
    <li><a href="http://cryptodb.org/static/SOP/">SOPs for <em>C.parvum</em> Annotation</a></li>
  </c:if>
  <c:if test="${project eq 'ToxoDB'}">
    <li><a href="/common/cosmid-BAC-tutorial/CosmidandBAC-Tutorial.html">Viewing Cosmid and BAC Alignments</a></li>
    <li><a href="/common/array-tutorial/Array-Tutorial.html">Viewing Microarray Probes</a></li>
  </c:if>
  <li><a href="${baseUrl}${linkToGeneMetrics}">${project} Gene Metrics</a></li>

 
  

<br/><span class="smallTitle">------ Submitting data to ${project}</span>
  
  <li><a href="${baseUrl}/dataSubmission.jsp">How to submit data to us</a></li>
 <li><a href="/EuPathDB_datasubm_SOP.pdf">EuPathDB Data Submission &amp; Release Policies</a></li>


<br/><span class="smallTitle">------ Usage and Citation</span>
  
  <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.About#citing">How to cite us</a></li>
  <c:if test="${not isPortal}">
    <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.About#citingproviders">Citing Data Providers</a></li>
  </c:if>
  <li><a href="${constants.publicationUrl}">Publications that Use our Resources</a></li>
 
  <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.About#use">Data Access Policy</a></li>



<br/><span class="smallTitle">------ Who are we?</span>
  
	<li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.AboutAll#swg">Scientific Working Group</a></li>
  <c:if test="${not isPortal}">
    <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.About#advisors">Scientific Advisory Team</a></li>
  </c:if>
	<li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.AboutAll#acks">Acknowledgements</a></li>
	<li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.About#funding">Funding</a></li>
	
<br/><span class="smallTitle">------ Technical</span>
	
	<li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.Infrastructure">EuPathDB Infrastructure</a></li>
	<li><a href="/proxystats/awstats.pl?config=${fn:toLowerCase(project)}.org">Website Usage Statistics</a></li>
    
</jsp:root>
