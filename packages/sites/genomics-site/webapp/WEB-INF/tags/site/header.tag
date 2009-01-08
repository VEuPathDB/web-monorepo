<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="title"
              description="Value to appear in page's title"
%>

<%@ attribute name="banner"
              required="false"
              description="Value to appear at top of page"
%>

<%@ attribute name="bannerPreformatted"
              required="false"
              description="Value to appear at top of page"
%>

<%@ attribute name="logo"
              required="false"
              description="relative url for logo to display, or no logo if set to 'none'"
%>

<%@ attribute name="parentDivision"
              required="false"
%>

<%@ attribute name="parentUrl"
              required="false"
%>

<%@ attribute name="divisionName"
              required="false"
%>

<%@ attribute name="division"
              required="false"
%>

<%@ attribute name="isBannerImage"
              required="false"
%>

<%@ attribute name="bannerSuperScript"
              required="false"
%>

<%@ attribute name="summary"
              required="false"
              description="short text description of the page"
%>

<%@ attribute name="headElement"
              required="false"
              description="additional head elements"
%>

<%@ attribute name="bodyElement"
              required="false"
              description="additional body elements"
%>


<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
        "http://www.w3.org/TR/html4/loose.dtd">
<html>

<head>
  <title><c:out value="${title}" default="${banner}" /></title>
  <link rel="icon" type="image/png" href="/assets/images/${project}/favicon.ico"> <%-- standard --%>
  <link rel="shortcut icon" href="/assets/images/${project}/favicon.ico"> <%-- for IE7 --%>
  <link rel="stylesheet" href="<c:url value='/misc/style.css' />" type="text/css">
  <link rel="stylesheet" href="<c:url value='/misc/sequence.css' />" type="text/css">
  <script type="text/javascript" src='<c:url value="/js/api.js"/>'></script>
 <script type='text/javascript' src='<c:url value="/js/newwindow.js"/>'></script>
<script type='text/javascript' src='<c:url value="/js/overlib.js"/>'></script>


  <c:set var="rssUrl" value="showXmlDataContent.do?name=XmlQuestions.NewsRss"/>
  <link rel="alternate" type="application/rss+xml" 
    title="RSS Feed for ${wdkModel.displayName}" 
    href="${rssUrl}" />



  ${headElement}
</head>

<body bgcolor="#FFFFFF" topmargin='3' marginheight='3' ${bodyElement}>

<table width="90%" align="center" 
        border="0" cellspacing="0" 
        cellpadding="0">
<tr><td colspan="3" align='center'>
<%-- <font color='red'>CryptoDB is experiencing technical difficulties. We hope to resolve them very soon. Please accept our apologies for occasional service outages while we work to fix the problem. </font> --%>
<%-- <font size='-1' color='red'>CryptoDB is undergoing maintenance today. There may be intermittent service outages.</font> --%>
</td></tr>
<tr><td colspan="3" align="right">
<c:choose>
<c:when test="${division ne 'home'}">
  <font size='-1'>
  <site:requestURL/>
  <c:choose>
    <c:when test="${wdkUser == null || wdkUser.guest == true}">
    
      <%--------------- Construct link to login page -------------%>  
        <%-- 
            urlencode the enclosing page's URL and append as a parameter 
            in the queryString. site:requestURL compensates
            for Struts' url mangling when forward in invoked.
        --%>
        <c:url value="login.jsp" var="loginUrl">
           <c:param name="originUrl" value="${originRequestUrl}"/> 
        </c:url>
        <%-- 
            urlencode the login page's URL and append as a parameter 
            in the queryString.
            If login fails, user returns to the refererUrl. If login
            succeeds, user should return to originUrl.
        --%>
        <c:url var="loginJsp" value='login.jsp'/>
        <c:url value="${loginUrl}" var="loginUrl">
           <c:param name="refererUrl" value="${loginJsp}"/> 
        </c:url>
        
        <c:if test="${division ne 'login'}">
          <a href="${loginUrl}" id='login'>Login</a> | <a href="<c:url value='showRegister.do'/>" id='register'>Register</a>
        </c:if>
        
    </c:when>
    <c:otherwise>
       <c:url value="processLogout.do" var="logoutUrl">
          <c:param name="refererUrl" value="${originRequestUrl}"/> 
       </c:url>
        ${wdkUser.firstName} ${wdkUser.lastName} | <a href="<c:url value='/showProfile.do'/>" id='profile'>Profile</a> | <a href="<c:url value='${logoutUrl}' />" id='logout'>Logout</a>
    </c:otherwise>
  </c:choose>
  </font>
</c:when>
</c:choose>
</td>
</tr>

    <c:choose>

        <%-- option to have no header at all --%>
        <c:when test="${banner eq 'none'}">
        </c:when>
              
        <%-- front page header --%>
        <c:when test="${division eq 'home'}">
            <c:set value="/images/cryptologo_maroon.gif" var="logo"/>

            <tr>
              <td width="30%">&nbsp;</td>
              <td width="40%"valign="middle" align="center">
                <a href="<c:url value="/" />">
                  <img src="<c:url value="${logo}"/>" border="0" alt="Site logo" />
                </a>
              </td> 
              <td width="30%" valign="middle" align="right">
               <font face='Arial, Helvetica' size="3">

<c:choose>
    <c:when test="${bannerSuperScript != null}">
        ${bannerSuperScript}&nbsp;&nbsp;&nbsp;
    </c:when>
    <%-- for pages other than home which do not use bannersuperscript (bigger font) --%>
    <c:otherwise>
          <i><b>Release ${version}</b></i>
    </c:otherwise>
 </c:choose>
                </font>
                <br>
                <font size="-3">&nbsp;&nbsp;February 19, 2008&nbsp;&nbsp;&nbsp;&nbsp;</font>
              </td>
            </tr>
          
            <tr>
              <td align="center" colspan="3">
                <c:import url="http://${pageContext.request.serverName}/include/announcements.html" />
              </td>
            </tr>
          
        </c:when> <%-- division eq 'home' --%>
        
        <%-- standard header --%>
        <c:otherwise>
        
            <c:set value="/" var="home"/>
            <c:set value="/images/oocyst_bg.gif" var="left_logo"/>
            <c:set value="" var="right_logo"/>

            <tr>
              <td  width="70" align="left">
                <a href="${home}">
                  <img src="<c:url value="${left_logo}"/>" border="0" alt="Site logo" />
                </a>
              </td>
          
              <td align="center">
                <c:choose>
                  <c:when test="${banner != null && bannerPreformatted == null}">
                    <b><font face="Arial,Helvetica" size="+3">
                    ${banner}
                    </font></b>
                  </c:when>
                  <c:when test="${banner == null && bannerPreformatted != null}">
                    ${bannerPreformatted}
                  </c:when>
                  <c:otherwise>
                  </c:otherwise>
                </c:choose>
              </td>
            <td width="70" align="right"><site:qhistButton/></td>  
            </tr>
            
    
        </c:otherwise>
    </c:choose>
    
</table> <%-- End of banner --%>

<table width="90%" align="center" 
       border="0" cellspacing="0" 
       cellpadding="0">
<tr><td>
<c:import url="http://${pageContext.request.serverName}/include/toolbar.html" />
</td></tr>
</table>

<%-- Open table and cell that encloses the page content --%>
<table width="90%" align="center" border="0"
       summary="parent table enclosing entire page content">
<tr><td>
<%-- Closing is in footer.tag --%>
      
