<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn"  uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<%@ attribute name="refer"
              required="true"
              description="page calling this tag"
%>
<%@ attribute name="showBanner"
              required="false"
              description="if true,it needs to show banner"
%>


<c:set var="project" value="${wdkModel.name}"/>
<c:set var="homeClass" value=""/>


<c:if test="${refer == 'home' || refer == 'home2'}">
  <c:set var="homeClass" value="home"/>
</c:if>

<!-- ================== BETA SITES ============ -->
<%-- hardcoded warning message only for beta sites --%>
<c:if test="${
    param.beta eq 'true' || 
    fn:startsWith(pageContext.request.serverName, 'beta') ||
    fn:startsWith(pageContext.request.serverName, 'b1')   ||
    fn:startsWith(pageContext.request.serverName, 'b2')
    }">
  <div class="warn announcebox ${homeClass}">
    <table><tr><td>
      <img src="/assets/images/warningSign.png" alt="warningSign" /></td>
    <td>
      <span class="warningMessage">
      This pre-release version of ${wdkModel.name} is available for early community review. 
      Please explore the site and <a class="open-window-contact-us" href='<c:url value='/contact.do'/>'>contact us</a> 
      with your feedback. This site is under active development so there may be incomplete or 
      inaccurate data and occasional site outages can be expected.</span>
     </td></tr></table>
  </div>
</c:if>
<%-- end hardcoded message only for beta sites --%>

<!-- ================== ALPHA SITES ============ -->
<%-- hardcoded warning message only for alpha sites --%>
<c:if test="${
    param.alpha eq 'true' || 
    fn:startsWith(pageContext.request.serverName, 'alpha') ||
    fn:startsWith(pageContext.request.serverName, 'a1')   ||
    fn:startsWith(pageContext.request.serverName, 'a2')
    }">
  <div class="warn announcebox ${homeClass}">
    <table><tr><td>
      <img src="/assets/images/warningSign.png" alt="warningSign" /></td>
    <td>
      <span class="warningMessage">
      This pre-release version of ${wdkModel.name} is available for early community review. 
      Your searches and strategies saved in this alpha release will not be available in the 
      official release.
      Please explore the site and <a class="open-window-contact-us" href='<c:url value='/contact.do'/>'>contact us</a> 
      with your feedback. This site is under active development so there may be incomplete or 
      inaccurate data and occasional site outages can be expected.</span>
     </td></tr></table>
  </div>
</c:if>
<%-- end hardcoded message only for alpha sites --%>


<!-- ================== IF SHOWBANNER, determined in pageFrame ============ -->

<c:if test="${not empty showBanner}">
  <div class="info announcebox ${homeClass}" style="color:darkred;font-size:120%">
    <table><tr>
			<td><img src="/assets/images/clearInfoIcon.png" alt="warningSign" /></td>
    	<td>
      	<span class="warningMessage">
					${showBanner}
      	</span>
     	</td>
		</tr></table>
  </div>
</c:if>


<!-- ================== READING MESSAGES FROM APICOMM (Information, Degraded, Down) =============== -->

<c:if test="${refer == 'home'}">
  <%--Information message retrieved from DB via messaging system--%>
  <c:set var="siteInfo">
  <imp:announcement messageCategory="Information" projectName="${project}" />
  </c:set>

  <c:if test="${siteInfo != ''}">
    <div class="info announcebox ${homeClass}">
    <table><tr><td>
	         <img src="/assets/images/clearInfoIcon.png" alt="warningSign" /></td>
               <td>
                 <span class="warningMessage">${siteInfo}</span>
    </td></tr></table>
    </div>
  </c:if>  <%-- if there are information announcements --%>

</c:if>  <%-- if home page --%>


<%--Retrieve from DB and display site degraded message scheduled via announcements system--%>
<c:set var="siteDegraded">
  <imp:announcement messageCategory="Degraded" projectName="${project}" />
</c:set>

<c:if test="${siteDegraded != ''}">
<div class="warn announcebox ${homeClass}">
  <table><tr><td>
               <img src="/assets/images/warningSign.png" alt="warningSign" /></td>
             <td>
               <span class="warningMessage">${siteDegraded}</span>
   </td></tr></table>
</div>
</c:if>


<%--Retrieve from DB and display site down message scheduled via announcements system--%>
<c:set var="siteDown">
  <imp:announcement messageCategory="Down" projectName="${project}" />
</c:set>

<c:if test="${siteDown != ''}">
<div class="error announcebox ${homeClass}">
  <table><tr><td>
               <img src="/assets/images/stopSign.png" alt="stopSign" /></td>
             <td>
               <span class="warningMessage">${siteDown}</span>
   </td></tr></table>
</div>
</c:if>

