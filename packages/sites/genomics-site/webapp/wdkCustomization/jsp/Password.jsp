<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
<%@ taglib prefix="logic" uri="http://struts.apache.org/tags-logic" %>
<%@ taglib prefix="bean" uri="http://struts.apache.org/tags-bean" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<imp:pageFrame title="${wdkModel.displayName} :: Change Password" refer="profile">

<script language="JavaScript" type="text/javascript">
<!--
function validateFields(e)
{
    if (typeof e != 'undefined' && !enter_key_trap(e)) {
        return false;
    }
    
    var newPassword = document.passwordForm.newPassword.value;
    var confirmPassword = document.passwordForm.confirmPassword.value;

    if (newPassword == "") {
        alert('The new password cannot be empty.');
        document.passwordForm.newPassword.focus();
        return false;
    } else if (newPassword != confirmPassword) {
        alert('The confirm password does not match with the new password.\nPlease verify your input.');
        document.passwordForm.newPassword.focus();
        return false;
    } else {
        document.passwordForm.changeButton.disabled = true;
        document.passwordForm.submit();
        return true;
    }
}
//-->
</script>


<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>

<!-- show error messages, if any -->
<imp:errors/>

<!-- get user object from session scope -->
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>

<div align="center">

<!-- display the success information, if the user registered successfully -->
<c:choose>
  <c:when test="${requestScope.changePasswordSucceed != null}">

  <p>
    <font color="blue">You have changed your password successfully.</font><br/>
    <a href="${pageContext.request.contextPath}/showProfile.do">Return to Profile</a>
    &#160;&#160;&#160;&#160;&#160;&#160;
    <a href="${pageContext.request.contextPath}/home.do">${wdkModel.displayName} Home</a>
  </p>

  </c:when>

  <c:otherwise>
  <!-- continue change password form -->

<html:form method="POST" action='/processPassword.do' >

  <c:if test="${requestScope.refererUrl != null}">
     <input type="hidden" name="refererUrl" value="${requestScope.refererUrl}">
  </c:if>

  <table width="400">
    <tr>
      <th colspan="2"> Change Your Password </th>
    </tr>

<c:choose>
  <c:when test="${wdkUser.guest == true}">

    <tr>
      <td colspan="2"> 
          You cannot change password as a guest.<br>
          Please login first before you change your password. 
          If you lost your password, please <a href="<c:url value='/resetpwd.jsp'/>">click here</a>.
      </td>
    </tr>

  </c:when>

  <c:otherwise>

    <!-- check if there's an error message to display -->
    <c:if test="${not empty changePasswordError}">
      <tr><td colspan="2"><font color="red">${changePasswordError}</font></td></tr>
     </c:if>
    <c:if test="${validator.errorsPresent}}">
      <c:forEach var="error" items="${validator.errorList}">
        <tr>
          <td colspan="2">
            <font color="red">${error}</font>
          </td>
        </tr>
      </c:forEach>
    </c:if>

    <tr>
      <td align="right" width="200" nowrap>Current User: </td>
      <td align="left">${wdkUser.firstName} ${wdkUser.lastName}</td>
    </tr>
    <tr>
      <td align="right" width="200" nowrap>Email: </td>
      <td align="left">${wdkUser.email}</td>
    </tr>
    <tr>
      <td align="right" width="200" nowrap>Current Password: </td>
      <td align="left"><input type="password" name="oldPassword"></td>
    </tr>
    <tr>
      <td align="right" width="200" nowrap>New Password: </td>
      <td align="left"><input type="password" name="newPassword"></td>
    </tr>
    <tr>
      <td align="right" width="200" nowrap>Retype Password: </td>
      <td align="left"><input type="password" name="confirmPassword"></td>
    </tr>
    <tr>
       <td colspan="2" align="center">
         <input type="submit" value="Change" onclick="return validateFields();" />
       </td>
    </tr>
    <tr>
       <td colspan="2"'>
       <div class='small'>
       <font color="red">
       The password you use here may be intercepted by others during transmission. 
       Choose a different password from any you use for sensitive accounts such as online banking or your university account. 
       </font>
       </div>
       </td>
    </tr>
  </c:otherwise>

</c:choose>

  </table>
</html:form>


  </c:otherwise>

</c:choose>

</div>

  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

</imp:pageFrame>
