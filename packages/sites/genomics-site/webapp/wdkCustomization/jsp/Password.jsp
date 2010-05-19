<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="logic" uri="http://jakarta.apache.org/struts/tags-logic" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<site:header title="${wdkModel.displayName} :: Change Password"
                 banner="Change Password"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="Change Password"
                 division="profile"/>


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
<wdk:errors/>

<!-- get user object from session scope -->
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>

<!-- display page header with recordClass type in banner -->
<c:set value="${wdkRecord.recordClass.type}" var="recordType"/>
<div align="center">

<!-- display the success information, if the user registered successfully -->
<c:choose>
  <c:when test="${requestScope.changePasswordSucceed != null}">

  <p>
    <font color="blue">You have changed your password successfully.</font>
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
    <c:if test="${requestScope.changePasswordError != null}">
       <tr>
          <td colspan="2">
             <font color="red">${requestScope.changePasswordError}</font>
          </td>
       </tr>
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
         <input type="submit" name="changeButton" value="Change"  onclick="return validateFields();" />
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

<site:footer/>
