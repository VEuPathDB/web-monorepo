<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
<%@ taglib prefix="logic" uri="http://struts.apache.org/tags-logic" %>
<%@ taglib prefix="bean" uri="http://struts.apache.org/tags-bean" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<imp:pageFrame title="${wdkModel.displayName} :: Reset Password"
                 banner="Reset Password"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="Reset Password"
                 division="profile">

<div align="center">

<!-- display the success information, if the user registered successfully -->
<c:choose>
  <c:when test="${requestScope.resetPasswordSucceed != null}">

  <font color="blue">
  <p>
    An email has been sent to authorizing you to set your password.
  </p>
  <p>
    Please change your password as soon as you receive the email.
  </p>
  <p>
    <b>Note:</b>Some junk mail filters may mistake the mail for junk.  If you do not see the mail, check your junk mail folder.
  </p>
  </font>

  </c:when>

  <c:otherwise>
  <!-- continue reset password form -->

<html:form method="POST" action='/processResetPassword.do' >

  <c:if test="${requestScope.refererUrl != null}">
     <input type="hidden" name="refererUrl" value="${requestScope.refererUrl}">
  </c:if>

  <p>Please type your email, and we will send you an email with a new temporary password. </p>
  <table width="400">
    <tr>
      <th colspan="2"> Request to reset your password </th>
    </tr>

    <!-- check if there's an error message to display -->
    <c:if test="${requestScope.resetPasswordError != null}">
       <tr>
          <td colspan="2">
             <font color="red">${requestScope.resetPasswordError}</font>
          </td>
       </tr>
    </c:if>

    <tr>
      <td align="right" width="100" nowrap>Your email: </td>
      <td align="left"><input type="text" name="email"></td>
    </tr>
    <tr>
       <td colspan="2" align="center"><input type="submit" value="Reset Password"></td>
    </tr>

  </table>
</html:form>


  </c:otherwise>

</c:choose>

</div>
</imp:pageFrame>
