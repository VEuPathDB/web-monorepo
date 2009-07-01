<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn"  uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>

<%@ attribute name="refer"
              required="true"
              description="page calling this tag"
%>


<c:set var="project" value="${wdkModel.name}"/>
<c:set var="homeClass" value=""/>


<c:if test="${refer == 'home' || refer == 'home2'}">
  <c:set var="homeClass" value="home"/>
</c:if>

<%-- hardcoded warning message only for beta sites --%>
<c:if test="${
    param.beta eq 'true' || 
    fn:startsWith(pageContext.request.serverName, 'beta') ||
    fn:startsWith(pageContext.request.serverName, 'b1')   ||
    fn:startsWith(pageContext.request.serverName, 'b2')
    }">
  <div class="warn announcebox ${homeClass}">
    <table><tr><td>
      <img src="/images/warningSign.png" alt="warningSign" /></td>
    <td>
      <span class="warningMessage">
      This pre-release version of ${wdkModel.name} is available for early community review. Please explore the site and <a onclick="poptastic(this.href); return false;" target="_blank" href='<c:url value='/help.jsp'/>'>contact us</a> with your feedback. This site is under active development so there may be incomplete or inaccurate data and occasional site outages can be expected.</span>
     </td></tr></table>
  </div>
</c:if>
<%-- end hardcoded message only for beta sites --%>

<c:if test="${refer == 'home'}">
  <%--Information message retrieved from DB via messaging system--%>
  <c:set var="siteInfo">
  <site:announcement messageCategory="Information" projectName="${project}" />
  </c:set>

  <c:if test="${siteInfo != ''}">
    <div class="info announcebox ${homeClass}">
    <table><tr><td>
	         <img src="/images/clearInfoIcon.png" alt="warningSign" /></td>
               <td>
                 <span class="warningMessage">${siteInfo}</span>
    </td></tr></table>
    </div>
  </c:if>  <%-- if there are information announcements --%>

</c:if>  <%-- if home page --%>


<%--Retrieve from DB and display site degraded message scheduled via announcements system--%>
<c:set var="siteDegraded">
  <site:announcement messageCategory="Degraded" projectName="${project}" />
</c:set>

<c:if test="${siteDegraded != ''}">
<div class="warn announcebox ${homeClass}">
  <table><tr><td>
               <img src="/images/warningSign.png" alt="warningSign" /></td>
             <td>
               <span class="warningMessage">${siteDegraded}</span>
   </td></tr></table>
</div>
</c:if>


<%--Retrieve from DB and display site down message scheduled via announcements system--%>
<c:set var="siteDown">
  <site:announcement messageCategory="Down" projectName="${project}" />
</c:set>

<c:if test="${siteDown != ''}">
<div class="errorbox">
  <div class="downIcon"><img src="/images/stopSign.png" alt="stopSign" /></div>
  <div class="downMessage">${siteDown}</div>
</div>
</c:if>

