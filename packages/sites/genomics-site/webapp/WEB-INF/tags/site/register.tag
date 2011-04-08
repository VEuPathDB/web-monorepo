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


<style type="text/css">
        .blockUI {   min-width: 750px; }
</style>


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



<script language="JavaScript" type="text/javascript">
<!--
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


<!-- get user object from session scope -->
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>

<!-- display page header with recordClass type in banner -->
<c:set value="${wdkRecord.recordClass.type}" var="recordType"/>

  <div align="center">

<!-- display the success information, if the user registered successfully -->
<c:choose>
  <c:when test="${requestScope.registerSucceed != null}">

  <h1>
    <b>You have registered successfully.</b>
  </h1>

  <p>We have sent you an email with a temporary password.</p>
  <p>Please login and change your password to one that you'll remember.</p>

  </c:when>

  <c:otherwise>
  <!-- continue registration fomr -->

<html:form method="POST" action='/processRegister.do' >

  <c:if test="${requestScope.refererUrl != null}">
     <input type="hidden" name="refererUrl" value="${requestScope.refererUrl}">
  </c:if>

  <p> <b>IMPORTANT</b>: If you already registered in another site<br>(AmoebaDB, EuPathDB, CryptoDB ,GiardiaDB, MicrosporidiaDB, PiroplasmaDB, PlasmoDB, ToxoDB, TrichDB or TriTrypDB)<br>you do NOT need to register again.</p>

   <br>

  <table width="650">

  <c:choose>
  <c:when test="${wdkUser != null && wdkUser.guest != true}">

    <tr>
      <td colspan="2"><p>You are logged in. </p>
        <p>To change your password or profile go <a href="<c:url value='/showProfile.do'/>">here</a>.</p></td>
    </tr>

  </c:when>

  <c:otherwise>

    <!-- check if there's an error message to display -->
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
    <td align="right" width="50%" nowrap>
          Send me email alerts about: 
    </td>
    <td nowrap>
        <c:choose>
           <c:when test="${requestScope.preference_global_email_amoebadb != null}">
              <input type="checkbox" name="preference_global_email_amoebadb" checked>AmoebaDB</input>
           </c:when>
           <c:otherwise>
              <input type="checkbox" name="preference_global_email_amoebadb">AmoebaDB</input>
           </c:otherwise>
        </c:choose>
        <c:choose>
           <c:when test="${requestScope.preference_global_email_apidb != null}">
              <input type="checkbox" name="preference_global_email_apidb" checked>EuPathDB</input>
           </c:when>
           <c:otherwise>
              <input type="checkbox" name="preference_global_email_apidb">EuPathDB</input>
           </c:otherwise>
        </c:choose>
        <c:choose>
           <c:when test="${requestScope.preference_global_email_cryptodb != null}">
              <input type="checkbox" name="preference_global_email_cryptodb" checked>CryptoDB</input>
           </c:when>
           <c:otherwise>
              <input type="checkbox" name="preference_global_email_cryptodb">CryptoDB</input>
           </c:otherwise>
        </c:choose>
        <c:choose>
           <c:when test="${requestScope.preference_global_email_giardiadb != null}">
              <input type="checkbox" name="preference_global_email_giardiadb" checked>GiardiaDB</input>
           </c:when>
           <c:otherwise>
              <input type="checkbox" name="preference_global_email_giardiadb">GiardiaDB</input>
           </c:otherwise>
        </c:choose>
        <c:choose>
           <c:when test="${requestScope.preference_global_email_microsporidiadb != null}">
              <input type="checkbox" name="preference_global_email_microsporidiadb" checked>MicrosporidiaDB</input>
           </c:when>
           <c:otherwise>
              <input type="checkbox" name="preference_global_email_microsporidiadb">MicrosporidiaDB</input>
           </c:otherwise>
        </c:choose>
    </td></tr>
    <td align="right" width="50%" nowrap>
    <td nowrap>
	<c:choose>
           <c:when test="${requestScope.preference_global_email_piroplasmadb != null}">
              <input type="checkbox" name="preference_global_email_piroplasmadb" checked>PiroplasmaDB</input>
           </c:when>
           <c:otherwise>
              <input type="checkbox" name="preference_global_email_piroplasmadb">PiroplasmaDB</input>
           </c:otherwise>
        </c:choose>
        <c:choose>
           <c:when test="${requestScope.preference_global_email_plasmodb != null}">
              <input type="checkbox" name="preference_global_email_plasmodb" checked>PlasmoDB</input>
           </c:when>
           <c:otherwise>
              <input type="checkbox" name="preference_global_email_plasmodb">PlasmoDB</input>
           </c:otherwise>
        </c:choose>
        <c:choose>
           <c:when test="${requestScope.preference_global_email_toxodb != null}">
              <input type="checkbox" name="preference_global_email_toxodb" checked>ToxoDB</input>
           </c:when>
           <c:otherwise>
              <input type="checkbox" name="preference_global_email_toxodb">ToxoDB</input>
           </c:otherwise>
        </c:choose>

        <c:choose>
           <c:when test="${requestScope.preference_global_email_trichdb != null}">
              <input type="checkbox" name="preference_global_email_trichdb" checked>TrichDB</input>
           </c:when>
           <c:otherwise>
              <input type="checkbox" name="preference_global_email_trichdb">TrichDB</input>
           </c:otherwise>
        </c:choose>
          <c:choose>
           <c:when test="${requestScope.preference_global_email_tritrypdb != null}">
              <input type="checkbox" name="preference_global_email_tritrypdb" checked>TriTrypDB</input>
           </c:when>
           <c:otherwise>
              <input type="checkbox" name="preference_global_email_tritrypdb">TriTrypDB</input>
           </c:otherwise>
        </c:choose>
    </td>
    </tr>
    <tr>
       <td colspan="2" align="center">
           <input type="submit" name="registerButton" value="Register"  onclick="return validateFields();" />
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
  <li>Add a comment on genes and sequences
  <li>Set site preferences, such as items per page displayed in the query result
  <li>Opt to receive infrequent alerts (at most monthly), by selecting (below) from which EuPathDB sites
  </ul>
  </div>
  </div>

  </c:otherwise>

</c:choose>


<div align="left" style="width:550px;margin:5px;border:1px  solid black;padding:5px;line-height:1.5em;">
<div style="font-size:1.2em;">
<b>&nbsp;&nbsp;&nbsp;EuPathDB Websites Privacy Policy</b> 
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
<li>If you add a comment to a Gene or a Sequence, your name and institution will be displayed with the comment 
<li>NOTHING ELSE.  We will not release your name or institution.  
</ul>
</div>
</td>

</tr></table>

</div>  <%-- div align left --%>

</div> <%-- div align center --%>



