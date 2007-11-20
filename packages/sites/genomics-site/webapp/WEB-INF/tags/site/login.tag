<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="logic" uri="http://jakarta.apache.org/struts/tags-logic" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>

<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<table border="0" cellspacing="0" cellpadding="0" width="100%">
<c:choose>
  <c:when test="${wdkUser != null && wdkUser.guest != true}">

      <tr>
        <td valign="top" colspan="2" align="center">
           <c:set var="firstName" value="${wdkUser.firstName}"/>
	   <div class="small">Welcome ${firstName}! </div>
        </td>
      </tr>
      <tr>
        <td colspan="2"  align="center" nowrap>
           <a href="<c:url value='/showProfile.do'/>"><div class="small">Change Profile</div></a>
        </td>
      </tr>
      <tr>
        <td colspan="2" align="center">
	   <html:form method="POST" action='/processLogout.do' >
              <input type="submit" value="Logout">
           </html:form>
        </td>
      </tr>

  </c:when>

  <c:otherwise>

     <c:if test="${sessionScope.loginError != null}">
       <c:set var="errorMessage" value="${sessionScope.loginError}"/>
       <c:set var="loginError" scope="session" value="${null}"/>
       <tr>
          <td colspan="2">
             <div class="small"><font color="red">${errorMessage}</font></div>
          </td>
       </tr>
     </c:if>
     <html:form method="POST" action='/processLogin.do' >
     <tr>
       <td align="center" colspan="2" nowrap>
         <div class="small">
           <b>Email: </b><input type="text" name="email" size="15">
         </div>
       </td>
     </tr>
     <tr>
       <td align="center" colspan="2">
         <div class="small">
           <b>Password:</b><input type="password" name="password" size="12">
         </div>
       </td>
     </tr>
     <tr>
        <td colspan="2" align="center" nowrap>
            <span class="small">
               <a href="<c:url value='/showResetPassword.do'/>">forgot?</a>
               <input type="submit" value="Login" style="width:76px;"/>
            </span>
            <c:if test="${requestScope.refererUrl != null}">
               <input type="hidden" name="refererUrl" value="${requestScope.refererUrl}">
            </c:if>
        </td>
     </tr>
    </html:form>

    <html:form method="POST" action='/showRegister.do' >
     <tr>
       <td colspan="2" align="center" valign="top">
          <div class="small"><input type="submit" value="Register / Subscribe" style="width:135px;"></div>
       </td>
     </tr>
    </html:form>
  </c:otherwise>

</c:choose>

</table>
