<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="version" value="${wdkModel.version}"/>
<c:set var="site" value="${wdkModel.displayName}"/>
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>


<%-- we need the header only for the css and js --%>
<imp:header title="${site}.org :: Support"
                 banner="Support"
                 parentDivision="${site}"
                 parentUrl="/home.jsp"
                 divisionName="Generic"
                 division="help"/>


<table width=100%> 
<tr><td>

<h1>Beta Tester Questionnaire</h1>
<h1>We appreciate your feedback!</h1>

<!-- ========== QUESTIONNAIRE ================= -->
<c:set var="question1" value="Did you find the feature useful?"/>
<c:set var="question2" value="Did you find the zoom control easy to use?"/>
<c:set var="question3" value="Were you confused by the scale of the genes relative to the genomic sequence?"/>
<!-- ========================================= -->

<hr>
<center><a style="font-size:14px" href="javascript:window.close()">Close this window.</a></center>  
<hr>

              <table>
              <form method="POST" action="/cgi-bin/processMail">

             	<input type="hidden" name="to1" value="redmine@"/>
                <input type="hidden" name="to2" value="apidb.org"/>
		<input type="hidden" name="cc1" value="help@"/>
                <input type="hidden" name="cc2" value="${site}.org"/>
               
		<!-- this tells the mail processor to add the questions and answers to the message -->
 		<input type="hidden" name="betatest" value="true"/>

 		<input type="hidden" name="q1" value="${question1}"/>
		<input type="hidden" name="q2" value="${question2}"/>
		<input type="hidden" name="q3" value="${question3}"/>

                <tr><td><div>Feature to be tested:</div></td>
                    <td><input type="text" name="subject" value="Genome View tab beta testing" size="81"></td></tr>

                <tr><td><div>Your email address:</div></td>
                    <c:choose>
                    <c:when test="${wdkUser == null || wdkUser.guest == true}">
                    <td><input type="text" name="replyTo" value="" size="81"></td></tr>
                    </c:when>
                    <c:otherwise>
                    <td><input type="text" name="replyTo" value="${wdkUser.email}" size="81"></td></tr>
                    </c:otherwise>
                    </c:choose>

  		<tr><td><div style="font-weight:bold">${question1}</div></td>
                    <td><input type="radio" name="a1" value="Yes">Yes</input>
			<input type="radio" name="a1" value="No">No</input>		</td></tr>

		<tr><td><div style="font-weight:bold">${question2}</div></td>
                    <td><input type="radio" name="a2" value="Yes">Yes</input>
			<input type="radio" name="a2" value="No">No</input>		</td></tr>

		<tr><td><div style="font-weight:bold">${question3}</div></td>
                    <td><input type="radio" name="a3" value="Yes">Yes</input>
			<input type="radio" name="a3" value="No">No</input>		</td></tr>

                <tr><td valign="top"><div style="font-weight:bold">Any other comment you would like to provide?</div></td>
                    <td><textarea name="message" cols="75" rows="8"></textarea>
                        <input type="hidden" name="uid"     value="${wdkUser.userId}">
                        <input type="hidden" name="website" value="${site}">
                        <input type="hidden" name="version" value="${version}">
                        <input type="hidden" name="browser" value="${header['User-Agent']}">
                        <input type="hidden" name="referer" value="${header['referer']}"
                       <%-- websitesupportform@apidb.org is a group in ApiDB Google Apps and an account in Redmine (an account is required for redmine to receive emails) --%>
                        <input type="hidden" name="reporterEmail" value="websitesupportform@apidb.org"/>     </td></tr>

                <tr><td>&nbsp;</td>
                    <td align="left"><input type="submit" value="Submit"></td></tr>
              </form>
              </table>
 
</td></tr>

<tr><td><br>If you would like to attach a screenshot, please email directly to <a href="mailto:help@${site}.org">help@${site}.org</a>.</td></tr>

</table>

<imp:footer/>


