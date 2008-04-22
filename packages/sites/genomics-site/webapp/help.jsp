<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="version" value="${wdkModel.version}"/>
<c:set var="site" value="${wdkModel.displayName}"/>
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="CGI_URL" value="${applicationScope.wdkModel.properties['CGI_URL']}"/>

<!-- get wdkModel name to display as page header -->
<site:header title="${site}.org :: Support"
                 banner="Support"
                 parentDivision="${site}"
                 parentUrl="/home.jsp"
                 divisionName="Generic"
                 division="help"/>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBorders> 

 <tr>
  <td bgcolor=white valign=top>

<!-- begin page table -->

<table border=0 width=100% cellpadding=10><tr><td valign=top>

 <hr class=brown>
    <center><a href="javascript:window.close()">Close this window.</a></center>  
    <hr class=brown>
<font size ="-1">
    We are available to help with <b>Questions</b>, <b>Error reports</b>, <b>Feature requests</b>, <b>Dataset proposals</b>, etc. &nbsp;&nbsp;Please include (but all are optional):
        <ul>
        <li>Your email, so we can respond.
        <li>If you are describing a problem, <i>details</i> of how the problem occured, including:
          <ul>
          <li>The URL of the offending page
          <li><i>Exact</i> steps to recreate the problem. If possible, please try to recreate the problem yourself so you can give us an exact recipe.
          <li>The full error message, if any.
          </ul>
        </ul>
</font>
              <table width="100%"><tr><td align="center">

              <table cellspacing="2" cellpadding="4" border="0" bgcolor="#cccccc">
              <form method="POST" action="${CGI_URL}/processMail">

                <input type="hidden" name="to1" value="apibugz@"/>
                <input type="hidden" name="to2" value="pcbi.upenn.edu"/>
                <input type="hidden" name="cc1" value="help@"/>
                <input type="hidden" name="cc2" value="${site}.org"/>

                <tr><td><div class="medium">Subject:</div></td>
                    <td><input type="text" name="subject" value="" size="81"></td></tr>
                <tr><td><div class="medium">Your email address:</div></td>
                    <c:choose>
                    <c:when test="${wdkUser == null || wdkUser.guest == true}">
                    <td><input type="text" name="replyTo" value="" size="81"></td></tr>
                    </c:when>
                    <c:otherwise>
                    <td><input type="text" name="replyTo" value="${wdkUser.email}" size="81"></td></tr>
                    </c:otherwise>
                    </c:choose>
                <tr><td valign="top"><div class="medium">Message:</div></td>
                    <td><textarea name="message" cols="75" rows="8"></textarea>
                        <input type="hidden" name="website" value="${site}">
                        <input type="hidden" name="version" value="${version}">
                        <input type="hidden" name="browser" value="${header['User-Agent']}">
                        <input type="hidden" name="referer" value="${header['referer']}">
                        <input type="hidden" name="reporterEmail" value="supportform@apidb.org"/>                    </td></tr>
                <tr><td>&nbsp;</td>
                    <td align="left"><input type="submit" value="Submit"></td></tr>
              </form>
              </table>
 
             </td></tr></table>

          <br>

	  </div>

</td></tr></table>
<!-- end page table -->

  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>


