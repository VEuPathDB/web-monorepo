<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="logic" uri="http://jakarta.apache.org/struts/tags-logic" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<site:header title="${wdkModel.displayName} :: Update User Profile"
                 banner="Update User Profile"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="Update User Profile"
                 division="profile"/>

<script language="JavaScript" type="text/javascript">
<!--
function validateFields(e)
{
    if (typeof e != 'undefined' && !enter_key_trap(e)) {
        return;
    }

    if (document.profileForm.firstName.value == "") {
        alert('Please provide your first name.');
        document.profileForm.firstName.focus();
        return false;
    } else if (document.profileForm.lastName.value == "") {
        alert('Please provide your last name.');
        document.profileForm.lastName.focus();
        return false;
    } else if (document.profileForm.organization.value == "") {
        alert('Please provide the name of the organization you belong to.');
        document.profileForm.organization.focus();
        return false;
    } else {
        document.profileForm.submit();
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
<c:set var="global" value="${wdkUser.globalPreferences}"/>


<!-- display the success information, if the user registered successfully -->
<c:if test="${requestScope.profileSucceed != null}">

  <p><font color="blue">Your profile has been updated successfully.</font> </p>

</c:if>

<html:form method="POST" action='/processProfile.do' >

  <c:if test="${requestScope.refererUrl != null}">
     <input type="hidden" name="refererUrl" value="${requestScope.refererUrl}">
  </c:if>

  <table width="650" border="0">
    <tr>
      <th colspan="2"> User Profile </th>
    </tr>

<c:choose>
  <c:when test="${wdkUser == null || wdkUser.guest == true}">

    <tr>
      <td colspan="2">Please login to view or update your profile.</td>
    </tr>

  </c:when>

  <c:otherwise>

    <!-- check if there's an error message to display -->
    <c:if test="${requestScope.profileError != null}">
       <tr>
          <td colspan="2">
             <font color="red">${requestScope.profileError}</font>
          </td>
       </tr>
    </c:if>

    <tr>
      <td align="right" width="50%" nowrap>Email: </td>
      <td align="left">${wdkUser.email}</td>
    </tr>
    <tr>
      <td colspan="2" align="right">
         <a href="<c:url value='/showPassword.do'/>"><img border="0" src="<c:url value='/images/change_pwd.gif'/>"></a>
      </td>
    </tr>
    <tr>
       <td colspan="2" align="left"><hr><b>User Information:</b></td>
    </tr>
    <tr>
      <td align="right" width="50%" nowrap><font color="red">*</font> First Name: </td>
      <td align="left"><input type="text" name="firstName" value="${wdkUser.firstName}" size="20"></td>
    </tr>
    <tr>
      <td align="right" width="50%" nowrap>Middle Name: </td>
      <td align="left"><input type="text" name="middleName" value="${wdkUser.middleName}" size="20"></td>
    </tr>
    <tr>
      <td align="right" width="50%" nowrap><font color="red">*</font> Last Name:</td>
      <td align="left"><input type="text" name="lastName" value="${wdkUser.lastName}" size="20"></td>
    </tr>
      <td align="right" width="50%" nowrap><font color="red">*</font> Institution:</td>
      <td align="left"><input type="text" name="organization" value="${wdkUser.organization}" size="50"></td>
    </tr>
    <tr>
       <td colspan="2" align="left"><hr><b>Preferences:</b></td>
    </tr>
    <tr>
      <td align="right" valign="top" width="50%" nowrap>
          Send me email alerts about: 
      </td>
      <td nowrap>
         <input type="checkbox" name="preference_global_email_apidb" 
	        ${(global['preference_global_email_apidb'] == 'on')? 'checked' : ''}>
	    EuPathDB
	 </input>
         <input type="checkbox" name="preference_global_email_cryptodb" 
	        ${(global['preference_global_email_cryptodb'] == 'on')? 'checked' : ''}>
	    CryptoDB
	 </input>
<input type="checkbox" name="preference_global_email_giardiadb" 
	        ${(global['preference_global_email_giardiadb'] == 'on')? 'checked' : ''}>
	    GiardiaDB
	 </input>
         <input type="checkbox" name="preference_global_email_plasmodb" 
	        ${(global['preference_global_email_plasmodb'] == 'on')? 'checked' : ''}>
	    PlasmoDB
	 </input>
         <input type="checkbox" name="preference_global_email_toxodb" 
	        ${(global['preference_global_email_toxodb'] == 'on')? 'checked' : ''}>
	    ToxoDB
	 </input>
 <input type="checkbox" name="preference_global_email_trichdb" 
	        ${(global['preference_global_email_trichdb'] == 'on')? 'checked' : ''}>
	    TrichDB
	 </input>
<input type="checkbox" name="preference_global_email_tritrypdb" 
	        ${(global['preference_global_email_tritrypdb'] == 'on')? 'checked' : ''}>
	    TriTrypDB
	 </input>
      </td>
    </tr>
    <tr>
       <td align="right">Items in the query result page:</td>
       <td>
          <select name="preference_global_items_per_page">
             <option value="5" ${(global['preference_global_items_per_page'] == 5)? 'SELECTED' : ''}>5</option>
             <option value="10" ${(global['preference_global_items_per_page'] == 10)? 'SELECTED' : ''}>10</option>
             <option value="20" ${(global['preference_global_items_per_page'] == 20)? 'SELECTED' : ''}>20</option>
             <option value="50" ${(global['preference_global_items_per_page'] == 50)? 'SELECTED' : ''}>50</option>
             <option value="100" ${(global['preference_global_items_per_page']== 100)? 'SELECTED' : ''}>100</option>
           </select>
       </td>
    </tr>
    <tr>
       <td colspan="2" align="right">
           <a href="#" onclick="return validateFields();">
             <img  border="0" src="<c:url value='/images/update_profile.gif'/>"/>
           </a>
       </td>
    </tr>

  </c:otherwise>

</c:choose>

  </table>
</html:form>

</div>

  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
