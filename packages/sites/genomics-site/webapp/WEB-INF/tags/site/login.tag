<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="logic" uri="http://jakarta.apache.org/struts/tags-logic" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

<%@ attribute name="showError"
              required="false"
%>

<%@ attribute name="includeCancel"
              required="false"
%>

<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>

<%-- set refererUrl to be the tag's enclosing page if not
      already set elsewhere in the page. (hint: external login pages
      such as login.jsp use this tag and will set refererUrl to be
      that login page.)--%>
<c:if test="${requestScope.refererUrl == null}">
  <wdk:requestURL/>
  <c:set var="refererUrl" value="${originRequestUrl}" scope="request"/> 
</c:if>

<%-- unset session scoped URLs to avoid conflicts if user
     enters from another page in parallel. IOW, keep the URLs
     restricted to requestScope (session scope was used to maintain 
     state through ProcessLoginAction which forwards via redirect (
     where request vars do not follow).) 
--%>
<c:remove var="originUrl"  scope="session"/>
<c:remove var="refererUrl" scope="session"/>

<html:form method="POST" action='/processLogin.do' >
<table border="0" cellspacing="0" cellpadding="0" width="100%">
<c:choose>
  <c:when test="${wdkUser != null && wdkUser.guest != true}">
      <tr>
        <td valign="top" colspan="2" align="center">
           <c:set var="firstName" value="${wdkUser.firstName}"/>
       <div class="normal">Welcome ${firstName}! </div>
        </td>
      </tr>
      <tr>
        <td colspan="1" align="left" valign="top">
           <div class="small">
           <a href="<c:url value='/showProfile.do' />" id="profile">Profile</a>
           </div>
        </td>
        <td colspan="1" align="right" valign="top">
          <c:url value="processLogout.do" var="logoutUrl">
             <c:param name="refererUrl" value="${originRequestUrl}"/> 
          </c:url>
           <div class="small">
           <a href="${logoutUrl}" id="logout">Logout</a>
           </div>
        </td>
      </tr>
  </c:when>
  <c:otherwise>
     <c:if test="${showError && sessionScope.loginError != null && sessionScope.loginError != ''}">
       <c:set var="errorMessage" value="${sessionScope.loginError}"/>
       <c:remove var="loginError" scope="session"/>
       <tr>
          <td align="center" colspan="2">
             <div class="small"><font color="red">${errorMessage}<br>
             Note email and password are case-sensitive.</font></div>
          </td>
       </tr>
     </c:if>
     <tr>
       <td align="right" width="45%"><div class="small"><b>Email:</b></div></td>
       <td align="left"><div class="small"><input id="email" type="text" name="email" size="20"></div></td>
     </tr>
     <tr>
       <td align="right"><div class="small"><b>Password:</b></div></td>
       <td align="left"><div class="small"><input id="password" type="password" name="password" size="20"></div></td>
     </tr>
     <tr>
        <td colspan="2" align="center" nowrap>
           <input type="checkbox" id="remember" name="remember" size="11">Remember me on this computer.</input>
        </td>
     </tr>
     <tr>
        <td colspan="2" align="center" nowrap>
            <span class="small">
               <input type="submit" value="Login" id="login" style="width:76px;"/>
               <c:if test="${includeCancel}">
                 <input type="submit" value="Cancel" style="width:76px;" onclick="$.unblockUI();return false;"/>
               </c:if>
            </span>
    
           <c:if test="${originUrl != null}">
             <input type="hidden" name="originUrl" value="${originUrl}">
           </c:if>
           <c:if test="${refererUrl != null}">
             <input type="hidden" name="refererUrl" value="${refererUrl}">
           </c:if>
       </td>
     </tr>
     <tr>
       <td colspan="2" align="center" valign="top">
          <span class="small"><a href="<c:url value='/showResetPassword.do'/>">Forgot Password?</a>&nbsp;&nbsp;<a href="showRegister.do">Register/Subscribe</a></span>
       </td>
     </tr>
  </c:otherwise>

</c:choose>

</table>
</html:form>
