<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />
<c:set var="siteName" value="${applicationScope.wdkModel.name}" />
<c:set var="version" value="${applicationScope.wdkModel.version}" />

<%-- if we want to use one image for all social icons and then show them as backgrounds
<style type="text/css">
a#twitter {
	background-image: url("/assets/images/social.jpg");
	background-position: -30px -5px;
}
a#facebook {
	background-image: url("/assets/images/social.jpg");
	background-position: -10px -25px;
}
#nav_top #twitter,#nav_top #facebook {
	-moz-border-radius: 2px 2px 2px 2px;
	border-radius: 2px 2px 2px 2px;

</style>
 --%>


<%---------------------- Small Menu Options on Header  ------------------%>
      <div id="nav_topdiv">
           <ul id="nav_top">

<%--- ABOUT   -----%>
      <li>
      <a href="#">About ${siteName}<img src="/assets/images/${project}/menu_divider5.png" alt="" width="17" height="9" /></a>
      	<ul>
    <c:choose>
    <c:when test="${project == 'EuPathDB'}">
	<li><a href="<c:url value="/aggregateNews.jsp"/>">${siteName} News</a></li>
	</c:when>
	<c:otherwise>
	<li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.News"/>">${siteName} News</a></li>
	</c:otherwise>
	</c:choose>
<%--	<li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#generalinfo"/>">General Information</a></li> --%>
<%-- all sites go to the Data Summary page --%>
	<li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.GenomeDataType"/>">Organisms in ${project}</a></li>

        <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#citingproviders"/>">Citing Data Providers</a></li>

<%-- if the site has statistics on its own, not covered in the Portal Data SUmmary table, such as Giardia and Trich, show them, otherwise show the genome table --%>
<c:choose>
<c:when test="${project == 'GiardiaDB' || project == 'TrichDB'}">
	<li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#stats"/>">Data Statistics</a></li>
</c:when>
<c:otherwise> 
	<li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.GenomeDataType"/>">Data Statistics</a></li>
</c:otherwise>
</c:choose>
	<li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#advisors"/>">Scientific Advisory Team</a></li>
	<li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#swg"/>">Scientific Working Group</a></li>
 	<li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#acks"/>">Acknowledgements</a></li>
 	<li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#funding"/>">Funding</a></li>
	<li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#use"/>">How to use this resource</a></li>
        <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#citing"/>">How to cite us</a></li>
        <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.EuPathDBPubs"/>">EuPathDB Publications</a></li>
        <li><a href="/proxystats/awstats.pl?config=${fn:toLowerCase(project)}.org">Website Usage Statistics</a></li>         

        </ul>
      </li>


<%--- HELP   -----%>
      <li>
      <a href="#">Help<img src="/assets/images/${project}/menu_divider5.png" alt="" width="17" height="9" /></a>
      		<ul>


          <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.Tutorials"/>">Web Tutorials</a></li>
    	  <c:if test="${refer == 'customSummary'}">
		  	<li><a href="javascript:void(0)" onclick="dykOpen()">Did You Know...</a></li>
          </c:if>
          <li><a href="http://workshop.eupathdb.org/current/">EuPathDB Workshop</a></li>
<%--	  <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.ExternalLinks"/>">Community Links</a></li> --%>
          <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.Glossary"/>">Glossary of Terms</a></li>
          <li><a href="<c:url value="http://eupathdb.org/tutorials/eupathdbFlyer.pdf"/>">EuPathDB Brochure</a></li>
        	</ul>
      </li>
    

<%--- LOGIN/REGISTER  -----%>
<wdk:requestURL/>

 <c:choose>
    <c:when test="${wdkUser == null || wdkUser.guest == true}">
    
      <%--------------- Construct popups to login/register -------------%>  
      <li>
        <a href="javascript:void(0)" onclick="popLogin()">Login<img src="/assets/images/${project}/menu_divider5.png" alt="" width="17" height="9" /></a>
        <div id="loginForm" style="display:none;">
          <h2 style="text-align: center">EuPathDB Account Login</h2>
          <site:login includeCancel="true" />
        </div>
      </li>

      <li>
<%-- popup does not scroll... a bug? since we do not keep context after registration, do not use popup
        <a href="javascript:void(0)" onclick="popRegister()">Register
		<img src="/assets/images/${project}/menu_divider5.png" alt="" width="17" height="9" />
	</a>
--%>
	  <a href="<c:url value='/showRegister.do'/>" >Register
			<img src="/assets/images/${project}/menu_divider5.png" alt="" width="17" height="9" />
	</a>

<%-- used with popRegister() 
        <div id="registerForm" style="display:none;">
          <h2 style="text-align: center">EuPathDB Account Registration</h2>
          <site:register includeCancel="true" />
        </div>
 --%>

      </li>
    </c:when>


<%--- PROFILE/LOGOUT  -----%>
    <c:otherwise>

      <%--------------- Construct links to profile/logout -------------%>   
      <c:url value="processLogout.do" var="logoutUrl">
        <c:param name="refererUrl" value="${originRequestUrl}"/> 
      </c:url>

      <li>
        <a href="<c:url value='/showProfile.do'/>" id='profile'>${wdkUser.firstName} ${wdkUser.lastName}'s Profile<img src="/assets/images/${project}/menu_divider5.png" alt="" width="17" height="9" /></a>
      </li>

      <li>
        <a href="<c:url value='/${logoutUrl}' />" id='logout'>Logout
		<img src="/assets/images/${project}/menu_divider5.png" alt="" width="17" height="9" />
	</a>
      </li>

    </c:otherwise>
  </c:choose>


<%--- CONTACT US  -----%>
	<li>
	<a href="<c:url value="/help.jsp"/>" target="_blank" onClick="poptastic(this.href); return false;">
		Contact Us<img src="/assets/images/${project}/menu_divider5.png" alt="" width="17" height="9" /></a>
      	</li>
 

<%--- TWITTER -----%>
	<li>
	<a id="twitter" href="http://twitter.com/eupathdb">
		<img title="Follow us on twitter!" src="/assets/images/twitter.gif" width="20"> 
	<%--	<img title="Follow us on twitter!"  src="<c:url value='/wdk/images/transparent1.gif'/>"  width="16" height="16">  --%>
	</a>
	</li>

<%--- FACEBOOK -----%>
	<li>
	<a id="facebook" href="https://www.facebook.com/pages/EuPathDB/133123003429972" style="margin-left:2px">
		<img title="Follow us on facebook!" src="/assets/images/facebook-icon.png" width="19">
	<%--	<img title="Follow us on facebook!"  src="<c:url value='/wdk/images/transparent1.gif'/>"  width="16" height="16">  --%>
	</a>
	</li>

           </ul>     <%-- id="nav_top" --%>
      </div>  <%-- id="nav_topdiv" --%>
