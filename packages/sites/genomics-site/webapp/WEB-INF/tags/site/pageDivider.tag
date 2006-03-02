<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>

<%@ attribute name="name"
              description="name of page section"
%>

<br><br>
<a name="${name}">
<table BORDER="0" CELLSPACING="0" CELLPADDING="2" WIDTH="100%" BGCOLOR="#ffdddd">
  <tr>
    <td BGCOLOR="#ffeeee" ALIGN="left">
      <font FACE="helvetica,sans-serif" SIZE="+1" COLOR="#AA0000"
        <b>${name}</b>
      </font>
    </td>
    <td BGCOLOR="#ffeeee" ALIGN="right">
      <a HREF="#top">back to top</a>
    </td>
  </tr>
  <tr>
    <td COLSPAN=2 BGCOLOR="#ffffff">&nbsp;</td></tr>
</table>
