<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<%@ attribute name="showError"
              required="false" %>

<%@ attribute name="includeCancel"
              required="false" %>

<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="isLoggedIn" value="${wdkUser != null && wdkUser.guest != true}"/>
<c:set var="userName" value="${wdkUser.firstName} ${wdkUser.lastName}"/>
<c:set var="userName" value="${fn:escapeXml(userName)}"/>
<c:set var="functionArg" value="{ \"isLoggedIn\": ${isLoggedIn}, \"userName\": \"${userName}\" }"/>

<span class="onload-function"
  data-function="User.populateUserControl"
  data-arguments="${fn:escapeXml(functionArg)}">
</span>

<span id="user-control"></span>

<script id="user-not-logged-in" type="text/x-handlebars-template">
  <li><a href="javascript:void(0)" onclick="wdk.user.login()">Login</a></li>
  <li><a href="<c:url value='/showRegister.do'/>">Register</a></li>
</script>

<script id="user-logged-in" type="text/x-handlebars-template">
  <li><a href="<c:url value='/profile.jsp'/>"><span id="user-name">{{userName}}</span>'s Profile</a></li>
  <li><a href="javascript:void(0)" onclick="User.logout()">Logout</a></li>
  <div id="logout">
    <form name="logoutForm" method="POST" action="<c:url value='/processLogout.do'/>"></form>
  </div>
</script>

<script id="user-login-message" type="text/x-handlebars-template">
  <div id="login-message">
    <div class="title">User Message</div>
    <span>{{message}}</span>
  </div>
</script>

<script id="user-login-form" type="text/x-handlebars-template">
  <div id="login" title="EuPathDB Account Login">
    <form name="loginForm" method="post" action="<c:url value='/processLogin.do'/>">
      <table border="0" cellspacing="0" cellpadding="0" width="100%">
        <c:if test="${showError && sessionScope.loginError != null && sessionScope.loginError != ''}">
          <c:set var="errorMessage" value="${sessionScope.loginError}"/>
          <c:remove var="loginError" scope="session"/>
          <tr>
            <td align="center" colspan="2">
              <div class="small">
                <font color="red">${errorMessage}<br>Note email and password are case-sensitive.</font>
              </div>
            </td>
          </tr>
        </c:if>
        <tr>
          <td align="right" width="45%"><div class="small"><b>Email:</b></div></td>
          <td align="left"><div class="small"><input id="email" type="text" name="email" size="20"/></div></td>
        </tr>
        <tr>
          <td align="right"><div class="small"><b>Password:</b></div></td>
          <td align="left"><div class="small"><input id="password" type="password" name="password" size="20"/></div></td>
        </tr>
        <tr><td style="text-align:center" colspan="2"><div class="small"><b>- OR -</b></div></td></tr>
        <tr>
          <td align="right"><div class="small"><b>Open ID:</b></div></td>
          <td align="left"><div class="small"><input id="openid" type="text" size="20" name="openid"/></div></td>
        </tr>
        <tr>
          <td colspan="2" align="center" nowrap>
            <input type="checkbox" id="remember" name="remember" size="11"/>Remember me on this computer.</input>
          </td>
        </tr>
        <tr>
          <td colspan="2" align="center" nowrap>
            <span class="small">
              <input type="submit" value="Login" id="login" style="width:76px;"/>
              <c:if test="${includeCancel}">
                <input type="submit" value="Cancel" style="width:76px;" onclick="jQuery('#loginForm input:hidden[name=refererUrl]').val(window.location);jQuery.unblockUI();return false;"/>
              </c:if>
            </span>
          </td>
        </tr>
        <tr>
          <td colspan="2" align="center" valign="top">
            <span class="small">
              <a href="<c:url value='/showResetPassword.do'/>">Forgot Password?</a>&nbsp;&nbsp;
              <a href="<c:url value='/showRegister.do'/>">Register/Subscribe</a>
            </span>
          </td>
        </tr>
      </table>
    </form>
  </div>
</script>
