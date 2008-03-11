<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />

<%--------------------------------------------------------------------%>

<c:choose>
<c:when test = "${project == 'EuPathDB'}">

<c:if test="${!empty helps}">
  <BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR>
  <BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR>

  <TABLE cellpadding="0" width="100%" border="0" cellspacing="2">
    <TR><TD bgcolor="#000000"><FONT size="+1" color="#ffffff">&nbsp;<B>Help</B></FONT></TD></TR>
    <TR><TD>&nbsp;</TD></TR>
  </TABLE>

  <TABLE width="100%" border="0">

      <!-- help for one form -->
      <c:forEach items="${helps}" var="hlp">
        <TR><TD valign="middle" bgcolor="#e0e0e0" align="left">
              <FONT size="+0" color="#663333" face="helvetica,sans-serif">
              <B>${hlp.key}</B></FONT></TD></TR>
        <TR><TD><TABLE width="100%">

                <!-- help for one param -->
                <c:forEach items="${hlp.value}" var="hlpLn">
                <TR><TD align="left"><B><A name="${hlpLn.key}"></A>${hlpLn.value.prompt}</B></TD>
                    <TD align="right"><A href="#${hlp.key}">
                        <IMG src='<c:url value="/images/fromHelp.jpg"/>' alt="Back To Form" border="0"></A>
                    </TD></TR>
                <TR><TD colspan="2">${hlpLn.value.help}</TD></TR>
                <TR><TD colspan="2">&nbsp;</TD></TR>
                </c:forEach>
                </TABLE>
            </TD></TR> 
      </c:forEach>
  </TABLE>
</c:if>



<%-- Not sure what this closes but seems necessary for the question page, otherwise the footer appears inside the border --%>
</div>

<%-- This closes the border div in the header --%>
</div>

<div  align="center"> 
<div id="footer">&copy; 2008 The EuPath Project Team:: <a href="/">EuPathDB.org</a><br> 
<a href="<c:url value='/help.jsp'/>"  target="_blank" onClick="poptastic(this.href); return false;">Contact us</a>
</div>
</div>

<%-- This closes the align div in the header --%>
</div>

</c:when>

<%--------------------------------------------------------------------%>


<c:otherwise>   <%-- code for all sites but EuPathDB --%>

<%-- closing line opened in header: line with a sidebar (or empty space if "help" page) --%>
</td>
</tr>

  <c:choose>
      <c:when test = "${project == 'ToxoDB'}">
             <c:set var="logo" value="/images/toxodb_logo-rotated.jpg"/>      
      </c:when>
      <c:when test = "${project == 'PlasmoDB'}">
             <c:set var="logo" value="/images/plasmodb_logo.gif"/>      
      </c:when>
      <c:when test = "${project == 'CryptoDB'}">
             <c:set var="logo" value="/images/oocyst_bg.gif"/>      
      </c:when>
      <c:when test = "${project == 'GiardiaDB'}">
             <c:set var="logo" value="/images/Mancuso1green2_blackbg_rotated_scale100.gif"/>      
      </c:when>
      <c:when test = "${project == 'TrichDB'}">
             <c:set var="logo" value="/images/600dpi_edit_auto_cropped_round_scale120.jpg"/>      
      </c:when>
  </c:choose>


<%-- footer itself in a table (sidebar (rowspan=2) should stretch to cover footer)  --%>
<%-- in question page we add the help lines --%>

<tr>
<td valign="bottom">

<c:if test="${!empty helps}">
  <BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR>
  <BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR>

  <TABLE cellpadding="0" width="100%" border="0" cellspacing="2">
    <TR><TD bgcolor="#000000"><FONT size="+1" color="#ffffff">&nbsp;<B>Help</B></FONT></TD></TR>
    <TR><TD>&nbsp;</TD></TR>
  </TABLE>

  <TABLE width="100%" border="0">

      <!-- help for one form -->
      <c:forEach items="${helps}" var="hlp">
        <TR><TD valign="middle" bgcolor="#e0e0e0" align="left">
              <FONT size="+0" color="#663333" face="helvetica,sans-serif">
              <B>${hlp.key}</B></FONT></TD></TR>
        <TR><TD><TABLE width="100%">

                <!-- help for one param -->
                <c:forEach items="${hlp.value}" var="hlpLn">
                <TR><TD align="left"><B><A name="${hlpLn.key}"></A>${hlpLn.value.prompt}</B></TD>
                    <TD align="right"><A href="#${hlp.key}">
                        <IMG src='<c:url value="/images/fromHelp.jpg"/>' alt="Back To Form" border="0"></A>
                    </TD></TR>
                <TR><TD colspan="2">${hlpLn.value.help}</TD></TR>
                <TR><TD colspan="2">&nbsp;</TD></TR>
                </c:forEach>
                </TABLE>
            </TD></TR> 
      </c:forEach>
  </TABLE>
</c:if>


<%-- moved to the EuPathDB section above --%>
<%--  End Question Form Div
<c:if test="${wdkModel.displayName eq 'ApiDB'}">
     </div>
</c:if>
--%>

  <table width="100%"  cellspacing="2" cellpadding="0">
   <tr><td colspan="4"><hr class="red"></td></tr>

    <tr>
        <td align="center">
            
            <table  cellspacing="0" cellpadding="0">
                <tr>
                    <td valign="middle" align="right">
                        <a href='http://apidb.org'>
                            <img SRC="<c:url value='${portalLogo}'/>" height="35" text='EUPATHDB' BORDER=0>
                        </a>
                    </td>
                    <td valign="middle" align="left">
                        <a href="http://eupathdb.org"><i>EuPathDB.org</i></a>
                    </td>
                </tr>
            </table>
        </td>

 <!-- copyright information -->

        <td colspan="2" class="copyright"><font size=-2 face="Arial,Helvetica"><b>
            &copy; 2008 The ApiDB/EuPathDB Project Team</b></font>
        </td>


        <td align="center">
            <table  cellspacing="0" cellpadding="0">
                <tr>
                    <td valign="middle" align="right">
                        <a href="<c:url value='/help.jsp'/>">
                            <img SRC="<c:url value='${logo}'/>" height="35" text='Help!' BORDER=0 width="40" height="38">
                        </a>
                    </td>
                    <td valign="middle" align="left">
                        <a href="<c:url value='/help.jsp'/>"  target="_blank" onClick="poptastic(this.href); return false;"><font color="brown"><b>Contact us!</a>
                    </td>
                </tr>
            </table>
        </td>
    </tr>


   </table>           


</td>
</tr>

</table> <%-- TABLE opened in header.tag that includes sidebar and jsp page plus this footer --%>

</c:otherwise> <%-- code for all sites but EuPathDB --%>
</c:choose>



</body></html>
