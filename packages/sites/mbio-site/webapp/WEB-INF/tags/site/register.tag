<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
<%@ taglib prefix="logic" uri="http://struts.apache.org/tags-logic" %>
<%@ taglib prefix="bean" uri="http://struts.apache.org/tags-bean" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<%@ attribute name="showError"
              required="false"
%>
<%@ attribute name="includeCancel"
              required="false"
%>
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>

<style type="text/css">
  .blockUI {   min-width: 750px; }

  p#regConf {
    font-weight: bold;
    font-size: 120%;
    color: green;
    margin: 10px 0 30px;
  }
</style>

<div align="center">
<c:choose>

<%-- REGISTRATION CONFIRMATION --%>
<c:when test="${requestScope.registerSucceed != null}">
  <h1>
    <b>You have registered successfully.</b>
  </h1>

  <p id="regConf">We have sent you an email with a temporary password.<br>
    Please log in within the next week (to avoid having this registration purged).
  </p>
</c:when>


<%-- REGISTRATION FORM --%>
<c:otherwise>    
  <html:form method="POST" action='/processRegister.do' >
    <c:if test="${requestScope.refererUrl != null}">
      <input type="hidden" name="refererUrl" value="${requestScope.refererUrl}">
    </c:if>

    <table id="regForm" width="650">
    <c:choose>

<%-- ALREADY LOGIN, PROFILE UPDATE? --%>
    <c:when test="${wdkUser != null && wdkUser.guest != true}">
    <tr>
      <td colspan="2"><p>You are logged in. </p>
        <p>To change your password or profile go <a href="<c:url value='/showProfile.do'/>">here</a>.</p></td>
    </tr>
    </c:when>

<%-- NEW USER --%>
    <c:otherwise>
    <c:if test="${requestScope.registerError != null}">
      <tr>
      <td colspan="2">
        <font color="red">${requestScope.registerError}</font>
      </td>
      </tr>
    </c:if>

    <tr>
      <td align="right" width="50%" nowrap><font color="red">*</font> Email: </td>
      <td align="left"><input type="text" name="email" value="${requestScope.email}" size="20"></td>
    </tr>
    <tr>
      <td align="right" width="50%" nowrap><font color="red">*</font> Confirm Email: </td>
      <td align="left"><input type="text" name="confirmEmail" value="${requestScope.email}" size="20"></td>
    </tr>
    <tr>
      <td align="right" width="50%" nowrap><font color="red">*</font> First Name: </td>
      <td align="left"><input type="text" name="firstName" value="${requestScope.firstName}" size="20"></td>
    </tr>
    <tr>
      <td align="right" width="50%" nowrap>Middle Name: </td>
      <td align="left"><input type="text" name="middleName" value="${requestScope.middleName}" size="20"></td>
    </tr>
    <tr>
      <td align="right" width="50%" nowrap><font color="red">*</font> Last Name: </td>
      <td align="left"><input type="text" name="lastName" value="${requestScope.lastName}" size="20"></td>
    </tr>
    <tr>
      <td align="right" width="50%" nowrap><font color="red">*</font> Institution: </td>
      <td align="left"><input type="text" name="organization" value="${requestScope.organization}" size="50"></td>
    </tr>
    <tr>
      <td style="font-size:120%" colspan="2" align="center">
        <br><input type="submit" name="registerButton" value="Register"  onclick="return validateFields();" />
        <c:if test="${includeCancel}">
          <input type="submit" value="Cancel" style="width:76px;" onclick="$.unblockUI();return false;"/>
        </c:if>
      </td>
    </tr>
    </c:otherwise>
    </c:choose>
    </table>
  </html:form>

  <br>
  <div align="left" style="width:550px;margin:5px;border:1px  solid black;padding:5px;line-height:1.5em;">
  <p><b>Why register/subscribe?</b> So you can:</p>
  <div id="cirbulletlist">
  <ul>
  <li>Have your strategies back the next time you login
  <li>Use your basket to store temporarily IDs of interest, and either save, or download or access other tools
  <li>Use your favorites to store IDs of permanent interest, for faster access to its record page
  <li>Set site preferences, such as items per page displayed in the query result
  </ul>
  </div>
  </div>

</c:otherwise>
</c:choose>
<!-- END OF REGISTRATION FORM/CONFIRMATION -->


<!-- PRIVACY POLICY -->
<div align="left" style="width:550px;margin:5px;border:1px  solid black;padding:5px;line-height:1.5em;">
<div style="font-size:1.2em;">
<b>MicrobiomeDB Websites Privacy Policy</b> 
</div>

<table><tr>
<td width="40%">
<p><b>How we will use your email:</b> </p>
<div id="cirbulletlist">
<ul>
<li>Confirm your subscription
<li>Send you infrequent alerts if you subscribe to receive them
<li>NOTHING ELSE.  We will not release the email list.  
</ul>
</div>
</td>

<td>
<p><b>How we will use your name and institution:</b></p>
<div id="cirbulletlist">
<ul>
<li>We will not release your name or institution.
</ul>
</div>
</td>
</tr></table>

</div> <!-- div PRIVACY POLICY -->


</div> <!-- div whole page - align center -->


<script language="JavaScript" type="text/javascript">
<!--

// spam prevention for register form
wdk.util.addSpamTimestamp(document.registerForm);

// enable submit button if form is rereshed after a submit
// some browsers will cache the form state
document.registerForm.registerButton.disabled = false;

function validateFields(e)
{
    if (typeof e != 'undefined' && !enter_key_trap(e)) {
        return;
    }

    var email = document.registerForm.email.value;
    var pat = email.indexOf('@');
    var pdot = email.lastIndexOf('.');
    var len = email.length;

    if (email == '') {
        alert('Please provide your email address.');
        document.registerForm.email.focus();
        return false;
    } else if (pat<=0 || pdot<pat || pat==len-1 || pdot==len-1) {
        alert('The format of the email is invalid.');
        document.registerForm.email.focus();
        return false;
    } else if (email != document.registerForm.confirmEmail.value) {
        alert('The emails do not match. Please enter it again.');
        document.registerForm.email.focus();
        return false;
    } else if (document.registerForm.firstName.value == "") {
        alert('Please provide your first name.');
        document.registerForm.firstName.focus();
        return false;
    } else if (document.registerForm.lastName.value == "") {
        alert('Please provide your last name.');
        document.registerForm.lastName.focus();
        return false;
    } else if (document.registerForm.organization.value == "") {
        alert('Please provide the name of the organization you belong to.');
        document.registerForm.organization.focus();
        return false;
    } else {
        document.registerForm.registerButton.disabled = true;
        document.registerForm.submit();
        return true;
    }
}
//-->
</script>


