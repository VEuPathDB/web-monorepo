<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:fn="http://java.sun.com/jsp/jstl/functions"
    xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <jsp:directive.attribute name="refer" required="false" 
              description="Page calling this tag"/>

  <c:set var="props" value="${applicationScope.wdkModel.properties}"/>
  <c:set var="project" value="${props['PROJECT_ID']}"/>
  <c:set var="siteName" value="${applicationScope.wdkModel.name}"/>
  <c:set var="version" value="${applicationScope.wdkModel.version}"/>
  <c:set var="baseUrl" value="${pageContext.request.contextPath}"/>

  <span class="onload-function" data-function="setUpNavDropDowns"><jsp:text/></span>
  
  <!--*********** Small Menu Options on Header ***********-->

  <div id="nav-top-div">
	  <ul id="nav-top">
	
	    <!-- ABOUT -->
	    <li>
	      <a href="javascript:void()">About ${siteName}</a>
	      <ul>
	        <c:choose>
	          <c:when test="${project eq 'EuPathDB'}">
	            <li><a href="${baseUrl}/aggregateNews.jsp">${siteName} News</a></li>
	          </c:when>
	          <c:otherwise>
	            <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.News">${siteName} News</a></li>
	          </c:otherwise>
	        </c:choose>
	        <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.About#citing">How to cite us</a></li>
	
	        <c:if test="${project ne 'EuPathDB'}">
	          <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.About#citingproviders">Citing Data Providers</a></li>
	        </c:if>
	        <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.GenomeDataType">Organisms in ${project}</a></li>
	        <li><a href="/EuPathDB_datasubm_SOP.pdf">EuPathDB Data Submission &amp; Release Policies</a></li>
	
	        <!-- if the site has statistics on its own, not covered in the Portal Data SUmmary table, such as Giardia and Trich, show them, otherwise show the genome table -->
	        <c:choose>
	          <c:when test="${project eq 'GiardiaDB' or project eq 'TrichDB'}">
	            <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.About#stats">Data Statistics</a></li>
	          </c:when>
	          <c:otherwise> 
	            <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.GenomeDataType">Data Statistics</a></li>
	          </c:otherwise>
	        </c:choose>
	
	        <c:if test="${project ne 'EuPathDB'}">
	          <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.About#advisors">Scientific Advisory Team</a></li>
	        </c:if>
	        <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.AboutAll#swg">Scientific Working Group</a></li>
	        <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.AboutAll#acks">Acknowledgements</a></li>
	        <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.About#funding">Funding</a></li>
	        <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.About#use">Data Access Policy</a></li>
	        <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.EuPathDBPubs">EuPathDB Publications</a></li>
	        <li><a href="http://scholar.google.com/scholar?as_q=&amp;num=10&amp;as_epq=&amp;as_oq=OrthoMCL+PlasmoDB+ToxoDB+CryptoDB+TrichDB+GiardiaDB+TriTrypDB+AmoebaDB+MicrosporidiaDB+%22FungiDB%22+PiroplasmaDB+ApiDB+EuPathDB&amp;as_eq=encrypt+cryptography+hymenoptera&amp;as_occt=any&amp;as_sauthors=&amp;as_publication=&amp;as_ylo=&amp;as_yhi=&amp;as_sdt=1.&amp;as_sdtp=on&amp;as_sdtf=&amp;as_sdts=39&amp;btnG=Search+Scholar&amp;hl=en">Publications that Cite Us</a></li>
	        <li><a href="/proxystats/awstats.pl?config=${fn:toLowerCase(project)}.org">Website Usage Statistics</a></li>         
	      </ul>
	    </li>
	   
	    <!-- HELP -->
	    <li>
	      <a href="javascript:void()">Help</a>
	      <ul>
	        <c:if test="${refer eq 'summary'}">
	          <li><a href="javascript:void(0)" onclick="dykOpen()">Did You Know...</a></li>
	        </c:if>
	        <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.Tutorials">Web Tutorials</a></li>
	        <li><a href="http://workshop.eupathdb.org/current/">EuPathDB Workshop</a></li>
	        <li><a href="http://workshop.eupathdb.org/current/index.php?page=schedule">Exercises from Workshop</a></li>
	        <li><a href="http://www.genome.gov/Glossary/">NCBI's Glossary of Terms</a></li>
	        <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.Glossary">Our Glossary</a></li>
	        <li><a href="${baseUrl}/help.jsp" target="_blank" onclick="poptastic(this.href); return false;">Contact Us</a></li>
	      </ul>
	    </li>
	     
	    <!-- LOGIN/REGISTER/PROFILE/LOGOUT -->
	    <imp:login/>
	  
	    <!-- CONTACT US -->
	    <li class="empty-divider">
	      <a href="${baseUrl}/help.jsp" target="_blank" onclick="poptastic(this.href); return false;">Contact Us</a>
	    </li>
	  
	    <!-- TWITTER/FACEBOOK -->
	    <li class="socmedia-link no-divider">
	      <a id="twitter" href="javascript:gotoTwitter()">
	        <img title="Follow us on Twitter!" src="/assets/images/twitter.gif" width="20"/> 
	      </a>
	    </li>
	    <li class="socmedia-link no-divider">
	      <a id="facebook" href="javascript:gotoFacebook()" style="margin-left:2px">
	        <img title="Follow us on Facebook!" src="/assets/images/facebook-icon.png" width="19"/>
	      </a>
	    </li>
	
	  </ul>
  </div>
  
</jsp:root>
